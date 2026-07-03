@echo off
setlocal

cd /d "%~dp0"

echo [archive_store] Stopping web/API processes on ports 5174 and 5175...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5174,5175 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { if ($_ -and (Get-Process -Id $_ -ErrorAction SilentlyContinue)) { Stop-Process -Id $_ -Force } }"

echo [archive_store] Stopping local PostgreSQL...
call npm.cmd run db:stop
if errorlevel 1 (
  echo [archive_store] PostgreSQL stop command returned an error. It may already be stopped.
)

echo.
echo [archive_store] Stopped.

endlocal

