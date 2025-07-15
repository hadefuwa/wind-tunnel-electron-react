# Raspberry Pi Electron App Debug & Fix Summary

## What Has Been Done So Far

### 1. **Autostart Setup**
- Created and installed a systemd service (`wind-tunnel-electron.service`) to launch the Electron app on boot.
- Wrote and deployed a startup script (`start-electron.sh`) to handle environment setup and launch the app.
- Ensured the service runs as the correct user (`matrix`) with the right `DISPLAY` and `XAUTHORITY`.

### 2. **Permissions & Script Issues**
- Fixed script permissions and line endings (converted to Unix format).
- Ensured the shebang (`#!/bin/bash`) is the very first line in the script, with no spaces or blank lines above.
- Verified the script is executable (`chmod +x`).

### 3. **Electron Code Fixes**
- Identified a TypeError: `Cannot read properties of undefined (reading 'commandLine')` in the Electron main process.
- Moved all `app.commandLine.appendSwitch` calls to immediately after importing `app` from 'electron' in `src/main/index.ts`.
- Ensured the import is `import { app } from 'electron';` and not using any alias or `electron_1.app`.
- Rebuilt the app and copied the new build to `/opt/wind-tunnel-electron`.

### 4. **Deployment Steps**
- Rebuilt the app on the Pi using `npm run build`.
- Copied the updated `dist/`, `package.json`, and `node_modules` to `/opt/wind-tunnel-electron`.
- Restarted the systemd service and checked logs for errors.

### 5. **Debugging**
- Ran the script manually to see real error output.
- Used `journalctl` and `systemctl status` to check service logs and status.
- Compared file contents and timestamps to ensure the correct build was deployed.

## What Is Planned Next

1. **Fix the Electron Import/Build Issue**
   - Ensure the main process code uses `import { app } from 'electron';` and all `app.commandLine.appendSwitch` calls use `app` directly.
   - Remove any usage of `electron_1.app` or similar aliases.
   - Rebuild the app and verify the compiled JS uses `app.commandLine.appendSwitch` at the top.

2. **Deploy the Correct Build**
   - Copy the new build to `/opt/wind-tunnel-electron`.
   - Restart the service and verify the Electron app launches without the TypeError.

3. **Verify Autostart**
   - Reboot the Pi and confirm the Electron app starts automatically and displays the UI.

4. **Document the Working Solution**
   - Summarize the final working setup for future reference.

## Key Troubleshooting Commands

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

**If you need to update the app:**
1. Pull latest code and build in `~/wind-tunnel-electron-react`.
2. Copy `dist/`, `package.json`, and `node_modules` to `/opt/wind-tunnel-electron`.
3. Restart the service. 