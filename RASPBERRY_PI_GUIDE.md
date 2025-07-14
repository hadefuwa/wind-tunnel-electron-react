# 🍓 Raspberry Pi Installation Guide

## Overview

Your wind tunnel application is fully compatible with Raspberry Pi! This guide will help you set up and run the application on Raspberry Pi hardware.

## ✅ **Compatibility**

### **Supported Raspberry Pi Models**
- ✅ **Raspberry Pi 4** (Recommended - 4GB/8GB RAM)
- ✅ **Raspberry Pi 3B+** (Good performance)
- ✅ **Raspberry Pi 3B** (Acceptable performance)
- ⚠️ **Raspberry Pi Zero** (Limited - may be slow)

### **Operating Systems**
- ✅ **Raspberry Pi OS** (Bullseye/Bookworm)
- ✅ **Ubuntu Server** for Raspberry Pi
- ✅ **Ubuntu Desktop** for Raspberry Pi

## 🚀 **Quick Start**

### **1. System Requirements**

```bash
# Minimum requirements
- Raspberry Pi 4 (2GB RAM minimum, 4GB recommended)
- 16GB+ microSD card (Class 10 or better)
- Power supply (5V/3A for Pi 4)
- Internet connection for installation
```

### **2. Install Node.js**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (required for Electron)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

### **3. Enable SPI Interface**

```bash
# Enable SPI in raspi-config
sudo raspi-config

# Navigate to: Interface Options -> SPI -> Enable
# Or use command line:
sudo raspi-config nonint do_spi 0

# Reboot to apply changes
sudo reboot
```

### **4. Install Application Dependencies**

```bash
# Install system dependencies
sudo apt install -y \
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
  libasound2

# Install development tools (if building from source)
sudo apt install -y \
  build-essential \
  python3 \
  git
```

### **5. Clone and Install Application**

```bash
# Clone the repository
git clone https://github.com/hadefuwa/wind-tunnel-electron-react.git
cd wind-tunnel-electron-react

# Install dependencies
npm install

# Build for Raspberry Pi (Simple Method - Recommended)
npm run dist:pi-simple

# Alternative: Try electron-builder (may fail on ARM64)
npm run dist:raspberry-pi-64  # For Pi 4 (64-bit)
# OR
npm run dist:raspberry-pi     # For Pi 3 (32-bit)
```

## 🔧 **Hardware Setup**

### **SPI Pin Connections**

```bash
# Raspberry Pi SPI Pinout
# SPI0 (Primary SPI)
MOSI  -> GPIO 10 (Pin 19)
MISO  -> GPIO 9  (Pin 21)
SCLK  -> GPIO 11 (Pin 23)
CE0   -> GPIO 8  (Pin 24)
CE1   -> GPIO 7  (Pin 26)

# SPI1 (Secondary SPI - Pi 4 only)
MOSI  -> GPIO 20 (Pin 38)
MISO  -> GPIO 19 (Pin 35)
SCLK  -> GPIO 21 (Pin 40)
CE0   -> GPIO 16 (Pin 36)
CE1   -> GPIO 17 (Pin 11)
```

### **Example Microcontroller Connection**

```bash
# Arduino/ESP32 SPI Connection
Arduino MOSI  -> Pi GPIO 10 (MOSI)
Arduino MISO  -> Pi GPIO 9  (MISO)
Arduino SCK   -> Pi GPIO 11 (SCLK)
Arduino SS    -> Pi GPIO 8  (CE0)
Arduino GND   -> Pi GND
Arduino 3.3V  -> Pi 3.3V (or external power)
```

## ⚙️ **Configuration**

### **1. SPI Settings**

```bash
# Check SPI devices
ls -la /dev/spidev*

# Should show:
# /dev/spidev0.0  (SPI0, CE0)
# /dev/spidev0.1  (SPI0, CE1)
# /dev/spidev1.0  (SPI1, CE0) - Pi 4 only
```

### **2. Application Settings**

In the application settings:
- **SPI Port**: `/dev/spidev0.0` (or your device)
- **Clock Speed**: 1MHz (adjust based on your hardware)
- **SPI Mode**: 0 (most common)
- **Data Bits**: 8-bit

### **3. Performance Optimization**

```bash
# Increase GPU memory (if needed for 3D visualization)
sudo raspi-config
# Navigate to: Advanced Options -> Memory Split
# Set to 128 or 256 MB

# Overclock (optional - for better performance)
sudo raspi-config
# Navigate to: Overclock
# Choose appropriate setting for your Pi model
```

## 🚀 **Running the Application**

### **Development Mode**

```bash
# Start development server
npm run dev

# The application will open automatically
# Note: 3D visualization is disabled on Pi for performance
```

### **Production Mode**

```bash
# Method 1: Simple Package (Recommended)
cd release/pi
./start.sh

# Method 2: Install as System Service
sudo ./install.sh
sudo systemctl start wind-tunnel

# Method 3: Desktop Application
# Look for "Wind Tunnel Application" in the Applications menu

# Method 4: Electron Builder (if successful)
./release/linux-arm64/Wind\ Tunnel\ Application-1.0.0.AppImage
# OR
sudo dpkg -i release/linux-arm64/wind-tunnel-electron_1.0.0_arm64.deb
```

## 📊 **Performance Expectations**

### **Raspberry Pi 4 (4GB/8GB)**
- ✅ **Dashboard**: Smooth performance
- ✅ **Charts**: Real-time updates work well
- ✅ **SPI Communication**: Full speed support
- ⚠️ **3D Visualization**: Disabled (fallback to 2D)
- ✅ **Data Processing**: Excellent

### **Raspberry Pi 3B+**
- ✅ **Dashboard**: Good performance
- ✅ **Charts**: Acceptable performance
- ✅ **SPI Communication**: Full support
- ⚠️ **3D Visualization**: Disabled
- ✅ **Data Processing**: Good

### **Memory Usage**
```bash
# Typical memory usage
- Application: ~200-300MB
- Electron: ~150-200MB
- System: ~200-300MB
- Total: ~600-800MB (well within Pi 4 limits)
```

## 🔧 **Troubleshooting**

### **Common Issues**

**1. SPI Not Working**
```bash
# Check if SPI is enabled
ls /dev/spidev*
# If empty, enable SPI in raspi-config

# Check SPI kernel module
lsmod | grep spi
# Should show spi_bcm2835
```

**2. Application Won't Start**
```bash
# Check Node.js version
node --version  # Should be 18+

# Check system dependencies
ldd /path/to/electron  # Check for missing libraries

# Run with debug output
DEBUG=* npm run dev
```

**3. Performance Issues**
```bash
# Monitor system resources
htop

# Check temperature
vcgencmd measure_temp

# Monitor memory usage
free -h
```

**4. Build Errors**
```bash
# If you get "app-builder process failed" error:
# This is a known issue with electron-builder on ARM64
# Use the simple packaging method instead:
npm run dist:pi-simple

# Or build manually:
npm run build
mkdir -p release/pi
cp -r dist/* release/pi/
cp package.json release/pi/
cp -r node_modules release/pi/
```

**5. Main Path Issues**
```bash
# If you get "Cannot find module" error for main process:
# This is due to the dist/main/main/index.js structure
# Fix it with the provided script:
chmod +x scripts/fix-main-path.sh
./scripts/fix-main-path.sh

# Or manually create symlinks:
ln -sf dist/main/main/index.js dist/main/index.js
ln -sf dist/main/main/preload.js dist/main/preload.js
```

**6. SPI Communication Errors**
```bash
# Test SPI manually
sudo apt install spi-tools
spidev_test -D /dev/spidev0.0

# Check permissions
ls -la /dev/spidev*
# Should be readable by your user
```

### **Performance Optimization**

```bash
# Disable unnecessary services
sudo systemctl disable bluetooth
sudo systemctl disable avahi-daemon

# Increase swap (if needed)
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Set CONF_SWAPSIZE=1024
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

## 🎯 **Best Practices**

### **1. Hardware Setup**
- Use quality microSD card (Class 10 or better)
- Ensure stable power supply
- Keep Pi cool (add heatsink/fan if needed)
- Use short, shielded cables for SPI

### **2. Software Setup**
- Use Raspberry Pi OS (not Ubuntu) for best compatibility
- Keep system updated
- Monitor system resources
- Use SSD instead of microSD for better performance

### **3. Application Usage**
- Start with simulation mode to test
- Gradually increase SPI clock speed
- Monitor data quality and error rates
- Use appropriate buffer sizes

## 📈 **Advanced Features**

### **Headless Operation**
```bash
# Run without display
export DISPLAY=:0
xhost +local:root
npm run dev

# Or use VNC for remote access
sudo apt install realvnc-vnc-server
```

### **Auto-Start**
```bash
# Create systemd service
sudo nano /etc/systemd/system/wind-tunnel.service

[Unit]
Description=Wind Tunnel Application
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/wind-tunnel-electron-react
ExecStart=/usr/bin/npm run dev
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable wind-tunnel
sudo systemctl start wind-tunnel
```

## 🎉 **Success!**

Your wind tunnel application is now running on Raspberry Pi! The application will automatically detect the Pi hardware and optimize performance accordingly.

### **Key Features Working on Pi:**
- ✅ Real-time data acquisition via SPI
- ✅ Beautiful dashboard interface
- ✅ Live charts and graphs
- ✅ Data logging and export
- ✅ Hardware configuration
- ✅ Error handling and recovery

### **Limitations on Pi:**
- ⚠️ 3D visualization disabled (performance)
- ⚠️ Reduced window size
- ⚠️ Some animations simplified

The application is fully functional for wind tunnel data acquisition and analysis on Raspberry Pi! 