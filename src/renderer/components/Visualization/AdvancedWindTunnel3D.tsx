import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { WebGLFallback } from './WebGLFallback';

interface AdvancedWindTunnel3DProps {
  className?: string;
  modelType?: 'car' | 'aerofoil' | 'building' | 'custom';
  showFlowLines?: boolean;
  showPressureField?: boolean;
  cameraPreset?: 'front' | 'side' | 'top' | 'perspective';
}

export const AdvancedWindTunnel3D: React.FC<AdvancedWindTunnel3DProps> = ({ 
  className = '',
  modelType = 'car',
  showFlowLines = true,
  showPressureField = false,
  cameraPreset = 'perspective'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const flowLinesRef = useRef<THREE.Group | null>(null);
  const pressureFieldRef = useRef<THREE.Points | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);

  const { currentData } = useAppStore();

  // Create advanced 3D scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    
    // Set camera position based on preset
    switch (cameraPreset) {
      case 'front':
        camera.position.set(0, 0, 8);
        break;
      case 'side':
        camera.position.set(8, 0, 0);
        break;
      case 'top':
        camera.position.set(0, 8, 0);
        break;
      default:
        camera.position.set(6, 4, 6);
    }
    
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup with fallback
    let renderer: THREE.WebGLRenderer;
    try {
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    setWebglAvailable(true);

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x0066ff, 0.5, 20);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Wind tunnel walls with enhanced design
    const tunnelGeometry = new THREE.BoxGeometry(10, 6, 16);
    const tunnelMaterial = new THREE.MeshPhongMaterial({
      color: 0x1e3a8a,
      transparent: true,
      opacity: 0.05,
      wireframe: true,
    });
    const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
    scene.add(tunnel);

    // Create model based on type
    const model = createModel(modelType);
    scene.add(model);
    modelRef.current = model;

    // Flow visualization
    if (showFlowLines) {
      const flowLines = createFlowLines();
      scene.add(flowLines);
      flowLinesRef.current = flowLines;
    }

    // Pressure field visualization
    if (showPressureField) {
      const pressureField = createPressureField();
      scene.add(pressureField);
      pressureFieldRef.current = pressureField;
    }

    // Ground with grid
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x374151,
      transparent: true,
      opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -2.9;
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Update model based on data
      if (modelRef.current && currentData) {
        updateModel(modelRef.current, currentData, modelType);
      }

      // Update flow lines
      if (flowLinesRef.current && currentData) {
        updateFlowLines(flowLinesRef.current, currentData);
      }

      // Update pressure field
      if (pressureFieldRef.current && currentData) {
        updatePressureField(pressureFieldRef.current, currentData);
      }

      // Smooth camera movement
      if (cameraRef.current) {
        const time = Date.now() * 0.0003;
        const radius = 8;
        cameraRef.current.position.x = Math.cos(time) * radius;
        cameraRef.current.position.z = Math.sin(time) * radius;
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
  }, [modelType, showFlowLines, showPressureField, cameraPreset]);

  // Create different model types
  const createModel = (type: string): THREE.Group => {
    const group = new THREE.Group();

    switch (type) {
      case 'car':
        // Enhanced car model
        const bodyGeometry = new THREE.BoxGeometry(2, 0.6, 3);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xf97316,
          metalness: 0.3,
          roughness: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Roof
        const roofGeometry = new THREE.BoxGeometry(1.6, 0.4, 2);
        const roofMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xdc2626,
          metalness: 0.2,
          roughness: 0.8
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 0.5;
        roof.position.z = -0.2;
        roof.castShadow = true;
        roof.receiveShadow = true;
        group.add(roof);

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12);
        const wheelMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x374151,
          metalness: 0.8,
          roughness: 0.2
        });
        
        const wheelPositions = [
          { x: -0.8, y: -0.3, z: 1.2 },
          { x: 0.8, y: -0.3, z: 1.2 },
          { x: -0.8, y: -0.3, z: -1.2 },
          { x: 0.8, y: -0.3, z: -1.2 },
        ];

        wheelPositions.forEach(pos => {
          const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
          wheel.position.set(pos.x, pos.y, pos.z);
          wheel.rotation.z = Math.PI / 2;
          wheel.castShadow = true;
          wheel.receiveShadow = true;
          group.add(wheel);
        });
        break;

      case 'aerofoil':
        // Aerofoil model
        const aerofoilShape = new THREE.Shape();
        aerofoilShape.moveTo(0, 0);
        aerofoilShape.quadraticCurveTo(0.5, 0.2, 1, 0);
        aerofoilShape.quadraticCurveTo(0.5, -0.1, 0, 0);
        
        const aerofoilGeometry = new THREE.ExtrudeGeometry(aerofoilShape, {
          depth: 0.1,
          bevelEnabled: false
        });
        const aerofoilMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x3b82f6,
          metalness: 0.1,
          roughness: 0.9
        });
        const aerofoil = new THREE.Mesh(aerofoilGeometry, aerofoilMaterial);
        aerofoil.rotation.x = Math.PI / 2;
        aerofoil.scale.set(2, 2, 1);
        aerofoil.castShadow = true;
        aerofoil.receiveShadow = true;
        group.add(aerofoil);
        break;

      case 'building':
        // Building model
        const buildingGeometry = new THREE.BoxGeometry(1.5, 2, 1.5);
        const buildingMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x6b7280,
          metalness: 0.1,
          roughness: 0.8
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = 1;
        building.castShadow = true;
        building.receiveShadow = true;
        group.add(building);
        break;

      default:
        // Default cube
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x8b5cf6 });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.castShadow = true;
        cube.receiveShadow = true;
        group.add(cube);
    }

    return group;
  };

  // Create flow lines
  const createFlowLines = (): THREE.Group => {
    const group = new THREE.Group();
    const lineCount = 50;

    for (let i = 0; i < lineCount; i++) {
      const points = [];
      const startX = (Math.random() - 0.5) * 8;
      const startY = (Math.random() - 0.5) * 4;
      const startZ = 8;

      for (let j = 0; j < 20; j++) {
        points.push(new THREE.Vector3(
          startX + j * 0.2,
          startY + Math.sin(j * 0.3) * 0.1,
          startZ - j * 0.8
        ));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6
      });
      const line = new THREE.Line(geometry, material);
      group.add(line);
    }

    return group;
  };

  // Create pressure field
  const createPressureField = (): THREE.Points => {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

      colors[i * 3] = 0.5 + Math.random() * 0.5;
      colors[i * 3 + 1] = 0.2 + Math.random() * 0.3;
      colors[i * 3 + 2] = 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    return new THREE.Points(geometry, material);
  };

  // Update model based on data
  const updateModel = (model: THREE.Group, data: any, type: string) => {
    // Rotate model based on drag coefficient
    const dragFactor = data.dragCoefficient;
    model.rotation.y = Math.sin(Date.now() * 0.001) * dragFactor * 0.1;

    // Scale model based on velocity
    const velocityScale = 1 + (data.velocity - 20) / 100;
    model.scale.setScalar(velocityScale);
  };

  // Update flow lines
  const updateFlowLines = (flowLines: THREE.Group, data: any) => {
    const velocity = data.velocity;
    flowLines.children.forEach((line, index) => {
      if (line instanceof THREE.Line) {
        const positions = line.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 2] -= (velocity / 50) * 0.1;
          if (positions[i + 2] < -8) {
            positions[i + 2] = 8;
            positions[i] = (Math.random() - 0.5) * 8;
            positions[i + 1] = (Math.random() - 0.5) * 4;
          }
        }
        line.geometry.attributes.position.needsUpdate = true;
      }
    });
  };

  // Update pressure field
  const updatePressureField = (pressureField: THREE.Points, data: any) => {
    const positions = pressureField.geometry.attributes.position.array as Float32Array;
    const pressure = data.pressure;
    
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] -= 0.05;
      if (positions[i + 2] < -8) {
        positions[i + 2] = 8;
        positions[i] = (Math.random() - 0.5) * 8;
        positions[i + 1] = (Math.random() - 0.5) * 4;
      }
    }
    
    pressureField.geometry.attributes.position.needsUpdate = true;
  };

  // Show fallback if WebGL is not available
  if (webglAvailable === false) {
    return <WebGLFallback className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-4 left-4 z-10 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3">
        <h3 className="text-white font-semibold mb-2">Advanced 3D Visualization</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <div>Model: {modelType}</div>
          <div>Velocity: {currentData?.velocity.toFixed(1) || '0.0'} m/s</div>
          <div>Drag: {currentData?.dragCoefficient.toFixed(3) || '0.000'}</div>
          <div>Lift: {currentData?.liftCoefficient.toFixed(3) || '0.000'}</div>
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