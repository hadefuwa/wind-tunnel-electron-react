import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { WebGLFallback } from './WebGLFallback';

interface WindTunnel3DProps {
  className?: string;
}

export const WindTunnel3D: React.FC<WindTunnel3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const carRef = useRef<THREE.Group | null>(null);
  const windParticlesRef = useRef<THREE.Points | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);

  const { currentData } = useAppStore();

  // Create scene, camera, and renderer
  useEffect(() => {
    if (!mountRef.current) return;

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

    // Renderer with fallback options
    let renderer: THREE.WebGLRenderer;
    try {
      // Try WebGL2 first
      renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: false,
        stencil: false,
        depth: true
      });
    } catch (error) {
      console.warn('WebGL2 failed, trying WebGL1:', error);
      try {
        // Fallback to WebGL1
        renderer = new THREE.WebGLRenderer({ 
          antialias: false,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
          stencil: false,
          depth: true
        });
             } catch (webglError) {
         console.error('WebGL initialization failed:', webglError);
         setWebglAvailable(false);
         return;
       }
    }

    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    setWebglAvailable(true);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

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
    scene.add(tunnel);

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
    scene.add(carGroup);
    carRef.current = carGroup;

    // Wind particles
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 6; // x
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2; // y
      particlePositions[i * 3 + 2] = Math.random() * 10 - 5; // z

      particleColors[i * 3] = 0.5 + Math.random() * 0.5; // r
      particleColors[i * 3 + 1] = 0.5 + Math.random() * 0.5; // g
      particleColors[i * 3 + 2] = 1.0; // b
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
    scene.add(particles);
    windParticlesRef.current = particles;

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x374151 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Rotate car slightly based on drag coefficient
      if (carRef.current && currentData) {
        const dragFactor = currentData.dragCoefficient;
        carRef.current.rotation.y = Math.sin(Date.now() * 0.001) * dragFactor * 0.1;
      }

      // Animate wind particles
      if (windParticlesRef.current && currentData) {
        const positions = windParticlesRef.current.geometry.attributes.position.array as Float32Array;
        const velocity = currentData.velocity;
        
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 2] -= (velocity / 50) * 0.1; // Move particles based on wind speed
          
          // Reset particles that go too far
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

      renderer.render(scene, camera);
    };

    animate();

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

    // Cleanup
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
  }, []);

  // Show fallback if WebGL is not available
  if (webglAvailable === false) {
    return <WebGLFallback className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-4 left-4 z-10 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3">
        <h3 className="text-white font-semibold mb-2">3D Wind Tunnel</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <div>Velocity: {currentData?.velocity.toFixed(1) || '0.0'} m/s</div>
          <div>Drag: {currentData?.dragCoefficient.toFixed(3) || '0.000'} </div>
          <div>Lift: {currentData?.liftCoefficient.toFixed(3) || '0.000'} </div>
        </div>
      </div>
      <div 
        ref={mountRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}; 