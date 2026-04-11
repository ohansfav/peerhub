@echo off
REM Peerup Quick Start Script for Windows
REM This script starts both the backend server and frontend in separate terminals

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         Peerup - Quick Start Script                    ║
echo ║                                                            ║
echo ║  Starting Backend (Port 3000) and Frontend (Port 5173)    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if we're in the right directory
if not exist ".\server" (
    echo ERROR: Cannot find 'server' folder. Please run this script from the project root.
    echo Expected: C:\Users\ohanu\OneDrive\Desktop\final year project 3\
    pause
    exit /b 1
)

if not exist ".\client" (
    echo ERROR: Cannot find 'client' folder. Please run this script from the project root.
    pause
    exit /b 1
)

echo ✓ Found both server and client directories
echo.
echo Starting Backend Server (http://localhost:3000)...
start cmd /k "cd server && npm run dev"

echo Waiting 3 seconds before starting frontend...
timeout /t 3 /nobreak

echo Starting Frontend Application (http://localhost:5173)...
start cmd /k "cd client && npm run dev"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  ✓ Both terminals have been opened!                       ║
echo ║                                                            ║
echo ║  Backend:  http://localhost:3000                          ║
echo ║  Frontend: http://localhost:5173                          ║
echo ║                                                            ║
echo ║  Open your browser and go to:                             ║
echo ║  http://localhost:5173                                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

pause

