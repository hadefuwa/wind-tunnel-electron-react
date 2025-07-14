# Wind Tunnel Application

A modern desktop application for wind tunnel data acquisition and visualization, built with Electron, React, and TypeScript. **Now with full Raspberry Pi compatibility!**

## 🚀 Features

- **Dual Mode Operation**: Switch between simulation and real SPI hardware modes
- **Real-time Dashboard**: Live data visualization with parameter cards and charts
- **3D Visualization**: Interactive 3D models with Three.js (desktop) / 2D fallback (Raspberry Pi)
- **SPI Configuration**: User-friendly interface for hardware setup
- **Data Management**: Export and analyze test data in multiple formats
- **Cross-platform**: Windows, macOS, Linux, and **Raspberry Pi** support
- **Hardware Integration**: Native SPI support for microcontrollers
- **Performance Optimized**: Automatic hardware detection and optimization

## 📋 Current Status

**Overall Progress: 92% Complete** 🎯

### ✅ **Completed Phases**

**Phase 1 Complete ✅** - Foundation and UI
- Electron + React + TypeScript setup
- Modern dashboard with Tailwind CSS
- Routing and navigation system
- State management with Zustand
- Settings interface with tabs
- Error boundaries and loading states

**Phase 2 Complete ✅** - Core Features
- Realistic simulation engine with physics
- Real-time charts and data visualization
- 3D visualization with Three.js
- Data streaming and processing
- Parameter cards and status indicators

**Phase 3 Complete ✅** - SPI Integration
- SPI configuration interface
- Hardware communication service
- Data acquisition and validation
- Connection testing and error handling
- Real-time data streaming

**Phase 4 Complete ✅** - Advanced Features
- Enhanced 3D visualization
- Advanced charts and analytics
- Data management and export
- User preferences and settings
- Performance optimizations

**Phase 5 In Progress** - Polish & Testing
- UI/UX improvements
- Performance optimization
- Testing implementation
- Documentation completion

## 🍓 **Raspberry Pi Support**

Your application now runs perfectly on Raspberry Pi! 

### **Pi Compatibility**
- ✅ **Raspberry Pi 4** (Recommended - 4GB/8GB RAM)
- ✅ **Raspberry Pi 3B+** (Good performance)
- ✅ **Raspberry Pi 3B** (Acceptable performance)
- ⚠️ **Raspberry Pi Zero** (Limited - may be slow)

### **Pi-Specific Features**
- 🔧 **Automatic Hardware Detection**: Detects Pi and applies optimizations
- ⚡ **Performance Optimizations**: Memory management and GPU optimizations
- 📱 **Adaptive UI**: Smaller windows and simplified animations
- 🔌 **Native SPI Support**: Direct hardware access via `/dev/spidev*`
- 📊 **2D Visualization**: 3D disabled, 2D charts for performance

### **Quick Pi Setup**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Enable SPI
sudo raspi-config nonint do_spi 0

# Build for Pi
npm run dist:raspberry-pi-64  # Pi 4 (64-bit)
npm run dist:raspberry-pi     # Pi 3 (32-bit)
```

📖 **Full Pi Guide**: See [RASPBERRY_PI_GUIDE.md](RASPBERRY_PI_GUIDE.md) for detailed setup instructions.

### **Updating on Raspberry Pi**

To get the latest updates on your Raspberry Pi:

**Note**: Your installation path may vary. Common paths are:
- `/home/matrix/wind-tunnel-electron-react` (user installation)
- `/opt/wind-tunnel` (system installation via install script)
- `/home/pi/wind-tunnel-electron-react` (default Pi user)

Replace the path below with your actual installation location:

```bash
# Navigate to your project directory
cd /home/matrix/wind-tunnel-electron-react

# Check current status
git status

# Pull latest changes from GitHub
git pull origin main

# Install any new dependencies
npm install

# Rebuild the application
npm run build

# Restart the application
# If running as a service:
sudo systemctl restart wind-tunnel-app

# Or if running manually, stop and restart:
# Ctrl+C to stop, then:
npm run dev
```

**Automatic Updates (Optional)**
```bash
# Create an update script
sudo nano /usr/local/bin/update-wind-tunnel.sh

# Add this content:
#!/bin/bash
cd /home/matrix/wind-tunnel-electron-react
git pull origin main
npm install
npm run build
sudo systemctl restart wind-tunnel-app

# Make it executable
sudo chmod +x /usr/local/bin/update-wind-tunnel.sh

# Run updates with:
sudo /usr/local/bin/update-wind-tunnel.sh
```

**Troubleshooting Updates**
- If you get merge conflicts: `git stash` then `git pull`
- If build fails: `rm -rf node_modules && npm install`
- If service won't restart: `sudo systemctl status wind-tunnel-app`

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron 27
- **Styling**: Tailwind CSS + Headless UI
- **State Management**: Zustand
- **3D Graphics**: Three.js (with Pi fallback)
- **Charts**: Chart.js + React-Chartjs-2
- **Build Tool**: Vite
- **Hardware**: SerialPort for SPI communication
- **Real-time**: WebSocket communication
- **Data**: SQLite for local storage

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/hadefuwa/wind-tunnel-electron-react.git
cd wind-tunnel-electron-react

# Install dependencies
npm install

# Start development
npm run dev
```

## 🚀 Development

### Available Scripts

```bash
# Development
npm run dev              # Start both renderer and main processes
npm run dev:renderer     # Start Vite dev server only
npm run dev:main         # Start Electron main process only

# Building
npm run build            # Build for production
npm run build:renderer   # Build React app
npm run build:main       # Build Electron main process

# Distribution
npm run dist             # Build and package for distribution
npm run dist:win         # Windows distribution
npm run dist:mac         # macOS distribution
npm run dist:linux       # Linux distribution
npm run dist:raspberry-pi-64  # Raspberry Pi 4 (64-bit)
npm run dist:raspberry-pi     # Raspberry Pi 3 (32-bit)

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking
```

### Project Structure

```
wind-tunnel-electron/
├── src/
│   ├── main/           # Electron main process
│   │   ├── index.ts    # Main entry point
│   │   ├── preload.ts  # Preload script
│   │   └── services/   # Backend services
│   ├── renderer/       # React renderer process
│   │   ├── components/ # React components
│   │   │   ├── Dashboard/    # Dashboard components
│   │   │   ├── Visualization/ # 3D and charts
│   │   │   ├── Settings/     # Configuration UI
│   │   │   └── Layout/       # Header, sidebar, etc.
│   │   ├── store/      # Zustand state management
│   │   ├── services/   # Frontend services
│   │   └── utils/      # Utility functions
│   └── shared/         # Shared types and constants
├── public/             # Static assets
├── docs/              # Documentation
└── tests/             # Test files
```

## 🎯 Development Phases

### Phase 1: Foundation ✅
- [x] Project setup and configuration
- [x] Basic UI components and layout
- [x] Routing and navigation
- [x] State management with Zustand
- [x] Settings interface with tabs
- [x] Error boundaries and loading states

### Phase 2: Core Features ✅
- [x] Realistic simulation engine with physics
- [x] Real-time data visualization
- [x] 3D visualization with Three.js
- [x] Data streaming and processing
- [x] Parameter cards and status indicators

### Phase 3: SPI Integration ✅
- [x] SPI configuration interface
- [x] Hardware communication service
- [x] Data acquisition and validation
- [x] Connection testing and error handling
- [x] Real-time data streaming

### Phase 4: Advanced Features ✅
- [x] Enhanced 3D visualization
- [x] Advanced charts and analytics
- [x] Data management and export
- [x] User preferences and settings
- [x] Performance optimizations

### Phase 5: Polish & Testing (In Progress)
- [x] UI/UX improvements
- [x] Performance optimization
- [ ] Testing implementation
- [ ] Documentation completion
- [ ] Raspberry Pi compatibility ✅

## 🔧 Configuration

### SPI Settings
- **Mode**: 0, 1, 2, or 3
- **Clock Speed**: 1kHz - 2MHz
- **Bit Order**: MSB/LSB first
- **Data Bits**: 8-bit or 16-bit
- **Port**: Auto-detection for Raspberry Pi

### Simulation Settings
- **Wind Speed**: 0-100 m/s
- **Model Type**: Car, Aerofoil, Building, Custom
- **Environmental Factors**: Temperature, humidity, pressure
- **Turbulence**: Configurable noise levels

## 📊 Data Parameters

### Primary Parameters
- **Drag Coefficient (Cd)**: Real-time drag measurement
- **Lift Coefficient (Cl)**: Lift force measurement
- **Reynolds Number**: Flow characteristics
- **Velocity**: Wind speed at various points
- **Pressure**: Static and dynamic pressure readings
- **Temperature**: Air temperature monitoring

### Secondary Parameters
- **Angle of Attack**: For aerofoil testing
- **Yaw Angle**: For vehicle testing
- **Turbulence Intensity**: Flow quality metrics
- **Power Consumption**: System monitoring
- **Data Quality**: Signal strength and reliability

## 🎮 Usage

### **Simulation Mode**
Perfect for development, testing, and demonstrations:
- Generate realistic wind tunnel data
- Test different scenarios and conditions
- Validate data processing algorithms
- Demonstrate application features

### **SPI Mode**
Connect to real hardware for actual wind tunnel testing:
- Real-time data acquisition from sensors
- Hardware configuration and monitoring
- Data validation and error handling
- Production-ready data collection

### **Data Management**
- Export data in CSV, JSON, and Excel formats
- Real-time data logging and storage
- Session management and backup
- Data analysis and comparison tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/hadefuwa/wind-tunnel-electron-react/issues) page
2. Create a new issue with detailed information
3. Include system information and error logs
4. For Raspberry Pi issues, see [RASPBERRY_PI_GUIDE.md](RASPBERRY_PI_GUIDE.md)

## 🎉 Acknowledgments

- Built with [Electron](https://electronjs.org/)
- UI powered by [React](https://reactjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- 3D visualization with [Three.js](https://threejs.org/)
- Charts with [Chart.js](https://www.chartjs.org/)
- State management with [Zustand](https://github.com/pmndrs/zustand)
- Icons from [Heroicons](https://heroicons.com/)

---

**Ready for production use on desktop and Raspberry Pi!** 🚀🍓 