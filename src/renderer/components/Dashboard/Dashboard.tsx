import React from 'react';
import ParameterCard from './ParameterCard';
import { useAppStore } from '../../store/useAppStore';

export default function Dashboard() {
  const { currentData } = useAppStore();

  const parameters = currentData ? [
    { name: 'Drag Coefficient', value: currentData.dragCoefficient.toFixed(2), unit: 'Cd', trend: 'up' as const, color: 'primary' as const },
    { name: 'Lift Coefficient', value: currentData.liftCoefficient.toFixed(2), unit: 'Cl', trend: 'down' as const, color: 'secondary' as const },
    { name: 'Reynolds Number', value: (currentData.reynoldsNumber / 1000000).toFixed(1) + 'M', unit: 'Re', trend: 'stable' as const, color: 'success' as const },
    { name: 'Velocity', value: currentData.velocity.toFixed(1), unit: 'm/s', trend: 'up' as const, color: 'warning' as const },
    { name: 'Pressure', value: currentData.pressure.toFixed(1), unit: 'kPa', trend: 'stable' as const, color: 'info' as const },
    { name: 'Temperature', value: currentData.temperature.toFixed(1), unit: '°C', trend: 'stable' as const, color: 'info' as const },
  ] : [];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-background-400">Real-time wind tunnel data and visualization</p>
      </div>

      {/* Parameter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parameters.map((param) => (
          <ParameterCard key={param.name} {...param} />
        ))}
      </div>

      {/* Charts and Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Charts */}
        <div className="bg-background-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Real-time Charts</h3>
          <div className="h-64 bg-background-700 rounded flex items-center justify-center">
            <p className="text-background-400">Chart.js integration coming soon...</p>
          </div>
        </div>

        {/* 3D Visualization */}
        <div className="bg-background-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">3D Visualization</h3>
          <div className="h-64 bg-background-700 rounded flex items-center justify-center">
            <p className="text-background-400">Three.js integration coming soon...</p>
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
                <th className="text-left py-2 text-background-400">Drag (Cd)</th>
                <th className="text-left py-2 text-background-400">Lift (Cl)</th>
                <th className="text-left py-2 text-background-400">Velocity (m/s)</th>
                <th className="text-left py-2 text-background-400">Pressure (kPa)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-background-700">
                <td className="py-2">2024-01-13 00:38:45</td>
                <td className="py-2">0.32</td>
                <td className="py-2">0.15</td>
                <td className="py-2">25.0</td>
                <td className="py-2">101.3</td>
              </tr>
              <tr className="border-b border-background-700">
                <td className="py-2">2024-01-13 00:38:40</td>
                <td className="py-2">0.31</td>
                <td className="py-2">0.16</td>
                <td className="py-2">24.8</td>
                <td className="py-2">101.2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 