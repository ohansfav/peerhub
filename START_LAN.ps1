# Peerup LAN Classroom Start Script (PowerShell)
# Builds frontend and starts backend so all devices on the same network use one host URL.

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  Peerup LAN Mode" -ForegroundColor Cyan
Write-Host "  Build frontend + start backend on port 3000" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".\server")) {
    Write-Host "ERROR: Cannot find server folder." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".\client")) {
    Write-Host "ERROR: Cannot find client folder." -ForegroundColor Red
    exit 1
}

$hostIp = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike "169.254*" -and $_.IPAddress -ne "127.0.0.1" } |
    Select-Object -First 1 -ExpandProperty IPAddress)

if ([string]::IsNullOrWhiteSpace($hostIp)) {
    $hostIp = "localhost"
}

Write-Host "Host classroom URL:" -ForegroundColor Yellow
Write-Host "  http://$hostIp`:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Everyone on the same network should open that URL and log in." -ForegroundColor Yellow
Write-Host ""

npm run lan:start
