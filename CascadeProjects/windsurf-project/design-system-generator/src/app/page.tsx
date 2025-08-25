'use client';

import { useState } from 'react';
import { validateTokens, Tokens } from '@/lib/tokens';
import { ComponentCustomizer } from '@/components/ComponentCustomizer';
import exampleTokens from '@/data/example-tokens.json';

export default function Home() {
  const [tokens, setTokens] = useState<Tokens>(exampleTokens as Tokens);
  const [showTokenUpload, setShowTokenUpload] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = validateTokens(data);
      
      if (result.success) {
        setTokens(result.data);
      } else {
        console.error('Invalid tokens:', result.error);
      }
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const handleUseExampleTokens = () => {
    setTokens(exampleTokens as Tokens);
    setShowTokenUpload(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Component Customizer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Search, customize, and export components as native Figma components. 
            The revolutionary design tool that bridges browser customization with Figma.
          </p>
        </div>

        {/* Token Upload Section - Simplified */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Design Tokens</h2>
            <button
              onClick={() => setShowTokenUpload(!showTokenUpload)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showTokenUpload ? 'Use Default' : 'Upload Custom'}
            </button>
          </div>
          
          {showTokenUpload ? (
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  Upload your design tokens JSON file
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </label>
              <button
                onClick={handleUseExampleTokens}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back to default tokens
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Using default design tokens with colors, typography, spacing, and more.
            </div>
          )}
        </div>

        {/* Main Component Customizer */}
        <ComponentCustomizer tokens={tokens} />

        {/* Footer */}
        <div className="text-center mt-16 py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Create custom components in your browser, export as native Figma components
          </p>
        </div>
      </div>
    </div>
  );
}
