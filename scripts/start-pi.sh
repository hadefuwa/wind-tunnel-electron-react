#!/bin/bash

# Raspberry Pi startup script for Wind Tunnel App
echo "🍓 Starting Wind Tunnel App on Raspberry Pi..."

# Check if we're on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    echo "❌ This script is designed for Raspberry Pi"
    exit 1
fi

# Check display environment
echo "🖥️  Checking display environment..."
if [ -z "$DISPLAY" ]; then
    echo "⚠️  No DISPLAY environment variable set"
    
    # Try to set up display
    if [ -f "/tmp/.X11-unix/X0" ]; then
        echo "✅ X11 socket found, setting DISPLAY=:0"
        export DISPLAY=:0
    elif [ -f "/tmp/.X11-unix/X1" ]; then
        echo "✅ X11 socket found, setting DISPLAY=:1"
        export DISPLAY=:1
    else
        echo "❌ No X11 socket found"
        echo "🖥️  Starting in headless mode..."
        export DISPLAY=""
    fi
else
    echo "✅ DISPLAY is set to: $DISPLAY"
fi

# Check if we can connect to X server
if [ -n "$DISPLAY" ]; then
    if xset q >/dev/null 2>&1; then
        echo "✅ X server connection successful"
    else
        echo "❌ Cannot connect to X server, switching to headless mode"
        export DISPLAY=""
    fi
fi

# Set up environment for Electron
export ELECTRON_DISABLE_SECURITY_WARNINGS=1
export ELECTRON_NO_ATTACH_CONSOLE=1

# Navigate to project directory
cd /home/matrix/wind-tunnel-electron-react

# Build if needed
if [ ! -f "dist/main/main/index.js" ]; then
    echo "🔨 Building application..."
    npm run build
fi

# Start the application
echo "🚀 Starting Wind Tunnel App..."
if [ -z "$DISPLAY" ]; then
    echo "🖥️  Running in headless mode"
    npm start
else
    echo "🖥️  Running with GUI"
    npm start
fi 