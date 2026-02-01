@echo off
REM Warung HPP Calculator - Stop Script for Windows
REM This script stops both frontend and backend services

echo.
echo ========================================
echo Stopping Warung HPP Calculator...
echo ========================================
echo.

REM PID file to track running processes
set PID_FILE=.pids

REM Check if PID file exists
if not exist %PID_FILE% (
    echo [WARNING] No running services found (PID file not found).
    echo          Services might not be running or were stopped manually.
    exit /b 0
)

REM Read PIDs from file
set /p BACKEND_PID=<%PID_FILE%
set /p FRONTEND_PID=<%PID_FILE%

REM Stop Backend
echo [1/2] Stopping Backend...
taskkill /F /PID %BACKEND_PID% > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend stopped (PID: %BACKEND_PID%)
) else (
    echo [WARNING] Backend process not found (PID: %BACKEND_PID%)
)

REM Stop Frontend
echo.
echo [2/2] Stopping Frontend...
taskkill /F /PID %FRONTEND_PID% > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend stopped (PID: %FRONTEND_PID%)
) else (
    echo [WARNING] Frontend process not found (PID: %FRONTEND_PID%)
)

REM Remove PID file
del %PID_FILE%

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
