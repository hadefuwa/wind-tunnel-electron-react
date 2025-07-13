import React, { useState } from 'react';
import { 
  Cog6ToothIcon,
  WifiIcon,
  ChartBarIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { SPIConfig } from './SPIConfig';

const tabs = [
  { name: 'General', icon: Cog6ToothIcon },
  { name: 'SPI Configuration', icon: WifiIcon },
  { name: 'Simulation', icon: ChartBarIcon },
  { name: 'Visualization', icon: CubeIcon },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('General');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-background-400">Configure your wind tunnel application</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-background-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-background-400 hover:text-background-300 hover:border-background-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-background-800 rounded-lg p-6">
        {activeTab === 'General' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-background-300 mb-2">
                  Application Theme
                </label>
                <select className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white">
                  <option>Dark Theme</option>
                  <option>Light Theme</option>
                  <option>Auto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-background-300 mb-2">
                  Data Update Rate
                </label>
                <select className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white">
                  <option>100ms</option>
                  <option>500ms</option>
                  <option>1s</option>
                  <option>5s</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SPI Configuration' && <SPIConfig />}

        {activeTab === 'Simulation' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Simulation Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-background-300 mb-2">
                  Wind Speed Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="flex-1 bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="flex-1 bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-background-300 mb-2">
                  Model Type
                </label>
                <select className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white">
                  <option>Car</option>
                  <option>Aerofoil</option>
                  <option>Building</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Visualization' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Visualization Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-background-300 mb-2">
                  3D Quality
                </label>
                <select className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-background-300 mb-2">
                  Chart Theme
                </label>
                <select className="w-full bg-background-700 border border-background-600 rounded-lg px-3 py-2 text-white">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 