param(
    [string]$MavenCommand = 'mvn'
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$serverRoot = Join-Path $repoRoot 'server'
$clientRoot = Join-Path $repoRoot 'client'
$outputRoot = Join-Path $PSScriptRoot 'target'
$databasePath = Join-Path $outputRoot 'selenium.sqlite'
$apiPort = 5101
$webPort = 5174
$apiProcess = $null
$webProcess = $null
$originalEnvironment = @{
    PORT = $env:PORT
    DB_PATH = $env:DB_PATH
    CLIENT_URL = $env:CLIENT_URL
    VITE_API_TARGET = $env:VITE_API_TARGET
}

New-Item -ItemType Directory -Force -Path @(
    $outputRoot,
    (Join-Path $outputRoot 'screenshots'),
    (Join-Path $outputRoot 'logs')
) | Out-Null

$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
    $nodePath = 'C:\Program Files\nodejs\node.exe'
    if (-not (Test-Path -LiteralPath $nodePath)) {
        throw 'Node.js was not found. Install Node.js and ensure node.exe is on PATH.'
    }
    $nodeCommand = Get-Item -LiteralPath $nodePath
}
$maven = Get-Command $MavenCommand -ErrorAction SilentlyContinue
if (-not $maven) {
    $temporaryMaven = Get-ChildItem -Path (Join-Path $env:TEMP 'apache-maven-*') -Directory -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending |
        ForEach-Object { Join-Path $_.FullName 'bin\mvn.cmd' } |
        Where-Object { Test-Path -LiteralPath $_ } |
        Select-Object -First 1
    if ($temporaryMaven) { $maven = Get-Item -LiteralPath $temporaryMaven }
    else { throw "Maven command '$MavenCommand' was not found. Install Apache Maven and ensure mvn is on PATH." }
}

foreach ($suffix in @('', '-shm', '-wal')) {
    $file = "$databasePath$suffix"
    if (Test-Path -LiteralPath $file) { Remove-Item -LiteralPath $file -Force }
}

try {
    $env:DB_PATH = $databasePath
    Push-Location $serverRoot
    try {
        & $nodeCommand.Source 'src/scripts/seed-appointments.js'
        if ($LASTEXITCODE -ne 0) { throw 'Could not seed the isolated Selenium test database.' }
    }
    finally {
        Pop-Location
    }

    $env:PORT = "$apiPort"
    $env:CLIENT_URL = "http://127.0.0.1:$webPort"
    $apiProcess = Start-Process -FilePath $nodeCommand.Source `
        -ArgumentList @('src/server.js') `
        -WorkingDirectory $serverRoot `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $outputRoot 'logs\api.out.log') `
        -RedirectStandardError (Join-Path $outputRoot 'logs\api.err.log') `
        -PassThru

    $env:VITE_API_TARGET = "http://127.0.0.1:$apiPort"
    $viteEntry = 'node_modules/vite/bin/vite.js'
    if (-not (Test-Path -LiteralPath (Join-Path $clientRoot $viteEntry))) {
        throw 'Vite dependencies are missing. Run npm ci in the client folder first.'
    }
    $webProcess = Start-Process -FilePath $nodeCommand.Source `
        -ArgumentList @($viteEntry, '--host', '127.0.0.1', '--port', "$webPort", '--strictPort') `
        -WorkingDirectory $clientRoot `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $outputRoot 'logs\vite.out.log') `
        -RedirectStandardError (Join-Path $outputRoot 'logs\vite.err.log') `
        -PassThru

    foreach ($url in @("http://127.0.0.1:$apiPort/health", "http://127.0.0.1:$webPort/")) {
        $ready = $false
        for ($attempt = 0; $attempt -lt 30; $attempt++) {
            $serviceProcess = if ($url.Contains(":$apiPort/")) { $apiProcess } else { $webProcess }
            if ($serviceProcess.HasExited) {
                $logPath = if ($url.Contains(":$apiPort/")) {
                    Join-Path $outputRoot 'logs\api.err.log'
                } else {
                    Join-Path $outputRoot 'logs\vite.err.log'
                }
                throw "Local service exited before becoming ready: $url. See $logPath."
            }
            try {
                $response = Invoke-WebRequest -Uri $url -TimeoutSec 2 -UseBasicParsing
                if ($response.StatusCode -eq 200) { $ready = $true; break }
            }
            catch { Start-Sleep -Seconds 1 }
        }
        if (-not $ready) { throw "Local test service did not become ready: $url" }
    }

    Write-Host "Test application: http://127.0.0.1:$webPort"
    Write-Host "Isolated database: $databasePath"
    & $maven.Source -f (Join-Path $PSScriptRoot 'pom.xml') test `
        "-Dapp.baseUrl=http://127.0.0.1:$webPort"
    $testExitCode = $LASTEXITCODE
    if ($testExitCode -ne 0) {
        Write-Host 'Tests failed. Generating the Surefire HTML report before returning failure.'
        & $maven.Source -f (Join-Path $PSScriptRoot 'pom.xml') surefire-report:report-only
        throw "Maven Selenium suite failed with exit code $testExitCode."
    }
    & $maven.Source -f (Join-Path $PSScriptRoot 'pom.xml') surefire-report:report-only
    if ($LASTEXITCODE -ne 0) { throw "Could not generate Surefire report; Maven exited with code $LASTEXITCODE." }
    Write-Host "Surefire report: $(Join-Path $PSScriptRoot 'target\site\surefire-report.html')"
}
finally {
    foreach ($name in $originalEnvironment.Keys) {
        $value = $originalEnvironment[$name]
        if ($null -eq $value) { Remove-Item "Env:$name" -ErrorAction SilentlyContinue }
        else { Set-Item "Env:$name" $value }
    }
    foreach ($process in @($webProcess, $apiProcess)) {
        if ($process -and -not $process.HasExited) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    }
}
