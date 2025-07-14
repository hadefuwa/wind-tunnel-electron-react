#!/bin/bash

# Debug build script for Raspberry Pi
echo "🔍 Debugging build process..."

# Check current directory
echo "📁 Current directory: $(pwd)"

# Check if TypeScript is available via npx
echo "📦 Checking TypeScript availability..."
if npx tsc --version &> /dev/null; then
    echo "✅ TypeScript is available via npx"
    npx tsc --version
else
    echo "❌ TypeScript not available via npx"
    echo "Installing TypeScript locally..."
    npm install typescript --save-dev
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
    
    # Check for symlink issues
    if [ -L "dist/main/index.js" ]; then
        echo "⚠️  dist/main/index.js is a symlink"
        echo "🔗 Symlink target: $(readlink dist/main/index.js)"
        
        # Check if the target exists
        TARGET=$(readlink dist/main/index.js)
        if [ -f "$TARGET" ]; then
            echo "✅ Symlink target exists: $TARGET"
        else
            echo "❌ Symlink target missing: $TARGET"
        fi
    fi
else
    echo "❌ dist/main directory not found"
fi

# Try to compile main process using npx
echo "🔨 Compiling main process..."
npx tsc -p tsconfig.main.json

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

# Check if main entry file exists (including symlinks)
if [ -e "$MAIN_ENTRY" ]; then
    echo "✅ Main entry file exists: $MAIN_ENTRY"
    if [ -L "$MAIN_ENTRY" ]; then
        echo "🔗 It's a symlink to: $(readlink $MAIN_ENTRY)"
    fi
else
    echo "❌ Main entry file not found: $MAIN_ENTRY"
fi

echo "�� Debug complete!" 