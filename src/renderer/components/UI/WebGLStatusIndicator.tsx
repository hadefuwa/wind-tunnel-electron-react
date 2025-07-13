import React, { useEffect, useState } from 'react';
import { runWebGLDiagnostics } from '../../utils/WebGLDiagnostics';
import { runGPUDiagnostics } from '../../utils/GPUDiagnostics';

interface WebGLStatusIndicatorProps {
  className?: string;
}

export const WebGLStatusIndicator: React.FC<WebGLStatusIndicatorProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [gpuInfo, setGpuInfo] = useState<string>('');
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    const checkWebGL = () => {
      try {
        // Check WebGL support
        const webglSupport = runWebGLDiagnostics();
        const gpuDiag = runGPUDiagnostics();
        
        if (webglSupport.supported) {
          setStatus('available');
          setGpuInfo(`${gpuDiag.gpuInfo.vendor} ${gpuDiag.gpuInfo.renderer}`);
        } else {
          setStatus('unavailable');
          setGpuInfo('WebGL not available');
        }
        
        setIssues([...gpuDiag.issues, ...webglSupport.errors]);
        
      } catch (error) {
        setStatus('unavailable');
        setGpuInfo('Error checking WebGL');
        setIssues([`Diagnostic error: ${(error as Error).message}`]);
      }
    };

    checkWebGL();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return 'text-green-400';
      case 'unavailable':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'available':
        return '✅';
      case 'unavailable':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'available':
        return 'WebGL Available';
      case 'unavailable':
        return 'WebGL Unavailable';
      default:
        return 'Checking WebGL...';
    }
  };

  return (
    <div className={`bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        {status === 'checking' && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
        )}
      </div>
      
      <div className="text-sm text-gray-300 mb-2">
        {gpuInfo}
      </div>
      
      {status === 'unavailable' && (
        <div className="text-xs text-yellow-400">
          Using 2D fallback mode
        </div>
      )}
      
      {issues.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
            {issues.length} issue{issues.length !== 1 ? 's' : ''} detected
          </summary>
          <ul className="text-xs text-red-300 mt-1 space-y-1">
            {issues.slice(0, 3).map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
            {issues.length > 3 && (
              <li>• ... and {issues.length - 3} more</li>
            )}
          </ul>
        </details>
      )}
    </div>
  );
}; 