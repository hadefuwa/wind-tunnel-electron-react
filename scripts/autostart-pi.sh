#!/bin/bash

# Wind Tunnel Application Autostart Script for Raspberry Pi
# This script sets up automatic startup for the wind tunnel application

set -e

echo "🍓 Setting up Wind Tunnel Application Autostart..."

# Configuration
APP_NAME="wind-tunnel"
APP_DIR="/opt/wind-tunnel"
USER="pi"
SERVICE_FILE="/etc/systemd/system/wind-tunnel.service"
DESKTOP_FILE="/usr/share/applications/wind-tunnel.desktop"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run as root (use sudo)"
        exit 1
    fi
}

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Installing Node.js 18+..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) found"
}

# Check if SPI is enabled
check_spi() {
    if [ ! -e "/dev/spidev0.0" ]; then
        print_warning "SPI not enabled. Enabling SPI..."
        raspi-config nonint do_spi 0
        print_warning "SPI enabled. Reboot required after installation."
    else
        print_success "SPI is enabled"
    fi
}

# Install system dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    
    apt-get update
    apt-get install -y \
        libgtk-3-0 \
        libnotify4 \
        libnss3 \
        libxss1 \
        libxtst6 \
        xdg-utils \
        libatspi2.0-0 \
        libdrm2 \
        libxkbcommon0 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxrandr2 \
        libgbm1 \
        libasound2 \
        git \
        curl \
        wget
}

# Create application directory
create_app_directory() {
    print_status "Creating application directory..."
    
    mkdir -p "$APP_DIR"
    chown "$USER:$USER" "$APP_DIR"
}

# Copy application files
copy_app_files() {
    print_status "Copying application files..."
    
    # Get the directory where this script is located
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
    
    # Copy built files if they exist
    if [ -d "$PROJECT_DIR/dist" ]; then
        cp -r "$PROJECT_DIR/dist" "$APP_DIR/"
        cp "$PROJECT_DIR/package.json" "$APP_DIR/"
        cp -r "$PROJECT_DIR/node_modules" "$APP_DIR/"
        print_success "Built files copied"
    else
        print_warning "No built files found. Will build in place."
        cp -r "$PROJECT_DIR" "$APP_DIR/"
        chown -R "$USER:$USER" "$APP_DIR"
    fi
}

# Create startup script
create_startup_script() {
    print_status "Creating startup script..."
    
    cat > "$APP_DIR/start.sh" << 'EOF'
#!/bin/bash
# Wind Tunnel Application Startup Script

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

echo "🚀 Starting Wind Tunnel Application..."

# Check if running in headless mode
if [ -z "$DISPLAY" ]; then
    echo "🍓 Headless mode detected - starting web service..."
    
    # Start web service mode
    if [ -f "dist/main/main/index.js" ]; then
        # Production mode
        echo "✅ Found main process at dist/main/main/index.js"
        node dist/main/main/index.js --web-mode
    elif [ -f "dist/main/index.js" ]; then
        # Production mode (alternative path)
        echo "✅ Found main process at dist/main/index.js"
        node dist/main/index.js --web-mode
    else
        # Development mode
        echo "⚠️ No built main process found, starting development mode..."
        npm run dev:renderer &
        sleep 5
        echo "✅ Web service started at http://localhost:3000"
        echo "🌐 Access from other devices: http://$(hostname -I | awk '{print $1}'):3000"
    fi
else
    echo "🖥️ Desktop mode detected - starting full application..."
    
    # Desktop mode
    if [ -f "dist/main/main/index.js" ]; then
        # Production mode
        echo "✅ Found main process at dist/main/main/index.js"
        node dist/main/main/index.js
    elif [ -f "dist/main/index.js" ]; then
        # Production mode (alternative path)
        echo "✅ Found main process at dist/main/index.js"
        node dist/main/index.js
    else
        # Development mode
        echo "⚠️ No built main process found, starting development mode..."
        npm run dev
    fi
fi
EOF

    chmod +x "$APP_DIR/start.sh"
    chown "$USER:$USER" "$APP_DIR/start.sh"
}

# Create systemd service
create_systemd_service() {
    print_status "Creating systemd service..."
    
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Wind Tunnel Application
After=network.target
Wants=network.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/start.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production
Environment=DISPLAY=:0

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable wind-tunnel.service
}

# Create desktop shortcut
create_desktop_shortcut() {
    print_status "Creating desktop shortcut..."
    
    cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Wind Tunnel Application
Comment=Wind tunnel data acquisition and visualization
Exec=$APP_DIR/start.sh
Icon=$APP_DIR/icon.png
Terminal=false
Categories=Science;Engineering;Education;
Keywords=wind;tunnel;aerodynamics;data;science;
EOF

    chmod +x "$DESKTOP_FILE"
}

# Create web service mode
create_web_service() {
    print_status "Creating web service mode..."
    
    cat > "$APP_DIR/web-service.js" << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist/renderer')));

// API endpoints
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        platform: 'raspberry-pi',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/api/system', (req, res) => {
    const os = require('os');
    res.json({
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: {
            total: os.totalmem(),
            free: os.freemem(),
            used: os.totalmem() - os.freemem()
        },
        load: os.loadavg()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Serve the main app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/renderer/index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🍓 Wind Tunnel Web Service running on port ${port}`);
    console.log(`🌐 Local: http://localhost:${port}`);
    console.log(`🌐 Network: http://$(require('os').networkInterfaces().eth0?.[0]?.address || '0.0.0.0'):${port}`);
});
EOF

    chmod +x "$APP_DIR/web-service.js"
    chown "$USER:$USER" "$APP_DIR/web-service.js"
}

# Create management script
create_management_script() {
    print_status "Creating management script..."
    
    cat > "$APP_DIR/manage.sh" << 'EOF'
#!/bin/bash

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVICE_NAME="wind-tunnel"

case "$1" in
    start)
        echo "🚀 Starting Wind Tunnel Application..."
        systemctl start $SERVICE_NAME
        ;;
    stop)
        echo "⏹️ Stopping Wind Tunnel Application..."
        systemctl stop $SERVICE_NAME
        ;;
    restart)
        echo "🔄 Restarting Wind Tunnel Application..."
        systemctl restart $SERVICE_NAME
        ;;
    status)
        echo "📊 Wind Tunnel Application Status:"
        systemctl status $SERVICE_NAME
        ;;
    logs)
        echo "📋 Wind Tunnel Application Logs:"
        journalctl -u $SERVICE_NAME -f
        ;;
    web)
        echo "🌐 Starting Web Service Mode..."
        cd "$APP_DIR"
        node web-service.js
        ;;
    dev)
        echo "🔧 Starting Development Mode..."
        cd "$APP_DIR"
        npm run dev:renderer
        ;;
    update)
        echo "📦 Updating Application..."
        cd "$APP_DIR"
        git pull origin main
        npm install
        npm run build
        systemctl restart $SERVICE_NAME
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|web|dev|update}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the application service"
        echo "  stop    - Stop the application service"
        echo "  restart - Restart the application service"
        echo "  status  - Show service status"
        echo "  logs    - Show service logs"
        echo "  web     - Start web service mode"
        echo "  dev     - Start development mode"
        echo "  update  - Update application from git"
        exit 1
        ;;
esac
EOF

    chmod +x "$APP_DIR/manage.sh"
    chown "$USER:$USER" "$APP_DIR/manage.sh"
}

# Main installation function
main() {
    print_status "Starting Wind Tunnel Application Autostart Setup..."
    
    check_root
    check_nodejs
    check_spi
    install_dependencies
    create_app_directory
    copy_app_files
    create_startup_script
    create_systemd_service
    create_desktop_shortcut
    create_web_service
    create_management_script
    
    print_success "Autostart setup completed!"
    echo ""
    echo "🎉 Installation Summary:"
    echo "   📁 Application installed to: $APP_DIR"
    echo "   🔧 Service created: wind-tunnel.service"
    echo "   🖥️ Desktop shortcut: Applications menu"
    echo "   🌐 Web service: http://localhost:3000"
    echo ""
    echo "🚀 Management Commands:"
    echo "   sudo systemctl start wind-tunnel    # Start service"
    echo "   sudo systemctl stop wind-tunnel     # Stop service"
    echo "   sudo systemctl status wind-tunnel   # Check status"
    echo "   $APP_DIR/manage.sh logs             # View logs"
    echo "   $APP_DIR/manage.sh web              # Start web mode"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Reboot if SPI was enabled: sudo reboot"
    echo "   2. Start the service: sudo systemctl start wind-tunnel"
    echo "   3. Check status: sudo systemctl status wind-tunnel"
    echo "   4. Access web interface: http://$(hostname -I | awk '{print $1}'):3000"
    echo ""
    print_warning "If SPI was enabled, a reboot is required for changes to take effect."
}

# Run main function
main "$@" 