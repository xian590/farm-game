@echo off
cd /d "%~dp0"
taskkill /F /FI "IMAGENAME eq node.exe" 2>nul
node server.js
