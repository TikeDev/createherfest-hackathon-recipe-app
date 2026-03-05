@echo off
REM Launch Brave with remote debugging for MCP server connection
REM Usage: launch-brave.bat [--fresh] [URL]
REM   --fresh: Use temporary profile (default: persistent profile)
REM   URL: URL to open (default: http://localhost:5173)
REM
REM NOTE: Brave path is hardcoded to the default Windows install location.
REM If Brave is installed elsewhere, update BRAVE_PATH below.

SET BRAVE_PATH=C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe
SET PROFILE_DIR=%USERPROFILE%\.simmer-brave-debug
SET DEFAULT_URL=http://localhost:5173
SET TARGET_URL=%DEFAULT_URL%
SET USE_FRESH=false

REM Parse arguments
FOR %%A IN (%*) DO (
  IF "%%A"=="--fresh" SET USE_FRESH=true
  IF "%%A" NEQ "--fresh" IF NOT "%%A"=="" SET TARGET_URL=%%A
)

REM Check Brave is installed
IF NOT EXIST "%BRAVE_PATH%" (
  echo Error: Brave not found at %BRAVE_PATH%
  echo If Brave is installed elsewhere, edit BRAVE_PATH in scripts\launch-brave.bat
  echo Download Brave from: https://brave.com/download/
  exit /b 1
)

IF "%USE_FRESH%"=="true" (
  SET PROFILE_DIR=%TEMP%\simmer-brave-debug-profile
  echo Using temporary profile
) ELSE (
  echo Using persistent profile at %PROFILE_DIR%
)

echo Launching Brave with remote debugging on port 9222...
echo Opening: %TARGET_URL%

"%BRAVE_PATH%" ^
  --remote-debugging-port=9222 ^
  --user-data-dir="%PROFILE_DIR%" ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-default-apps ^
  %TARGET_URL%
