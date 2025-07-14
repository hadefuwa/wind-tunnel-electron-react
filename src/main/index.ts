import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { defaultWebSocketService } from './services/WebSocketServer';

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

const isPi = isRaspberryPi();

// Handle GPU process crashes and WebGL issues
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

// Raspberry Pi specific optimizations
if (isPi) {
  console.log('🍓 Raspberry Pi detected - applying optimizations');
  app.commandLine.appendSwitch('--disable-webgl'); // Disable WebGL on Pi for stability
  app.commandLine.appendSwitch('--disable-webgl2');
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

const isDev = !app.isPackaged;

function createWindow() {
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
      // Enable WebGL only on desktop
      webgl: !isPi,
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
    app.on('render-process-gone', (event, webContents, details) => {
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

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Stop WebSocket server
  defaultWebSocketService.stop();
  
  if (process.platform !== 'darwin') app.quit();
}); 