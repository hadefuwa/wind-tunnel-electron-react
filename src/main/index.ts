import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { defaultWebSocketService } from './services/WebSocketServer';
import { defaultSimulationService } from '../renderer/services/SimulationService';

// Handle GPU process crashes
app.commandLine.appendSwitch('--disable-gpu-sandbox');
app.commandLine.appendSwitch('--disable-software-rasterizer');
app.commandLine.appendSwitch('--disable-dev-shm-usage');
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--disable-web-security');
app.commandLine.appendSwitch('--allow-running-insecure-content');

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      // Enable WebGL
      webgl: true,
    },
    show: false,
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  win.once('ready-to-show', () => win.show());
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