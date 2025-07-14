#!/bin/bash

# Fix Main Path Script for Raspberry Pi
# This script fixes the dist/main/main/index.js path issue

echo "🔧 Fixing main path issue..."

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project directory"
    exit 1
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ No dist directory found. Please run 'npm run build' first."
    exit 1
fi

# Check if the main/main structure exists
if [ -f "dist/main/main/index.js" ]; then
    echo "✅ Found main process at dist/main/main/index.js"
    
    # Create symlinks to fix the path
    echo "🔗 Creating symlinks to fix path..."
    ln -sf dist/main/main/index.js dist/main/index.js
    ln -sf dist/main/main/preload.js dist/main/preload.js
    
    echo "✅ Symlinks created:"
    echo "   dist/main/index.js -> dist/main/main/index.js"
    echo "   dist/main/preload.js -> dist/main/main/preload.js"
    
elif [ -f "dist/main/index.js" ]; then
    echo "✅ Main process already at correct location: dist/main/index.js"
    
else
    echo "❌ No main process found. Please run 'npm run build' first."
    exit 1
fi

echo "🎉 Main path issue fixed!"
echo "🚀 You can now run the application normally." 