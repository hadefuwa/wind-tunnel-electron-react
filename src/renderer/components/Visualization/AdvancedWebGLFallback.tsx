import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface AdvancedWebGLFallbackProps {
  className?: string;
}

export const AdvancedWebGLFallback: React.FC<AdvancedWebGLFallbackProps> = ({ className = '' }) => {
  const { currentData } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isAnimating, setIsAnimating] = useState(false);

  // Particle system for wind visualization
  const particles = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particles.current = [];
      for (let i = 0; i < 50; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: Math.random() * 100,
          maxLife: 100 + Math.random() * 50
        });
      }
    };

    initParticles();

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw wind tunnel outline
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

      // Draw car representation
      const carX = canvas.width / 2;
      const carY = canvas.height / 2;
      const windSpeed = currentData?.windSpeed ?? 0;
      const dragForce = currentData?.dragForce ?? 0;
      const liftForce = currentData?.liftForce ?? 0;

      // Car body
      ctx.fillStyle = '#f97316';
      ctx.fillRect(carX - 30, carY - 15, 60, 30);

      // Car roof
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(carX - 25, carY - 25, 50, 15);

      // Wheels
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(carX - 20, carY + 15, 8, 0, Math.PI * 2);
      ctx.arc(carX + 20, carY + 15, 8, 0, Math.PI * 2);
      ctx.fill();

      // Wind direction indicator
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      for (let i = 0; i < 5; i++) {
        const x = 80 + i * 40;
        const y = canvas.height / 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20, y);
        ctx.stroke();
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(x + 20, y);
        ctx.lineTo(x + 15, y - 5);
        ctx.lineTo(x + 15, y + 5);
        ctx.fill();
      }

      // Update and draw particles
      particles.current.forEach((particle, index) => {
        // Update position based on wind speed
        particle.x += particle.vx + (windSpeed / 10);
        particle.y += particle.vy;
        particle.life--;

        // Reset particle if it goes off screen or dies
        if (particle.x > canvas.width || particle.x < 0 || 
            particle.y > canvas.height || particle.y < 0 || 
            particle.life <= 0) {
          particle.x = -20;
          particle.y = Math.random() * canvas.height;
          particle.vx = 1 + Math.random() * 2;
          particle.vy = (Math.random() - 0.5) * 2;
          particle.life = particle.maxLife;
        }

        // Draw particle
        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = `rgba(96, 165, 250, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw force vectors
      if (dragForce > 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(carX + 35, carY);
        ctx.lineTo(carX + 35 + dragForce * 10, carY);
        ctx.stroke();
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(carX + 35 + dragForce * 10, carY);
        ctx.lineTo(carX + 30 + dragForce * 10, carY - 5);
        ctx.lineTo(carX + 30 + dragForce * 10, carY + 5);
        ctx.fill();
      }

      if (liftForce > 0) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(carX, carY - 20);
        ctx.lineTo(carX, carY - 20 - liftForce * 10);
        ctx.stroke();
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(carX, carY - 20 - liftForce * 10);
        ctx.lineTo(carX - 5, carY - 15 - liftForce * 10);
        ctx.lineTo(carX + 5, carY - 15 - liftForce * 10);
        ctx.fill();
      }

      // Draw data overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 200, 120);

      ctx.fillStyle = '#ffffff';
      ctx.font = '14px monospace';
      ctx.fillText('Wind Speed: ' + windSpeed.toFixed(1) + ' m/s', 20, 30);
      ctx.fillText('Drag Force: ' + dragForce.toFixed(3), 20, 50);
      ctx.fillText('Lift Force: ' + liftForce.toFixed(3), 20, 70);
      ctx.fillText('Pressure: ' + (currentData?.pressure?.toFixed(1) ?? '0.0') + ' kPa', 20, 90);
      ctx.fillText('Temp: ' + (currentData?.temperature?.toFixed(1) ?? '0.0') + '°C', 20, 110);

      // Draw status indicator
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(canvas.width - 20, 20, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.fillText('2D Mode', canvas.width - 80, 25);

      animationRef.current = requestAnimationFrame(animate);
    };

    setIsAnimating(true);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsAnimating(false);
    };
  }, [currentData]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-4 left-4 z-10 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3">
        <h3 className="text-white font-semibold mb-2">2D Wind Tunnel Visualization</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <div>Velocity: {currentData?.windSpeed?.toFixed(1) ?? '0.0'} m/s</div>
          <div>Drag: {currentData?.dragForce?.toFixed(3) ?? '0.000'} </div>
          <div>Lift: {currentData?.liftForce?.toFixed(3) ?? '0.000'} </div>
        </div>
        <div className="text-xs text-yellow-400 mt-2">
          ⚠️ WebGL unavailable - Using 2D rendering
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
      
      {!isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
            <div className="text-sm text-gray-400">Initializing 2D visualization...</div>
          </div>
        </div>
      )}
    </div>
  );
}; 