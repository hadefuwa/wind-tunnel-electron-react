export interface GPUDiagnostics {
  gpuInfo: {
    vendor: string;
    renderer: string;
    version: string;
  };
  webglSupport: {
    webgl1: boolean;
    webgl2: boolean;
    experimental: boolean;
  };
  capabilities: {
    maxTextureSize: number;
    maxViewportDims: [number, number];
    maxRenderbufferSize: number;
    maxVertexAttribs: number;
    maxVertexUniformVectors: number;
    maxFragmentUniformVectors: number;
  };
  extensions: string[];
  issues: string[];
  recommendations: string[];
}

export const runGPUDiagnostics = (): GPUDiagnostics => {
  const diagnostics: GPUDiagnostics = {
    gpuInfo: {
      vendor: 'Unknown',
      renderer: 'Unknown',
      version: 'Unknown'
    },
    webglSupport: {
      webgl1: false,
      webgl2: false,
      experimental: false
    },
    capabilities: {
      maxTextureSize: 0,
      maxViewportDims: [0, 0],
      maxRenderbufferSize: 0,
      maxVertexAttribs: 0,
      maxVertexUniformVectors: 0,
      maxFragmentUniformVectors: 0
    },
    extensions: [],
    issues: [],
    recommendations: []
  };

  try {
    // Test WebGL1
    const canvas1 = document.createElement('canvas');
    const gl1 = canvas1.getContext('webgl') || canvas1.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (gl1) {
      diagnostics.webglSupport.webgl1 = true;
      diagnostics.gpuInfo.version = gl1.getParameter(gl1.VERSION) || 'Unknown';
      
      const debugInfo = gl1.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        diagnostics.gpuInfo.vendor = gl1.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown';
        diagnostics.gpuInfo.renderer = gl1.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown';
      }
      
      // Get capabilities
      diagnostics.capabilities.maxTextureSize = gl1.getParameter(gl1.MAX_TEXTURE_SIZE) || 0;
      diagnostics.capabilities.maxViewportDims = gl1.getParameter(gl1.MAX_VIEWPORT_DIMS) || [0, 0];
      diagnostics.capabilities.maxRenderbufferSize = gl1.getParameter(gl1.MAX_RENDERBUFFER_SIZE) || 0;
      diagnostics.capabilities.maxVertexAttribs = gl1.getParameter(gl1.MAX_VERTEX_ATTRIBS) || 0;
      diagnostics.capabilities.maxVertexUniformVectors = gl1.getParameter(gl1.MAX_VERTEX_UNIFORM_VECTORS) || 0;
      diagnostics.capabilities.maxFragmentUniformVectors = gl1.getParameter(gl1.MAX_FRAGMENT_UNIFORM_VECTORS) || 0;
      
      // Get extensions
      if ('getSupportedExtensions' in gl1) {
        const extensions = gl1.getSupportedExtensions();
        if (extensions) {
          diagnostics.extensions = extensions;
        }
      }
    }

    // Test WebGL2
    const canvas2 = document.createElement('canvas');
    const gl2 = canvas2.getContext('webgl2') as WebGL2RenderingContext | null;
    
    if (gl2) {
      diagnostics.webglSupport.webgl2 = true;
    }

    // Analyze for issues
    analyzeIssues(diagnostics);

  } catch (error) {
    diagnostics.issues.push(`Diagnostics failed: ${(error as Error).message}`);
  }

  return diagnostics;
};

const analyzeIssues = (diagnostics: GPUDiagnostics): void => {
  // Check for software rendering
  const renderer = diagnostics.gpuInfo.renderer.toLowerCase();
  if (renderer.includes('swiftshader') || renderer.includes('software') || renderer.includes('llvmpipe')) {
    diagnostics.issues.push('Software rendering detected - performance will be limited');
    diagnostics.recommendations.push('Consider updating GPU drivers or using hardware acceleration');
  }

  // Check for Intel HD Graphics issues
  if (diagnostics.gpuInfo.vendor.toLowerCase().includes('intel') && 
      renderer.includes('hd graphics')) {
    diagnostics.issues.push('Intel HD Graphics detected - known WebGL compatibility issues');
    diagnostics.recommendations.push('Update Intel graphics drivers to latest version');
  }

  // Check for low capabilities
  if (diagnostics.capabilities.maxTextureSize < 1024) {
    diagnostics.issues.push('Low maximum texture size detected');
    diagnostics.recommendations.push('This may limit 3D rendering quality');
  }

  if (diagnostics.capabilities.maxVertexAttribs < 8) {
    diagnostics.issues.push('Limited vertex attributes support');
    diagnostics.recommendations.push('Complex 3D models may not render correctly');
  }

  // Check for missing WebGL support
  if (!diagnostics.webglSupport.webgl1 && !diagnostics.webglSupport.webgl2) {
    diagnostics.issues.push('No WebGL support detected');
    diagnostics.recommendations.push('WebGL may be disabled in browser settings or GPU drivers');
    diagnostics.recommendations.push('Try updating GPU drivers or enabling hardware acceleration');
  }

  // Check for specific GPU issues
  if (renderer.includes('radeon') && renderer.includes('hd 7')) {
    diagnostics.issues.push('AMD Radeon HD 7000 series detected - known WebGL issues');
    diagnostics.recommendations.push('Update AMD graphics drivers or consider using 2D fallback');
  }

  if (renderer.includes('geforce') && (renderer.includes('gtx 4') || renderer.includes('gtx 5'))) {
    diagnostics.issues.push('Older NVIDIA GPU detected - may have WebGL limitations');
    diagnostics.recommendations.push('Update NVIDIA graphics drivers for better WebGL support');
  }

  // Add general recommendations
  if (diagnostics.issues.length > 0) {
    diagnostics.recommendations.push('The application will use 2D fallback mode for better compatibility');
    diagnostics.recommendations.push('Check browser console for detailed error messages');
  }
};

export const getGPUSummary = (diagnostics: GPUDiagnostics): string => {
  const parts = [];
  
  if (diagnostics.gpuInfo.vendor !== 'Unknown') {
    parts.push(`${diagnostics.gpuInfo.vendor} ${diagnostics.gpuInfo.renderer}`);
  }
  
  if (diagnostics.webglSupport.webgl2) {
    parts.push('WebGL2');
  } else if (diagnostics.webglSupport.webgl1) {
    parts.push('WebGL1');
  } else {
    parts.push('No WebGL');
  }
  
  if (diagnostics.issues.length > 0) {
    parts.push(`${diagnostics.issues.length} issues detected`);
  }
  
  return parts.join(' | ');
}; 