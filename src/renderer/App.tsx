import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Settings from './components/Settings/Settings';
import { WebGLTest } from './components/Visualization/WebGLTest';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-background-900 flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />
          <main className="flex-1 content-scrollable">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/webgl-test" element={<WebGLTest />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
} 