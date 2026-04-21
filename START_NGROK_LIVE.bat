@echo off
REM Peerup Live Ngrok Start Script for Windows
REM Starts backend + Vite dev frontend and tunnels frontend port 5173.

set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

echo.
echo ============================================================
echo              Peerup - Ngrok Live Update Mode
echo ============================================================
echo.

if not exist "%PROJECT_ROOT%\server" (
  echo ERROR: Cannot find 'server' folder. Run from project root.
  pause
  exit /b 1
)

if not exist "%PROJECT_ROOT%\client" (
  echo ERROR: Cannot find 'client' folder. Run from project root.
  pause
  exit /b 1
)

echo [1/4] Starting backend server on http://localhost:3000 ...
start "Peerup Backend" cmd /k "cd /d ""%PROJECT_ROOT%\server"" && npm run dev"

echo Waiting 3 seconds before starting frontend...
timeout /t 3 /nobreak >nul

echo [2/4] Starting frontend server on http://localhost:5173 ...
start "Peerup Frontend" cmd /k "cd /d ""%PROJECT_ROOT%\client"" && npm run dev"

echo Waiting 4 seconds for frontend boot...
timeout /t 4 /nobreak >nul

echo [3/4] Preparing ngrok tunnel on port 5173...
where ngrok >nul 2>nul
if errorlevel 1 (
  echo ERROR: ngrok is not installed or not in PATH.
  echo Install from https://ngrok.com/download and retry.
  pause
  exit /b 1
)

REM Avoid stale local ngrok process collisions
taskkill /F /IM ngrok.exe >nul 2>nul

echo [4/4] Starting ngrok in a new terminal (ngrok http 5173)
start "Ngrok" cmd /k "ngrok http 5173"

echo.
echo ============================================================
echo Local frontend:  http://localhost:5173
echo Local backend:   http://localhost:3000
echo Ngrok should tunnel frontend port 5173 for live updates.
echo ============================================================
echo.

pause
