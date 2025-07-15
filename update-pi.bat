@echo off
echo ========================================
echo Wind Tunnel App - Pi Update Script
echo ========================================
echo.

echo This script will help you update your Raspberry Pi with the latest code.
echo.

set /p PI_IP="Enter your Pi's IP address (e.g., 192.168.1.100): "
set /p PI_USER="Enter your Pi username (default: pi): "

if "%PI_USER%"=="" set PI_USER=pi

echo.
echo Updating Pi at %PI_IP% with user %PI_USER%...
echo.

echo 1. Stopping the wind tunnel service...
ssh %PI_USER%@%PI_IP% "sudo systemctl stop wind-tunnel-app.service"

echo 2. Pulling latest code...
ssh %PI_USER%@%PI_IP% "cd /home/%PI_USER%/wind-tunnel-electron-react && git pull origin main"

echo 3. Installing dependencies...
ssh %PI_USER%@%PI_IP% "cd /home/%PI_USER%/wind-tunnel-electron-react && npm install"

echo 4. Building the app...
ssh %PI_USER%@%PI_IP% "cd /home/%PI_USER%/wind-tunnel-electron-react && npm run build"

echo 5. Starting the service...
ssh %PI_USER%@%PI_IP% "sudo systemctl start wind-tunnel-app.service"

echo 6. Checking service status...
ssh %PI_USER%@%PI_IP% "sudo systemctl status wind-tunnel-app.service"

echo.
echo ========================================
echo Update complete!
echo ========================================
echo.
echo Your Pi should now be running the updated app.
echo If you're still seeing the old UI, try:
echo 1. Refresh the browser (Ctrl+F5)
echo 2. Clear browser cache
echo 3. Restart the Pi: ssh %PI_USER%@%PI_IP% "sudo reboot"
echo.
pause 