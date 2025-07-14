#!/bin/bash

echo "🔍 Checking what's currently running on your Pi..."
echo "=================================================="
echo ""

# Check all running processes
echo "🔄 All running processes:"
echo "-------------------------"
ps aux | grep -E "(node|electron|npm|vite)" | grep -v grep
echo ""

# Check what's listening on ports
echo "🌐 Ports in use:"
echo "----------------"
netstat -tlnp | grep -E ":(3000|3001|3002|3003|8080|8081)"
echo ""

# Check if Electron is running
echo "⚡ Electron processes:"
echo "---------------------"
ps aux | grep electron | grep -v grep
echo ""

# Check if Node.js processes are running
echo "🟢 Node.js processes:"
echo "-------------------"
ps aux | grep node | grep -v grep
echo ""

# Check if Vite is running
echo "🚀 Vite processes:"
echo "-----------------"
ps aux | grep vite | grep -v grep
echo ""

# Check display environment
echo "🖥️ Display environment:"
echo "----------------------"
echo "DISPLAY: $DISPLAY"
echo "XAUTHORITY: $XAUTHORITY"
echo ""

# Check if X server is running
echo "🖥️ X Server status:"
echo "------------------"
if xset q >/dev/null 2>&1; then
    echo "✅ X server is running"
    echo "Active displays:"
    xrandr --listmonitors 2>/dev/null || echo "Could not list monitors"
else
    echo "❌ X server is not accessible"
fi
echo ""

# Check for any GUI windows
echo "🪟 GUI Windows:"
echo "---------------"
if command -v wmctrl >/dev/null 2>&1; then
    wmctrl -l 2>/dev/null || echo "wmctrl not available"
else
    echo "wmctrl not installed"
fi
echo ""

echo "🔍 Check complete!"
echo "==================================================" 