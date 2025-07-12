import React from 'react';
import { 
  SignalIcon, 
  SignalSlashIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

import { useAppStore } from '../../store/useAppStore';

export default function Header() {
  const { mode, isConnected } = useAppStore();
  return (
    <header className="bg-primary-800 px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold tracking-wide">Wind Tunnel Application</h1>
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
    </header>
  );
} 