@echo off
REM Fix Recharts Dependency Script
REM This script will clean and reinstall npm dependencies

echo ========================================
echo    Fix Recharts Dependency Issue
echo ========================================
echo.

cd /d "D:\itp\Hospital-Management-System\frontend"

echo [1/5] Removing node_modules directory...
if exist node_modules (
    rmdir /s /q node_modules
    echo    Done!
) else (
    echo    Directory not found, skipping...
)
echo.

echo [2/5] Removing package-lock.json...
if exist package-lock.json (
    del /f /q package-lock.json
    echo    Done!
) else (
    echo    File not found, skipping...
)
echo.

echo [3/5] Clearing npm cache...
call npm cache clean --force
echo    Done!
echo.

echo [4/5] Installing all dependencies...
echo    This may take a few minutes...
call npm install
echo.

echo [5/5] Verifying recharts installation...
call npm list recharts
echo.

echo ========================================
echo    Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npm run dev
echo 2. Open your browser to test the dashboard
echo.

pause
