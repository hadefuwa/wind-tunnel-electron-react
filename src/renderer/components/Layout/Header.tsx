import React from 'react';
import { 
  SignalIcon, 
  SignalSlashIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

import { useAppStore } from '../../store/useAppStore';

const APP_VERSION = '1.0.0'; // You can update this manually or read from package.json

export default function Header() {
  const { mode, isConnected } = useAppStore();
  return (
    <header className="bg-background-800 border-b border-background-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white">Wind Tunnel Control</h1>
          <span className="text-xs text-background-400 bg-background-700 px-2 py-1 rounded">
            v{APP_VERSION}
          </span>
        </div>
        <div className="flex items-center">
          <span className={`ml-4 px-3 py-1 rounded text-sm font-semibold ${
            mode === 'simulation' 
              ? 'bg-secondary-500 text-black' 
              : 'bg-success-500 text-white'
          }`}>
            {mode === 'simulation' ? 'Simulation Mode' : 'SPI Mode'}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <SignalIcon className="h-5 w-5 text-success-400" />
            ) : (
              <SignalSlashIcon className="h-5 w-5 text-error-400" />
            )}
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <button className="p-2 hover:bg-primary-700 rounded-lg transition-colors">
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
} 