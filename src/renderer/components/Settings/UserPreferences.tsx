import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  CogIcon, 
  PaintBrushIcon, 
  ClockIcon, 
  ChartBarIcon,
  ComputerDesktopIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

export default function UserPreferences() {
  const { 
    theme, 
    updateRate, 
    setTheme, 
    setUpdateRate 
  } = useAppStore();

  const [localUpdateRate, setLocalUpdateRate] = useState(updateRate);
  const [localTheme, setLocalTheme] = useState(theme);

  const handleSave = () => {
    setTheme(localTheme);
    setUpdateRate(localUpdateRate);
    alert('Preferences saved successfully!');
  };

  const handleReset = () => {
    setLocalTheme(theme);
    setLocalUpdateRate(updateRate);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">User Preferences</h3>
        <p className="text-background-400 text-sm">
          Customize your application experience and settings
        </p>
      </div>

      {/* Theme Settings */}
      <div className="bg-background-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <PaintBrushIcon className="h-5 w-5 mr-2 text-primary-500" />
          <h4 className="text-md font-medium">Theme Settings</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-background-300 mb-3">
              Application Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setLocalTheme('light')}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                  localTheme === 'light'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-background-600 hover:border-background-500'
                }`}
              >
                <SunIcon className="h-5 w-5 mr-2" />
                Light
              </button>
              <button
                onClick={() => setLocalTheme('dark')}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                  localTheme === 'dark'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-background-600 hover:border-background-500'
                }`}
              >
                <MoonIcon className="h-5 w-5 mr-2" />
                Dark
              </button>
              <button
                onClick={() => setLocalTheme('auto')}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                  localTheme === 'auto'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-background-600 hover:border-background-500'
                }`}
              >
                <ComputerDesktopIcon className="h-5 w-5 mr-2" />
                Auto
              </button>
            </div>
            <p className="text-xs text-background-400 mt-2">
              Auto theme follows your system preference
            </p>
          </div>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="bg-background-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <ClockIcon className="h-5 w-5 mr-2 text-primary-500" />
          <h4 className="text-md font-medium">Performance Settings</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-background-300 mb-2">
              Data Update Rate: {localUpdateRate}ms
            </label>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={localUpdateRate}
              onChange={(e) => setLocalUpdateRate(Number(e.target.value))}
              className="w-full h-2 bg-background-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-background-400 mt-1">
              <span>Fast (50ms)</span>
              <span>Slow (1000ms)</span>
            </div>
            <p className="text-xs text-background-400 mt-2">
              Lower values provide more responsive updates but use more CPU
            </p>
          </div>
        </div>
      </div>

      {/* Chart Settings */}
      <div className="bg-background-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <ChartBarIcon className="h-5 w-5 mr-2 text-primary-500" />
          <h4 className="text-md font-medium">Chart Settings</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-background-300 mb-2">
              Default Chart Type
            </label>
            <select className="w-full px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="line">Line Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="bar">Bar Chart</option>
              <option value="radar">Radar Chart</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-background-300 mb-2">
              Data Points to Display
            </label>
            <select className="w-full px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="50">50 points</option>
              <option value="100">100 points</option>
              <option value="200">200 points</option>
              <option value="500">500 points</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3D Visualization Settings */}
      <div className="bg-background-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <CogIcon className="h-5 w-5 mr-2 text-primary-500" />
          <h4 className="text-md font-medium">3D Visualization Settings</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-background-300 mb-2">
              Default Model Type
            </label>
            <select className="w-full px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="car">Car</option>
              <option value="aerofoil">Aerofoil</option>
              <option value="building">Building</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-background-300 mb-2">
              Rendering Quality
            </label>
            <select className="w-full px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="low">Low (Better Performance)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Better Quality)</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableShadows"
              className="w-4 h-4 text-primary-600 bg-background-700 border-background-600 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label htmlFor="enableShadows" className="ml-2 text-sm text-background-300">
              Enable shadows and lighting effects
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableParticles"
              className="w-4 h-4 text-primary-600 bg-background-700 border-background-600 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label htmlFor="enableParticles" className="ml-2 text-sm text-background-300">
              Show wind particles and flow visualization
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-medium transition-colors"
        >
          Save Preferences
        </button>
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2 bg-background-700 hover:bg-background-600 rounded-lg text-white font-medium transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Current Settings Summary */}
      <div className="bg-background-800 rounded-lg p-6">
        <h4 className="text-md font-medium mb-4">Current Settings</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-background-400">Theme:</span>
            <span className="ml-2 font-medium capitalize">{theme}</span>
          </div>
          <div>
            <span className="text-background-400">Update Rate:</span>
            <span className="ml-2 font-medium">{updateRate}ms</span>
          </div>
          <div>
            <span className="text-background-400">Chart Type:</span>
            <span className="ml-2 font-medium">Line Chart</span>
          </div>
          <div>
            <span className="text-background-400">Data Points:</span>
            <span className="ml-2 font-medium">100</span>
          </div>
        </div>
      </div>
    </div>
  );
} 