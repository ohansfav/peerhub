@echo off
REM Peerup Ngrok Start Script for Windows
REM Builds client and serves it from backend (port 3000) for stable ngrok sharing

echo.
echo ============================================================
echo                 Peerup - Ngrok Share Mode
echo ============================================================
echo NOTE: This script shares backend port 3000 and serves the built frontend snapshot.
echo       For live frontend code updates, use START_NGROK_LIVE.bat instead.
echo.

if not exist ".\server" (
  echo ERROR: Cannot find 'server' folder. Run from project root.
  pause
  exit /b 1
)

if not exist ".\client" (
  echo ERROR: Cannot find 'client' folder. Run from project root.
  pause
  exit /b 1
)

echo [1/4] Installing/updating client dependencies...
call cmd /c "cd client && npm install"
if errorlevel 1 (
  echo ERROR: Failed to install client dependencies.
  pause
  exit /b 1
)

echo [2/4] Building frontend for production serving...
call cmd /c "cd client && npm run build"
if errorlevel 1 (
  echo ERROR: Client build failed.
  pause
  exit /b 1
)

echo [3/4] Starting backend server on http://localhost:3000 ...
start cmd /k "cd server && npm run dev"

echo Waiting 4 seconds for backend boot...
timeout /t 4 /nobreak >nul

echo [4/4] Preparing plain ngrok tunnel on port 3000...
where ngrok >nul 2>nul
if errorlevel 1 (
  echo ERROR: ngrok is not installed or not in PATH.
  echo Install from https://ngrok.com/download and retry.
  pause
  exit /b 1
)

REM Avoid ERR_NGROK_334 from stale local ngrok process
taskkill /F /IM ngrok.exe >nul 2>nul

echo Starting ngrok in a new terminal (ngrok http 3000)
start cmd /k "ngrok http 3000"

echo.
echo ============================================================
echo Backend is served at:  http://localhost:3000
echo Ngrok should tunnel:   http://localhost:3000
echo This mode serves a built frontend snapshot from client/dist.
echo Re-run this script after frontend changes, or use START_NGROK_LIVE.bat.
echo.
echo Share the HTTPS ngrok URL shown in the ngrok terminal.
echo If users see a warning page, they must click through once.
echo ============================================================
echo.

pause
