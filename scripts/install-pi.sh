#!/bin/bash

# Simple Wind Tunnel Application Installation for Raspberry Pi
# Run this script on your Raspberry Pi to set up autostart

echo "🍓 Installing Wind Tunnel Application Autostart..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Configuration
APP_DIR="/opt/wind-tunnel"
USER="pi"

# Create application directory
echo "📁 Creating application directory..."
mkdir -p "$APP_DIR"
chown "$USER:$USER" "$APP_DIR"

# Copy current project to application directory
echo "📦 Copying application files..."
cp -r . "$APP_DIR/"
chown -R "$USER:$USER" "$APP_DIR"

# Create startup script
echo "🚀 Creating startup script..."
cat > "$APP_DIR/start.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Starting Wind Tunnel Application..."

# Check if running in headless mode
if [ -z "$DISPLAY" ]; then
    echo "🍓 Headless mode detected - starting web service..."
    npm run dev:renderer
else
    echo "🖥️ Desktop mode detected - starting full application..."
    # Fix the main path issue - check both possible locations
    if [ -f "dist/main/main/index.js" ]; then
        echo "✅ Found main process at dist/main/main/index.js"
        node dist/main/main/index.js
    elif [ -f "dist/main/index.js" ]; then
        echo "✅ Found main process at dist/main/index.js"
        node dist/main/index.js
    else
        echo "⚠️ No built main process found, starting development mode..."
        npm run dev
    fi
fi
EOF

chmod +x "$APP_DIR/start.sh"
chown "$USER:$USER" "$APP_DIR/start.sh"

# Create systemd service
echo "🔧 Creating systemd service..."
cat > "/etc/systemd/system/wind-tunnel.service" << EOF
[Unit]
Description=Wind Tunnel Application
After=network.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/start.sh
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable wind-tunnel.service

# Create management script
echo "📋 Creating management script..."
cat > "$APP_DIR/manage.sh" << 'EOF'
#!/bin/bash

case "$1" in
    start)
        echo "🚀 Starting Wind Tunnel Application..."
        sudo systemctl start wind-tunnel
        ;;
    stop)
        echo "⏹️ Stopping Wind Tunnel Application..."
        sudo systemctl stop wind-tunnel
        ;;
    restart)
        echo "🔄 Restarting Wind Tunnel Application..."
        sudo systemctl restart wind-tunnel
        ;;
    status)
        echo "📊 Wind Tunnel Application Status:"
        sudo systemctl status wind-tunnel
        ;;
    logs)
        echo "📋 Wind Tunnel Application Logs:"
        sudo journalctl -u wind-tunnel -f
        ;;
    web)
        echo "🌐 Starting Web Service Mode..."
        cd "$(dirname "$0")"
        npm run dev:renderer
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|web}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the application service"
        echo "  stop    - Stop the application service"
        echo "  restart - Restart the application service"
        echo "  status  - Show service status"
        echo "  logs    - Show service logs"
        echo "  web     - Start web service mode"
        exit 1
        ;;
esac
EOF

chmod +x "$APP_DIR/manage.sh"
chown "$USER:$USER" "$APP_DIR/manage.sh"

echo "✅ Installation completed!"
echo ""
echo "🎉 Wind Tunnel Application installed to: $APP_DIR"
echo ""
echo "🚀 Management Commands:"
echo "   sudo systemctl start wind-tunnel    # Start service"
echo "   sudo systemctl stop wind-tunnel     # Stop service"
echo "   sudo systemctl status wind-tunnel   # Check status"
echo "   $APP_DIR/manage.sh logs             # View logs"
echo "   $APP_DIR/manage.sh web              # Start web mode"
echo ""
echo "📋 Next Steps:"
echo "   1. Start the service: sudo systemctl start wind-tunnel"
echo "   2. Check status: sudo systemctl status wind-tunnel"
echo "   3. Access web interface: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "🌐 The application will automatically start on boot!" 