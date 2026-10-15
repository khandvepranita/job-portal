@echo off
setlocal
if exist "C:\Program Files\Eclipse Adoptium\jdk-25.0.2.10-hotspot" (
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-25.0.2.10-hotspot"
)
set "PATH=%JAVA_HOME%\bin;%PATH%"

if exist "%USERPROFILE%\.maven\apache-maven-3.9.6\bin\mvn.cmd" (
    call "%USERPROFILE%\.maven\apache-maven-3.9.6\bin\mvn.cmd" %*
    exit /b %ERRORLEVEL%
)

mvn %*
