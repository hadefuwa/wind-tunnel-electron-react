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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Debug touchscreen scrolling
  useEffect(() => {
    console.log('App mounted - checking touchscreen support');
    console.log('Touch supported:', 'ontouchstart' in window);
    console.log('Pointer events supported:', 'onpointerdown' in window);
    console.log('User agent:', navigator.userAgent);
    
    // Check if we're on a touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    console.log('Is touch device:', isTouchDevice);
    
    if (isTouchDevice) {
      console.log('Touchscreen detected - enabling touch scrolling');
    }
  }, []);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    markTutorialComplete();
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Touch event handlers for debugging
  const handleTouchStart = (e: React.TouchEvent) => {
    console.log('Touch start detected on main content');
    console.log('Touch points:', e.touches.length);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    console.log('Touch move detected on main content');
    console.log('Touch delta Y:', e.touches[0]?.clientY);
  };

  return (
    <Router>
      <div className="min-h-screen bg-background-900 text-white flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
          <main 
            className="flex-1 content-scrollable transition-all duration-300"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
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