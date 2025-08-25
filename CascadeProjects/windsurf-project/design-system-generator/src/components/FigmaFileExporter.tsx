'use client';

import { useState } from 'react';
import { Tokens } from '@/lib/tokens';
import { FigmaFileGenerator } from '@/lib/figma-file-generator';

interface FigmaFileExporterProps {
  tokens: Tokens;
}

export function FigmaFileExporter({ tokens }: FigmaFileExporterProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportFigmaFile = async () => {
    setIsGenerating(true);
    
    try {
      const generator = new FigmaFileGenerator();
      const figmaFileContent = generator.generateFigmaFile(tokens);
      
      // Create and download the .fig file
      const blob = new Blob([figmaFileContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'design-system-components.fig';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Figma file:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Export Figma Components</h2>
      
      <div className="bg-purple-50 p-4 rounded-md mb-6">
        <h3 className="font-medium text-purple-900 mb-2">Native Figma Components:</h3>
        <ul className="text-purple-800 space-y-1 text-sm">
          <li>• <strong>Auto Layout</strong> - Components resize automatically</li>
          <li>• <strong>Responsive</strong> - Proper constraints and sizing</li>
          <li>• <strong>Text Auto-Resize</strong> - Text adapts to content</li>
          <li>• <strong>Component Properties</strong> - Variants and states</li>
          <li>• <strong>Design Tokens</strong> - All colors and typography as styles</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Components Included:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <strong>Buttons</strong>
              <ul className="mt-1 text-gray-600">
                <li>• Primary</li>
                <li>• Secondary</li>
                <li>• Danger</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>Text Fields</strong>
              <ul className="mt-1 text-gray-600">
                <li>• Default</li>
                <li>• Error State</li>
                <li>• Disabled</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>Cards</strong>
              <ul className="mt-1 text-gray-600">
                <li>• Default</li>
                <li>• Elevated</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">How to Use:</h4>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Click "Export Figma File" to download the .fig file</li>
            <li>2. Open Figma and drag the .fig file directly into your canvas</li>
            <li>3. Components will be imported with full functionality</li>
            <li>4. Find components in the Assets panel for reuse</li>
            <li>5. Components have auto layout, constraints, and responsive behavior</li>
          </ol>
        </div>

        <button
          onClick={handleExportFigmaFile}
          disabled={isGenerating}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating Figma File...
            </>
          ) : (
            <>
              📁 Export Figma File
            </>
          )}
        </button>
      </div>
    </div>
  );
}
