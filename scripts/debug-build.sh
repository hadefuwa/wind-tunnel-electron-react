#!/bin/bash

# Debug build script for Raspberry Pi
echo "🔍 Debugging build process..."

# Check current directory
echo "📁 Current directory: $(pwd)"

# Check if TypeScript is installed
echo "📦 Checking TypeScript installation..."
if command -v tsc &> /dev/null; then
    echo "✅ TypeScript is installed"
    tsc --version
else
    echo "❌ TypeScript not found in PATH"
    echo "Installing TypeScript globally..."
    npm install -g typescript
fi

# Check if dist directory exists
echo "📂 Checking dist directory..."
if [ -d "dist" ]; then
    echo "✅ dist directory exists"
    ls -la dist/
else
    echo "❌ dist directory not found"
fi

# Check if dist/main exists
echo "📂 Checking dist/main directory..."
if [ -d "dist/main" ]; then
    echo "✅ dist/main directory exists"
    ls -la dist/main/
else
    echo "❌ dist/main directory not found"
fi

# Try to compile main process
echo "🔨 Compiling main process..."
tsc -p tsconfig.main.json

# Check compilation result
if [ $? -eq 0 ]; then
    echo "✅ Main process compilation successful"
    if [ -f "dist/main/index.js" ]; then
        echo "✅ dist/main/index.js exists"
        echo "📄 File size: $(ls -lh dist/main/index.js | awk '{print $5}')"
    else
        echo "❌ dist/main/index.js not found after compilation"
    fi
else
    echo "❌ Main process compilation failed"
fi

# Check package.json main entry
echo "📋 Checking package.json main entry..."
MAIN_ENTRY=$(node -p "require('./package.json').main")
echo "Main entry: $MAIN_ENTRY"

# Check if main entry file exists
if [ -f "$MAIN_ENTRY" ]; then
    echo "✅ Main entry file exists: $MAIN_ENTRY"
else
    echo "❌ Main entry file not found: $MAIN_ENTRY"
fi

echo "�� Debug complete!" 