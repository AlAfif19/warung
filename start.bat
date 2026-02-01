@echo off
REM Warung HPP Calculator - Start Script for Windows
REM This script starts both frontend and backend services

echo.
echo ========================================
echo Starting Warung HPP Calculator...
echo ========================================
echo.

REM PID file to track running processes
set PID_FILE=.pids

REM Check if already running
if exist %PID_FILE% (
    echo [WARNING] Services might already be running. Use 'stop.bat' first to stop them.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" (
        exit /b 1
    )
)

REM Start Backend
echo [1/2] Starting Backend (FastAPI)...
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo [ERROR] Virtual environment not found. Please run 'setup.bat' first.
    cd ..
    exit /b 1
)

REM Activate virtual environment and start backend in background
call venv\Scripts\activate.bat
start /B cmd /C "uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ..\backend.log 2>&1"

REM Get the backend PID (using tasklist and findstr)
for /f "tokens=2" %%i in ('tasklist ^| findstr /i "python.exe" ^| findstr /i /v "findstr"') do (
    set BACKEND_PID=%%i
    goto :backend_found
)
:backend_found
echo %BACKEND_PID% > ..\%PID_FILE%

echo [OK] Backend started
echo      Logs: backend.log

cd ..

REM Wait a moment for backend to start
timeout /t 2 /nobreak > nul

REM Start Frontend
echo.
echo [2/2] Starting Frontend (Next.js)...
cd frontend

REM Start frontend in background
start /B cmd /C "npm run dev > ..\frontend.log 2>&1"

REM Get the frontend PID (using tasklist and findstr)
for /f "tokens=2" %%i in ('tasklist ^| findstr /i "node.exe" ^| findstr /i /v "findstr"') do (
    set FRONTEND_PID=%%i
    goto :frontend_found
)
:frontend_found
echo %FRONTEND_PID% >> ..\%PID_FILE%

echo [OK] Frontend started
echo      Logs: frontend.log

cd ..

echo.
echo ========================================
echo All services started successfully!
echo ========================================
echo.
echo PIDs saved to: %PID_FILE%
echo.
echo Access the application:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo View logs:
echo   Backend: type backend.log
echo   Frontend: type frontend.log
echo.
echo To stop all services, run: stop.bat
echo.
