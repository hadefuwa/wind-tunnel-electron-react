#!/bin/bash

# Wind Tunnel App Startup Script for Raspberry Pi
# This script is used by the systemd service

echo "🍓 Starting Wind Tunnel App on Raspberry Pi..."

# Set environment variables
export DISPLAY=:0
export ELECTRON_DISABLE_SECURITY_WARNINGS=1
export ELECTRON_NO_ATTACH_CONSOLE=1

# Navigate to project directory
cd /home/matrix/wind-tunnel-electron-react

# Check if we're on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    echo "❌ This script is designed for Raspberry Pi"
    exit 1
fi

# Build if needed
if [ ! -f "dist/main/main/index.js" ]; then
    echo "🔨 Building application..."
    npm run build
fi

# Start the application
echo "🚀 Starting Wind Tunnel App..."
npm start
