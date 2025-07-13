import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => (
  <div className={`animate-pulse bg-background-700 rounded ${className}`} style={style} />
);

export const ParameterCardSkeleton: React.FC = () => (
  <div className="bg-background-800 rounded-lg p-6 border border-background-700">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-background-800 rounded-lg p-6 border border-background-700">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="h-48 flex items-end space-x-1">
      {Array.from({ length: 20 }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="flex-1 bg-primary-600/20" 
          style={{ height: `${Math.random() * 60 + 20}%` }}
        />
      ))}
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header Skeleton */}
    <div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-64" />
    </div>

    {/* Tab Navigation Skeleton */}
    <div className="flex space-x-1 bg-background-800 rounded-lg p-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-24 rounded-md" />
      ))}
    </div>

    {/* Parameter Cards Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <ParameterCardSkeleton key={i} />
      ))}
    </div>

    {/* Simulation Controls Skeleton */}
    <div className="bg-background-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-40" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-4 w-64" />
    </div>

    {/* Charts and Visualization Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="bg-background-800 rounded-lg p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  </div>
); 