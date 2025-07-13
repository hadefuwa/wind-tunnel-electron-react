import { WindTunnelData } from '../store/useAppStore';

export interface SPIConfig {
  mode: 0 | 1 | 2 | 3;
  clockSpeed: number;
  bitOrder: 'MSB' | 'LSB';
  dataBits: 8 | 16;
  chipSelect: string;
  port: string;
  samplingRate: number;
  bufferSize: number;
  timeout: number;
  retryCount: number;
}

export interface SPIConnectionStatus {
  isConnected: boolean;
  port: string;
  lastError: string | null;
  dataRate: number;
  packetCount: number;
  errorCount: number;
}

export class SPIService {
  private config: SPIConfig;
  private isConnected: boolean = false;
  private isRunning: boolean = false;
  private dataCallback: ((data: WindTunnelData) => void) | null = null;
  private statusCallback: ((status: SPIConnectionStatus) => void) | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private connectionStatus: SPIConnectionStatus = {
    isConnected: false,
    port: '',
    lastError: null,
    dataRate: 0,
    packetCount: 0,
    errorCount: 0,
  };

  constructor(config: SPIConfig) {
    this.config = config;
  }

  // Update configuration
  updateConfig(config: Partial<SPIConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('SPI config updated:', this.config);
  }

  // Test connection to SPI device
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Testing SPI connection with config:', this.config);
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate device detection
      const deviceDetected = Math.random() > 0.2; // 80% success rate
      
      if (deviceDetected) {
        this.connectionStatus.isConnected = true;
        this.connectionStatus.port = this.config.port;
        this.connectionStatus.lastError = null;
        
        return {
          success: true,
          message: 'SPI connection successful! Device detected and responding.'
        };
      } else {
        this.connectionStatus.isConnected = false;
        this.connectionStatus.lastError = 'Device not found';
        
        return {
          success: false,
          message: 'Connection failed. Check port settings and device connection.'
        };
      }
    } catch (error) {
      this.connectionStatus.isConnected = false;
      this.connectionStatus.lastError = (error as Error).message;
      
      return {
        success: false,
        message: `Connection test failed: ${(error as Error).message}`
      };
    }
  }

  // Connect to SPI device
  async connect(): Promise<boolean> {
    try {
      console.log('Connecting to SPI device...');
      
      const testResult = await this.testConnection();
      if (!testResult.success) {
        throw new Error(testResult.message);
      }
      
      this.isConnected = true;
      this.notifyStatusChange();
      
      console.log('SPI connection established');
      return true;
    } catch (error) {
      console.error('SPI connection failed:', error);
      this.isConnected = false;
      this.connectionStatus.lastError = (error as Error).message;
      this.notifyStatusChange();
      return false;
    }
  }

  // Disconnect from SPI device
  disconnect(): void {
    console.log('Disconnecting from SPI device...');
    
    this.stopDataAcquisition();
    this.isConnected = false;
    this.connectionStatus.isConnected = false;
    this.notifyStatusChange();
  }

  // Start data acquisition
  startDataAcquisition(callback: (data: WindTunnelData) => void): boolean {
    if (!this.isConnected) {
      console.error('Cannot start data acquisition: not connected');
      return false;
    }

    this.dataCallback = callback;
    this.isRunning = true;
    
    console.log('Starting SPI data acquisition...');
    
    // Simulate data acquisition at specified sampling rate
    this.intervalId = setInterval(() => {
      if (this.isRunning && this.dataCallback) {
        const data = this.generateSPIData();
        this.dataCallback(data);
        this.connectionStatus.packetCount++;
        this.connectionStatus.dataRate = this.config.samplingRate;
        this.notifyStatusChange();
      }
    }, 1000 / this.config.samplingRate);

    return true;
  }

  // Stop data acquisition
  stopDataAcquisition(): void {
    console.log('Stopping SPI data acquisition...');
    
    this.isRunning = false;
    this.dataCallback = null;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Send command to SPI device
  async sendCommand(command: number[]): Promise<number[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to SPI device');
    }

    try {
      console.log('Sending SPI command:', command);
      
      // Simulate SPI communication
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Simulate response (in real implementation, this would be actual SPI communication)
      const response = command.map(byte => byte ^ 0xFF); // Simple XOR response
      
      return response;
    } catch (error) {
      this.connectionStatus.errorCount++;
      this.connectionStatus.lastError = (error as Error).message;
      this.notifyStatusChange();
      throw error;
    }
  }

  // Get connection status
  getConnectionStatus(): SPIConnectionStatus {
    return { ...this.connectionStatus };
  }

  // Set status callback
  setStatusCallback(callback: (status: SPIConnectionStatus) => void): void {
    this.statusCallback = callback;
  }

  // Notify status change
  private notifyStatusChange(): void {
    if (this.statusCallback) {
      this.statusCallback(this.getConnectionStatus());
    }
  }

  // Generate realistic SPI data (simulation)
  private generateSPIData(): WindTunnelData {
    const baseTime = Date.now();
    const timeVariation = Math.sin(baseTime * 0.001) * 0.1;
    
    return {
      dragCoefficient: 0.3 + Math.random() * 0.1 + timeVariation,
      liftCoefficient: 0.1 + Math.random() * 0.05 + timeVariation * 0.5,
      reynoldsNumber: 1000000 + Math.random() * 500000,
      velocity: 20 + Math.random() * 10 + timeVariation * 2,
      pressure: 101.3 + Math.random() * 2 + timeVariation * 0.1,
      temperature: 22 + Math.random() * 3 + timeVariation * 0.5,
      timestamp: new Date(),
    };
  }

  // Reset error counters
  resetErrorCounters(): void {
    this.connectionStatus.errorCount = 0;
    this.connectionStatus.lastError = null;
    this.notifyStatusChange();
  }

  // Get available SPI ports
  static getAvailablePorts(): string[] {
    // In a real implementation, this would scan for available SPI ports
    return ['SPI0', 'SPI1', 'SPI2'];
  }

  // Validate configuration
  static validateConfig(config: SPIConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.clockSpeed < 1000 || config.clockSpeed > 10000000) {
      errors.push('Clock speed must be between 1kHz and 10MHz');
    }

    if (config.samplingRate < 1 || config.samplingRate > 10000) {
      errors.push('Sampling rate must be between 1Hz and 10kHz');
    }

    if (config.timeout < 100 || config.timeout > 30000) {
      errors.push('Timeout must be between 100ms and 30s');
    }

    if (config.retryCount < 0 || config.retryCount > 10) {
      errors.push('Retry count must be between 0 and 10');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Default SPI service instance
export const defaultSPIService = new SPIService({
  mode: 0,
  clockSpeed: 1000000,
  bitOrder: 'MSB',
  dataBits: 8,
  chipSelect: 'CS0',
  port: 'SPI0',
  samplingRate: 1000,
  bufferSize: 1024,
  timeout: 5000,
  retryCount: 3,
}); 