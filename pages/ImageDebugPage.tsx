import React, { useState, useEffect } from 'react';

const ImageDebugPage: React.FC = () => {
  const [debug, setDebug] = useState<any>({});

  useEffect(() => {
    checkImageSetup();
  }, []);

  const checkImageSetup = async () => {
    try {
      const settingsStr = localStorage.getItem('core_dna_settings');
      if (!settingsStr) {
        setDebug({ error: 'No settings in localStorage' });
        return;
      }

      const settings = JSON.parse(settingsStr);
      const activeImageGen = settings.activeImageGen;
      const imageProviders = settings.image || {};

      let result: any = {
        activeImageGen,
        availableProviders: Object.keys(imageProviders),
        activeProviderConfig: imageProviders[activeImageGen] || null,
        allImageConfigs: imageProviders
      };

      // Try to generate a test image
      if (!activeImageGen || !imageProviders[activeImageGen]?.apiKey) {
        result.error = 'No image provider configured with API key';
        setDebug(result);
        return;
      }

      result.testingImage = true;
      setDebug(result);

      // Try import and call
      const { generateImage } = await import('../services/mediaGenerationService');
      const testResult = await generateImage('A simple red square on white background');
      
      result.testImageSuccess = true;
      result.testImageUrl = testResult.url;
      result.testProvider = testResult.provider;
      setDebug(result);

    } catch (e: any) {
      setDebug(prev => ({ ...prev, error: e.message, stack: e.stack }));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🖼️ Image Generation Debug</h1>

        <div className="bg-gray-900 p-6 rounded-lg mb-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Configuration Check</h2>
          <pre className="bg-black p-4 rounded overflow-auto text-sm">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>

        {debug.testImageSuccess && (
          <div className="bg-green-900/20 border border-green-500 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold text-green-300 mb-4">✅ Image Generation Works!</h2>
            <p className="text-green-200 mb-4">Provider: {debug.testProvider}</p>
            <img 
              src={debug.testImageUrl} 
              alt="Test" 
              className="max-w-md h-auto border border-green-500 rounded"
            />
          </div>
        )}

        {debug.error && (
          <div className="bg-red-900/20 border border-red-500 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold text-red-300 mb-4">❌ Error</h2>
            <p className="text-red-200 mb-2">Message: {debug.error}</p>
            {debug.stack && (
              <pre className="bg-black p-4 rounded text-xs text-red-300 overflow-auto">
                {debug.stack}
              </pre>
            )}
          </div>
        )}

        <button
          onClick={checkImageSetup}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
        >
          Re-check Setup
        </button>
      </div>
    </div>
  );
};

export default ImageDebugPage;
