@echo off
echo ========================================
echo   Fabryka CRM - Initial Setup
echo ========================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Install Python 3.12+
    pause
    exit /b 1
)

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Install Node.js 20+
    pause
    exit /b 1
)

echo [1/5] Creating Python virtual environment...
cd /d %~dp0backend
if not exist "venv" (
    python -m venv venv
)

echo [2/5] Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo [3/5] Installing Node.js dependencies...
cd /d %~dp0frontend
call npm install

echo [4/5] Copying .env file...
cd /d %~dp0
if not exist ".env" (
    copy .env.example .env
    echo [INFO] Created .env from .env.example. Edit DB settings!
) else (
    echo [INFO] .env already exists, skipping.
)

echo [5/6] Creating migrations...
cd /d %~dp0backend
call venv\Scripts\activate.bat
python manage.py makemigrations

echo [6/6] Applying migrations...
python manage.py migrate

echo.
echo ========================================
echo   Setup complete!
echo ========================================
echo.
echo To create superuser run: create_superuser.bat
echo To start the project run: run.bat
echo.
pause
