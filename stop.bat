@echo off
REM Warung HPP Calculator - Stop Script for Windows
REM This script stops both frontend and backend services

echo.
echo ========================================
echo Stopping Warung HPP Calculator...
echo ========================================
echo.

REM Stop Backend (Python processes)
echo [1/2] Stopping Backend...
taskkill /F /IM python.exe > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend stopped
) else (
    echo [WARNING] No backend processes found
)

REM Stop Frontend (Node processes)
echo.
echo [2/2] Stopping Frontend...
taskkill /F /IM node.exe > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend stopped
) else (
    echo [WARNING] No frontend processes found
)

REM Remove PID file if it exists
if exist .pids (
    del .pids
)

echo.
echo ========================================
echo All services stopped!
echo ========================================
echo.
echo Log files preserved:
echo   Backend: backend.log
echo   Frontend: frontend.log
echo.
echo To start services again, run: start.bat
echo.
