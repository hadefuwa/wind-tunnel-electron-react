import { WindTunnelData } from '../store/useAppStore';

export interface SimulationConfig {
  windSpeed: number; // m/s
  modelType: 'car' | 'aerofoil' | 'building' | 'custom';
  angleOfAttack: number; // degrees
  temperature: number; // °C
  pressure: number; // kPa
  humidity: number; // %
  turbulence: number; // 0-1
}

export class SimulationService {
  private config: SimulationConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private baseTime = Date.now();

  constructor(config: SimulationConfig) {
    this.config = config;
  }

  // Start simulation with data updates
  start(onDataUpdate: (data: WindTunnelData) => void, updateRate: number = 100) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.baseTime = Date.now();
    
    this.intervalId = setInterval(() => {
      const data = this.generateData();
      onDataUpdate(data);
    }, updateRate);
  }

  // Stop simulation
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  // Update simulation configuration
  updateConfig(newConfig: Partial<SimulationConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Generate realistic wind tunnel data
  private generateData(): WindTunnelData {
    const time = (Date.now() - this.baseTime) / 1000; // seconds
    const windSpeed = this.config.windSpeed;
    
    // Add realistic variations and noise
    const noise = this.generateNoise(time);
    const turbulence = this.config.turbulence;
    
    // Calculate aerodynamic coefficients based on model type and conditions
    const { dragCoeff, liftCoeff } = this.calculateAerodynamicCoefficients(time);
    
    // Calculate Reynolds number
    const reynoldsNumber = this.calculateReynoldsNumber(windSpeed);
    
    // Add environmental variations
    const temperatureVariation = Math.sin(time * 0.1) * 0.5;
    const pressureVariation = Math.cos(time * 0.05) * 0.2;
    
    return {
      dragCoefficient: dragCoeff + noise.drag * turbulence,
      liftCoefficient: liftCoeff + noise.lift * turbulence,
      reynoldsNumber: reynoldsNumber + noise.reynolds * 10000,
      velocity: windSpeed + noise.velocity * 2,
      pressure: this.config.pressure + pressureVariation + noise.pressure,
      temperature: this.config.temperature + temperatureVariation + noise.temperature,
      timestamp: new Date(),
    };
  }

  // Calculate aerodynamic coefficients based on model type
  private calculateAerodynamicCoefficients(time: number): { dragCoeff: number; liftCoeff: number } {
    const angleRad = (this.config.angleOfAttack * Math.PI) / 180;
    const timeVariation = Math.sin(time * 0.5) * 0.1;
    
    switch (this.config.modelType) {
      case 'car':
        // Car aerodynamics - low drag, minimal lift
        return {
          dragCoeff: 0.3 + Math.sin(time * 0.2) * 0.05 + timeVariation,
          liftCoeff: 0.1 + Math.cos(time * 0.3) * 0.02,
        };
        
      case 'aerofoil':
        // Airfoil aerodynamics - lift varies with angle of attack
        const liftSlope = 0.1; // per degree
        const dragBase = 0.02;
        return {
          dragCoeff: dragBase + Math.pow(this.config.angleOfAttack, 2) * 0.001 + timeVariation,
          liftCoeff: liftSlope * this.config.angleOfAttack + Math.sin(angleRad) * 0.2 + timeVariation,
        };
        
      case 'building':
        // Building aerodynamics - high drag, no lift
        return {
          dragCoeff: 1.2 + Math.sin(time * 0.1) * 0.1 + timeVariation,
          liftCoeff: 0.0 + Math.cos(time * 0.4) * 0.01,
        };
        
      default:
        // Custom/default - moderate values
        return {
          dragCoeff: 0.5 + Math.sin(time * 0.3) * 0.08 + timeVariation,
          liftCoeff: 0.2 + Math.cos(time * 0.2) * 0.05 + timeVariation,
        };
    }
  }

  // Calculate Reynolds number
  private calculateReynoldsNumber(velocity: number): number {
    const characteristicLength = 1.0; // meters (typical for wind tunnel models)
    const kinematicViscosity = 1.5e-5; // m²/s (air at 20°C)
    return (velocity * characteristicLength) / kinematicViscosity;
  }

  // Generate realistic sensor noise
  private generateNoise(time: number) {
    return {
      drag: (Math.random() - 0.5) * 0.02,
      lift: (Math.random() - 0.5) * 0.01,
      reynolds: (Math.random() - 0.5) * 0.1,
      velocity: (Math.random() - 0.5) * 0.5,
      pressure: (Math.random() - 0.5) * 0.1,
      temperature: (Math.random() - 0.5) * 0.2,
    };
  }

  // Get current simulation status
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
    };
  }
}

// Create default simulation service instance
export const defaultSimulationService = new SimulationService({
  windSpeed: 25,
  modelType: 'car',
  angleOfAttack: 0,
  temperature: 22.5,
  pressure: 101.3,
  humidity: 50,
  turbulence: 0.1,
}); 