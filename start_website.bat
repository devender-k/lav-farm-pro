@echo off
REM ===============================================================
REM   Farm Pro Website - Powered by Lavkush
REM   One-Click Web Server & Application Launcher
REM ===============================================================
title Farm Pro Web Portal - Powered by Lavkush
color 0A

echo.
echo ==============================================================
echo             Farm Pro Web Portal - Powered by Lavkush
echo            Smart Farming, Plant AI Scanner ^& Admin Hub
echo ==============================================================
echo.

REM --- Step 1: Check Node.js ---
echo [1/3] Checking Node.js runtime...
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Node.js is NOT installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/ (LTS Recommended)
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v 2^>^&1') do set NODEVER=%%v
echo [OK] Node.js %NODEVER% detected.
echo.

REM --- Step 2: Check Dependencies ---
echo [2/3] Checking web dependencies...
if not exist node_modules (
    echo [INFO] Installing packages (express, cors, multer)...
    call npm install
) else (
    echo [OK] Dependencies ready.
)
echo.

REM --- Step 3: Launch Web Server & Browser ---
echo [3/3] Starting Farm Pro Web Server...
echo.
echo ==============================================================
echo   Server is active! Opening web interface in your browser...
echo   Local Address:      http://localhost:3000
echo   Worldwide Address:  https://lav-farm-pro.loca.lt (Permanent)
echo   Press Ctrl+C to stop the server when done.
echo ==============================================================
echo.

cd /d "%~dp0"
start "" "http://localhost:3000"
node server.js

pause
