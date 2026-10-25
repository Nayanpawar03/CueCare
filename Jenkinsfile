// CueCare Pipeline as Code, Continuous Testing, and Docker CD — Tasks 8, 10, and 12
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
            name: 'MAVEN_COMMAND',
            defaultValue: 'C:\\Users\\Nayan\\AppData\\Local\\Temp\\apache-maven-3.9.16\\bin\\mvn.cmd',
            description: 'Path to mvn.cmd on the Windows Jenkins agent.'
        )
        string(
            name: 'DOCKER_CLI',
            defaultValue: 'C:\\Users\\Nayan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe',
            description: 'Path to docker.exe on the Windows Jenkins agent.'
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

        stage('Selenium UI Tests') {
            steps {
                script {
                    def mavenCommand = params.MAVEN_COMMAND?.trim() ?: 'C:\\Users\\Nayan\\AppData\\Local\\Temp\\apache-maven-3.9.16\\bin\\mvn.cmd'
                    withEnv(["SELENIUM_MAVEN_COMMAND=${mavenCommand}"]) {
                    powershell '''
                        $ErrorActionPreference = 'Stop'
                        if (-not (Test-Path -LiteralPath $env:SELENIUM_MAVEN_COMMAND)) {
                            throw "Maven command not found: $env:SELENIUM_MAVEN_COMMAND"
                        }
                        .\\tests\\selenium\\run-local.ps1 -MavenCommand $env:SELENIUM_MAVEN_COMMAND
                    '''
                    }
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

        stage('Docker Build') {
            steps {
                script {
                    def deploymentEnvironment = params.DEPLOY_ENV?.trim() ?: 'dev'
                    def dockerCommand = params.DOCKER_CLI?.trim() ?: 'C:\\Users\\Nayan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
                    def imageTag = "cuecare:${deploymentEnvironment}-${env.BUILD_NUMBER}"
                    withEnv([
                        "DOCKER_CLI_PATH=${dockerCommand}",
                        'DOCKER_HOST=npipe:////./pipe/dockerDesktopLinuxEngine',
                        "DOCKER_IMAGE=${imageTag}"
                    ]) {
                        bat '''
                            if not exist "%DOCKER_CLI_PATH%" (
                                echo Docker CLI not found: %DOCKER_CLI_PATH%
                                exit /b 1
                            )
                            "%DOCKER_CLI_PATH%" --host "%DOCKER_HOST%" version
                            if errorlevel 1 exit /b %ERRORLEVEL%
                            "%DOCKER_CLI_PATH%" --host "%DOCKER_HOST%" build --tag "%DOCKER_IMAGE%" .
                        '''
                    }
                }
            }
        }

        stage('Docker Deploy') {
            steps {
                script {
                    def deploymentEnvironment = params.DEPLOY_ENV?.trim() ?: 'dev'
                    def dockerCommand = params.DOCKER_CLI?.trim() ?: 'C:\\Users\\Nayan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
                    withEnv(["DOCKER_CLI_PATH=${dockerCommand}"]) {
                        powershell '''
                            $ErrorActionPreference = 'Stop'
                            .\\scripts\\deploy-docker.ps1 `
                                -Environment $env:DEPLOY_ENV `
                                -BuildNumber $env:BUILD_NUMBER `
                                -DockerCommand $env:DOCKER_CLI_PATH
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            junit testResults: 'tests/selenium/target/surefire-reports/TEST-*.xml', allowEmptyResults: true
            archiveArtifacts artifacts: 'tests/selenium/target/site/surefire-report.html,tests/selenium/target/surefire-reports/**,tests/selenium/target/screenshots/**', allowEmptyArchive: true, fingerprint: true
        }
        success {
            echo "CueCare ${params.DEPLOY_ENV} Docker deployment completed successfully after Selenium tests passed."
        }
        failure {
            echo 'Pipeline failed. Review the stage console output for the failing step.'
        }
    }
}
