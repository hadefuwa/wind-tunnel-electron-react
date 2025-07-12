import React from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon 
} from '@heroicons/react/24/solid';

interface ParameterCardProps {
  name: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const colorClasses = {
  primary: 'border-primary-500 bg-primary-500/10',
  secondary: 'border-secondary-500 bg-secondary-500/10',
  success: 'border-success-500 bg-success-500/10',
  warning: 'border-warning-500 bg-warning-500/10',
  error: 'border-error-500 bg-error-500/10',
  info: 'border-background-400 bg-background-400/10',
};

const trendIcons = {
  up: ArrowUpIcon,
  down: ArrowDownIcon,
  stable: MinusIcon,
};

const trendColors = {
  up: 'text-success-400',
  down: 'text-error-400',
  stable: 'text-background-400',
};

export default function ParameterCard({ name, value, unit, trend, color }: ParameterCardProps) {
  const TrendIcon = trendIcons[trend];

  return (
    <div className={`bg-background-800 rounded-lg p-6 border-l-4 ${colorClasses[color]} hover:bg-background-750 transition-colors`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-background-300">{name}</h3>
        <TrendIcon className={`h-4 w-4 ${trendColors[trend]}`} />
      </div>
      
      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="ml-1 text-sm text-background-400">{unit}</span>
      </div>
      
      <div className="mt-2 text-xs text-background-500">
        Last updated: Just now
      </div>
    </div>
  );
} 