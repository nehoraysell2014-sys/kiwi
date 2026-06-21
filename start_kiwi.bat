@echo off
echo ===================================================
echo   Starting Kiwi Educational Assistant...
echo ===================================================
echo.

:: Start the Vite development server in a new command window
start "Kiwi Educational Assistant Server" cmd /k "npm run dev"

:: Wait a couple of seconds for the server to spin up
timeout /t 2 /nobreak >nul

:: Open the browser to the local development URL
echo Opening http://localhost:5173 in your default browser...
start http://localhost:5173

exit
