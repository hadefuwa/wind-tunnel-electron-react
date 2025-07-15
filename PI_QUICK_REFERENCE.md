# Raspberry Pi Quick Reference

## 🚀 One-Command Setup
```bash
curl -fsSL https://raw.githubusercontent.com/hadefuwa/wind-tunnel-electron-react/main/scripts/install-pi.sh | bash
```

## 📦 Essential Commands

### Install Dependencies
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential python3 git

# Enable SPI
sudo raspi-config nonint do_spi 0
```

### Setup Project
```bash
cd ~
git clone https://github.com/hadefuwa/wind-tunnel-electron-react.git
cd wind-tunnel-electron-react
npm install
npm run build
```

### Create Startup Script
```bash
sudo nano /usr/local/bin/start-wind-tunnel.sh
```
**Content:**
```bash
#!/bin/bash
export DISPLAY=:0
export XAUTHORITY=/home/pi/.Xauthority
sleep 5
cd /home/pi/wind-tunnel-electron-react
python3 -m http.server 3000 &
sleep 2
npm run electron:pi &
wait
```

### Create Service
```bash
sudo nano /etc/systemd/system/wind-tunnel.service
```
**Content:**
```ini
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
```

### Enable Service
```bash
sudo chmod +x /usr/local/bin/start-wind-tunnel.sh
sudo systemctl daemon-reload
sudo systemctl enable wind-tunnel
sudo systemctl start wind-tunnel
```

## 🔧 Configuration

### Display Settings
```bash
sudo nano /boot/config.txt
```
**Add:**
```
hdmi_force_hotplug=1
hdmi_group=1
hdmi_mode=4
console_blank=0
```

### Touchscreen (if using)
```bash
sudo nano /boot/config.txt
```
**Add:**
```
dtoverlay=ads7846,cs=1,penirq=25,penirq_pull=2,speed=50000,keep_vref_on=0,swapxy=0,pmax=255,xohms=150,xmin=200,xmax=3900,ymin=200,ymax=3900
```

## 🚀 Management Commands

### Start/Stop Service
```bash
sudo systemctl start wind-tunnel
sudo systemctl stop wind-tunnel
sudo systemctl restart wind-tunnel
```

### Check Status
```bash
sudo systemctl status wind-tunnel
sudo journalctl -u wind-tunnel -f
```

### Update App
```bash
cd ~/wind-tunnel-electron-react
git pull origin main
npm install
npm run build
sudo systemctl restart wind-tunnel
```

## 🔍 Troubleshooting

### Common Issues
```bash
# Blank screen
sudo nano /boot/config.txt  # Add hdmi_force_hotplug=1

# Permission denied
sudo usermod -a -G spi,gpio pi

# Service won't start
sudo systemctl status wind-tunnel
sudo journalctl -u wind-tunnel -f

# Check if app is running
ps aux | grep electron
curl http://localhost:3000
```

### Debug Commands
```bash
# System info
uname -a
free -h
df -h
vcgencmd measure_temp

# Display info
tvservice -s
xrandr

# SPI devices
ls -la /dev/spidev*
```

## 📱 Touchscreen Setup

### Calibrate Touchscreen
```bash
sudo apt-get install -y xinput-calibrator
xinput_calibrator
```

### Enable Touch Scrolling
```bash
npm install hammerjs
npm run build
```

## 🔄 Quick Update Script
```bash
sudo nano /usr/local/bin/update-wind-tunnel.sh
```
**Content:**
```bash
#!/bin/bash
cd /home/pi/wind-tunnel-electron-react
git pull origin main
npm install
npm run build
sudo systemctl restart wind-tunnel
echo "Updated successfully!"
```

## ✅ Verification Checklist
- [ ] Node.js installed (`node --version`)
- [ ] SPI enabled (`ls /dev/spidev*`)
- [ ] Project built (`npm run build`)
- [ ] Service running (`sudo systemctl status wind-tunnel`)
- [ ] Web interface accessible (`curl http://localhost:3000`)
- [ ] App displays on screen
- [ ] Touch scrolling works (if touchscreen)

## 📞 Quick Help
- **Logs**: `sudo journalctl -u wind-tunnel -f`
- **Status**: `sudo systemctl status wind-tunnel`
- **Restart**: `sudo systemctl restart wind-tunnel`
- **Update**: `/usr/local/bin/update-wind-tunnel.sh`

---
**Full Guide**: See `RASPBERRY_PI_SETUP_GUIDE.md` for detailed instructions. 