// CueCare Pipeline as Code — Task 8
// Runs on the Windows Jenkins agent configured for the Task 7 job.

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    parameters {
        choice(
            name: 'DEPLOY_ENV',
            choices: ['dev', 'staging'],
            description: 'Select the local deployment environment and its ports.'
        )
        string(
            name: 'DEPLOY_ROOT',
            defaultValue: 'C:\\CueCareDeploy',
            description: 'Folder used for application releases, logs, and the generated Nginx configuration.'
        )
        string(
            name: 'NGINX_HOME',
            defaultValue: 'C:\\nginx-1.30.6',
            description: 'Folder containing nginx.exe and conf\\mime.types.'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                bat 'git rev-parse --short HEAD'
                echo "Deploying to ${params.DEPLOY_ENV}"
            }
        }

        stage('Build') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                dir('server') {
                    bat 'npm ci'
                    bat 'npm test'
                    bat 'npm run build'
                }
                dir('client') {
                    bat 'npm ci'
                    bat 'npm run build'
                }
            }
        }

        stage('Package') {
            steps {
                powershell '''
                    $ErrorActionPreference = 'Stop'
                    New-Item -ItemType Directory -Force -Path artifacts | Out-Null
                    $package = "artifacts/cuecare-${env:DEPLOY_ENV}-${env:BUILD_NUMBER}.zip"
                    if (Test-Path $package) { Remove-Item -LiteralPath $package -Force }
                    Compress-Archive -Path @(
                        'client/dist',
                        'server/src',
                        'server/package.json',
                        'server/package-lock.json'
                    ) -DestinationPath $package -CompressionLevel Optimal
                    Write-Host "Created package: $package"
                '''
                archiveArtifacts artifacts: 'artifacts/*.zip', fingerprint: true
            }
        }

        stage('Deploy') {
            steps {
                // Keep the Node API process alive after this Jenkins step exits.
                withEnv(['JENKINS_NODE_COOKIE=dontKillMe']) {
                    powershell '''
                        $ErrorActionPreference = 'Stop'
                        .\\scripts\\deploy.ps1 `
                            -Environment $env:DEPLOY_ENV `
                            -DeployRoot $env:DEPLOY_ROOT `
                            -NginxHome $env:NGINX_HOME `
                            -BuildNumber $env:BUILD_NUMBER
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "CueCare ${params.DEPLOY_ENV} deployment completed successfully."
        }
        failure {
            echo 'Pipeline failed. Review the stage console output for the failing step.'
        }
    }
}
