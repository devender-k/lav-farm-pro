@echo off
REM ===============================================================
REM   Farm Pro - User Website Launcher
REM   Powered by Lavkush
REM ===============================================================
title Farm Pro - User Website (Farmer Portal)
color 0A

echo.
echo ==============================================================
echo             Farm Pro - USER WEBSITE PORTAL
echo                   Powered by Lavkush
echo ==============================================================
echo.
echo Mode: USER MODE (Public / Farmers)
echo Rights:
echo   - Instant AI Plant Health Scanner
echo   - Submit Consultation & Diagnosis Requests
echo   - Chat with ChatL AI Assistant
echo   - Browse Plant Diseases, Cures ^& Fertilizer Schedules
echo.

cd /d "%~dp0"

REM Check if server is already running on port 3000
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Starting Farm Pro backend web server...
    start /b node server.js
    timeout /t 2 /nobreak >nul
) else (
    echo [OK] Web server is already active on port 3000.
)

echo.
echo [LAUNCH] Opening Farm Pro User Website in your browser...
start "" "http://localhost:3000/?portal=user"

echo.
echo ==============================================================
echo   User Website is open at: http://localhost:3000/?portal=user
echo   Zero-Admin Mode: Users can browse, scan and submit requests only.
echo ==============================================================
echo.
pause
