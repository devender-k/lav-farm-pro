@echo off
REM ===============================================================
REM   Farm Pro - Permanent Worldwide Public Link (lav-farm-pro)
REM   Powered by Lavkush
REM ===============================================================
title Farm Pro - Permanent Worldwide Link (lav-farm-pro)
color 0A

echo.
echo ==============================================================
echo             Farm Pro - PERMANENT WORLDWIDE LINK
echo                     Powered by Lavkush
echo ==============================================================
echo.
echo 🌟 Permanent Website Address (NEVER CHANGES):
echo.
echo   👤 User Portal Link:
echo      👉 https://lav-farm-pro.loca.lt/?portal=user
echo.
echo   👑 Admin Portal Link:
echo      👉 https://lav-farm-pro.loca.lt/?role=admin
echo.
echo   🌍 Main Home:
echo      👉 https://lav-farm-pro.loca.lt
echo.
echo --------------------------------------------------------------
echo ℹ️  FIRST-TIME VISITOR VERIFICATION:
echo    If a phone or PC asks for an 'Endpoint IP' on first opening,
echo    enter your current network IP or click 'Submit':
echo    👉 223.177.96.67
echo    (This only appears once per browser/phone for security)
echo --------------------------------------------------------------
echo.
echo Starting permanent worldwide connection on 'lav-farm-pro'...
echo Press Ctrl+C if you wish to close the tunnel.
echo.

cd /d "%~dp0"
call npx -y localtunnel --port 3000 --subdomain lav-farm-pro

pause
