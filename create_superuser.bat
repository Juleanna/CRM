@echo off
echo ========================================
echo   Create Superuser
echo ========================================
echo.
cd /d %~dp0backend
call venv\Scripts\activate.bat
python manage.py createsuperuser
pause
