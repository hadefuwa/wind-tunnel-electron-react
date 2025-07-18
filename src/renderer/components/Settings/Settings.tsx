import React, { useState } from 'react';
import { 
  Cog6ToothIcon,
  WifiIcon,
  ChartBarIcon,
  CubeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { SPIConfig } from './SPIConfig';
import UserPreferences from './UserPreferences';

const tabs = [
  { name: 'General', icon: Cog6ToothIcon },
  { name: 'User Preferences', icon: UserIcon },
  { name: 'SPI Configuration', icon: WifiIcon },
  { name: 'Simulation', icon: ChartBarIcon },
  { name: 'Visualization', icon: CubeIcon },
];

const APP_VERSION = '1.0.0';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('General');
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const handleRunUpdateScript = async () => {
    setUpdating(true);
    setUpdateMessage('🚀 Running update script...');
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        // @ts-ignore
        const result = await window.electronAPI.runUpdateScript();
        setUpdateMessage('✅ ' + result);
      } else {
        setUpdateMessage('⚠️ Electron API not available. Please run manually.');
      }
    } catch (err: any) {
      setUpdateMessage('❌ ' + (err?.message || err));
    } finally {
      setUpdating(false);
    }
  };

  const handleRunManualUpdate = async () => {
    setUpdating(true);
    setUpdateMessage('🔄 Opening terminal with update commands...');
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        // @ts-ignore
        const result = await window.electronAPI.runManualUpdate();
        setUpdateMessage('✅ ' + result);
      } else {
        setUpdateMessage('⚠️ Electron API not available. Please run manually.');
      }
    } catch (err: any) {
      setUpdateMessage('❌ ' + (err?.message || err));
    } finally {
      setUpdating(false);
    }
  };

  const handleManualUpdate = () => {
    setUpdateMessage(`
📋 Manual Update Instructions for Raspberry Pi:

1. Open terminal on your Pi
2. Navigate to app directory:
   cd /home/matrix/wind-tunnel-electron-react

3. Pull latest changes:
   git pull origin main

4. Install dependencies:
   npm install

5. Rebuild the app:
   npm run build

6. Restart the service:
   sudo systemctl restart wind-tunnel

Or use the update script:
   sudo /usr/local/bin/update-wind-tunnel.sh
    `);
  };

  const handleCheckForUpdates = async () => {
    setUpdating(true);
    setUpdateMessage('🔍 Checking for updates...');
    
    try {
      // Simulate checking for updates
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just show current version info
      setUpdateMessage(`
📊 Current Version: v${APP_VERSION}

🔄 To update on Raspberry Pi:
• Use the manual update instructions below
• Or run the update script if configured
• Updates require terminal access and sudo privileges

⚠️ Note: Auto-updates are not available for security reasons
      `);
    } catch (err: any) {
      setUpdateMessage('❌ Failed to check for updates: ' + (err?.message || err));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 dashboard-content">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-background-400">Configure your wind tunnel application</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-background-400">Version</span>
            <div className="text-lg font-bold text-primary-400">v{APP_VERSION}</div>
          </div>
        </div>
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
            {/* Update Section */}
            <div className="mt-6 p-4 bg-background-700 rounded-lg">
              <h4 className="text-md font-semibold mb-3">Application Updates</h4>
              <div className="space-y-3">
                <button
                  onClick={handleCheckForUpdates}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 mr-2"
                >
                  {updating ? 'Checking...' : 'Check for Updates'}
                </button>
                <button
                  onClick={handleRunUpdateScript}
                  disabled={updating}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 mr-2"
                >
                  {updating ? 'Running...' : 'Run Update Script'}
                </button>
                <button
                  onClick={handleRunManualUpdate}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                >
                  {updating ? 'Opening...' : 'Open Terminal with Commands'}
                </button>
              </div>
              {updateMessage && (
                <div className="mt-3 p-3 bg-background-600 rounded text-sm text-background-200 whitespace-pre-line">
                  {updateMessage}
                </div>
              )}
              <div className="mt-3 text-xs text-background-400">
                💡 Tip: For Raspberry Pi, use terminal commands or the update script for reliable updates.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'User Preferences' && <UserPreferences />}

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