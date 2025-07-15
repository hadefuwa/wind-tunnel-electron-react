#!/bin/bash

# Wind Tunnel App Update Script for Raspberry Pi
# This script updates the app and ensures no test content is shown

set -e

echo "🍓 Updating Wind Tunnel App..."

# Stop the current service
echo "🛑 Stopping current service..."
sudo systemctl stop wind-tunnel-app || true

# Kill any remaining Electron processes
echo "🔪 Killing any remaining Electron processes..."
pkill -f "wind-tunnel-app" || true
pkill -f "electron" || true

# Wait a moment
sleep 2

# Copy updated files to system directory
echo "📁 Copying updated files..."
sudo cp -r * /opt/wind-tunnel-app/

# Set proper ownership
echo "👤 Setting ownership..."
sudo chown -R matrix:matrix /opt/wind-tunnel-app/

# Make sure the start script is executable
echo "🔧 Making start script executable..."
sudo chmod +x /opt/wind-tunnel-app/start.sh

# Build the application
echo "🔨 Building application..."
cd /opt/wind-tunnel-app
npm run build

# Start the service
echo "🚀 Starting updated service..."
sudo systemctl start wind-tunnel-app

# Wait a moment for the app to start
sleep 3

# Check if the app is running
if pgrep -f "wind-tunnel-app" > /dev/null; then
    echo "✅ Wind Tunnel App is now running with updated version!"
    echo "🎉 Test content should be completely removed!"
else
    echo "⚠️  App may not have started properly. Check the logs:"
    echo "   sudo journalctl -u wind-tunnel-app -f"
fi

echo "🎉 Update complete!" 