import React, { useEffect, useRef } from 'react';
import { touchScrollDebug } from '../../utils/TouchScrollDebug';

export const TouchScrollTest: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('TouchScrollTest mounted');
    console.log('Scroll element:', scrollRef.current);
    
    // Enable touch scroll debugging
    touchScrollDebug.enable();
    
    if (scrollRef.current) {
      console.log('Scroll element scrollHeight:', scrollRef.current.scrollHeight);
      console.log('Scroll element clientHeight:', scrollRef.current.clientHeight);
      touchScrollDebug.checkScrollableElement(scrollRef.current);
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    console.log('TouchScrollTest - Touch start');
    console.log('Touch coordinates:', e.touches[0]?.clientX, e.touches[0]?.clientY);
    touchScrollDebug.logTouchEvent(e.nativeEvent, 'start');
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    console.log('TouchScrollTest - Touch move');
    console.log('Touch coordinates:', e.touches[0]?.clientX, e.touches[0]?.clientY);
    touchScrollDebug.logTouchEvent(e.nativeEvent, 'move');
  };

  const handleScroll = (e: React.UIEvent) => {
    console.log('TouchScrollTest - Scroll event');
    console.log('Scroll top:', e.currentTarget.scrollTop);
    touchScrollDebug.logScrollEvent(e.currentTarget as HTMLElement, 'scroll');
  };

  return (
    <div className="bg-background-800 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Touch Scroll Test</h3>
      <div 
        ref={scrollRef}
        className="h-64 overflow-y-auto bg-background-700 rounded p-4 touch-scroll-test"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onScroll={handleScroll}
        style={{
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="space-y-4">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="bg-background-600 p-3 rounded">
              <p className="text-white">Scroll Test Item {i + 1}</p>
              <p className="text-background-400 text-sm">
                This is a test item to verify touch scrolling is working properly.
                Try swiping up and down on this content.
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 text-sm text-background-400">
        <p>Touch this area and swipe up/down to test scrolling</p>
        <p>Check console for debug messages</p>
      </div>
    </div>
  );
}; 