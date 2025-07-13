import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { AdvancedWebGLFallback } from './AdvancedWebGLFallback';

interface WindTunnel3DProps {
  className?: string;
}

// WebGL detection utility
const detectWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | WebGL2RenderingContext | null;
    
    if (!gl) {
      return { supported: false, version: 'none', error: 'No WebGL context available' };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
    
    return {
      supported: true,
      version: gl.getParameter(gl.VERSION),
      vendor,
      renderer,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS)
    };
  } catch (error) {
    return { supported: false, version: 'none', error: (error as Error).message };
  }
};

export const WindTunnel3D: React.FC<WindTunnel3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const carRef = useRef<THREE.Group | null>(null);
  const windParticlesRef = useRef<THREE.Points | null>(null);
  const animationIdRef = useRef<number | null>(null);
  
  const [webglStatus, setWebglStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [webglInfo, setWebglInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  const { currentData } = useAppStore();

  // WebGL detection with retry logic
  const initializeWebGL = useCallback(async () => {
    console.log('🔍 Checking WebGL support...');
    
    // Check if WebGL is disabled at system level
    if (navigator.userAgent.includes('Electron')) {
      console.log('🔍 Running in Electron - checking for WebGL availability...');
    }
    
    const webglSupport = detectWebGLSupport();
    setWebglInfo(webglSupport);
    
    if (!webglSupport.supported) {
      console.error('❌ WebGL not supported:', webglSupport.error);
      setWebglStatus('unavailable');
      setErrorMessage(webglSupport.error || 'Unknown WebGL error');
      return false;
    }

    console.log('✅ WebGL detected:', webglSupport);
    
    // Test WebGL context creation with Three.js
    try {
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 1;
      testCanvas.height = 1;
      
      const testRenderer = new THREE.WebGLRenderer({ 
        canvas: testCanvas,
        antialias: false,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: false,
        stencil: false,
        depth: true
      });
      
      testRenderer.dispose();
      console.log('✅ Three.js WebGL renderer test passed');
      return true;
    } catch (error) {
      console.error('❌ Three.js WebGL renderer test failed:', error);
      setErrorMessage(`Three.js initialization failed: ${(error as Error).message}`);
      return false;
    }
  }, []);

  // Initialize scene with comprehensive error handling
  const initializeScene = useCallback(async () => {
    if (!mountRef.current) {
      console.error('❌ Mount ref not available');
      return false;
    }

    try {
      console.log('🚀 Initializing 3D scene...');
      
      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(5, 3, 5);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Renderer with multiple fallback strategies
      let renderer: THREE.WebGLRenderer | null = null;
      let rendererOptions = [
        // Strategy 1: High performance WebGL2
        {
          antialias: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
          stencil: false,
          depth: true
        },
        // Strategy 2: Default WebGL2
        {
          antialias: false,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
          stencil: false,
          depth: true
        },
        // Strategy 3: Low power WebGL2
        {
          antialias: false,
          powerPreference: "low-power",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
          stencil: false,
          depth: true
        },
        // Strategy 4: Basic WebGL1
        {
          antialias: false,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
          stencil: false,
          depth: true,
          alpha: false
        }
      ];

      let rendererCreated = false;
      for (let i = 0; i < rendererOptions.length; i++) {
        try {
          console.log(`🔄 Trying renderer strategy ${i + 1}...`);
          renderer = new THREE.WebGLRenderer(rendererOptions[i]);
          rendererCreated = true;
          console.log(`✅ Renderer strategy ${i + 1} successful`);
          break;
        } catch (error) {
          console.warn(`⚠️ Renderer strategy ${i + 1} failed:`, error);
          if (i === rendererOptions.length - 1) {
            throw new Error(`All renderer strategies failed. Last error: ${(error as Error).message}`);
          }
        }
      }

      if (!rendererCreated || !renderer) {
        throw new Error('Failed to create WebGL renderer with any strategy');
      }

      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      console.log('✅ Scene initialization completed');
      return true;

    } catch (error) {
      console.error('❌ Scene initialization failed:', error);
      setErrorMessage(`Scene initialization failed: ${(error as Error).message}`);
      return false;
    }
  }, []);

  // Create 3D objects
  const createObjects = useCallback(() => {
    if (!sceneRef.current) return;

    try {
      console.log('🎨 Creating 3D objects...');

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      sceneRef.current.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 1024; // Reduced for better performance
      directionalLight.shadow.mapSize.height = 1024;
      sceneRef.current.add(directionalLight);

      // Wind tunnel walls
      const tunnelGeometry = new THREE.BoxGeometry(8, 4, 12);
      const tunnelMaterial = new THREE.MeshPhongMaterial({
        color: 0x1e3a8a,
        transparent: true,
        opacity: 0.1,
        wireframe: true,
      });
      const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
      tunnel.position.z = 0;
      sceneRef.current.add(tunnel);

      // Car model (simplified)
      const carGroup = new THREE.Group();
      
      // Car body
      const bodyGeometry = new THREE.BoxGeometry(1.5, 0.5, 2.5);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xf97316 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.castShadow = true;
      body.receiveShadow = true;
      carGroup.add(body);

      // Car roof
      const roofGeometry = new THREE.BoxGeometry(1.2, 0.3, 1.5);
      const roofMaterial = new THREE.MeshPhongMaterial({ color: 0xdc2626 });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = 0.4;
      roof.position.z = -0.2;
      roof.castShadow = true;
      roof.receiveShadow = true;
      carGroup.add(roof);

      // Wheels
      const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8);
      const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x374151 });
      
      const wheelPositions = [
        { x: -0.6, y: -0.3, z: 0.8 },
        { x: 0.6, y: -0.3, z: 0.8 },
        { x: -0.6, y: -0.3, z: -0.8 },
        { x: 0.6, y: -0.3, z: -0.8 },
      ];

      wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(pos.x, pos.y, pos.z);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        wheel.receiveShadow = true;
        carGroup.add(wheel);
      });

      carGroup.position.set(0, 0, 0);
      sceneRef.current.add(carGroup);
      carRef.current = carGroup;

      // Wind particles (reduced count for better performance)
      const particleCount = 100;
      const particleGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 6;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
        particlePositions[i * 3 + 2] = Math.random() * 10 - 5;

        particleColors[i * 3] = 0.5 + Math.random() * 0.5;
        particleColors[i * 3 + 1] = 0.5 + Math.random() * 0.5;
        particleColors[i * 3 + 2] = 1.0;
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      sceneRef.current.add(particles);
      windParticlesRef.current = particles;

      // Ground
      const groundGeometry = new THREE.PlaneGeometry(10, 10);
      const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x374151 });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -2;
      ground.receiveShadow = true;
      sceneRef.current.add(ground);

      console.log('✅ 3D objects created successfully');

          } catch (error) {
        console.error('❌ Failed to create 3D objects:', error);
        setErrorMessage(`Object creation failed: ${(error as Error).message}`);
      }
  }, []);

  // Animation loop
  const startAnimation = useCallback(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) {
      console.error('❌ Cannot start animation - missing scene, camera, or renderer');
      return;
    }

    console.log('🎬 Starting animation loop...');

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      try {
        // Rotate car slightly based on drag force
        if (carRef.current && currentData) {
          const dragFactor = currentData.dragForce ?? 0;
          carRef.current.rotation.y = Math.sin(Date.now() * 0.001) * dragFactor * 0.1;
        }

        // Animate wind particles
        if (windParticlesRef.current && currentData) {
          const positions = windParticlesRef.current.geometry.attributes.position.array as Float32Array;
          const velocity = currentData.windSpeed ?? 0;
          
          for (let i = 0; i < 100; i++) {
            positions[i * 3 + 2] -= (velocity / 50) * 0.1;
            
            if (positions[i * 3 + 2] < -5) {
              positions[i * 3 + 2] = 5;
              positions[i * 3] = (Math.random() - 0.5) * 6;
              positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
            }
          }
          
          windParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        }

        // Rotate camera slowly
        if (cameraRef.current) {
          const time = Date.now() * 0.0005;
          cameraRef.current.position.x = Math.cos(time) * 5;
          cameraRef.current.position.z = Math.sin(time) * 5;
          cameraRef.current.lookAt(0, 0, 0);
        }

        rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      } catch (error) {
        console.error('❌ Animation error:', error);
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
      }
    };

    animate();
  }, [currentData]);

  // Main initialization effect
  useEffect(() => {
    const initialize = async () => {
      setWebglStatus('checking');
      setErrorMessage('');

      // Step 1: Check WebGL support
      const webglSupported = await initializeWebGL();
      if (!webglSupported) {
        setWebglStatus('unavailable');
        return;
      }

      // Step 2: Initialize scene
      const sceneInitialized = await initializeScene();
      if (!sceneInitialized) {
        setWebglStatus('unavailable');
        return;
      }

      // Step 3: Create objects
      createObjects();

      // Step 4: Start animation
      startAnimation();

      setWebglStatus('available');

      // Handle resize
      const handleResize = () => {
        if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
        
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        if (mountRef.current && rendererRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
      };
    };

    initialize();
  }, [initializeWebGL, initializeScene, createObjects, startAnimation, retryCount]);

  // Retry mechanism
  const handleRetry = () => {
    console.log('🔄 Retrying WebGL initialization...');
    setRetryCount(prev => prev + 1);
    setWebglStatus('checking');
    setErrorMessage('');
  };

  // Show loading state
  if (webglStatus === 'checking') {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg border border-gray-700/50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <div className="text-sm text-gray-400">Initializing 3D Visualization...</div>
            {webglInfo && (
              <div className="text-xs text-gray-500">
                WebGL: {webglInfo.version} | {webglInfo.vendor}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

    // Show fallback if WebGL is not available
  if (webglStatus === 'unavailable') {
    return (
      <div className={`relative ${className}`}>
        <AdvancedWebGLFallback className={className} />
        {errorMessage && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-900/80 backdrop-blur-sm rounded-lg p-3">
            <div className="text-red-200 text-sm mb-2">WebGL Error:</div>
            <div className="text-red-100 text-xs mb-3">{errorMessage}</div>
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show 3D visualization
  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-4 left-4 z-10 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3">
        <h3 className="text-white font-semibold mb-2">3D Wind Tunnel</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <div>Velocity: {currentData?.windSpeed?.toFixed(1) ?? '0.0'} m/s</div>
          <div>Drag: {currentData?.dragForce?.toFixed(3) ?? '0.000'} </div>
          <div>Lift: {currentData?.liftForce?.toFixed(3) ?? '0.000'} </div>
        </div>
        {webglInfo && (
          <div className="text-xs text-gray-500 mt-2">
            {webglInfo.version} | {webglInfo.renderer}
          </div>
        )}
      </div>
      <div 
        ref={mountRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}; 