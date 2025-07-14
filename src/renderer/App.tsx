import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './components/Settings/Settings';
import { WebGLTest } from './components/Visualization/WebGLTest';
import { OnboardingTutorial, useTutorial } from './components/UI/OnboardingTutorial';

export default function App() {
  const { hasSeenTutorial, markTutorialComplete } = useTutorial();
  const [showTutorial, setShowTutorial] = useState(!hasSeenTutorial);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    markTutorialComplete();
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Router>
      <div className="min-h-screen bg-background-900 text-white flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
          <main className="flex-1 p-6 overflow-y-auto overflow-x-auto scrollable transition-all duration-300" style={{ touchAction: 'pan-y pan-x' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/webgl-test" element={<WebGLTest />} />
            </Routes>
          </main>
        </div>
        
        <OnboardingTutorial
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          onComplete={handleTutorialComplete}
        />
      </div>
    </Router>
  );
} 