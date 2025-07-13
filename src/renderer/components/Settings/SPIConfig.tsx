import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  CogIcon, 
  WifiIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface SPIConfigData {
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

const defaultSPIConfig: SPIConfigData = {
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
};

export const SPIConfig: React.FC = () => {
  const { mode, setMode } = useAppStore();
  const [config, setConfig] = useState<SPIConfigData>(defaultSPIConfig);
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testMessage, setTestMessage] = useState('');

  const handleConfigChange = (key: keyof SPIConfigData, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleModeChange = (newMode: 'simulation' | 'spi') => {
    setMode(newMode);
    if (newMode === 'simulation') {
      setIsConnected(false);
      setTestResult(null);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setTestMessage('');

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure for demo
      const success = Math.random() > 0.3;
      
      if (success) {
        setTestResult('success');
        setTestMessage('SPI connection successful! Device detected and responding.');
        setIsConnected(true);
      } else {
        setTestResult('error');
        setTestMessage('Connection failed. Check port settings and device connection.');
        setIsConnected(false);
      }
    } catch (error) {
      setTestResult('error');
      setTestMessage('Connection test failed: ' + (error as Error).message);
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfig = () => {
    // In a real app, this would save to persistent storage
    console.log('Saving SPI config:', config);
    // You could dispatch an action to save to the store or localStorage
  };

  const loadPreset = (preset: 'default' | 'high-speed' | 'low-noise') => {
    const presets = {
      default: defaultSPIConfig,
      'high-speed': {
        ...defaultSPIConfig,
        clockSpeed: 2000000,
        samplingRate: 2000,
        bufferSize: 2048,
      },
      'low-noise': {
        ...defaultSPIConfig,
        clockSpeed: 500000,
        samplingRate: 500,
        bufferSize: 512,
        retryCount: 5,
      },
    };
    setConfig(presets[preset]);
  };

  return (
    <div className="space-y-6">
      {/* Mode Status */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SPI Configuration</h3>
          <p className="text-background-400">Configure SPI communication with your microcontroller</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            mode === 'simulation' 
              ? 'bg-primary-600 text-white' 
              : 'bg-background-700 text-background-300'
          }`}>
            Simulation Mode
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            mode === 'spi' 
              ? 'bg-success-600 text-white' 
              : 'bg-background-700 text-background-300'
          }`}>
            SPI Mode
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="bg-background-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Operation Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleModeChange('simulation')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              mode === 'simulation'
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-background-600 hover:border-background-500'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CogIcon className="h-6 w-6 text-primary-500" />
              <div className="text-left">
                <div className="font-medium">Simulation Mode</div>
                <div className="text-sm text-background-400">Generate realistic test data</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handleModeChange('spi')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              mode === 'spi'
                ? 'border-success-500 bg-success-500/10'
                : 'border-background-600 hover:border-background-500'
            }`}
          >
            <div className="flex items-center space-x-3">
              <WifiIcon className="h-6 w-6 text-success-500" />
              <div className="text-left">
                <div className="font-medium">SPI Mode</div>
                <div className="text-sm text-background-400">Connect to real hardware</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* SPI Configuration */}
      {mode === 'spi' && (
        <div className="space-y-6">
          {/* Connection Settings */}
          <div className="bg-background-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Connection Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">SPI Mode</label>
                <select
                  value={config.mode}
                  onChange={(e) => handleConfigChange('mode', parseInt(e.target.value))}
                  className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value={0}>Mode 0 (CPOL=0, CPHA=0)</option>
                  <option value={1}>Mode 1 (CPOL=0, CPHA=1)</option>
                  <option value={2}>Mode 2 (CPOL=1, CPHA=0)</option>
                  <option value={3}>Mode 3 (CPOL=1, CPHA=1)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Clock Speed (Hz)</label>
                <select
                  value={config.clockSpeed}
                  onChange={(e) => handleConfigChange('clockSpeed', parseInt(e.target.value))}
                  className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value={1000}>1 kHz</option>
                  <option value={10000}>10 kHz</option>
                  <option value={100000}>100 kHz</option>
                  <option value={500000}>500 kHz</option>
                  <option value={1000000}>1 MHz</option>
                  <option value={2000000}>2 MHz</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bit Order</label>
                <select
                  value={config.bitOrder}
                  onChange={(e) => handleConfigChange('bitOrder', e.target.value)}
                  className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="MSB">MSB First</option>
                  <option value="LSB">LSB First</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data Bits</label>
                <select
                  value={config.dataBits}
                  onChange={(e) => handleConfigChange('dataBits', parseInt(e.target.value))}
                  className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value={8}>8-bit</option>
                  <option value={16}>16-bit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Chip Select</label>
                <select
                  value={config.chipSelect}
                  onChange={(e) => handleConfigChange('chipSelect', e.target.value)}
                  className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="CS0">CS0</option>
                  <option value="CS1">CS1</option>
                  <option value="CS2">CS2</option>
                  <option value="CS3">CS3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SPI Port</label>
                <select
                  value={config.port}
                  onChange={(e) => handleConfigChange('port', e.target.value)}
                  className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="SPI0">SPI0</option>
                  <option value="SPI1">SPI1</option>
                  <option value="SPI2">SPI2</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Protocol Settings */}
          <div className="bg-background-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Data Protocol</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sampling Rate (Hz)</label>
                <input
                  type="number"
                  value={config.samplingRate}
                  onChange={(e) => handleConfigChange('samplingRate', parseInt(e.target.value))}
                  className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white"
                  min="1"
                  max="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Buffer Size</label>
                <select
                  value={config.bufferSize}
                  onChange={(e) => handleConfigChange('bufferSize', parseInt(e.target.value))}
                  className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value={256}>256 bytes</option>
                  <option value={512}>512 bytes</option>
                  <option value={1024}>1 KB</option>
                  <option value={2048}>2 KB</option>
                  <option value={4096}>4 KB</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Timeout (ms)</label>
                <input
                  type="number"
                  value={config.timeout}
                  onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                  className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white"
                  min="100"
                  max="30000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Retry Count</label>
                <input
                  type="number"
                  value={config.retryCount}
                  onChange={(e) => handleConfigChange('retryCount', parseInt(e.target.value))}
                  className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white"
                  min="0"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Preset Configurations */}
          <div className="bg-background-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Preset Configurations</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => loadPreset('default')}
                className="px-4 py-2 bg-background-700 hover:bg-background-600 rounded-lg text-white transition-colors"
              >
                Default
              </button>
              <button
                onClick={() => loadPreset('high-speed')}
                className="px-4 py-2 bg-background-700 hover:bg-background-600 rounded-lg text-white transition-colors"
              >
                High Speed
              </button>
              <button
                onClick={() => loadPreset('low-noise')}
                className="px-4 py-2 bg-background-700 hover:bg-background-600 rounded-lg text-white transition-colors"
              >
                Low Noise
              </button>
            </div>
          </div>

          {/* Connection Testing */}
          <div className="bg-background-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Connection Testing</h3>
            
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={testConnection}
                disabled={isTesting}
                className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                {isTesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Testing...
                  </>
                ) : (
                  <>
                    <WifiIcon className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </button>

              {testResult && (
                <div className="flex items-center space-x-2">
                  {testResult === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 text-success-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-error-500" />
                  )}
                  <span className={`text-sm ${
                    testResult === 'success' ? 'text-success-400' : 'text-error-400'
                  }`}>
                    {testResult === 'success' ? 'Connected' : 'Connection Failed'}
                  </span>
                </div>
              )}
            </div>

            {testMessage && (
              <div className={`p-3 rounded-lg ${
                testResult === 'success' 
                  ? 'bg-success-500/10 border border-success-500/20' 
                  : 'bg-error-500/10 border border-error-500/20'
              }`}>
                <p className={`text-sm ${
                  testResult === 'success' ? 'text-success-400' : 'text-error-400'
                }`}>
                  {testMessage}
                </p>
              </div>
            )}
          </div>

          {/* Save Configuration */}
          <div className="bg-background-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Save Configuration</h3>
                <p className="text-sm text-background-400">Save current settings for future use</p>
              </div>
              <button
                onClick={saveConfig}
                className="px-6 py-2 bg-success-600 hover:bg-success-700 rounded-lg text-white font-medium transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Mode Info */}
      {mode === 'simulation' && (
        <div className="bg-background-800 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <CogIcon className="h-6 w-6 text-primary-500 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Simulation Mode Active</h3>
              <p className="text-background-400 mb-4">
                The application is currently running in simulation mode. Realistic wind tunnel data is being generated for development and testing purposes.
              </p>
              <div className="bg-background-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Simulation Features:</h4>
                <ul className="text-sm text-background-400 space-y-1">
                  <li>• Realistic aerodynamic calculations</li>
                  <li>• Configurable wind speeds and model properties</li>
                  <li>• Environmental factors (temperature, pressure, humidity)</li>
                  <li>• Real-time data streaming</li>
                  <li>• 3D visualization with physics simulation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 