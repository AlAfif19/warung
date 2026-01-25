@echo off
REM Warung HPP Calculator - Quick Setup Script for Windows
REM This script helps you set up the development environment

echo.
echo ========================================
echo Warung HPP Calculator Setup
echo ========================================
echo.

REM Check prerequisites
echo [1/4] Checking prerequisites...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python 3 is not installed. Please install Python 3.10+ first.
    echo Visit: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python found

where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] MySQL is not installed or not in PATH.
    echo Please install MySQL 8.0+ and ensure it's running.
    echo Visit: https://dev.mysql.com/downloads/mysql/
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" (
        exit /b 1
    )
) else (
    echo [OK] MySQL found
)

echo.
echo [2/4] Setting up backend...

cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo [WARNING] Please edit backend\.env with your database credentials
)

cd ..

echo.
echo [3/4] Setting up frontend...

cd frontend

REM Install dependencies
echo Installing Node.js dependencies...
call npm install

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

cd ..

echo.
echo [4/4] Database setup...

set /p setup_db="Do you want to set up the database now? (y/n): "
if /i "%setup_db%"=="y" (
    set /p mysql_password="Enter MySQL root password: "
    
    mysql -u root -p%mysql_password% < database\schema.sql
    
    if %errorlevel% equ 0 (
        echo [OK] Database setup completed successfully!
    ) else (
        echo [ERROR] Database setup failed. Please check your credentials.
    )
)

echo.
echo ========================================
echo Setup completed!
echo ========================================
echo.
echo Next steps:
echo   1. Edit backend\.env with your database credentials
echo   2. Edit frontend\.env if needed (default: http://localhost:8000)
echo   3. Start MySQL service
echo   4. Run backend: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn main:app --reload
echo   5. Run frontend: cd frontend ^&^& npm run dev
echo.
echo Access the application:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo For more information, see README.md
echo.
pause
