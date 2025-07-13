import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend,
  ScatterController,
  BubbleController,
} from 'chart.js';
import { Line, Scatter, Radar, Bubble } from 'react-chartjs-2';
import { WindTunnelData } from '../../store/useAppStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend,
  ScatterController,
  BubbleController
);

interface AdvancedChartsProps {
  data: WindTunnelData[];
  className?: string;
}

export default function AdvancedCharts({ data, className = '' }: AdvancedChartsProps) {
  if (data.length === 0) {
    return (
      <div className={`bg-background-800 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Advanced Analytics</h3>
        <div className="text-center text-background-400 py-8">
          No data available for analysis
        </div>
      </div>
    );
  }

  // Prepare data for different chart types
  const timeLabels = data.map((_, index) => `T${index + 1}`);
  const dragData = data.map(d => d.dragCoefficient);
  const liftData = data.map(d => d.liftCoefficient);
  const velocityData = data.map(d => d.velocity);
  const pressureData = data.map(d => d.pressure);

  // Scatter plot data (Drag vs Velocity)
  const scatterData = {
    datasets: [
      {
        label: 'Drag vs Velocity',
        data: data.map(d => ({ x: d.velocity, y: d.dragCoefficient })),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Radar chart data (current values)
  const currentData = data[data.length - 1];
  const radarData = {
    labels: ['Drag Coeff', 'Lift Coeff', 'Velocity', 'Pressure', 'Temperature'],
    datasets: [
      {
        label: 'Current Values',
        data: [
          currentData.dragCoefficient * 100, // Scale for better visualization
          currentData.liftCoefficient * 100,
          currentData.velocity,
          currentData.pressure / 10, // Scale down pressure
          currentData.temperature,
        ],
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(249, 115, 22, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(249, 115, 22, 1)',
      },
    ],
  };

  // Bubble chart data (3D visualization of multiple parameters)
  const bubbleData = {
    datasets: [
      {
        label: 'Multi-Parameter Analysis',
        data: data.map(d => ({
          x: d.velocity,
          y: d.dragCoefficient,
          r: d.liftCoefficient * 20, // Use lift coefficient for bubble size
        })),
        backgroundColor: data.map((_, index) => 
          `hsla(${200 + (index * 10) % 160}, 70%, 60%, 0.6)`
        ),
        borderColor: data.map((_, index) => 
          `hsla(${200 + (index * 10) % 160}, 70%, 60%, 1)`
        ),
        borderWidth: 1,
      },
    ],
  };

  // Comparison line chart
  const comparisonData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Drag Coefficient',
        data: dragData,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Lift Coefficient',
        data: liftData,
        borderColor: 'rgba(249, 115, 22, 1)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#e2e8f0' },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
      },
    },
    scales: {
      r: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
        pointLabels: { color: '#94a3b8' },
      },
    },
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold mb-4">Advanced Analytics</h3>
        <p className="text-background-400 text-sm mb-6">
          Multi-dimensional analysis of wind tunnel data
        </p>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot */}
        <div className="bg-background-800 rounded-lg p-4">
          <h4 className="text-md font-medium mb-3">Drag vs Velocity Correlation</h4>
          <div className="h-48">
            <Scatter data={scatterData} options={chartOptions} />
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-background-800 rounded-lg p-4">
          <h4 className="text-md font-medium mb-3">Current Parameter Overview</h4>
          <div className="h-48">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* Bubble Chart */}
        <div className="bg-background-800 rounded-lg p-4">
          <h4 className="text-md font-medium mb-3">Multi-Parameter Analysis</h4>
          <div className="h-48">
            <Bubble data={bubbleData} options={chartOptions} />
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="bg-background-800 rounded-lg p-4">
          <h4 className="text-md font-medium mb-3">Drag vs Lift Comparison</h4>
          <div className="h-48">
            <Line data={comparisonData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="bg-background-800 rounded-lg p-4">
        <h4 className="text-md font-medium mb-3">Statistical Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-background-400">Avg Drag Coeff</div>
            <div className="text-lg font-semibold">
              {(dragData.reduce((a, b) => a + b, 0) / dragData.length).toFixed(3)}
            </div>
          </div>
          <div>
            <div className="text-background-400">Avg Lift Coeff</div>
            <div className="text-lg font-semibold">
              {(liftData.reduce((a, b) => a + b, 0) / liftData.length).toFixed(3)}
            </div>
          </div>
          <div>
            <div className="text-background-400">Avg Velocity</div>
            <div className="text-lg font-semibold">
              {(velocityData.reduce((a, b) => a + b, 0) / velocityData.length).toFixed(1)} m/s
            </div>
          </div>
          <div>
            <div className="text-background-400">Data Points</div>
            <div className="text-lg font-semibold">{data.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 