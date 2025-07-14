#!/bin/bash

# Fix build script for Raspberry Pi
echo "🔧 Fixing build issues..."

# Clean up existing dist directory
echo "🧹 Cleaning up dist directory..."
rm -rf dist/

# Install TypeScript locally if not available
echo "📦 Ensuring TypeScript is available..."
if ! npx tsc --version &> /dev/null; then
    echo "Installing TypeScript locally..."
    npm install typescript --save-dev
fi

# Build the application
echo "🔨 Building the application..."
npm run build

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully"
    
    # Check if the main entry file exists
    if [ -f "dist/main/index.js" ]; then
        echo "✅ dist/main/index.js exists"
        echo "📄 File size: $(ls -lh dist/main/index.js | awk '{print $5}')"
    else
        echo "❌ dist/main/index.js still missing"
        echo "🔍 Checking what was created..."
        ls -la dist/main/
        exit 1
    fi
else
    echo "❌ Build failed"
    exit 1
fi

echo "🎉 Build fix complete!" 