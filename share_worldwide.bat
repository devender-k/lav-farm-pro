@echo off
REM ===============================================================
REM   Farm Pro - Permanent Worldwide Public Link
REM   Powered by Lavkush
REM ===============================================================
title Farm Pro - Permanent Worldwide Link (lav-medication)
color 0A

echo.
echo ==============================================================
echo             Farm Pro - PERMANENT WORLDWIDE LINK
echo                     Powered by Lavkush
echo ==============================================================
echo.
echo Permanent Website Address:
echo   🌍 Official Link:  https://lav-medication.loca.lt
echo   👤 User Portal:   https://lav-medication.loca.lt/?portal=user
echo   👑 Admin Portal:  https://lav-medication.loca.lt/?role=admin
echo.
echo This website name NEVER changes! Anyone anywhere in the world
echo can open this same link from any smartphone, laptop, or tablet.
echo.
echo --------------------------------------------------------------
echo 🔑 One-Time Friendly Password (if prompted): 223.226.97.139
echo --------------------------------------------------------------
echo.

cd /d "%~dp0"
call npx -y localtunnel --port 3000 --subdomain lav-medication

pause
