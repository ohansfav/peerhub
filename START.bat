@echo off
REM Peerup Quick Start Script for Windows
REM This script starts both the backend server and frontend in separate terminals

set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         Peerup - Quick Start Script                    ║
echo ║                                                            ║
echo ║  Starting Backend (Port 3000) and Frontend (Port 5173)    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Resolve paths from script location (works even when launched from another folder)
if not exist "%PROJECT_ROOT%\server" (
    echo ERROR: Cannot find 'server' folder next to this script.
    echo Expected: %PROJECT_ROOT%\server
    pause
    exit /b 1
)

if not exist "%PROJECT_ROOT%\client" (
    echo ERROR: Cannot find 'client' folder next to this script.
    pause
    exit /b 1
)

echo ✓ Found both server and client directories
echo.
echo Starting Backend Server (http://localhost:3000)...
start "Peerup Backend" cmd /k "cd /d ""%PROJECT_ROOT%\server"" && npm run dev"

echo Waiting 3 seconds before starting frontend...
timeout /t 3 /nobreak

echo Starting Frontend Application (http://localhost:5173)...
start "Peerup Frontend" cmd /k "cd /d ""%PROJECT_ROOT%\client"" && npm run dev"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  ✓ Both terminals have been opened!                       ║
echo ║                                                            ║
echo ║  Backend:  http://localhost:3000                          ║
echo ║  Frontend: http://localhost:5173                          ║
echo ║                                                            ║
echo ║  Open your browser and go to:                             ║
echo ║  http://localhost:5173                                    ║
echo ║                                                            ║
echo ║  For ngrok sharing, use: START_NGROK.bat                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

pause

