@echo off
echo Django Backend - http://localhost:8000
echo.
cd /d %~dp0backend
call venv\Scripts\activate.bat
python manage.py runserver 0.0.0.0:8000
