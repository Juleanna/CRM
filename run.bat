@echo off
echo ========================================
echo   Fabryka CRM - Start
echo ========================================
echo.
echo Django backend:  http://localhost:8000
echo Django admin:    http://localhost:8000/admin/
echo React frontend:  http://localhost:5173
echo.
echo Press Ctrl+C in any window to stop.
echo ========================================
echo.

:: Start Django backend in a new window
start "Django Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python manage.py runserver 0.0.0.0:8000"

:: Small delay
timeout /t 2 /nobreak >nul

:: Start Vite frontend in a new window
start "Vite Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Servers started in separate windows.
echo.
pause
