import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-background-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-background-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-background-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-background-900'
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className="bg-background-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs">
            {content}
            <div className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`} />
          </div>
        </div>
      )}
    </div>
  );
};

export const InfoTooltip: React.FC<{ content: string; className?: string }> = ({ 
  content, 
  className = '' 
}) => (
  <Tooltip content={content} className={className}>
    <div className="inline-flex items-center justify-center w-4 h-4 bg-background-600 text-background-300 rounded-full text-xs cursor-help hover:bg-background-500 transition-colors">
      ?
    </div>
  </Tooltip>
); 