@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET ___MVNW_EXACTLY_ONE_PERCENT_=%
@SET __MAVEN_CMD_LINE_ARGS__=%*
@SET __MVNW_PROJECT_BASEDIR__=%~dp0
@REM Strip trailing backslash
@IF "%__MVNW_PROJECT_BASEDIR__:~-1%"=="\" (
    @SET __MVNW_PROJECT_BASEDIR__=%__MVNW_PROJECT_BASEDIR__:~0,-1%
)

@SET __MVNW_LAUNCHER__=%__MVNW_PROJECT_BASEDIR__%\.mvn\wrapper\MavenWrapperDownloader.java

@SETLOCAL
@SET JAVA_HOME_=%JAVA_HOME%

@IF NOT "%JAVA_HOME_%" == "" GOTO javaHomeSet

@SET JAVA_CMD=java.exe
@GOTO init

:javaHomeSet
@SET JAVA_CMD=%JAVA_HOME_%\bin\java.exe

:init
@SET __MVNW_REPOURL__=https://repo.maven.apache.org/maven2

@FOR /F "usebackq tokens=1,2 delims==" %%A IN (`findstr /i "distributionUrl" "%__MVNW_PROJECT_BASEDIR__%\.mvn\wrapper\maven-wrapper.properties"`) DO (
    @IF "%%A"=="distributionUrl" @SET __MVNW_DISTRIBUTION_URL__=%%B
)

@IF "%__MVNW_DISTRIBUTION_URL__%"=="" (
    @ECHO [ERROR] distributionUrl not found in maven-wrapper.properties
    @EXIT /B 1
)

@FOR /F "tokens=*" %%i IN ("%__MVNW_DISTRIBUTION_URL__%") DO @SET __MVNW_DISTRIBUTION_URL__=%%i

@SET __MVNW_DISTRIBUTION_FILENAME__=%__MVNW_DISTRIBUTION_URL__:*/=%

@FOR %%a IN (%__MVNW_DISTRIBUTION_FILENAME__%) DO @SET __MVNW_DIST_BASEDIR__=%%~na
@SET __MVNW_USER_HOME__=%USERPROFILE%\.m2\wrapper\dists
@SET __MVNW_DIST_DIR__=%__MVNW_USER_HOME__%\%__MVNW_DIST_BASEDIR__%

@IF EXIST "%__MVNW_DIST_DIR__%" GOTO runMvn

@ECHO Downloading Maven from %__MVNW_DISTRIBUTION_URL__%
@IF NOT EXIST "%__MVNW_USER_HOME__%" @MD "%__MVNW_USER_HOME__%"
@"%JAVA_CMD%" -cp "%__MVNW_PROJECT_BASEDIR__%\.mvn\wrapper\maven-wrapper.jar" "-Dmaven.multiModuleProjectDirectory=%__MVNW_PROJECT_BASEDIR__%"  org.apache.maven.wrapper.MavenWrapperMain %__MAVEN_CMD_LINE_ARGS__%
@GOTO end

:runMvn
@SET __MVNW_MAVEN_BIN__=
@FOR /R "%__MVNW_DIST_DIR__%" %%d IN (mvn.cmd) DO (
    @IF NOT "%%d"=="" @SET __MVNW_MAVEN_BIN__=%%d
)

@IF "%__MVNW_MAVEN_BIN__%"=="" (
    @ECHO [ERROR] mvn.cmd not found under %__MVNW_DIST_DIR__%
    @EXIT /B 1
)

@"%__MVNW_MAVEN_BIN__%"  %__MAVEN_CMD_LINE_ARGS__%

:end
@ENDLOCAL
