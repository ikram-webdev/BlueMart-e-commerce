@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND_DIR=%ROOT%backend"
set "FRONTEND_DIR=%ROOT%frontend"

if not exist "%BACKEND_DIR%" (
  echo [ERROR] Backend folder not found: %BACKEND_DIR%
  exit /b 1
)

if not exist "%FRONTEND_DIR%" (
  echo [ERROR] Frontend folder not found: %FRONTEND_DIR%
  exit /b 1
)

echo Starting PHP backend on http://127.0.0.1:8080 ...
start "ecomstore-backend" cmd /k "cd /d \"%BACKEND_DIR%\" && php -S 127.0.0.1:8080"

echo Starting Vite frontend on http://localhost:5173 ...
start "ecomstore-frontend" cmd /k "cd /d \"%FRONTEND_DIR%\" && npm run dev"

echo.
echo Dev servers launched in new terminals.
echo Health check URL: http://127.0.0.1:8080/health.php
echo App URL:          http://localhost:5173
