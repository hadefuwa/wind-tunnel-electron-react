import React, { useEffect, useState } from 'react';
import { runWebGLDiagnostics, testThreeJSWebGL } from '../../utils/WebGLDiagnostics';
import { runGPUDiagnostics, getGPUSummary } from '../../utils/GPUDiagnostics';

export const WebGLTest: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [gpuDiagnostics, setGpuDiagnostics] = useState<any>(null);
  const [threeJSTest, setThreeJSTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = () => {
      console.log('🧪 Running WebGL diagnostics...');
      
      // Run WebGL diagnostics
      const webglDiagnostics = runWebGLDiagnostics();
      setDiagnostics(webglDiagnostics);
      
      // Run GPU diagnostics
      const gpuDiag = runGPUDiagnostics();
      setGpuDiagnostics(gpuDiag);
      
      // Run Three.js test
      const threeTest = testThreeJSWebGL();
      setThreeJSTest(threeTest);
      
      setLoading(false);
      
      console.log('📊 WebGL Diagnostics:', webglDiagnostics);
      console.log('🎮 GPU Diagnostics:', gpuDiag);
      console.log('🎯 Three.js Test:', threeTest);
    };

    runTests();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
        <div className="text-center mt-2 text-gray-400">Running WebGL tests...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 rounded-lg space-y-4">
      <h3 className="text-white font-semibold">WebGL Diagnostics</h3>
      
      {/* WebGL Support Status */}
      <div className="bg-gray-800 rounded p-3">
        <div className="text-sm text-gray-300 mb-2">WebGL Support</div>
        <div className={`text-lg font-mono ${diagnostics?.supported ? 'text-green-400' : 'text-red-400'}`}>
          {diagnostics?.supported ? '✅ Supported' : '❌ Not Supported'}
        </div>
      </div>

      {/* WebGL Version */}
      <div className="bg-gray-800 rounded p-3">
        <div className="text-sm text-gray-300 mb-2">Version</div>
        <div className="text-white font-mono">{diagnostics?.version || 'Unknown'}</div>
      </div>

      {/* GPU Summary */}
      <div className="bg-gray-800 rounded p-3">
        <div className="text-sm text-gray-300 mb-2">GPU Summary</div>
        <div className="text-white text-sm font-mono">
          {gpuDiagnostics ? getGPUSummary(gpuDiagnostics) : 'Loading...'}
        </div>
      </div>

      {/* Vendor & Renderer */}
      <div className="bg-gray-800 rounded p-3">
        <div className="text-sm text-gray-300 mb-2">Hardware Details</div>
        <div className="text-white text-sm">
          <div>Vendor: {gpuDiagnostics?.gpuInfo?.vendor || diagnostics?.vendor || 'Unknown'}</div>
          <div>Renderer: {gpuDiagnostics?.gpuInfo?.renderer || diagnostics?.renderer || 'Unknown'}</div>
          <div>Version: {gpuDiagnostics?.gpuInfo?.version || diagnostics?.version || 'Unknown'}</div>
        </div>
      </div>

      {/* Three.js Test */}
      <div className="bg-gray-800 rounded p-3">
        <div className="text-sm text-gray-300 mb-2">Three.js Test</div>
        <div className={`text-lg font-mono ${threeJSTest?.success ? 'text-green-400' : 'text-red-400'}`}>
          {threeJSTest?.success ? '✅ Passed' : '❌ Failed'}
        </div>
        {threeJSTest?.error && (
          <div className="text-red-300 text-sm mt-1">{threeJSTest.error}</div>
        )}
      </div>

      {/* GPU Issues */}
      {gpuDiagnostics?.issues && gpuDiagnostics.issues.length > 0 && (
        <div className="bg-red-900/50 rounded p-3">
          <div className="text-sm text-red-300 mb-2">❌ GPU Issues</div>
          <ul className="text-red-200 text-sm space-y-1">
            {gpuDiagnostics.issues.map((issue: string, index: number) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* GPU Recommendations */}
      {gpuDiagnostics?.recommendations && gpuDiagnostics.recommendations.length > 0 && (
        <div className="bg-blue-900/50 rounded p-3">
          <div className="text-sm text-blue-300 mb-2">💡 Recommendations</div>
          <ul className="text-blue-200 text-sm space-y-1">
            {gpuDiagnostics.recommendations.map((rec: string, index: number) => (
              <li key={index}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {diagnostics?.warnings && diagnostics.warnings.length > 0 && (
        <div className="bg-yellow-900/50 rounded p-3">
          <div className="text-sm text-yellow-300 mb-2">⚠️ Warnings</div>
          <ul className="text-yellow-200 text-sm space-y-1">
            {diagnostics.warnings.map((warning: string, index: number) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Errors */}
      {diagnostics?.errors && diagnostics.errors.length > 0 && (
        <div className="bg-red-900/50 rounded p-3">
          <div className="text-sm text-red-300 mb-2">❌ Errors</div>
          <ul className="text-red-200 text-sm space-y-1">
            {diagnostics.errors.map((error: string, index: number) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Capabilities */}
      <div className="bg-gray-800 rounded p-3">
        <div className="text-sm text-gray-300 mb-2">Capabilities</div>
        <div className="text-white text-xs space-y-1">
          <div>Max Texture Size: {diagnostics?.maxTextureSize || 0}</div>
          <div>Max Vertex Attribs: {diagnostics?.capabilities?.maxVertexAttribs || 0}</div>
          <div>Max Texture Units: {diagnostics?.capabilities?.maxCombinedTextureImageUnits || 0}</div>
          <div>Max Viewport: {diagnostics?.maxViewportDims?.join(' x ') || '0 x 0'}</div>
        </div>
      </div>

      {/* Extensions */}
      {diagnostics?.extensions && diagnostics.extensions.length > 0 && (
        <div className="bg-gray-800 rounded p-3">
          <div className="text-sm text-gray-300 mb-2">Extensions ({diagnostics.extensions.length})</div>
          <div className="text-white text-xs max-h-32 overflow-y-auto">
            {diagnostics.extensions.slice(0, 10).join(', ')}
            {diagnostics.extensions.length > 10 && ` ... and ${diagnostics.extensions.length - 10} more`}
          </div>
        </div>
      )}
    </div>
  );
}; 