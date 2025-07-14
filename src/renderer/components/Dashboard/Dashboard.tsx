import React, { useState } from 'react';
import ParameterCard from './ParameterCard';
import RealTimeChart from './RealTimeChart';
import AdvancedCharts from './AdvancedCharts';
import DataManagement from './DataManagement';
import { WindTunnel3D } from '../Visualization/WindTunnel3D';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAppStore } from '../../store/useAppStore';
import { PlayIcon, StopIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import { DashboardSkeleton } from './LoadingSkeleton';
import { InfoTooltip } from '../UI/Tooltip';
import { WebGLStatusIndicator } from '../UI/WebGLStatusIndicator';
import { TouchScrollTest } from '../UI/TouchScrollTest';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'main' | 'analytics' | 'data'>('main');
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    currentData, 
    dataHistory, 
    isSimulationRunning, 
    startSimulation, 
    stopSimulation 
  } = useAppStore();

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
    <div className="space-y-6 content-scrollable">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-background-400">Real-time wind tunnel data and visualization</p>
      </div>

      {/* Touch Scroll Test */}
      <TouchScrollTest />

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-background-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('main')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'main'
              ? 'bg-primary-600 text-white'
              : 'text-background-400 hover:text-white hover:bg-background-700'
          }`}
        >
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Main View
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-primary-600 text-white'
              : 'text-background-400 hover:text-white hover:bg-background-700'
          }`}
        >
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Advanced Analytics
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'data'
              ? 'bg-primary-600 text-white'
              : 'text-background-400 hover:text-white hover:bg-background-700'
          }`}
        >
          <DocumentTextIcon className="h-4 w-4 mr-2" />
          Data Management
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'main' && (
        <>
          {/* Parameter Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parameters.map((param, index) => (
              <div
                key={param.name}
                className="transform transition-all duration-300 ease-out hover:scale-105"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <ParameterCard {...param} />
              </div>
            ))}
          </div>

          {/* System Status and Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* WebGL Status */}
            <WebGLStatusIndicator />
            
            {/* Simulation Controls */}
            <div className="lg:col-span-2 bg-background-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">Simulation Controls</h3>
                  <InfoTooltip content="Control the wind tunnel simulation. Start to begin data collection, stop to pause." />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={startSimulation}
                    disabled={isSimulationRunning}
                    className="flex items-center px-4 py-2 bg-success-600 hover:bg-success-700 disabled:bg-success-800 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Start
                  </button>
                  <button
                    onClick={stopSimulation}
                    disabled={!isSimulationRunning}
                    className="flex items-center px-4 py-2 bg-error-600 hover:bg-error-700 disabled:bg-error-800 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                  >
                    <StopIcon className="h-4 w-4 mr-2" />
                    Stop
                  </button>
                </div>
              </div>
              <div className="text-sm text-background-400">
                Status: {isSimulationRunning ? 'Running' : 'Stopped'} | 
                Data Points: {dataHistory.length} | 
                Last Update: {currentData ? new Date(currentData.timestamp).toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Charts and Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time Charts */}
            <div className="space-y-4">
              <RealTimeChart
                data={dataHistory}
                parameter="dragForce"
                title="Drag Force"
                color="#3b82f6"
                unit="N"
              />
              <RealTimeChart
                data={dataHistory}
                parameter="windSpeed"
                title="Wind Speed"
                color="#f97316"
                unit="m/s"
              />
            </div>

            {/* 3D Visualization */}
            <div className="bg-background-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">3D Visualization</h3>
              <div className="h-64">
                <ErrorBoundary>
                  <WindTunnel3D className="h-full" />
                </ErrorBoundary>
              </div>
            </div>
          </div>

          {/* Data Grid */}
          <div className="bg-background-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Data Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-background-700">
                    <th className="text-left py-2 text-background-400">Timestamp</th>
                    <th className="text-left py-2 text-background-400">Drag Force (N)</th>
                    <th className="text-left py-2 text-background-400">Lift Force (N)</th>
                    <th className="text-left py-2 text-background-400">Wind Speed (m/s)</th>
                    <th className="text-left py-2 text-background-400">Pressure (kPa)</th>
                  </tr>
                </thead>
                <tbody>
                  {dataHistory.slice(-5).reverse().map((data, index) => (
                    <tr key={index} className="border-b border-background-700">
                      <td className="py-2">{new Date(data.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2">{data.dragForce.toFixed(2)}</td>
                      <td className="py-2">{data.liftForce.toFixed(2)}</td>
                      <td className="py-2">{data.windSpeed.toFixed(1)}</td>
                      <td className="py-2">{data.pressure.toFixed(1)}</td>
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
  );
} 