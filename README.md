# Wind Tunnel Application

A modern desktop application for wind tunnel data acquisition and visualization, built with Electron, React, and TypeScript.

## 🚀 Features

- **Dual Mode Operation**: Switch between simulation and real SPI hardware modes
- **Real-time Dashboard**: Live data visualization with parameter cards and charts
- **3D Visualization**: Interactive 3D models with Three.js
- **SPI Configuration**: User-friendly interface for hardware setup
- **Data Management**: Export and analyze test data
- **Cross-platform**: Windows, macOS, and Linux support

## 📋 Current Status

**Phase 1 Complete ✅** - Foundation and UI
- Electron + React + TypeScript setup
- Modern dashboard with Tailwind CSS
- Routing and navigation system
- State management with Zustand
- Settings interface with tabs

**Phase 2 In Progress** - Core Features
- Simulation engine
- Real-time charts
- 3D visualization
- Data streaming

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron 27
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **3D Graphics**: Three.js
- **Charts**: Chart.js
- **Build Tool**: Vite
- **Hardware**: SerialPort for SPI communication

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
│   │   ├── store/      # Zustand state management
│   │   ├── services/   # Frontend services
│   │   └── types/      # TypeScript types
│   └── shared/         # Shared code
├── public/             # Static assets
├── docs/              # Documentation
└── tests/             # Test files
```

## 🎯 Development Phases

### Phase 1: Foundation ✅
- [x] Project setup and configuration
- [x] Basic UI components and layout
- [x] Routing and navigation
- [x] State management
- [x] Settings interface

### Phase 2: Core Features (Current)
- [ ] Simulation engine
- [ ] Real-time data visualization
- [ ] 3D visualization
- [ ] Data streaming

### Phase 3: SPI Integration
- [ ] SPI configuration interface
- [ ] Hardware communication
- [ ] Data acquisition
- [ ] Error handling

### Phase 4: Advanced Features
- [ ] Enhanced 3D visualization
- [ ] Advanced charts
- [ ] Data management
- [ ] User preferences

### Phase 5: Polish & Testing
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Testing
- [ ] Documentation

## 🔧 Configuration

### SPI Settings
- **Mode**: 0, 1, 2, or 3
- **Clock Speed**: 1kHz - 1MHz
- **Bit Order**: MSB/LSB first
- **Data Bits**: 8-bit or 16-bit

### Simulation Settings
- **Wind Speed**: 0-100 m/s
- **Model Type**: Car, Aerofoil, Building, Custom
- **Environmental Factors**: Temperature, humidity, pressure

## 📊 Data Parameters

### Primary Parameters
- Drag Coefficient (Cd)
- Lift Coefficient (Cl)
- Reynolds Number
- Velocity
- Pressure
- Temperature

### Secondary Parameters
- Angle of Attack
- Yaw Angle
- Turbulence Intensity
- Power Consumption
- Data Quality

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

## 🎉 Acknowledgments

- Built with [Electron](https://electronjs.org/)
- UI powered by [React](https://reactjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- 3D visualization with [Three.js](https://threejs.org/)
- Charts with [Chart.js](https://www.chartjs.org/) 