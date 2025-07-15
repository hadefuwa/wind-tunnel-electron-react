import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './components/Settings/Settings';
import { WebGLTest } from './components/Visualization/WebGLTest';
import { OnboardingTutorial, useTutorial } from './components/UI/OnboardingTutorial';

export default function App() {
  const { hasSeenTutorial, markTutorialComplete } = useTutorial();
  const [showTutorial, setShowTutorial] = useState(!hasSeenTutorial);

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

  return (
    <Router>
      <div className="min-h-screen bg-background-900 text-white">
        <main className="h-screen overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/webgl-test" element={<WebGLTest />} />
          </Routes>
        </main>
        
        <OnboardingTutorial
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          onComplete={handleTutorialComplete}
        />
      </div>
    </Router>
  );
} 