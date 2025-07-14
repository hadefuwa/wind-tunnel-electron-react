#!/bin/bash

# Test compilation script
echo "🧪 Testing TypeScript compilation..."

# Clean dist directory
rm -rf dist/

# Compile main process
echo "🔨 Compiling main process..."
npx tsc -p tsconfig.main.json

# Check result
if [ $? -eq 0 ]; then
    echo "✅ Compilation successful"
    
    # Check file structure
    echo "📂 Checking file structure..."
    if [ -f "dist/main/main/index.js" ]; then
        echo "✅ dist/main/main/index.js exists"
        echo "📄 File size: $(ls -lh dist/main/main/index.js | awk '{print $5}')"
        echo "📄 First few lines:"
        head -5 dist/main/main/index.js
    else
        echo "❌ dist/main/main/index.js not found"
        echo "📂 What was created:"
        find dist/ -type f -name "*.js" | head -10
    fi
else
    echo "❌ Compilation failed"
    exit 1
fi

echo "🧪 Test complete!" 