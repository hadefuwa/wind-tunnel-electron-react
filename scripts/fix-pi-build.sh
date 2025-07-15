#!/bin/bash

# Fix Pi Build Script
# This script properly builds and packages the app for Raspberry Pi

echo "🔧 Fixing Pi build..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the app
echo "🏗️ Building the app..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not created"
    exit 1
fi

# Package for Pi
echo "📦 Packaging for Pi..."
npm run package-pi

echo "✅ Build and packaging complete!"
echo "🚀 The app should now work properly on the Pi"
echo "📁 Built files are in: dist/"
echo "📦 Pi package is in: release/pi/" 