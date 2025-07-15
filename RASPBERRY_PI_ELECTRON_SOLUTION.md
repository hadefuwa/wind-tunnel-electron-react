# Raspberry Pi Electron App - Complete Solution Guide

## Problem Summary
The Wind Tunnel Electron app was failing to run on Raspberry Pi due to multiple issues:
1. **ES6 import errors** causing `app.commandLine.appendSwitch` TypeError
2. **Shared memory errors** preventing GUI display
3. **Multiple conflicting services** from different people's scripts
4. **Power supply issues** affecting GPU functionality
5. **Missing renderer file serving** causing blank screens

## Complete Solution

### 1. Fixed Electron Import Issues
**Problem:** ES6 imports were causing `TypeError: Cannot read properties of undefined (reading 'commandLine')`

**Solution:** Converted ES6 imports to CommonJS require statements in `src/main/index.ts`:
```typescript
// OLD (causing errors):
import { app, BrowserWindow, ipcMain } from 'electron';

// NEW (working):
const { app, BrowserWindow, ipcMain } = require('electron');
```

### 2. Fixed TypeScript Compilation Errors
**Problem:** TypeScript strict mode errors with callback parameters

**Solution:** Added explicit type annotations:
```typescript
app.on('render-process-gone', (event: any, webContents: any, details: any) => {
  // ...
});

exec(command, (err: any, stdout: any, stderr: any) => {
  // ...
});
```

### 3. Cleaned Up Multiple Services
**Problem:** Multiple conflicting systemd services from different people

**Solution:** Removed all old services and created one clean setup:
```bash
# Stop and disable all old services
sudo systemctl stop wind-tunnel-app wind-tunnel-electron wind-tunnel-web wind-tunnel
sudo systemctl disable wind-tunnel-app wind-tunnel-electron wind-tunnel-web wind-tunnel

# Remove old service files
sudo rm /etc/systemd/system/wind-tunnel*.service

# Clean up old directories
sudo rm -rf /opt/wind-tunnel /opt/wind-tunnel-electron
```

### 4. Created Clean Deployment Structure
```bash
# Create clean deployment directory
sudo mkdir -p /opt/wind-tunnel-app
sudo chown matrix:matrix /opt/wind-tunnel-app

# Copy working build
cp -r ~/wind-tunnel-electron-react/* /opt/wind-tunnel-app/
```

### 5. Fixed Display Issues
**Problem:** Shared memory errors and blank screens

**Solution:** Created a startup script that serves renderer files via HTTP server:

**File:** `/opt/wind-tunnel-app/start.sh`
```bash
#!/bin/bash
cd /opt/wind-tunnel-app
export DISPLAY=:0
export XAUTHORITY=/home/matrix/.Xauthority
export ELECTRON_DISABLE_SECURITY_WARNINGS=1
export ELECTRON_NO_ATTACH_CONSOLE=1
export ELECTRON_NO_SANDBOX=1

echo "Waiting for display to be ready..."
sleep 10

echo "Starting HTTP server for renderer..."
npx http-server dist/renderer -p 3000 --cors &
HTTP_PID=$!

echo "Waiting for HTTP server..."
sleep 3

echo "Starting Wind Tunnel App on HDMI display..."
./node_modules/.bin/electron --no-sandbox --disable-gpu-sandbox --disable-dev-shm-usage dist/main/main/index.js

# Clean up HTTP server when Electron exits
kill $HTTP_PID
```

**Make executable:**
```bash
chmod +x /opt/wind-tunnel-app/start.sh
```

### 6. Created Clean Systemd Service
**File:** `/etc/systemd/system/wind-tunnel-app.service`
```ini
[Unit]
Description=Wind Tunnel Application
After=graphical.target
Wants=graphical.target

[Service]
Type=simple
User=matrix
Group=matrix
Environment=DISPLAY=:0
Environment=XAUTHORITY=/home/matrix/.Xauthority
Environment=XDG_RUNTIME_DIR=/run/user/1000
WorkingDirectory=/opt/wind-tunnel-app
ExecStart=/opt/wind-tunnel-app/start.sh
Restart=on-failure
RestartSec=5

[Install]
WantedBy=graphical.target
```

### 7. Enable and Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable wind-tunnel-app
sudo systemctl start wind-tunnel-app
```

## Key Technical Solutions

### A. HTTP Server for Renderer Files
**Why needed:** Electron app needs to load HTML/CSS/JS files, but they weren't being served properly.

**Solution:** Start an HTTP server (`npx http-server`) to serve the renderer files on port 3000, then Electron loads from `http://localhost:3000`.

### B. Display Environment Variables
**Why needed:** Systemd services don't inherit display environment.

**Solution:** Explicitly set:
- `DISPLAY=:0` - Use primary display
- `XAUTHORITY=/home/matrix/.Xauthority` - X11 authentication
- `XDG_RUNTIME_DIR=/run/user/1000` - Runtime directory

### C. Electron Flags for Raspberry Pi
**Why needed:** Raspberry Pi has different GPU and memory constraints.

**Solution:** Use flags:
- `--no-sandbox` - Disable sandboxing
- `--disable-gpu-sandbox` - Disable GPU sandbox
- `--disable-dev-shm-usage` - Avoid shared memory issues

### D. Timing and Delays
**Why needed:** Display system needs time to initialize.

**Solution:** 
- `sleep 10` - Wait for display to be ready
- `sleep 3` - Wait for HTTP server to start

## Final Working Setup

### What Works Now:
✅ **Autostart on boot** - Service starts automatically  
✅ **HDMI display** - App shows on touchscreen  
✅ **WebSocket server** - Backend functionality works  
✅ **Web interface** - Accessible via browser on port 3000  
✅ **No shared memory errors** - Stable operation  
✅ **Clean service management** - One service, no conflicts  

### Access Points:
- **Touchscreen:** App displays automatically on HDMI
- **Web browser:** `http://your-pi-ip:3000`
- **WebSocket:** Port 8081 for data communication

### Troubleshooting Commands:
```bash
# Check service status
sudo systemctl status wind-tunnel-app

# View logs
sudo journalctl -u wind-tunnel-app -n 30

# Check if running
ps aux | grep electron | grep -v grep

# Check WebSocket server
netstat -tlnp | grep 8081

# Restart service
sudo systemctl restart wind-tunnel-app
```

## Lessons Learned

1. **CommonJS over ES6** - Use `require()` instead of `import` for Electron main process on ARM
2. **HTTP server needed** - Electron needs renderer files served via HTTP, not file://
3. **Display environment** - Systemd services need explicit display environment variables
4. **Timing matters** - Delays needed for display and HTTP server initialization
5. **Clean slate approach** - Remove all conflicting services before creating new one
6. **Power supply matters** - Low voltage warnings can affect GPU functionality

## Future Updates

To update the app:
1. Pull latest code: `git pull origin main`
2. Build: `npm run build`
3. Copy to deployment: `cp -r dist/* /opt/wind-tunnel-app/dist/`
4. Restart service: `sudo systemctl restart wind-tunnel-app`

---

**Result:** A fully functional Wind Tunnel Electron app running on Raspberry Pi with autostart, HDMI display, and web interface access! 🚀 