# Raspberry Pi Setup Guide for Wind Tunnel App

This guide provides complete instructions for setting up the Wind Tunnel Electron app on a Raspberry Pi with touchscreen support.

## 📋 Prerequisites

### Hardware Requirements
- **Raspberry Pi 4** (Recommended - 4GB/8GB RAM)
- **Raspberry Pi 3B+** (Good performance)
- **Raspberry Pi 3B** (Acceptable performance)
- **Touchscreen Display** (Optional but recommended)
- **Power Supply**: 5V/3A minimum (Pi 4), 5V/2.5A minimum (Pi 3)
- **MicroSD Card**: 16GB+ Class 10 or better
- **SPI Sensors** (If using hardware mode)

### Software Requirements
- **Raspberry Pi OS** (Bullseye or newer)
- **Node.js 18+**
- **Git**

## 🚀 Quick Setup (Automated)

### Option 1: One-Command Installation
```bash
# Download and run the automated installer
curl -fsSL https://raw.githubusercontent.com/hadefuwa/wind-tunnel-electron-react/main/scripts/install-pi.sh | bash
```

### Option 2: Manual Installation
Follow the detailed steps below.

## 📦 Step-by-Step Installation

### Step 1: Prepare Raspberry Pi OS

1. **Download Raspberry Pi OS**
   ```bash
   # Download the latest Raspberry Pi OS Lite (recommended)
   # Visit: https://www.raspberrypi.com/software/
   ```

2. **Flash to MicroSD Card**
   - Use Raspberry Pi Imager
   - Enable SSH during setup
   - Set hostname: `wind-tunnel-pi`
   - Set username: `pi` (or your preferred username)

3. **First Boot Setup**
   ```bash
   # Connect to Pi via SSH or directly
   ssh pi@wind-tunnel-pi.local
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Enable required interfaces
   sudo raspi-config
   # Navigate to: Interface Options > SPI > Enable
   # Navigate to: Interface Options > I2C > Enable (if needed)
   # Navigate to: Display Options > Screen Blanking > Disable
   ```

### Step 2: Install Node.js and Dependencies

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x

# Install build tools
sudo apt-get install -y build-essential python3 git

# Install additional dependencies
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
```

### Step 3: Clone and Setup Project

```bash
# Navigate to home directory
cd ~

# Clone the repository
git clone https://github.com/hadefuwa/wind-tunnel-electron-react.git
cd wind-tunnel-electron-react

# Install dependencies
npm install

# Build the application
npm run build
```

### Step 4: Configure Display and Touchscreen

```bash
# Edit display configuration
sudo nano /boot/config.txt

# Add these lines at the end:
# Enable touchscreen support
dtoverlay=ads7846,cs=1,penirq=25,penirq_pull=2,speed=50000,keep_vref_on=0,swapxy=0,pmax=255,xohms=150,xmin=200,xmax=3900,ymin=200,ymax=3900

# Force HDMI output
hdmi_force_hotplug=1
hdmi_group=1
hdmi_mode=4

# Disable screen blanking
console_blank=0

# Save and reboot
sudo reboot
```

### Step 5: Create Startup Script

```bash
# Create the startup script
sudo nano /usr/local/bin/start-wind-tunnel.sh

# Add this content:
#!/bin/bash

# Set display environment
export DISPLAY=:0
export XAUTHORITY=/home/pi/.Xauthority

# Wait for display to be ready
sleep 5

# Navigate to app directory
cd /home/pi/wind-tunnel-electron-react

# Start HTTP server for renderer files
python3 -m http.server 3000 &
HTTP_PID=$!

# Wait for server to start
sleep 2

# Start Electron with Pi optimizations
npm run electron:pi &
ELECTRON_PID=$!

# Wait for processes
wait $HTTP_PID $ELECTRON_PID

# Make executable
sudo chmod +x /usr/local/bin/start-wind-tunnel.sh
```

### Step 6: Create Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/wind-tunnel.service

# Add this content:
[Unit]
Description=Wind Tunnel Electron App
After=network.target graphical-session.target
Wants=graphical-session.target

[Service]
Type=simple
User=pi
Group=pi
Environment=DISPLAY=:0
Environment=XAUTHORITY=/home/pi/.Xauthority
ExecStart=/usr/local/bin/start-wind-tunnel.sh
Restart=always
RestartSec=10

[Install]
WantedBy=graphical-session.target

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable wind-tunnel
sudo systemctl start wind-tunnel

# Check status
sudo systemctl status wind-tunnel
```

### Step 7: Configure Autostart (Alternative)

If you prefer autostart over systemd:

```bash
# Create autostart directory
mkdir -p ~/.config/autostart

# Create desktop file
nano ~/.config/autostart/wind-tunnel.desktop

# Add content:
[Desktop Entry]
Type=Application
Name=Wind Tunnel
Exec=/usr/local/bin/start-wind-tunnel.sh
Terminal=false
X-GNOME-Autostart-enabled=true

# Make executable
chmod +x ~/.config/autostart/wind-tunnel.desktop
```

## 🔧 Configuration

### SPI Configuration

1. **Enable SPI Interface**
   ```bash
   sudo raspi-config nonint do_spi 0
   ```

2. **Check SPI Devices**
   ```bash
   ls -la /dev/spidev*
   # Should show: /dev/spidev0.0 and /dev/spidev0.1
   ```

3. **Add User to SPI Group**
   ```bash
   sudo usermod -a -G spi pi
   sudo usermod -a -G gpio pi
   ```

### Touchscreen Calibration

```bash
# Install calibration tools
sudo apt-get install -y xinput-calibrator

# Calibrate touchscreen
xinput_calibrator

# Save calibration to X11 config
sudo nano /usr/share/X11/xorg.conf.d/99-calibration.conf

# Add calibration data from previous command
Section "InputClass"
    Identifier "calibration"
    MatchProduct "ADS7846 Touchscreen"
    Driver "evdev"
    Option "Calibration" "x1 y1 x2 y2"
    Option "SwapAxes" "0"
EndSection
```

## 🚀 Testing the Installation

### Test 1: Manual Startup
```bash
# Stop service
sudo systemctl stop wind-tunnel

# Start manually
/usr/local/bin/start-wind-tunnel.sh
```

### Test 2: Web Interface
```bash
# Check if web server is running
curl http://localhost:3000

# Should return HTML content
```

### Test 3: Electron App
```bash
# Check if Electron is running
ps aux | grep electron

# Should show electron process
```

### Test 4: Touchscreen
- Touch the screen to interact with the app
- Try swiping up/down on the Dashboard
- Verify touch events are registered

## 🔍 Troubleshooting

### Common Issues

1. **Blank Screen**
   ```bash
   # Check display configuration
   sudo nano /boot/config.txt
   
   # Add: hdmi_force_hotplug=1
   # Reboot: sudo reboot
   ```

2. **Touchscreen Not Working**
   ```bash
   # Check if touchscreen is detected
   xinput list
   
   # Recalibrate if needed
   xinput_calibrator
   ```

3. **App Won't Start**
   ```bash
   # Check service status
   sudo systemctl status wind-tunnel
   
   # Check logs
   sudo journalctl -u wind-tunnel -f
   
   # Check permissions
   ls -la /usr/local/bin/start-wind-tunnel.sh
   ```

4. **SPI Permission Denied**
   ```bash
   # Add user to groups
   sudo usermod -a -G spi,gpio pi
   
   # Logout and login again
   ```

5. **Performance Issues**
   ```bash
   # Check CPU and memory usage
   htop
   
   # Check temperature
   vcgencmd measure_temp
   
   # Overclock if needed (Pi 4 only)
   sudo nano /boot/config.txt
   # Add: over_voltage=2, arm_freq=1750
   ```

### Debug Commands

```bash
# Check system resources
free -h
df -h
vcgencmd get_mem gpu

# Check display info
tvservice -s
xrandr

# Check USB devices
lsusb

# Check SPI devices
ls -la /dev/spidev*

# Check network
ip addr show
ping google.com
```

## 📱 Touchscreen Optimization

### Enable Touch Scrolling
The app includes Hammer.js for touch scrolling support:

```bash
# Verify Hammer.js is installed
npm list hammerjs

# If not installed:
npm install hammerjs
npm run build
```

### Touchscreen Settings
```bash
# Optimize touchscreen response
sudo nano /boot/config.txt

# Add these settings:
# Touchscreen optimization
dtoverlay=ads7846,cs=1,penirq=25,penirq_pull=2,speed=50000,keep_vref_on=0,swapxy=0,pmax=255,xohms=150,xmin=200,xmax=3900,ymin=200,ymax=3900

# Disable screen blanking
console_blank=0

# Force HDMI output
hdmi_force_hotplug=1
hdmi_group=1
hdmi_mode=4
```

## 🔄 Updates and Maintenance

### Update the App
```bash
# Navigate to app directory
cd ~/wind-tunnel-electron-react

# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild
npm run build

# Restart service
sudo systemctl restart wind-tunnel
```

### Create Update Script
```bash
# Create update script
sudo nano /usr/local/bin/update-wind-tunnel.sh

# Add content:
#!/bin/bash
cd /home/pi/wind-tunnel-electron-react
git pull origin main
npm install
npm run build
sudo systemctl restart wind-tunnel
echo "Wind Tunnel updated successfully!"

# Make executable
sudo chmod +x /usr/local/bin/update-wind-tunnel.sh

# Run updates with:
sudo /usr/local/bin/update-wind-tunnel.sh
```

### System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up
sudo apt autoremove -y
sudo apt autoclean
```

## 📊 Performance Monitoring

### Monitor System Resources
```bash
# Install monitoring tools
sudo apt-get install -y htop iotop

# Monitor in real-time
htop
```

### Check App Performance
```bash
# Monitor Electron process
ps aux | grep electron

# Check memory usage
free -h

# Check disk usage
df -h
```

## 🔒 Security Considerations

### Firewall Setup
```bash
# Install UFW
sudo apt-get install -y ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 3000  # Web interface
sudo ufw enable
```

### User Permissions
```bash
# Create dedicated user (optional)
sudo adduser windtunnel
sudo usermod -a -G spi,gpio windtunnel

# Update service to use new user
sudo nano /etc/systemd/system/wind-tunnel.service
# Change User=pi to User=windtunnel
```

## 📞 Support

If you encounter issues:

1. **Check the logs**: `sudo journalctl -u wind-tunnel -f`
2. **Verify hardware**: Run diagnostic commands above
3. **Check GitHub issues**: [Project Issues](https://github.com/hadefuwa/wind-tunnel-electron-react/issues)
4. **Create new issue**: Include system info and error logs

### System Information to Include
```bash
# Run these commands and include output in support requests
uname -a
cat /etc/os-release
node --version
npm --version
vcgencmd get_mem gpu
free -h
df -h
```

## ✅ Verification Checklist

- [ ] Raspberry Pi OS installed and updated
- [ ] Node.js 18+ installed
- [ ] SPI interface enabled
- [ ] Project cloned and built
- [ ] Startup script created and executable
- [ ] Systemd service configured and enabled
- [ ] Display configured for touchscreen
- [ ] Touchscreen calibrated
- [ ] App starts automatically on boot
- [ ] Web interface accessible at http://localhost:3000
- [ ] Touch scrolling works on Dashboard
- [ ] SPI sensors detected (if using hardware mode)
- [ ] Performance acceptable
- [ ] Updates working

## 🎉 Success!

Your Wind Tunnel app is now running on Raspberry Pi! The app will:
- Start automatically on boot
- Display on the touchscreen
- Support touch scrolling
- Run the web interface on port 3000
- Handle SPI hardware communication
- Provide real-time data visualization

**Next Steps:**
1. Configure your SPI sensors
2. Set up data logging
3. Customize the interface
4. Test with your wind tunnel hardware

---

**Need help?** Check the troubleshooting section or create an issue on GitHub! 