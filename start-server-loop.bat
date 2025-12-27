@echo off
title KhakiSol Webhook Server - AUTO RESTART
cd /d c:\shopify
color 0A

:loop
echo.
echo ========================================
echo   KhakiSol Webhook Server
echo   Auto-restart enabled
echo   DO NOT CLOSE THIS WINDOW
echo ========================================
echo.
echo Starting server at %time%...
echo.
node src/server.js

echo.
echo Server stopped at %time%
echo Restarting in 3 seconds...
timeout /t 3 /nobreak >nul
goto loop
