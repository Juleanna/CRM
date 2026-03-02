@echo off
echo ========================================
echo   Database Migrations
echo ========================================
echo.
cd /d %~dp0backend
call venv\Scripts\activate.bat

echo Creating migrations...
python manage.py makemigrations
echo.

echo Applying migrations...
python manage.py migrate
echo.

echo Done!
pause
