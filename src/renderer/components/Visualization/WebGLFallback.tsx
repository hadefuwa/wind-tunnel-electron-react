import React from 'react';
import { useAppStore } from '../../store/useAppStore';

interface WebGLFallbackProps {
  className?: string;
}

export const WebGLFallback: React.FC<WebGLFallbackProps> = ({ className = '' }) => {
  const { currentData } = useAppStore();

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-4 left-4 z-10 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3">
        <h3 className="text-white font-semibold mb-2">2D Wind Tunnel View</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <div>Velocity: {currentData?.windSpeed?.toFixed(1) ?? '0.0'} m/s</div>
          <div>Drag: {currentData?.dragForce?.toFixed(3) ?? '0.000'} </div>
          <div>Lift: {currentData?.liftForce?.toFixed(3) ?? '0.000'} </div>
        </div>
      </div>
      
      <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg border border-gray-700/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Wind Tunnel Schematic */}
          <div className="relative w-64 h-32 bg-gray-800/50 rounded-lg border border-gray-600/50 overflow-hidden">
            {/* Air flow lines */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-1">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-8 bg-blue-400/60 rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Car representation */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-4 bg-orange-500 rounded-sm relative">
                <div className="absolute -top-1 left-1 w-6 h-2 bg-red-500 rounded-sm"></div>
                {/* Wheels */}
                <div className="absolute -bottom-1 left-0 w-2 h-2 bg-gray-600 rounded-full"></div>
                <div className="absolute -bottom-1 right-0 w-2 h-2 bg-gray-600 rounded-full"></div>
              </div>
            </div>
            
            {/* Wind direction indicator */}
            <div className="absolute top-2 right-2 text-xs text-blue-400">
              → {currentData?.windSpeed?.toFixed(0) ?? '0'} m/s
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">WebGL Unavailable - Using 2D View</span>
          </div>
          
          {/* Data summary */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-400">Drag Force</div>
              <div className="text-white font-mono">{currentData?.dragForce?.toFixed(3) ?? '0.000'}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-400">Lift Force</div>
              <div className="text-white font-mono">{currentData?.liftForce?.toFixed(3) ?? '0.000'}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-400">Pressure</div>
              <div className="text-white font-mono">{currentData?.pressure?.toFixed(1) ?? '0.0'} kPa</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-400">Temperature</div>
              <div className="text-white font-mono">{currentData?.temperature?.toFixed(1) ?? '0.0'}°C</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 