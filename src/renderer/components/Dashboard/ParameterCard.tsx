import React from 'react';

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

// Simple icon components to replace heroicons
const ArrowUpIcon = ({ className }: { className?: string }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
const ArrowDownIcon = ({ className }: { className?: string }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const MinusIcon = ({ className }: { className?: string }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;

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
    <div className={`enhanced-card rounded-xl p-8 border-l-8 ${colorClasses[color]} hover:bg-background-750 transition-all duration-300 hover:scale-105 shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-background-300 prominent-text">{name}</h3>
        <TrendIcon className={`h-8 w-8 ${trendColors[trend]}`} />
      </div>
      
      <div className="flex items-baseline mb-6">
        <span className="prominent-value">{value}</span>
        <span className="ml-4 text-3xl text-background-400 font-semibold">{unit}</span>
      </div>
      
      <div className="text-xl text-background-500">
        Last updated: Just now
      </div>
    </div>
  );
} 