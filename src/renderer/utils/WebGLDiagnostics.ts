export interface WebGLDiagnostics {
  supported: boolean;
  version: string;
  vendor: string;
  renderer: string;
  maxTextureSize: number;
  maxViewportDims: [number, number];
  extensions: string[];
  capabilities: {
    maxVertexAttribs: number;
    maxVertexUniformVectors: number;
    maxVaryingVectors: number;
    maxCombinedTextureImageUnits: number;
    maxVertexTextureImageUnits: number;
    maxTextureImageUnits: number;
    maxFragmentUniformVectors: number;
    aliasedLineWidthRange: [number, number];
    aliasedPointSizeRange: [number, number];
    maxViewportDims: [number, number];
    maxRenderbufferSize: number;
  };
  errors: string[];
  warnings: string[];
}

export const runWebGLDiagnostics = (): WebGLDiagnostics => {
  const diagnostics: WebGLDiagnostics = {
    supported: false,
    version: 'none',
    vendor: 'unknown',
    renderer: 'unknown',
    maxTextureSize: 0,
    maxViewportDims: [0, 0],
    extensions: [],
    capabilities: {
      maxVertexAttribs: 0,
      maxVertexUniformVectors: 0,
      maxVaryingVectors: 0,
      maxCombinedTextureImageUnits: 0,
      maxVertexTextureImageUnits: 0,
      maxTextureImageUnits: 0,
      maxFragmentUniformVectors: 0,
      aliasedLineWidthRange: [0, 0],
      aliasedPointSizeRange: [0, 0],
      maxViewportDims: [0, 0],
      maxRenderbufferSize: 0,
    },
    errors: [],
    warnings: []
  };

  try {
    // Create canvas and get WebGL context
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    const gl = canvas.getContext('webgl2') || 
               canvas.getContext('webgl') || 
               canvas.getContext('experimental-webgl') as WebGLRenderingContext | WebGL2RenderingContext | null;

    if (!gl) {
      diagnostics.errors.push('No WebGL context available');
      return diagnostics;
    }

    diagnostics.supported = true;
    diagnostics.version = gl.getParameter(gl.VERSION) || 'unknown';

    // Get vendor and renderer info
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      diagnostics.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown';
      diagnostics.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
    } else {
      diagnostics.warnings.push('WEBGL_debug_renderer_info extension not available');
    }

    // Get basic capabilities
    diagnostics.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
    diagnostics.maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) || [0, 0];

    // Get available extensions
    if ('getSupportedExtensions' in gl) {
      const supportedExtensions = gl.getSupportedExtensions();
      if (supportedExtensions) {
        diagnostics.extensions = supportedExtensions;
      }
    } else {
      diagnostics.warnings.push('Extension enumeration not supported');
    }

    // Get detailed capabilities
    diagnostics.capabilities = {
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS) || 0,
      maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) || 0,
      maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS) || 0,
      maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) || 0,
      maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) || 0,
      maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) || 0,
      maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) || 0,
      aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE) || [0, 0],
      aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) || [0, 0],
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS) || [0, 0],
      maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) || 0,
    };

    // Check for common issues
    if (diagnostics.maxTextureSize < 1024) {
      diagnostics.warnings.push('Low maximum texture size detected');
    }

    if (diagnostics.capabilities.maxVertexAttribs < 8) {
      diagnostics.warnings.push('Limited vertex attributes support');
    }

    if (diagnostics.capabilities.maxCombinedTextureImageUnits < 8) {
      diagnostics.warnings.push('Limited texture units support');
    }

    // Check for software rendering
    if (diagnostics.renderer.toLowerCase().includes('swiftshader') || 
        diagnostics.renderer.toLowerCase().includes('software') ||
        diagnostics.renderer.toLowerCase().includes('llvmpipe')) {
      diagnostics.warnings.push('Software rendering detected - performance may be limited');
    }

    // Check for known problematic drivers
    if (diagnostics.vendor.toLowerCase().includes('intel') && 
        diagnostics.renderer.toLowerCase().includes('hd graphics')) {
      diagnostics.warnings.push('Intel HD Graphics detected - may have WebGL limitations');
    }

    console.log('🔍 WebGL Diagnostics:', diagnostics);

  } catch (error) {
    diagnostics.errors.push(`WebGL diagnostics failed: ${(error as Error).message}`);
    console.error('❌ WebGL diagnostics error:', error);
  }

  return diagnostics;
};

export const testThreeJSWebGL = (): { success: boolean; error?: string; info?: any } => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: false,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false,
      preserveDrawingBuffer: false,
      stencil: false,
      depth: true
    });

    // Test basic Three.js functionality
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    camera.position.z = 5;

    renderer.render(scene, camera);
    renderer.dispose();

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
};


// Import Three.js for the test function
import * as THREE from 'three'; 