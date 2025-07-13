import React, { useState, useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface TutorialStep {
  title: string;
  content: string;
  target?: string; // CSS selector for highlighting
}

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to Wind Tunnel App',
    content: 'This application helps you analyze aerodynamic data in real-time. You can run simulations or connect to real hardware via SPI.'
  },
  {
    title: 'Dashboard Overview',
    content: 'The main dashboard shows real-time parameter cards, charts, and 3D visualization. All data updates automatically during simulation.'
  },
  {
    title: 'Simulation Controls',
    content: 'Use the Start/Stop buttons to control the simulation. The simulation generates realistic aerodynamic data with configurable parameters.'
  },
  {
    title: 'Parameter Cards',
    content: 'Each card displays a key aerodynamic parameter. Values update in real-time and show trends with color-coded indicators.'
  },
  {
    title: 'Real-time Charts',
    content: 'Charts display historical data trends. You can zoom, pan, and analyze patterns in the aerodynamic data.'
  },
  {
    title: '3D Visualization',
    content: 'The 3D view shows your model in the wind tunnel. You can rotate, zoom, and see real-time updates based on simulation data.'
  },
  {
    title: 'Settings & Configuration',
    content: 'Access settings via the sidebar to configure SPI connections, simulation parameters, and user preferences.'
  },
  {
    title: 'Data Management',
    content: 'Export data in multiple formats (CSV, JSON, Excel) and manage your test sessions for later analysis.'
  }
];

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-background-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Tutorial</h2>
          <button
            onClick={skipTutorial}
            className="text-background-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-background-400 mb-2">
            <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
            <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-background-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">
            {tutorialSteps[currentStep].title}
          </h3>
          <p className="text-background-300 leading-relaxed">
            {tutorialSteps[currentStep].content}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 text-background-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Previous
          </button>

          <div className="flex space-x-2">
            <button
              onClick={skipTutorial}
              className="px-4 py-2 text-background-400 hover:text-white transition-colors"
            >
              Skip
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook to manage tutorial state
export const useTutorial = () => {
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem('windTunnelTutorialSeen') === 'true';
  });

  const markTutorialComplete = () => {
    setHasSeenTutorial(true);
    localStorage.setItem('windTunnelTutorialSeen', 'true');
  };

  return {
    hasSeenTutorial,
    markTutorialComplete
  };
}; 