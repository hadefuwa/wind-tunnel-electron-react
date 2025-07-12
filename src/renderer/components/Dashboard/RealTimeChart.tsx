import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { WindTunnelData } from '../../store/useAppStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RealTimeChartProps {
  data: WindTunnelData[];
  parameter: keyof WindTunnelData;
  title: string;
  color: string;
  unit?: string;
  maxDataPoints?: number;
}

export default function RealTimeChart({ 
  data, 
  parameter, 
  title, 
  color, 
  unit = '', 
  maxDataPoints = 50 
}: RealTimeChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [] as any[],
  });

  useEffect(() => {
    if (!data.length) return;

    const recentData = data.slice(-maxDataPoints);
    const labels = recentData.map((_, index) => {
      const time = new Date(_.timestamp);
      return time.toLocaleTimeString();
    });

    const values = recentData.map((item) => {
      const value = item[parameter];
      return typeof value === 'number' ? value : 0;
    });

    setChartData({
      labels,
      datasets: [
        {
          label: `${title} ${unit}`,
          data: values,
          borderColor: color,
          backgroundColor: color + '20',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 4,
        },
      ],
    });
  }, [data, parameter, title, color, unit, maxDataPoints]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#e2e8f0',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: title,
        color: '#e2e8f0',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: color,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
          color: '#94a3b8',
        },
        ticks: {
          color: '#94a3b8',
          maxTicksLimit: 8,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: unit,
          color: '#94a3b8',
        },
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    elements: {
      point: {
        hoverBackgroundColor: color,
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 2,
      },
    },
  };

  return (
    <div className="bg-background-800 rounded-lg p-4 h-64">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
} 