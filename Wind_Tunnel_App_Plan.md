# Wind Tunnel Application - Development Plan

## Project Overview
A desktop application for wind tunnel data acquisition and visualization, supporting both simulation mode and real-time SPI communication with a microcontroller.

## Core Features

### 1. **Dual Mode Operation**
- **Simulation Mode**: Generate realistic wind tunnel data for development and testing
- **Real SPI Mode**: Connect to actual microcontroller via SPI for live data acquisition
- Easy switching between modes via settings panel

### 2. **Beautiful Dashboard Interface**
- Modern, responsive UI with real-time data visualization
- Multiple parameter displays (drag, lift, pressure, velocity, etc.)
- Interactive charts and graphs
- Real-time data streaming with smooth animations

### 3. **3D Visualization**
- 3D model of car/aerofoil in wind tunnel environment
- Real-time visual feedback based on data
- Simple physics representation (no complex fluid dynamics engine)
- Configurable model types (car, aerofoil, custom shapes)

### 4. **SPI Configuration System**
- User-friendly SPI setup interface
- Configurable parameters (baud rate, pins, protocol settings)
- Connection status monitoring
- Data validation and error handling

## Technical Architecture

### Frontend (Electron + React/TypeScript)
```
src/
├── components/
│   ├── Dashboard/
│   │   ├── ParameterCards.tsx
│   │   ├── RealTimeCharts.tsx
│   │   ├── DataGrid.tsx
│   │   └── StatusIndicators.tsx
│   ├── Visualization/
│   │   ├── WindTunnel3D.tsx
│   │   ├── ModelRenderer.tsx
│   │   └── FlowVisualization.tsx
│   ├── Settings/
│   │   ├── SPIConfig.tsx
│   │   ├── SimulationSettings.tsx
│   │   └── GeneralSettings.tsx
│   └── Layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── MainLayout.tsx
├── services/
│   ├── SPIService.ts
│   ├── SimulationService.ts
│   ├── DataProcessor.ts
│   └── WebSocketService.ts
├── types/
│   ├── WindTunnelData.ts
│   ├── SPIConfig.ts
│   └── SimulationConfig.ts
└── utils/
    ├── DataValidation.ts
    ├── ChartHelpers.ts
    └── Constants.ts
```

### Backend (Node.js/Electron Main Process)
```
main/
├── services/
│   ├── SPIDriver.ts
│   ├── DataAcquisition.ts
│   └── WebSocketServer.ts
├── config/
│   ├── DefaultSettings.ts
│   └── SPIConfig.ts
└── utils/
    ├── Logger.ts
    └── DataFormatter.ts
```

## Data Parameters to Display

### Primary Parameters
- **Drag Coefficient (Cd)**: Real-time drag measurement
- **Lift Coefficient (Cl)**: Lift force measurement
- **Reynolds Number**: Flow characteristics
- **Velocity**: Wind speed at various points
- **Pressure**: Static and dynamic pressure readings
- **Temperature**: Air temperature monitoring
- **Humidity**: Environmental conditions

### Secondary Parameters
- **Angle of Attack**: For aerofoil testing
- **Yaw Angle**: For vehicle testing
- **Turbulence Intensity**: Flow quality metrics
- **Power Consumption**: System monitoring
- **Data Quality**: Signal strength and reliability

## SPI Configuration Interface

### Connection Settings
- **SPI Mode**: 0, 1, 2, or 3
- **Clock Speed**: Configurable frequency (1kHz - 1MHz)
- **Bit Order**: MSB/LSB first
- **Data Bits**: 8-bit or 16-bit
- **Chip Select**: Configurable CS pin
- **Port Selection**: Available SPI ports

### Data Protocol
- **Packet Structure**: Header, data, checksum
- **Sampling Rate**: Configurable frequency
- **Buffer Size**: Data buffering settings
- **Error Handling**: Retry logic and timeout settings

## Simulation Engine

### Data Generation
- **Realistic Physics**: Basic aerodynamic calculations
- **Configurable Parameters**: Wind speed, model properties
- **Random Variations**: Simulate sensor noise
- **Scenario Modes**: Different test conditions

### Simulation Features
- **Variable Wind Speed**: 0-100 m/s range
- **Angle Control**: Adjustable angle of attack/yaw
- **Model Properties**: Configurable drag/lift characteristics
- **Environmental Factors**: Temperature, humidity, pressure

## User Interface Design

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header: App Title, Mode Indicator, Connection Status    │
├─────────────────┬───────────────────────────────────────┤
│ Sidebar:        │ Main Dashboard Area                   │
│ - Navigation    │ ┌─────────────┬─────────────┐         │
│ - Quick Stats   │ │ Drag Coeff  │ Lift Coeff  │         │
│ - Alerts        │ │   0.32      │   0.15      │         │
│                 │ └─────────────┴─────────────┘         │
│                 │ ┌─────────────┬─────────────┐         │
│                 │ │ Velocity    │ Pressure    │         │
│                 │ │   25 m/s    │  101.3 kPa  │         │
│                 │ └─────────────┴─────────────┘         │
│                 │ ┌─────────────────────────────┐       │
│                 │ │     Real-time Charts        │       │
│                 │ │                             │       │
│                 │ └─────────────────────────────┘       │
│                 │ ┌─────────────────────────────┐       │
│                 │ │     3D Visualization        │       │
│                 │ │                             │       │
│                 │ └─────────────────────────────┘       │
└─────────────────┴───────────────────────────────────────┘
```

### Color Scheme
- **Primary**: Deep blue (#1e3a8a) - Professional, technical
- **Secondary**: Orange (#f97316) - Energy, data
- **Success**: Green (#16a34a) - Good readings
- **Warning**: Yellow (#ca8a04) - Caution
- **Error**: Red (#dc2626) - Problems
- **Background**: Dark theme (#0f172a) - Easy on eyes

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Electron + React + TypeScript project
- [ ] Create basic project structure
- [ ] Implement basic UI components
- [ ] Set up development environment

### Phase 2: Core Features (Week 3-4)
- [ ] Implement simulation engine
- [ ] Create basic dashboard layout
- [ ] Add real-time data visualization
- [ ] Implement basic 3D visualization

### Phase 3: SPI Integration (Week 5-6)
- [ ] Develop SPI configuration interface
- [ ] Implement SPI communication service
- [ ] Add data validation and error handling
- [ ] Test with real hardware

### Phase 4: Advanced Features (Week 7-8)
- [ ] Enhance 3D visualization
- [ ] Add advanced charts and graphs
- [ ] Implement data logging and export
- [ ] Add user preferences and settings

### Phase 5: Polish & Testing (Week 9-10)
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Documentation and user guide

## Technology Stack

### Frontend
- **Framework**: Electron + React + TypeScript
- **UI Library**: Tailwind CSS + Headless UI
- **Charts**: Chart.js or D3.js
- **3D Graphics**: Three.js
- **State Management**: Zustand or Redux Toolkit

### Backend
- **Runtime**: Node.js (Electron main process)
- **SPI Library**: node-spi or similar
- **WebSocket**: ws library for real-time communication
- **Data Processing**: Custom algorithms

### Development Tools
- **Build Tool**: Vite or Webpack
- **Linting**: ESLint + Prettier
- **Testing**: Jest + React Testing Library
- **Version Control**: Git

## File Structure

```
wind-tunnel-electron/
├── package.json
├── electron-builder.json
├── tsconfig.json
├── tailwind.config.js
├── src/
│   ├── main/
│   │   ├── index.ts
│   │   ├── services/
│   │   └── config/
│   ├── renderer/
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── shared/
│       ├── types/
│       └── constants/
├── public/
│   ├── index.html
│   └── assets/
├── docs/
│   ├── API.md
│   ├── SPI_Protocol.md
│   └── User_Guide.md
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## Key Features Summary

1. **Easy Mode Switching**: Toggle between simulation and real SPI mode
2. **Beautiful Dashboard**: Modern, responsive interface with real-time data
3. **3D Visualization**: Interactive 3D model with basic physics
4. **Comprehensive SPI Setup**: User-friendly configuration interface
5. **Real-time Data**: Live streaming of all wind tunnel parameters
6. **Data Export**: Save and export test data
7. **Error Handling**: Robust error detection and recovery
8. **Cross-platform**: Windows, macOS, and Linux support

## Success Metrics

- **Performance**: < 100ms data update latency
- **Reliability**: 99.9% uptime during tests
- **Usability**: < 5 minutes to configure SPI connection
- **Accuracy**: < 1% error in simulated data
- **User Experience**: Intuitive interface requiring minimal training

This plan provides a comprehensive roadmap for developing your wind tunnel application with all the features you requested. The modular architecture ensures easy maintenance and future enhancements. 