#!/bin/bash

# Wind Tunnel App - Raspberry Pi Update Script
# This script pulls the latest changes from GitHub and restarts the application

echo "🔄 Starting Wind Tunnel App update on Raspberry Pi..."

# Navigate to the project directory
# Updated to use matrix user's home directory
PROJECT_DIR="/home/matrix/wind-tunnel-electron-react"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found at $PROJECT_DIR"
    echo "Please update the PROJECT_DIR variable in this script to match your Pi's project location"
    exit 1
fi

cd "$PROJECT_DIR"

echo "📁 Working directory: $(pwd)"

# Check if git repository exists
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please clone the repository first:"
    echo "git clone <your-repo-url> ."
    exit 1
fi

# Stop any running instances of the app
echo "🛑 Stopping any running instances..."
pkill -f "wind-tunnel-electron" || true
pkill -f "electron" || true

# Pull latest changes from GitHub
echo "⬇️  Pulling latest changes from GitHub..."
git fetch origin
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull changes from GitHub"
    exit 1
fi

echo "✅ Successfully pulled latest changes"

# Install/update dependencies
echo "📦 Installing/updating dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build the application"
    exit 1
fi

# Start the application
echo "🚀 Starting the Wind Tunnel App..."
npm start &

# Wait a moment for the app to start
sleep 3

# Check if the app is running
if pgrep -f "wind-tunnel-electron" > /dev/null; then
    echo "✅ Wind Tunnel App is now running!"
    echo "📱 Touchscreen scrolling should now work properly"
else
    echo "⚠️  App may not have started properly. Check the logs above."
fi

echo "🎉 Update complete!" 