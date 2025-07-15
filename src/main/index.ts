const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { defaultWebSocketService } = require('./services/WebSocketServer');
const { exec } = require('child_process');

// Move all commandLine switches here, right after importing 'app'
app.commandLine.appendSwitch('--disable-gpu-sandbox');
app.commandLine.appendSwitch('--disable-software-rasterizer');
app.commandLine.appendSwitch('--disable-dev-shm-usage');
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--disable-web-security');
app.commandLine.appendSwitch('--allow-running-insecure-content');
app.commandLine.appendSwitch('--disable-gpu-process-crash-limit');
app.commandLine.appendSwitch('--disable-gpu-driver-bug-workarounds');
app.commandLine.appendSwitch('--disable-gpu-vsync');
app.commandLine.appendSwitch('--disable-accelerated-2d-canvas');
app.commandLine.appendSwitch('--disable-accelerated-video-decode');

// Detect if running on Raspberry Pi
const isRaspberryPi = () => {
  try {
    const fs = require('fs');
    const cpuInfo = fs.readFileSync('/proc/cpuinfo', 'utf8');
    return cpuInfo.includes('Raspberry Pi') || cpuInfo.includes('BCM2708') || cpuInfo.includes('BCM2709') || cpuInfo.includes('BCM2711');
  } catch {
    return false;
  }
};

// Detect if running in headless mode (no display)
const isHeadless = () => {
  return !process.env.DISPLAY || process.env.DISPLAY === '';
};

const isPi = isRaspberryPi();
const isHeadlessMode = isHeadless();

console.log(`🍓 Raspberry Pi: ${isPi}`);
console.log(`🖥️  Headless mode: ${isHeadlessMode}`);
console.log(`🖥️  DISPLAY: ${process.env.DISPLAY || 'not set'}`);

// Raspberry Pi specific optimizations
if (isPi) {
  console.log('🍓 Raspberry Pi detected - applying optimizations');
  // Only disable WebGL in headless mode, enable it for GUI mode
  if (isHeadlessMode) {
    app.commandLine.appendSwitch('--disable-webgl');
    app.commandLine.appendSwitch('--disable-webgl2');
  } else {
    app.commandLine.appendSwitch('--enable-webgl');
    app.commandLine.appendSwitch('--enable-webgl2');
  }
  app.commandLine.appendSwitch('--disable-accelerated-compositing');
  app.commandLine.appendSwitch('--disable-accelerated-layers');
  app.commandLine.appendSwitch('--disable-accelerated-plugins');
  app.commandLine.appendSwitch('--disable-accelerated-video');
  app.commandLine.appendSwitch('--disable-gpu-memory-buffer-video-frames');
  app.commandLine.appendSwitch('--disable-gpu-rasterization');
  app.commandLine.appendSwitch('--disable-oop-rasterization');
  app.commandLine.appendSwitch('--disable-zero-copy');
  app.commandLine.appendSwitch('--disable-background-timer-throttling');
  app.commandLine.appendSwitch('--disable-renderer-backgrounding');
  app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');
  app.commandLine.appendSwitch('--disable-features', 'TranslateUI');
  app.commandLine.appendSwitch('--disable-features', 'BlinkGenPropertyTrees');
  app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');
} else {
  // Enable WebGL for desktop systems
  app.commandLine.appendSwitch('--enable-webgl');
  app.commandLine.appendSwitch('--enable-webgl2');
}

// Headless mode support
if (isHeadlessMode) {
  console.log('🖥️  Headless mode detected - applying headless optimizations');
  app.commandLine.appendSwitch('--headless');
  app.commandLine.appendSwitch('--disable-gpu');
  app.commandLine.appendSwitch('--no-sandbox');
  app.commandLine.appendSwitch('--disable-dev-shm-usage');
  app.commandLine.appendSwitch('--disable-web-security');
  app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');
}

const isDev = !app.isPackaged;

function createWindow() {
  // Don't create window in headless mode
  if (isHeadlessMode) {
    console.log('🖥️  Running in headless mode - no window will be created');
    return null;
  }

  const win = new BrowserWindow({
    width: isPi ? 1024 : 1280, // Smaller window for Pi
    height: isPi ? 768 : 800,
    minWidth: isPi ? 800 : 900,
    minHeight: isPi ? 600 : 600,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      // Enable WebGL for desktop and Pi in GUI mode
      webgl: !isPi || !isHeadlessMode,
    },
    show: false,
    // Raspberry Pi specific settings
    ...(isPi && {
      fullscreenable: true,
      resizable: true,
      maximizable: false, // Prevent memory issues
    }),
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    if (!isPi) win.webContents.openDevTools(); // Disable dev tools on Pi
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  win.once('ready-to-show', () => win.show());
  
  // Raspberry Pi specific optimizations
  if (isPi) {
    // Reduce memory usage
    win.webContents.setBackgroundThrottling(false);
    
    // Handle low memory situations
    app.on('render-process-gone', (event: any, webContents: any, details: any) => {
      console.log('Render process gone:', details.reason);
      if (details.reason === 'oom') {
        console.log('Out of memory detected - restarting window');
        createWindow();
      }
    });
  }
}

app.whenReady().then(async () => {
  // Start WebSocket server
  try {
    await defaultWebSocketService.start();
    console.log('WebSocket server started successfully');
  } catch (error) {
    console.error('Failed to start WebSocket server:', error);
  }

  // Only create window if not in headless mode
  if (!isHeadlessMode) {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  } else {
    console.log('🖥️  Running in headless mode - WebSocket server is available');
    console.log('🌐 WebSocket server running on port 8080');
  }
});

app.on('window-all-closed', () => {
  // Stop WebSocket server
  defaultWebSocketService.stop();
  
  if (process.platform !== 'darwin') app.quit();
}); 

// Add IPC handlers for update operations
ipcMain.handle('run-update-script', async () => {
  return new Promise((resolve, reject) => {
    // Check if we're on Raspberry Pi
    if (!isPi) {
      return reject('Update script is only available on Raspberry Pi');
    }

    // Try to run the update script
    const updateScript = '/usr/local/bin/update-wind-tunnel.sh';
    exec(`sudo ${updateScript}`, (err: any, stdout: any, stderr: any) => {
      if (err) {
        // If script doesn't exist, provide manual instructions
        return reject(`Update script not found. Please run manually:\ncd /home/matrix/wind-tunnel-electron-react\ngit pull origin main\nnpm install\nnpm run build\nsudo systemctl restart wind-tunnel`);
      }
      resolve(`Update script executed successfully:\n${stdout}`);
    });
  });
});

ipcMain.handle('run-manual-update', async () => {
  return new Promise((resolve, reject) => {
    // Check if we're on Raspberry Pi
    if (!isPi) {
      return reject('Manual update is only available on Raspberry Pi');
    }

    const appDir = '/home/matrix/wind-tunnel-electron-react';
    
    // Run update commands in a new terminal window
    const commands = [
      `cd ${appDir}`,
      'git pull origin main',
      'npm install',
      'npm run build',
      'sudo systemctl restart wind-tunnel'
    ].join(' && ');

    // Open a new terminal with the commands
    exec(`gnome-terminal -- bash -c "${commands}; read -p 'Press Enter to close...'"`, (err: any, stdout: any, stderr: any) => {
      if (err) {
        // Fallback: try xterm
        exec(`xterm -e "bash -c '${commands}; read -p \"Press Enter to close...\"'"`, (err2: any, stdout2: any, stderr2: any) => {
          if (err2) {
            // Last resort: just show the commands
            resolve(`Please run these commands in terminal:\n\n${commands}`);
          } else {
            resolve('Update commands opened in xterm terminal');
          }
        });
      } else {
        resolve('Update commands opened in gnome-terminal');
      }
    });
  });
});

ipcMain.handle('check-app-version', async () => {
  try {
    const packageJson = require('../../package.json');
    return {
      version: packageJson.version,
      isPi: isPi,
      appDir: isPi ? '/home/matrix/wind-tunnel-electron-react' : process.cwd()
    };
  } catch (error) {
    return {
      version: 'unknown',
      isPi: isPi,
      appDir: isPi ? '/home/matrix/wind-tunnel-electron-react' : process.cwd()
    };
  }
}); 