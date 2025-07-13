import { create } from 'zustand';
import { defaultSimulationService, SimulationConfig } from '../services/SimulationService';
import { defaultWebSocketClient } from '../services/WebSocketClient';

export interface WindTunnelData {
  dragCoefficient: number;
  liftCoefficient: number;
  reynoldsNumber: number;
  velocity: number;
  pressure: number;
  temperature: number;
  timestamp: Date;
}

interface AppState {
  // Mode and Connection
  mode: 'simulation' | 'spi';
  isConnected: boolean;
  websocketConnected: boolean;
  
  // Data
  currentData: WindTunnelData | null;
  dataHistory: WindTunnelData[];
  
  // Settings
  updateRate: number; // milliseconds
  theme: 'dark' | 'light' | 'auto';
  
  // Simulation
  isSimulationRunning: boolean;
  simulationConfig: SimulationConfig;
  
  // Actions
  setMode: (mode: 'simulation' | 'spi') => void;
  setConnectionStatus: (connected: boolean) => void;
  setWebSocketStatus: (connected: boolean) => void;
  updateData: (data: WindTunnelData) => void;
  setUpdateRate: (rate: number) => void;
  setTheme: (theme: 'dark' | 'light' | 'auto') => void;
  clearDataHistory: () => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  updateSimulationConfig: (config: Partial<SimulationConfig>) => void;
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
}

const initialData: WindTunnelData = {
  dragCoefficient: 0.32,
  liftCoefficient: 0.15,
  reynoldsNumber: 1200000,
  velocity: 25.0,
  pressure: 101.3,
  temperature: 22.5,
  timestamp: new Date(),
};

const initialSimulationConfig: SimulationConfig = {
  windSpeed: 25,
  modelType: 'car',
  angleOfAttack: 0,
  temperature: 22.5,
  pressure: 101.3,
  humidity: 50,
  turbulence: 0.1,
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  mode: 'simulation',
  isConnected: false,
  websocketConnected: false,
  currentData: initialData,
  dataHistory: [initialData],
  updateRate: 100,
  theme: 'dark',
  isSimulationRunning: false,
  simulationConfig: initialSimulationConfig,
  
  // Actions
  setMode: (mode) => set({ mode }),
  
  setConnectionStatus: (connected) => set({ isConnected: connected }),
  
  updateData: (data) => {
    const { dataHistory } = get();
    const newHistory = [...dataHistory, data].slice(-100); // Keep last 100 readings
    
    set({
      currentData: data,
      dataHistory: newHistory,
    });
  },
  
  setUpdateRate: (rate) => set({ updateRate: rate }),
  
  setTheme: (theme) => set({ theme }),
  
  clearDataHistory: () => set({ dataHistory: [] }),
  
  startSimulation: () => {
    const { updateRate, simulationConfig } = get();
    defaultSimulationService.updateConfig(simulationConfig);
    defaultSimulationService.start((data) => {
      get().updateData(data);
    }, updateRate);
    set({ isSimulationRunning: true });
  },
  
  stopSimulation: () => {
    defaultSimulationService.stop();
    set({ isSimulationRunning: false });
  },
  
  updateSimulationConfig: (config) => {
    const { simulationConfig } = get();
    const newConfig = { ...simulationConfig, ...config };
    set({ simulationConfig: newConfig });
    defaultSimulationService.updateConfig(newConfig);
  },

  setWebSocketStatus: (connected) => set({ websocketConnected: connected }),

  connectWebSocket: async () => {
    try {
      await defaultWebSocketClient.connect();
      
      // Set up message handlers
      defaultWebSocketClient.on('data', (data: WindTunnelData) => {
        get().updateData(data);
      });

      defaultWebSocketClient.on('status', (status) => {
        console.log('WebSocket status:', status);
      });

      defaultWebSocketClient.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      set({ websocketConnected: true });
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      set({ websocketConnected: false });
    }
  },

  disconnectWebSocket: () => {
    defaultWebSocketClient.disconnect();
    set({ websocketConnected: false });
  },
})); 