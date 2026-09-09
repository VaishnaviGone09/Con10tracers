@echo off
REM CON10TRACERS Backend Startup Script for Windows

echo CON10TRACERS Backend Startup
echo =============================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment.
        echo Please ensure Python 3.11+ is installed and accessible.
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)

REM Load demo data
echo Loading demo data...
python -m data.synthetic.demo_data

REM Start the application
echo.
echo Starting FastAPI application...
echo API Documentation will be available at: http://localhost:8000/docs
echo.
python -m app.main

pause
