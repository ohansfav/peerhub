@echo off
REM Peerup LAN Classroom Start Script (Windows Batch)
REM Builds frontend and starts backend so all devices on same Wi-Fi can use one host URL.

set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

echo.
echo ===============================================================
echo   Peerup LAN Mode
echo   Build frontend + start backend on port 3000
echo ===============================================================
echo.

if not exist "%PROJECT_ROOT%\server" (
    echo ERROR: Cannot find server folder.
    pause
    exit /b 1
)

if not exist "%PROJECT_ROOT%\client" (
    echo ERROR: Cannot find client folder.
    pause
    exit /b 1
)

for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '169.254*' -and $_.IPAddress -ne '127.0.0.1' } | Select-Object -First 1 -ExpandProperty IPAddress)"`) do set "HOST_IP=%%i"
if "%HOST_IP%"=="" set "HOST_IP=localhost"

echo Host classroom URL:
echo   http://%HOST_IP%:3000
echo.
echo Everyone on the same network should open that URL and log in.
echo.

cd /d "%PROJECT_ROOT%"
call npm run lan:start
