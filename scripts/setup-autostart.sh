#!/bin/bash

# Wind Tunnel Electron App Autostart Setup for Raspberry Pi
# This script sets up the Electron app to start automatically on boot

set -e

echo "🍓 Setting up Wind Tunnel Electron App Autostart..."

# Configuration
APP_NAME="wind-tunnel-electron"
APP_DIR="/opt/wind-tunnel-electron"
USER="pi"
SERVICE_FILE="/etc/systemd/system/wind-tunnel-electron.service"
DESKTOP_FILE="/usr/share/applications/wind-tunnel-electron.desktop"
AUTOSTART_FILE="/etc/xdg/lxsession/LXDE-pi/autostart"

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
    
    # Copy the entire project
    cp -r "$PROJECT_DIR"/* "$APP_DIR/"
    chown -R "$USER:$USER" "$APP_DIR"
    
    print_success "Application files copied to $APP_DIR"
}

# Create Electron startup script
create_startup_script() {
    print_status "Creating Electron startup script..."
    
    cat > "$APP_DIR/start-electron.sh" << 'EOF'
#!/bin/bash

# Wind Tunnel Electron App Startup Script
# This script starts the Electron app on Raspberry Pi

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

echo "🍓 Starting Wind Tunnel Electron App..."

# Set environment variables for Electron
export DISPLAY=:0
export ELECTRON_DISABLE_SECURITY_WARNINGS=1
export ELECTRON_NO_ATTACH_CONSOLE=1
export NODE_ENV=production

# Check if we're on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    echo "❌ This script is designed for Raspberry Pi"
    exit 1
fi

# Build if needed
if [ ! -f "dist/main/main/index.js" ]; then
    echo "🔨 Building application..."
    npm run build
fi

# Start the Electron application
echo "🚀 Starting Electron app..."
npm start

echo "✅ Electron app started"
EOF

    chmod +x "$APP_DIR/start-electron.sh"
    chown "$USER:$USER" "$APP_DIR/start-electron.sh"
}

# Create systemd service for Electron
create_systemd_service() {
    print_status "Creating systemd service for Electron..."
    
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Wind Tunnel Electron Application
After=network.target graphical-session.target
Wants=network.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/start-electron.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production
Environment=DISPLAY=:0
Environment=XAUTHORITY=/home/$USER/.Xauthority

# Wait for X server
ExecStartPre=/bin/bash -c 'until xset q &>/dev/null; do sleep 1; done'

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR

[Install]
WantedBy=graphical.target
EOF

    systemctl daemon-reload
    systemctl enable wind-tunnel-electron.service
    
    print_success "Systemd service created and enabled"
}

# Create desktop shortcut
create_desktop_shortcut() {
    print_status "Creating desktop shortcut..."
    
    cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Wind Tunnel Electron
Comment=Wind tunnel data acquisition and visualization
Exec=$APP_DIR/start-electron.sh
Icon=$APP_DIR/src/logo.png
Terminal=false
Categories=Science;Engineering;Education;
Keywords=wind;tunnel;aerodynamics;data;science;
StartupNotify=true
EOF

    chmod +x "$DESKTOP_FILE"
    print_success "Desktop shortcut created"
}

# Setup autostart for desktop environment
setup_desktop_autostart() {
    print_status "Setting up desktop autostart..."
    
    # Create autostart directory if it doesn't exist
    mkdir -p "$(dirname "$AUTOSTART_FILE")"
    
    # Add to autostart
    echo "@$APP_DIR/start-electron.sh" >> "$AUTOSTART_FILE"
    
    print_success "Desktop autostart configured"
}

# Create management script
create_management_script() {
    print_status "Creating management script..."
    
    cat > "$APP_DIR/manage-electron.sh" << 'EOF'
#!/bin/bash

APP_DIR="$(cd "$(dirname "$0")" && pwd)"

case "$1" in
    start)
        echo "🚀 Starting Wind Tunnel Electron App..."
        sudo systemctl start wind-tunnel-electron
        ;;
    stop)
        echo "⏹️ Stopping Wind Tunnel Electron App..."
        sudo systemctl stop wind-tunnel-electron
        ;;
    restart)
        echo "🔄 Restarting Wind Tunnel Electron App..."
        sudo systemctl restart wind-tunnel-electron
        ;;
    status)
        echo "📊 Wind Tunnel Electron App Status:"
        sudo systemctl status wind-tunnel-electron
        ;;
    logs)
        echo "📋 Wind Tunnel Electron App Logs:"
        sudo journalctl -u wind-tunnel-electron -f
        ;;
    build)
        echo "🔨 Building application..."
        cd "$APP_DIR"
        npm run build
        ;;
    dev)
        echo "🛠️ Starting development mode..."
        cd "$APP_DIR"
        npm run dev
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|build|dev}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the Electron app service"
        echo "  stop    - Stop the Electron app service"
        echo "  restart - Restart the Electron app service"
        echo "  status  - Show service status"
        echo "  logs    - Show service logs"
        echo "  build   - Build the application"
        echo "  dev     - Start development mode"
        exit 1
        ;;
esac
EOF

    chmod +x "$APP_DIR/manage-electron.sh"
    chown "$USER:$USER" "$APP_DIR/manage-electron.sh"
    
    print_success "Management script created"
}

# Main installation function
main() {
    print_status "Starting Wind Tunnel Electron App autostart setup..."
    
    check_root
    check_nodejs
    check_spi
    install_dependencies
    create_app_directory
    copy_app_files
    create_startup_script
    create_systemd_service
    create_desktop_shortcut
    setup_desktop_autostart
    create_management_script
    
    print_success "🎉 Wind Tunnel Electron App autostart setup completed!"
    echo ""
    echo "📋 Installation Summary:"
    echo "   App Directory: $APP_DIR"
    echo "   Service File: $SERVICE_FILE"
    echo "   Desktop Shortcut: $DESKTOP_FILE"
    echo "   Autostart File: $AUTOSTART_FILE"
    echo ""
    echo "🚀 Management Commands:"
    echo "   sudo systemctl start wind-tunnel-electron    # Start service"
    echo "   sudo systemctl stop wind-tunnel-electron     # Stop service"
    echo "   sudo systemctl status wind-tunnel-electron   # Check status"
    echo "   $APP_DIR/manage-electron.sh logs             # View logs"
    echo "   $APP_DIR/manage-electron.sh build            # Build app"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Reboot: sudo reboot"
    echo "   2. The Electron app will start automatically on boot"
    echo "   3. Check status: sudo systemctl status wind-tunnel-electron"
    echo ""
    echo "🌐 The Electron app will automatically start on boot!"
}

# Run main function
main "$@" 