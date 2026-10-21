param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('dev', 'staging')]
    [string]$Environment,

    [Parameter(Mandatory = $true)]
    [string]$DeployRoot,

    [Parameter(Mandatory = $true)]
    [string]$NginxHome,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^\d+$')]
    [string]$BuildNumber
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $NginxHome -PathType Container)) {
    throw "Nginx folder '$NginxHome' was not found. Extract the official Windows Nginx ZIP there; nginx.exe and conf\mime.types must exist."
}

$nginxExe = Join-Path $NginxHome 'nginx.exe'
$mimeTypes = Join-Path $NginxHome 'conf\mime.types'
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
$nginxTemplatePath = Join-Path $PSScriptRoot '..\deploy\nginx.conf.template'

if (-not (Test-Path -LiteralPath $nginxExe -PathType Leaf)) {
    throw "Nginx executable not found: $nginxExe"
}
if (-not (Test-Path -LiteralPath $mimeTypes -PathType Leaf)) {
    throw "Nginx MIME types file not found: $mimeTypes"
}
if (-not $nodeCommand -or -not $npmCommand) {
    throw 'Node.js and npm must be available in the Jenkins service PATH.'
}
if (-not (Test-Path -LiteralPath $nginxTemplatePath -PathType Leaf)) {
    throw "Nginx configuration template not found: $nginxTemplatePath"
}

$settings = @{
    dev = @{ ApiPort = 5001; WebPort = 8081 }
    staging = @{ ApiPort = 5002; WebPort = 8082 }
}
$apiPort = $settings[$Environment].ApiPort
$webPort = $settings[$Environment].WebPort
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$releaseRoot = Join-Path (Join-Path (Join-Path (Join-Path $DeployRoot $Environment) 'releases') $BuildNumber) ''
$serverRoot = Join-Path $releaseRoot 'server'
$clientRoot = Join-Path $releaseRoot 'client'
$sharedRoot = Join-Path (Join-Path $DeployRoot 'shared') $Environment
$logRoot = Join-Path (Join-Path $DeployRoot 'logs') $Environment
$nginxStateRoot = Join-Path $DeployRoot 'nginx'
$pidFile = Join-Path $sharedRoot 'api.pid'
$databasePath = Join-Path $sharedRoot 'cuecare.sqlite'
$nginxConfig = Join-Path $nginxStateRoot 'nginx.conf'

New-Item -ItemType Directory -Force -Path @(
    $releaseRoot,
    $serverRoot,
    $clientRoot,
    $sharedRoot,
    $logRoot,
    $nginxStateRoot
) | Out-Null

Copy-Item -Path (Join-Path $repoRoot 'server\src') -Destination $serverRoot -Recurse -Force
Copy-Item -LiteralPath (Join-Path $repoRoot 'server\package.json') -Destination $serverRoot -Force
Copy-Item -LiteralPath (Join-Path $repoRoot 'server\package-lock.json') -Destination $serverRoot -Force
Copy-Item -Path (Join-Path $repoRoot 'client\dist\*') -Destination $clientRoot -Recurse -Force

Push-Location $serverRoot
try {
    & $npmCommand.Source ci --omit=dev
    if ($LASTEXITCODE -ne 0) { throw "Installing production dependencies failed with exit code $LASTEXITCODE." }

    $env:DB_PATH = $databasePath
    & $nodeCommand.Source 'src/scripts/seed-appointments.js'
    if ($LASTEXITCODE -ne 0) { throw "Seeding demo appointment slots failed with exit code $LASTEXITCODE." }
}
finally {
    Pop-Location
}

if (Test-Path -LiteralPath $pidFile) {
    $oldPidText = (Get-Content -LiteralPath $pidFile -Raw).Trim()
    $oldPid = 0
    if ([int]::TryParse($oldPidText, [ref]$oldPid)) {
        $oldProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $oldPid" -ErrorAction SilentlyContinue
        if ($oldProcess -and $oldProcess.Name -eq 'node.exe' -and $oldProcess.CommandLine -like "*$DeployRoot\$Environment\releases*\server\src\server.js*") {
            Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        }
    }
}

$env:PORT = "$apiPort"
$env:DB_PATH = $databasePath
$env:CLIENT_URL = "http://localhost:$webPort"
$apiOut = Join-Path $logRoot 'api.out.log'
$apiErr = Join-Path $logRoot 'api.err.log'
$apiProcess = Start-Process -FilePath $nodeCommand.Source `
    -ArgumentList @('src/server.js') `
    -WorkingDirectory $serverRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $apiOut `
    -RedirectStandardError $apiErr `
    -PassThru
Set-Content -LiteralPath $pidFile -Value $apiProcess.Id -Encoding ascii

$apiHealthUrl = "http://127.0.0.1:$apiPort/health"
$apiReady = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Seconds 1
    try {
        $health = Invoke-RestMethod -Uri $apiHealthUrl -TimeoutSec 2
        if ($health.status -eq 'UP') {
            $apiReady = $true
            break
        }
    }
    catch {
        # Wait for the server to finish starting; the loop has a 30-second limit.
    }
}
if (-not $apiReady) {
    throw "CueCare API did not become healthy at $apiHealthUrl. Check $apiErr."
}

$toNginxPath = {
    param([string]$Path)
    return $Path.Replace('\', '/')
}
$configText = Get-Content -LiteralPath $nginxTemplatePath -Raw
$configText = $configText.Replace('__DEPLOY_ROOT__', (& $toNginxPath $DeployRoot))
$configText = $configText.Replace('__NGINX_HOME__', (& $toNginxPath $NginxHome))
$configText = $configText.Replace('__CLIENT_ROOT__', (& $toNginxPath $clientRoot))
$configText = $configText.Replace('__API_PORT__', "$apiPort")
$configText = $configText.Replace('__WEB_PORT__', "$webPort")
Set-Content -LiteralPath $nginxConfig -Value $configText -Encoding ascii

$nginxPrefix = "$((& $toNginxPath $NginxHome))/"
$nginxConfigPath = & $toNginxPath $nginxConfig
$nginxProcesses = Get-Process -Name nginx -ErrorAction SilentlyContinue
if ($nginxProcesses) {
    & $nginxExe -p $nginxPrefix -c $nginxConfigPath -s reload
    if ($LASTEXITCODE -ne 0) {
        throw 'Nginx could not reload the generated CueCare configuration. Stop any existing Nginx process and rerun the pipeline.'
    }
}
else {
    Start-Process -FilePath $nginxExe `
        -WorkingDirectory $NginxHome `
        -ArgumentList @('-p', $nginxPrefix, '-c', $nginxConfigPath) `
        -WindowStyle Hidden
}

$applicationUrl = "http://localhost:$webPort/"
$proxyHealthUrl = "http://localhost:$webPort/health"
$webReady = $false
for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Seconds 1
    try {
        $proxyHealth = Invoke-RestMethod -Uri $proxyHealthUrl -TimeoutSec 2
        if ($proxyHealth.status -eq 'UP') {
            $webReady = $true
            break
        }
    }
    catch {
        # Nginx may need a moment to start or reload its configuration.
    }
}
if (-not $webReady) {
    throw "The Nginx health check failed at $proxyHealthUrl. Check Nginx logs under $nginxStateRoot and API logs under $logRoot."
}

Write-Host "Deployment environment: $Environment"
Write-Host "CueCare application URL: $applicationUrl"
Write-Host "CueCare health check: $proxyHealthUrl returned $($proxyHealth.status)"
Write-Host "Release directory: $releaseRoot"
