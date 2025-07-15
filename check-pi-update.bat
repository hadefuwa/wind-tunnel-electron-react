@echo off
echo ========================================
echo Wind Tunnel App - Raspberry Pi Update
echo ========================================
echo.

echo Checking if Raspberry Pi is accessible...
ping -n 1 raspberrypi.local >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Cannot reach raspberrypi.local
    echo Please make sure your Pi is connected to the network
    pause
    exit /b 1
)

echo.
echo Connecting to Raspberry Pi...
echo.

echo Current commit on your local machine:
git log --oneline -1

echo.
echo Checking Raspberry Pi status...
ssh matrix@raspberrypi.local "cd /home/matrix/wind-tunnel-electron-react && echo 'Current commit on Pi:' && git log --oneline -1 && echo. && echo 'Checking for updates...' && git fetch origin && git status"

echo.
echo Do you want to update the Raspberry Pi? (y/n)
set /p choice=
if /i "%choice%"=="y" (
    echo.
    echo Updating Raspberry Pi...
    ssh matrix@raspberrypi.local "cd /home/matrix/wind-tunnel-electron-react && git pull origin main && npm install && npm run build && sudo systemctl restart wind-tunnel"
    echo.
    echo Update complete! The app should restart automatically.
) else (
    echo Update cancelled.
)

echo.
pause 