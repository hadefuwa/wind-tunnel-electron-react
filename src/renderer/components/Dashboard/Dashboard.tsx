import React, { useState } from 'react';
import ParameterCard from './ParameterCard';
import RealTimeChart from './RealTimeChart';
import AdvancedCharts from './AdvancedCharts';
import DataManagement from './DataManagement';
import { WindTunnel3D } from '../Visualization/WindTunnel3D';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAppStore } from '../../store/useAppStore';
import { DashboardSkeleton } from './LoadingSkeleton';
import { InfoTooltip } from '../UI/Tooltip';
import { WebGLStatusIndicator } from '../UI/WebGLStatusIndicator';
import { WindTunnelData } from '../../../shared/types/WindTunnelData';

// Simple icon components to replace heroicons
const PlayIcon = ({ className }: { className?: string }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const StopIcon = ({ className }: { className?: string }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>;
const ChartBarIcon = ({ className }: { className?: string }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>;
const DocumentTextIcon = ({ className }: { className?: string }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'main' | 'analytics' | 'data'>('main');
  const [isLoading, setIsLoading] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  const { 
    currentData, 
    dataHistory, 
    isSimulationRunning, 
    startSimulation, 
    stopSimulation 
  } = useAppStore();

  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F1 to show/hide shortcuts
      if (event.key === 'F1') {
        event.preventDefault();
        setShowShortcuts(!showShortcuts);
      }
      // Escape to hide shortcuts
      if (event.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts]);

  // Show loading skeleton if no data is available
  if (!currentData && dataHistory.length === 0) {
    return <DashboardSkeleton />;
  }

  const parameters = currentData ? [
    { name: 'Drag Force', value: currentData.dragForce.toFixed(2), unit: 'N', trend: 'up' as const, color: 'primary' as const },
    { name: 'Lift Force', value: currentData.liftForce.toFixed(2), unit: 'N', trend: 'down' as const, color: 'secondary' as const },
    { name: 'Reynolds Number', value: (currentData.reynoldsNumber / 1000000).toFixed(1) + 'M', unit: 'Re', trend: 'stable' as const, color: 'success' as const },
    { name: 'Wind Speed', value: currentData.windSpeed.toFixed(1), unit: 'm/s', trend: 'up' as const, color: 'warning' as const },
    { name: 'Pressure', value: currentData.pressure.toFixed(1), unit: 'kPa', trend: 'stable' as const, color: 'info' as const },
    { name: 'Temperature', value: currentData.temperature.toFixed(1), unit: '°C', trend: 'stable' as const, color: 'info' as const },
  ] : [];

  return (
    <>
      <div ref={scrollRef} className="space-y-8 content-scrollable" style={{overflowY: 'auto', maxHeight: '100vh', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y'}}>
        {/* Header - Made larger and more prominent */}
        <div className="text-center py-8 dashboard-header">
          <div className="flex flex-col items-center space-y-4">
            <img 
              src="/logo.png" 
              alt="Wind Tunnel Logo" 
              className="h-24 w-auto object-contain dashboard-logo"
            />
            <div>
              <h1 className="text-5xl font-bold text-white mb-4 prominent-text">Wind Tunnel Dashboard</h1>
              <p className="text-2xl text-background-400">Real-time aerodynamic data and visualization</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Made larger */}
        <div className="flex space-x-2 bg-background-800 rounded-xl p-2 enhanced-card">
          <button
            onClick={() => setActiveTab('main')}
            className={`flex items-center px-6 py-3 rounded-lg text-lg font-medium transition-colors ${
              activeTab === 'main'
                ? 'bg-primary-600 text-white'
                : 'text-background-400 hover:text-white hover:bg-background-700'
            }`}
          >
            <ChartBarIcon className="h-6 w-6" />
            <span className="ml-3">Main View</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center px-6 py-3 rounded-lg text-lg font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-primary-600 text-white'
                : 'text-background-400 hover:text-white hover:bg-background-700'
            }`}
          >
            <ChartBarIcon className="h-6 w-6" />
            <span className="ml-3">Advanced Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center px-6 py-3 rounded-lg text-lg font-medium transition-colors ${
              activeTab === 'data'
                ? 'bg-primary-600 text-white'
                : 'text-background-400 hover:text-white hover:bg-background-700'
            }`}
          >
            <DocumentTextIcon className="h-6 w-6" />
            <span className="ml-3">Data Management</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'main' && (
          <>
            {/* Parameter Cards Grid - Made larger and more prominent */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {parameters.map((param, index) => (
                <div
                  key={param.name}
                  className="parameter-card"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <ParameterCard {...param} />
                </div>
              ))}
            </div>

            {/* System Status and Controls - Made larger */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* WebGL Status */}
              <WebGLStatusIndicator />
              
              {/* Simulation Controls - Made larger */}
              <div className="lg:col-span-2 bg-background-800 rounded-xl p-8 enhanced-card control-panel">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-2xl font-semibold prominent-text">Simulation Controls</h3>
                    <InfoTooltip content="Control the wind tunnel simulation. Start to begin data collection, stop to pause." />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={startSimulation}
                      disabled={isSimulationRunning}
                      className="flex items-center px-6 py-3 bg-success-600 hover:bg-success-700 disabled:bg-success-800 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors text-lg"
                    >
                      <PlayIcon className="h-6 w-6" />
                      <span className="ml-2">Start</span>
                    </button>
                    <button
                      onClick={stopSimulation}
                      disabled={!isSimulationRunning}
                      className="flex items-center px-6 py-3 bg-error-600 hover:bg-error-700 disabled:bg-error-800 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors text-lg"
                    >
                      <StopIcon className="h-6 w-6" />
                      <span className="ml-2">Stop</span>
                    </button>
                  </div>
                </div>
                <div className="text-lg text-background-400">
                  Status: {isSimulationRunning ? 'Running' : 'Stopped'} | 
                  Data Points: {dataHistory.length} | 
                  Last Update: {currentData ? new Date(currentData.timestamp).toLocaleTimeString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Charts and Visualization - Made larger */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Real-time Charts - Made larger */}
              <div className="space-y-6">
                <div className="chart-container">
                  <RealTimeChart
                    data={dataHistory}
                    parameter="dragForce"
                    title="Drag Force"
                    color="#3b82f6"
                    unit="N"
                  />
                </div>
                <div className="chart-container">
                  <RealTimeChart
                    data={dataHistory}
                    parameter="windSpeed"
                    title="Wind Speed"
                    color="#f97316"
                    unit="m/s"
                  />
                </div>
              </div>

              {/* 3D Visualization - Made larger */}
              <div className="bg-background-800 rounded-xl p-8 enhanced-card chart-container">
                <h3 className="text-2xl font-semibold mb-6 prominent-text">3D Visualization</h3>
                <div className="h-80">
                  <ErrorBoundary>
                    <WindTunnel3D className="h-full" />
                  </ErrorBoundary>
                </div>
              </div>
            </div>

            {/* Data Grid - Made larger */}
            <div className="bg-background-800 rounded-xl p-8 enhanced-card data-table">
              <h3 className="text-2xl font-semibold mb-6 prominent-text">Data Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-lg">
                  <thead>
                    <tr className="border-b border-background-700">
                      <th className="text-left py-4 text-background-400 font-semibold">Timestamp</th>
                      <th className="text-left py-4 text-background-400 font-semibold">Drag Force (N)</th>
                      <th className="text-left py-4 text-background-400 font-semibold">Lift Force (N)</th>
                      <th className="text-left py-4 text-background-400 font-semibold">Wind Speed (m/s)</th>
                      <th className="text-left py-4 text-background-400 font-semibold">Pressure (kPa)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataHistory.slice(-5).reverse().map((data: WindTunnelData, index: number) => (
                      <tr key={index} className="border-b border-background-700">
                        <td className="py-4">{new Date(data.timestamp).toLocaleTimeString()}</td>
                        <td className="py-4">{data.dragForce.toFixed(2)}</td>
                        <td className="py-4">{data.liftForce.toFixed(2)}</td>
                        <td className="py-4">{data.windSpeed.toFixed(1)}</td>
                        <td className="py-4">{data.pressure.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <AdvancedCharts data={dataHistory} />
        )}

        {activeTab === 'data' && (
          <DataManagement />
        )}
      </div>

      {/* Keyboard Shortcuts Overlay */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-background-800 rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-6">Keyboard Shortcuts</h3>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between">
                <span className="text-background-300">F1</span>
                <span className="text-white">Show/Hide this help</span>
              </div>
              <div className="flex justify-between">
                <span className="text-background-300">F11</span>
                <span className="text-white">Toggle fullscreen</span>
              </div>
              <div className="flex justify-between">
                <span className="text-background-300">Escape</span>
                <span className="text-white">Close dialogs</span>
              </div>
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-6 w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
} 