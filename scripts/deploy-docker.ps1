param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('dev', 'staging')]
    [string]$Environment,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^\d+$')]
    [string]$BuildNumber,

    [Parameter(Mandatory = $true)]
    [string]$DockerCommand
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $DockerCommand -PathType Leaf)) {
    throw "Docker CLI not found: $DockerCommand"
}

$composeCommand = Join-Path (Split-Path -Parent $DockerCommand) 'docker-compose.exe'
if (-not (Test-Path -LiteralPath $composeCommand -PathType Leaf)) {
    throw "Docker Compose executable not found beside the Docker CLI: $composeCommand"
}

$dockerHost = 'npipe:////./pipe/dockerDesktopLinuxEngine'
$projectName = "cuecare-$Environment"
$containerName = "cuecare-$Environment"
$imageTag = "$Environment-$BuildNumber"
$portByEnvironment = @{ dev = 8083; staging = 8084 }
$hostPort = $portByEnvironment[$Environment]
$applicationUrl = "http://127.0.0.1:$hostPort/"
$healthUrl = "http://127.0.0.1:$hostPort/health"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

$env:DOCKER_HOST = $dockerHost
$env:COMPOSE_PROJECT_NAME = $projectName
$env:IMAGE_TAG = $imageTag
$env:CONTAINER_NAME = $containerName
$env:CUECARE_PORT = "$hostPort"

function Invoke-Docker {
    param([string[]]$DockerArguments)

    Write-Host "> docker $($DockerArguments -join ' ')"
    $previousErrorPreference = $ErrorActionPreference
    try {
        # Windows PowerShell can promote native stderr progress into an
        # exception when ErrorActionPreference is Stop. Capture it and use
        # Docker's exit code as the command result instead.
        $ErrorActionPreference = 'Continue'
        $dockerOutput = & $DockerCommand --host $dockerHost @DockerArguments 2>&1
        $dockerExitCode = $LASTEXITCODE
        foreach ($line in $dockerOutput) { Write-Host $line }
    }
    finally {
        $ErrorActionPreference = $previousErrorPreference
    }
    if ($dockerExitCode -ne 0) {
        throw "Docker command failed with exit code $dockerExitCode."
    }
}

function Invoke-DockerCompose {
    param([string[]]$ComposeArguments)

    Write-Host "> docker-compose $($ComposeArguments -join ' ')"
    $previousErrorPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $composeOutput = & $composeCommand @ComposeArguments 2>&1
        $composeExitCode = $LASTEXITCODE
        foreach ($line in $composeOutput) { Write-Host $line }
    }
    finally {
        $ErrorActionPreference = $previousErrorPreference
    }
    if ($composeExitCode -ne 0) {
        throw "Docker Compose command failed with exit code $composeExitCode."
    }
}

Push-Location $repoRoot
try {
    Invoke-DockerCompose -ComposeArguments @(
        '--project-name', $projectName,
        'up', '--detach', '--no-build', '--force-recreate', '--remove-orphans'
    )
}
finally {
    Pop-Location
}

$containerReady = $false
Write-Host "Waiting for Docker health check at $healthUrl..."
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Seconds 2
    & $DockerCommand --host $dockerHost inspect --format '{{.State.Health.Status}}' $containerName 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $containerHealth = (& $DockerCommand --host $dockerHost inspect --format '{{.State.Health.Status}}' $containerName 2>$null | Out-String).Trim()
        if ($containerHealth -eq 'healthy') {
            $containerReady = $true
            break
        }
    }
}

if (-not $containerReady) {
    throw "Container '$containerName' did not become healthy. Review its Docker logs."
}

$health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 5
if ($health.status -ne 'UP') {
    throw "Application health check did not return UP at $healthUrl."
}
$webResponse = Invoke-WebRequest -Uri $applicationUrl -UseBasicParsing -TimeoutSec 10
if ($webResponse.StatusCode -ne 200) {
    throw "CueCare frontend returned HTTP $($webResponse.StatusCode) at $applicationUrl."
}

Write-Host "Docker image: cuecare:$imageTag"
Write-Host "Docker container: $containerName (healthy)"
Write-Host "Deployment environment: $Environment"
Write-Host "CueCare application URL: $applicationUrl"
Write-Host "CueCare health check: $healthUrl returned $($health.status)"
