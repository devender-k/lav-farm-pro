@echo off
REM ===============================================================
REM   Farm Pro - User Worldwide Link (lav-medication)
REM   Powered by Lavkush
REM ===============================================================
title Farm Pro - lav-medication User Worldwide Link
color 0A

echo.
echo ==============================================================
echo             Farm Pro - USER WORLDWIDE LINK
echo                   Powered by Lavkush
echo ==============================================================
echo.
echo Mode: USER ONLY (Zero Admin Rights)
echo Users can view crops, run AI scans, and submit consultation requests.
echo They DO NOT have any right to change anything on the website.
echo.
echo Starting secure public tunnel on subdomain: lav-medication...
echo.
echo --------------------------------------------------------------
echo 🌍 Public Worldwide Link: https://lav-medication.loca.lt
echo 🔑 One-Time Tunnel Password (if prompted): 223.226.97.139
echo --------------------------------------------------------------
echo.

cd /d "%~dp0"
call npx -y localtunnel --port 3000 --subdomain lav-medication

pause
