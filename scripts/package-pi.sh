#!/bin/bash

# Raspberry Pi Packaging Script
# This script creates a simple package for Raspberry Pi without using electron-builder

echo "🍓 Packaging for Raspberry Pi..."

# Create output directory
mkdir -p release/pi

# Copy built files
echo "📁 Copying built files..."
cp -r dist/* release/pi/
cp package.json release/pi/
cp -r node_modules release/pi/

# Create startup script
cat > release/pi/start.sh << 'EOF'
#!/bin/bash
# Wind Tunnel Application Startup Script for Raspberry Pi

echo "🚀 Starting Wind Tunnel Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node --version)"
    exit 1
fi

# Start the application
echo "✅ Starting application..."
node dist/main/index.js
EOF

# Make startup script executable
chmod +x release/pi/start.sh

# Create desktop shortcut
cat > release/pi/wind-tunnel.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Wind Tunnel Application
Comment=Wind tunnel data acquisition and visualization
Exec=/usr/bin/node /opt/wind-tunnel/dist/main/index.js
Icon=/opt/wind-tunnel/icon.png
Terminal=false
Categories=Science;Engineering;
EOF

# Create installation script
cat > release/pi/install.sh << 'EOF'
#!/bin/bash
# Installation script for Wind Tunnel Application on Raspberry Pi

echo "🍓 Installing Wind Tunnel Application..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Create application directory
INSTALL_DIR="/opt/wind-tunnel"
echo "📁 Installing to $INSTALL_DIR..."

# Copy files
cp -r * $INSTALL_DIR/
chmod +x $INSTALL_DIR/start.sh

# Create desktop shortcut
cp wind-tunnel.desktop /usr/share/applications/

# Create systemd service
cat > /etc/systemd/system/wind-tunnel.service << 'SERVICE_EOF'
[Unit]
Description=Wind Tunnel Application
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/opt/wind-tunnel
ExecStart=/usr/bin/node dist/main/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# Enable service
systemctl enable wind-tunnel.service

echo "✅ Installation complete!"
echo "🚀 To start the application:"
echo "   - Desktop: Look for 'Wind Tunnel Application' in the menu"
echo "   - Service: sudo systemctl start wind-tunnel"
echo "   - Manual: cd /opt/wind-tunnel && ./start.sh"
EOF

chmod +x release/pi/install.sh

echo "✅ Raspberry Pi package created in release/pi/"
echo "📦 To install on Pi:"
echo "   1. Copy release/pi/ to your Raspberry Pi"
echo "   2. Run: sudo ./install.sh"
echo "   3. Or run manually: ./start.sh" 