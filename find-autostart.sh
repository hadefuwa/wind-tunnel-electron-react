#!/bin/bash

echo "🔍 Finding Wind Tunnel App Autostart Methods on Raspberry Pi..."
echo "================================================================"
echo ""

# Check systemd services
echo "📋 Checking systemd services..."
echo "-------------------------------"
systemctl list-units --type=service --state=running | grep -i wind
systemctl list-units --type=service --state=active | grep -i wind
echo ""

# Check for specific service files
echo "📁 Checking for service files..."
echo "--------------------------------"
if [ -f "/etc/systemd/system/wind-tunnel-app.service" ]; then
    echo "✅ Found: /etc/systemd/system/wind-tunnel-app.service"
    systemctl status wind-tunnel-app --no-pager -l
elif [ -f "/etc/systemd/system/wind-tunnel.service" ]; then
    echo "✅ Found: /etc/systemd/system/wind-tunnel.service"
    systemctl status wind-tunnel --no-pager -l
else
    echo "❌ No wind tunnel service files found"
fi
echo ""

# Check autostart directories
echo "📂 Checking autostart directories..."
echo "-----------------------------------"
if [ -f "/home/matrix/.config/autostart/wind-tunnel.desktop" ]; then
    echo "✅ Found: /home/matrix/.config/autostart/wind-tunnel.desktop"
    cat /home/matrix/.config/autostart/wind-tunnel.desktop
elif [ -f "/home/pi/.config/autostart/wind-tunnel.desktop" ]; then
    echo "✅ Found: /home/pi/.config/autostart/wind-tunnel.desktop"
    cat /home/pi/.config/autostart/wind-tunnel.desktop
else
    echo "❌ No autostart .desktop files found"
fi
echo ""

# Check system-wide autostart
echo "🌐 Checking system-wide autostart..."
echo "-----------------------------------"
if [ -f "/etc/xdg/autostart/wind-tunnel.desktop" ]; then
    echo "✅ Found: /etc/xdg/autostart/wind-tunnel.desktop"
    cat /etc/xdg/autostart/wind-tunnel.desktop
else
    echo "❌ No system-wide autostart files found"
fi
echo ""

# Check rc.local
echo "📝 Checking rc.local..."
echo "----------------------"
if [ -f "/etc/rc.local" ]; then
    echo "✅ Found: /etc/rc.local"
    grep -i wind /etc/rc.local || echo "No wind tunnel entries found"
else
    echo "❌ No rc.local file found"
fi
echo ""

# Check crontab
echo "⏰ Checking crontab..."
echo "---------------------"
crontab -l 2>/dev/null | grep -i wind || echo "No wind tunnel entries in crontab"
echo ""

# Check running processes
echo "🔄 Checking running processes..."
echo "-------------------------------"
ps aux | grep -i wind | grep -v grep || echo "No wind tunnel processes found"
echo ""

# Check what's listening on common ports
echo "🌐 Checking network ports..."
echo "----------------------------"
netstat -tlnp | grep -E ":(3000|3001|8080|8081)" || echo "No wind tunnel ports found"
echo ""

# Check if app is in project directory
echo "📁 Checking project directory..."
echo "-------------------------------"
if [ -d "/home/matrix/wind-tunnel-electron-react" ]; then
    echo "✅ Project directory exists: /home/matrix/wind-tunnel-electron-react"
    ls -la /home/matrix/wind-tunnel-electron-react/start.sh 2>/dev/null || echo "❌ start.sh not found"
    ls -la /home/matrix/wind-tunnel-electron-react/package.json 2>/dev/null || echo "❌ package.json not found"
else
    echo "❌ Project directory not found"
fi
echo ""

echo "🔍 Autostart detection complete!"
echo "================================================================"
