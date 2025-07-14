import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  Cog6ToothIcon,
  ChartBarIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'WebGL Test', href: '/webgl-test', icon: ComputerDesktopIcon },
];

const quickStats = [
  { name: 'Drag Coefficient', value: '0.32', unit: 'Cd' },
  { name: 'Lift Coefficient', value: '0.15', unit: 'Cl' },
  { name: 'Velocity', value: '25', unit: 'm/s' },
  { name: 'Pressure', value: '101.3', unit: 'kPa' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-background-800 border-r border-background-700 flex flex-col transition-all duration-300`}>
      {/* Toggle Button */}
      <div className="p-2 border-b border-background-700">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-background-300 hover:bg-background-700 hover:text-white transition-colors"
        >
          {collapsed ? (
            <Bars3Icon className="h-5 w-5" />
          ) : (
            <XMarkIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-background-300 hover:bg-background-700 hover:text-white'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
                {!collapsed && item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick Stats */}
      {!collapsed && (
        <div className="p-4 border-t border-background-700">
          <h3 className="text-sm font-medium text-background-300 mb-3">Quick Stats</h3>
          <div className="space-y-2">
            {quickStats.map((stat) => (
              <div key={stat.name} className="flex justify-between items-center text-sm">
                <span className="text-background-400">{stat.name}</span>
                <div className="text-right">
                  <span className="text-white font-medium">{stat.value}</span>
                  <span className="text-background-400 ml-1">{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="p-4 border-t border-background-700">
        <div className={`flex items-center text-warning-400 text-sm ${collapsed ? 'justify-center' : ''}`}>
          <ExclamationTriangleIcon className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
          {!collapsed && <span>No active alerts</span>}
        </div>
      </div>
    </div>
  );
} 