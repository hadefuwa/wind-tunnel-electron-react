import React, { useState, useEffect, useRef } from 'react';

interface LazyLoadProps {
  children: React.ReactNode;
  threshold?: number;
  placeholder?: React.ReactNode;
  className?: string;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({ 
  children, 
  threshold = 0.1, 
  placeholder,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  useEffect(() => {
    if (isVisible) {
      // Simulate loading delay for better UX
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div ref={ref} className={className}>
      {!isLoaded ? (
        placeholder || (
          <div className="animate-pulse bg-background-700 rounded-lg h-64 flex items-center justify-center">
            <div className="text-background-400">Loading...</div>
          </div>
        )
      ) : (
        children
      )}
    </div>
  );
};

// Higher-order component for lazy loading
export const withLazyLoad = <P extends object>(
  Component: React.ComponentType<P>,
  placeholder?: React.ReactNode
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <LazyLoad placeholder={placeholder}>
      <Component {...(props as P)} ref={ref} />
    </LazyLoad>
  ));
}; 