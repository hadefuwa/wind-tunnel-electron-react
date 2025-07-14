# Wind Tunnel App - Raspberry Pi & 7-inch HDMI Screen Setup Guide

## 🍓 Overview

Your Wind Tunnel application is a sophisticated data acquisition and visualization system designed specifically for Raspberry Pi with touchscreen displays. It combines real-time sensor data collection, 3D visualization, and touch-friendly interface controls.

## 🖥️ Hardware Setup

### Raspberry Pi Configuration
- **Model**: Raspberry Pi (any model with HDMI output)
- **Display**: 7-inch HDMI touchscreen
- **Interface**: Touch input for navigation and control
- **Connectivity**: SPI sensors, WebSocket communication

### Display Specifications
- **Resolution**: 1024x600 (typical for 7-inch screens)
- **Touch**: Capacitive or resistive touch input
- **Orientation**: Landscape mode optimized
- **Refresh Rate**: 60Hz for smooth animations

## 🏗️ Application Architecture

### 1. **Main Process (Electron Backend)**
```
src/main/index.ts
├── Raspberry Pi Detection
├── Display Environment Setup
├── WebSocket Server (Port 8080)
├── SPI Communication
└── Window Management
```

**Key Features:**
- **Automatic Pi Detection**: Detects Raspberry Pi hardware and applies optimizations
- **Display Handling**: Manages 7-inch screen resolution and touch input
- **Headless Mode**: Can run without GUI for data collection
- **Memory Management**: Optimized for Pi's limited RAM

### 2. **Renderer Process (React Frontend)**
```
src/renderer/
├── Dashboard.tsx (Main Interface)
├── RealTimeChart.tsx (Data Visualization)
├── WindTunnel3D.tsx (3D Graphics)
├── SPIConfig.tsx (Sensor Configuration)
└── Touch-Optimized Components
```

**Key Features:**
- **Touch-Friendly UI**: Large buttons, swipe gestures, pinch-to-zoom
- **Responsive Design**: Adapts to 7-inch screen dimensions
- **Real-time Updates**: Live data visualization
- **3D Graphics**: WebGL-based wind tunnel simulation

## 🔧 Raspberry Pi Optimizations

### Performance Optimizations
```typescript
// Applied automatically when Pi is detected
app.commandLine.appendSwitch('--disable-webgl'); // Stability over graphics
app.commandLine.appendSwitch('--disable-gpu-sandbox');
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--disable-dev-shm-usage');
```

### Memory Management
- **Background Throttling**: Disabled to prevent data loss
- **Render Process Monitoring**: Automatic restart on memory issues
- **Optimized Window Size**: 1024x768 for 7-inch screens

### Touch Input Handling
```css
/* Touch-friendly global styles */
html, body, #root {
  touch-action: pan-y pan-x; /* Allow scrolling in all directions */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling */
}

/* Minimum touch targets */
button, input, select, textarea {
  min-height: 44px; /* Easy to tap */
  min-width: 44px;
}
```

## 📊 Data Flow

### 1. **Sensor Data Collection**
```
SPI Sensors → Raspberry Pi GPIO → SPI Service → WebSocket Server → Frontend
```

**Components:**
- **SPI Service**: Manages sensor communication
- **Data Logger**: Stores historical data
- **Real-time Processing**: Immediate data analysis

### 2. **Visualization Pipeline**
```
Raw Data → Processing → Charts → 3D Visualization → Touch Interface
```

**Features:**
- **Real-time Charts**: Live drag force, lift force, wind speed
- **3D Wind Tunnel**: Interactive 3D simulation
- **Data Tables**: Historical data review
- **Export Functions**: CSV/JSON data export

## 🎯 Touch Interface Design

### Navigation
- **Swipe Gestures**: Scroll through dashboard sections
- **Tap Navigation**: Large, easy-to-tap buttons
- **Pinch-to-Zoom**: On charts and 3D visualizations
- **Long Press**: Context menus and options

### Dashboard Layout
```
┌─────────────────────────────────────┐
│ Header (Status, Controls)           │
├─────────────────────────────────────┤
│ Tab Navigation (Main/Analytics/Data)│
├─────────────────────────────────────┤
│ Parameter Cards (6 cards in grid)   │
├─────────────────────────────────────┤
│ Charts & 3D Visualization           │
├─────────────────────────────────────┤
│ Data Tables & Export                │
└─────────────────────────────────────┘
```

### Touch Zones
- **Top 20%**: Header and navigation
- **Middle 60%**: Main content area (scrollable)
- **Bottom 20%**: Controls and status

## 🔌 Hardware Integration

### SPI Sensor Setup
```typescript
// SPI Configuration for sensors
const spiConfig = {
  device: '/dev/spidev0.0',
  mode: 0,
  maxSpeed: 1000000,
  bitsPerWord: 8
};
```

### Supported Sensors
- **Pressure Sensors**: Air pressure measurement
- **Temperature Sensors**: Ambient temperature
- **Force Sensors**: Drag and lift force measurement
- **Flow Sensors**: Wind speed and direction

### GPIO Pin Mapping
- **SPI0**: Primary sensor communication
- **GPIO**: Status LEDs and control signals
- **I2C**: Additional sensor support

## 🚀 Startup Process

### 1. **System Boot**
```bash
# Automatic startup script
./scripts/start-pi.sh
```

### 2. **Environment Detection**
- **Raspberry Pi Detection**: Checks `/proc/cpuinfo`
- **Display Detection**: Checks X11 sockets and DISPLAY variable
- **Touch Input**: Detects touchscreen capabilities

### 3. **Application Launch**
- **GUI Mode**: Full interface with touch support
- **Headless Mode**: WebSocket server only (for remote access)

## 📱 Touch Interface Features

### Gesture Support
- **Swipe Up/Down**: Scroll through content
- **Swipe Left/Right**: Navigate between tabs
- **Tap**: Select buttons and options
- **Double Tap**: Zoom in/out on charts
- **Long Press**: Context menus

### Visual Feedback
- **Button Press**: Scale animation (0.98x)
- **Loading States**: Skeleton screens during data load
- **Error States**: Clear error messages
- **Success States**: Green checkmarks and confirmations

## 🔄 Real-time Features

### Data Updates
- **100ms Intervals**: High-frequency sensor reading
- **Live Charts**: Real-time data visualization
- **WebSocket**: Instant data transmission
- **Auto-scaling**: Charts adapt to data ranges

### Performance Monitoring
- **Memory Usage**: Automatic monitoring and optimization
- **CPU Usage**: Efficient processing for Pi
- **Network**: WebSocket connection status
- **Storage**: Data logging and export

## 🛠️ Troubleshooting

### Common Issues
1. **Touch Not Working**: Check touchscreen drivers
2. **Display Issues**: Verify HDMI connection and resolution
3. **Performance**: Monitor memory usage and CPU
4. **Sensors**: Check SPI configuration and wiring

### Debug Commands
```bash
# Check display
xset q

# Check touch input
ls /dev/input/event*

# Monitor system resources
htop

# Check SPI devices
ls /dev/spidev*
```

## 🎨 Customization

### Screen Resolution
```typescript
// Adjust for different screen sizes
const screenConfig = {
  width: 1024,  // 7-inch typical
  height: 768,
  minWidth: 800,
  minHeight: 600
};
```

### Touch Sensitivity
```css
/* Adjust touch targets for different screens */
@media (pointer: coarse) {
  button, input, select, textarea {
    min-height: 44px; /* Increase for larger screens */
    min-width: 44px;
  }
}
```

## 🔮 Future Enhancements

### Planned Features
- **Multi-touch Support**: Advanced gesture recognition
- **Voice Commands**: Hands-free operation
- **Remote Access**: Web interface for remote monitoring
- **Data Analytics**: Advanced statistical analysis
- **Machine Learning**: Predictive modeling

### Hardware Expansion
- **Additional Sensors**: More measurement capabilities
- **Camera Integration**: Visual flow analysis
- **Network Sensors**: Distributed measurement
- **Cloud Integration**: Remote data storage

---

This setup provides a complete, touch-optimized wind tunnel data acquisition and visualization system specifically designed for Raspberry Pi with 7-inch HDMI touchscreen displays. 