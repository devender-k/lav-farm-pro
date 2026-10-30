@echo off
REM ===============================================================
REM   Farm Pro - Admin Website Launcher
REM   Powered by Lavkush
REM ===============================================================
title Farm Pro - Admin Website (Full Management Rights)
color 0E

echo.
echo ==============================================================
echo             Farm Pro - ADMIN WEBSITE PORTAL
echo                   Powered by Lavkush
echo ==============================================================
echo.
echo Mode: ADMIN MODE (Lavkush)
echo Rights:
echo   - Full edit/delete rights over plant diseases ^& cure guides
echo   - Review user diagnosis requests ^& prescribe custom remedies
echo   - Remote launch and control of native FarmCare Pro desktop app
echo   - Configure system announcements, contacts ^& branding
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
echo [LAUNCH] Opening Farm Pro Admin Website in your browser...
start "" "http://localhost:3000/?role=admin"

echo.
echo ==============================================================
echo   Admin Website is open at: http://localhost:3000/?role=admin
echo   Full management rights are unlocked!
echo ==============================================================
echo.
pause
