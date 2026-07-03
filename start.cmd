@echo off
setlocal

cd /d "%~dp0"

if not exist "local" mkdir "local"

echo [archive_store] Starting local PostgreSQL...
call npm.cmd run db:start
if errorlevel 1 (
  echo [archive_store] Failed to start local PostgreSQL.
  exit /b 1
)

echo [archive_store] Starting local API on http://127.0.0.1:5175 ...
start "archive_store_api" /min cmd /c "cd /d %~dp0 && npm.cmd run dev:api ^> local\api.log 2^>^&1"

echo [archive_store] Starting web app on http://127.0.0.1:5174 ...
start "archive_store_web" /min cmd /c "cd /d %~dp0 && npm.cmd run dev -- --host 127.0.0.1 ^> dev-server.log 2^>^&1"

echo.
echo [archive_store] Started.
echo   App: http://127.0.0.1:5174/
echo   API: http://127.0.0.1:5175/api/health
echo   DB : 127.0.0.1:54324/archive_store
echo.
echo Use end.cmd to stop local processes.

endlocal

