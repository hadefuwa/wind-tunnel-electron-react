# Wind Tunnel Electron App – Raspberry Pi Debug & Deployment Summary

## 1. **Project Goal**
Run a React/Electron app on Raspberry Pi with full hardware access (SPI, serial, etc.), and have it autostart reliably on boot using systemd.

---

## 2. **Key Issues Encountered**
- **Electron app.commandLine.appendSwitch TypeError:**  
  The main process code was using an ES6 import for Electron, which compiled to a CommonJS alias (`electron_1.app`). This caused `app` to be undefined in the built JS, breaking all command line switches.
- **Systemd service not starting:**  
  Caused by script errors, permissions, or missing/corrupted files.
- **Deployment confusion:**  
  Sometimes the latest build was not copied to `/opt/wind-tunnel-electron`, so the Pi was running old code.
- **Script execution errors:**  
  Caused by missing shebang, wrong permissions, or Windows line endings.

---

## 3. **What Was Fixed**

### **A. Electron Main Process Import**
- Changed from:
  ```typescript
  import { app, BrowserWindow, ipcMain } from 'electron';
  ```
  to:
  ```typescript
  const { app, BrowserWindow, ipcMain } = require('electron');
  ```
- This ensures `app` is always defined and available for `app.commandLine.appendSwitch(...)`.

### **B. Build & Deployment**
- Always run `npm run build` after code changes.
- Copy the new `dist/`, `package.json`, and `node_modules` to `/opt/wind-tunnel-electron` on the Pi.
- Use `sudo systemctl restart wind-tunnel-electron` to restart the service.

### **C. Systemd Service & Script**
- Service runs as the correct user (`matrix`), with the right `DISPLAY` and `XAUTHORITY`.
- Startup script (`start-electron.sh`) is executable, has the correct shebang, and uses Unix line endings.

### **D. Debugging Process**
- Used `journalctl -u wind-tunnel-electron -n 30` and manual script runs to see real errors.
- Compared file contents and timestamps to ensure the correct build was deployed.

---

## 4. **Final Working Solution**

### **A. Main Process Code**
- Top of `src/main/index.ts`:
  ```typescript
  const { app, BrowserWindow, ipcMain } = require('electron');
  // ... rest of code unchanged ...
  ```

### **B. Build & Deploy Steps**
1. On your dev machine or Pi:
   ```bash
   npm run build
   ```
2. Copy to `/opt` on the Pi:
   ```bash
   sudo cp -r ~/wind-tunnel-electron-react/dist/* /opt/wind-tunnel-electron/dist/
   sudo cp ~/wind-tunnel-electron-react/package.json /opt/wind-tunnel-electron/
   sudo cp -r ~/wind-tunnel-electron-react/node_modules /opt/wind-tunnel-electron/
   ```
3. Restart the service:
   ```bash
   sudo systemctl restart wind-tunnel-electron
   sudo systemctl status wind-tunnel-electron
   ```

### **C. Troubleshooting Commands**
- Check service status:
  ```bash
  sudo systemctl status wind-tunnel-electron
  ```
- View logs:
  ```bash
  sudo journalctl -u wind-tunnel-electron -n 30
  ```
- Run script manually:
  ```bash
  cd /opt/wind-tunnel-electron
  ./start-electron.sh
  ```
- Check file contents:
  ```bash
  head -50 /opt/wind-tunnel-electron/dist/main/main/index.js
  ```

---

## 5. **Why Electron (Not Web App)?**
- Needed direct hardware access (SPI, serial, etc.) via Node.js APIs.
- Electron allows this, browsers do not.

---

## 6. **Lessons Learned**
- Always check the actual code running on the Pi matches your latest build.
- Use CommonJS require for Electron in the main process for best compatibility on ARM.
- Systemd and Linux scripts are strict: permissions, line endings, and shebangs matter.
- Debug by running scripts manually and checking logs.

---

**If you need to update the app in the future:**
1. Pull latest code and build in `~/wind-tunnel-electron-react`.
2. Copy `dist/`, `package.json`, and `node_modules` to `/opt/wind-tunnel-electron`.
3. Restart the service.

--- 