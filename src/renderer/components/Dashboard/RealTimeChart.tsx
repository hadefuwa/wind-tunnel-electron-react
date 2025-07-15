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
import { WindTunnelData } from '../../../shared/types/WindTunnelData';

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
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 8,
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
            size: 16,
            weight: 'bold',
          },
        },
      },
      title: {
        display: true,
        text: title,
        color: '#e2e8f0',
        font: {
          size: 20,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: color,
        borderWidth: 2,
        titleFont: {
          size: 16,
          weight: 'bold',
        },
        bodyFont: {
          size: 14,
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
          color: '#94a3b8',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        ticks: {
          color: '#94a3b8',
          maxTicksLimit: 8,
          font: {
            size: 14,
          },
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
          lineWidth: 1,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: unit,
          color: '#94a3b8',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 14,
          },
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
          lineWidth: 1,
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
        hoverBorderWidth: 3,
      },
    },
  };

  return (
    <div className="bg-background-800 rounded-xl p-6 h-80">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
} 