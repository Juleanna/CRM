@echo off
echo ========================================
echo   Fabryka CRM - Create Database
echo ========================================
echo.

psql -h localhost -U postgres -c "CREATE DATABASE fabryka_db;" 2>nul

if %errorlevel% equ 0 (
    echo Database 'fabryka_db' created successfully!
) else (
    echo Database may already exist or connection failed.
)

echo.
pause
