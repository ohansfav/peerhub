# Peerhub Quick Start Script for PowerShell
# This script starts both the backend server and frontend

Write-Host "`n"
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         Peerhub - Quick Start Script (PowerShell)       ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║  Starting Backend (Port 3000) and Frontend (Port 5173)    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# Check if we're in the right directory
if (-not (Test-Path ".\server")) {
    Write-Host "ERROR: Cannot find 'server' folder." -ForegroundColor Red
    Write-Host "Expected: C:\Users\ohanu\OneDrive\Desktop\final year project 3\" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".\client")) {
    Write-Host "ERROR: Cannot find 'client' folder." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Found both server and client directories" -ForegroundColor Green
Write-Host "`n"

# Start Backend Server
Write-Host "Starting Backend Server (http://localhost:3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Get-Location)\server'; npm run dev"

# Wait 3 seconds
Write-Host "Waiting 3 seconds before starting frontend..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Start Frontend Application
Write-Host "Starting Frontend Application (http://localhost:5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Get-Location)\client'; npm run dev"

Write-Host "`n"
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✓ Both terminals have been opened!                       ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  Backend:  http://localhost:3000                          ║" -ForegroundColor Green
Write-Host "║  Frontend: http://localhost:5173                          ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  Open your browser and go to:                             ║" -ForegroundColor Green
Write-Host "║  http://localhost:5173                                    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host "`n"

