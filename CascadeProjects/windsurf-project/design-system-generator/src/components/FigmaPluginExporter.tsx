'use client';

import { useState } from 'react';
import { Tokens } from '@/lib/tokens';

interface FigmaPluginExporterProps {
  tokens: Tokens;
}

export function FigmaPluginExporter({ tokens }: FigmaPluginExporterProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePluginCode = (tokens: Tokens): string => {
    return `// Auto-generated Figma Plugin Code
figma.showUI(__html__, { width: 320, height: 200 });

const tokens = ${JSON.stringify(tokens, null, 2)};

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    try {
      // Create or get the design system page
      let page = figma.root.children.find(p => p.name === 'Design System Components') as PageNode;
      if (!page) {
        page = figma.createPage();
        page.name = 'Design System Components';
      }
      figma.currentPage = page;

      // Clear existing nodes
      page.children.forEach((node) => node.remove());

      // Create styles
      createStyles(tokens);

      let xOffset = 50;
      const yOffset = 50;

      // Generate components with auto layout
      createButtonComponents(tokens, xOffset, yOffset);
      xOffset += 200;
      
      createTextFieldComponents(tokens, xOffset, yOffset);
      xOffset += 300;
      
      createCardComponents(tokens, xOffset, yOffset);

      // Zoom to fit
      figma.viewport.scrollAndZoomIntoView(page.children);
      
      figma.ui.postMessage({ type: 'complete' });
    } catch (error) {
      figma.ui.postMessage({ type: 'error', message: error.message });
    }
  }
};

function hexToRgb(hex) {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

function createStyles(tokens) {
  // Create color styles
  Object.entries(tokens.colors).forEach(([category, shades]) => {
    Object.entries(shades).forEach(([shade, value]) => {
      const styleName = \`\${category}/\${shade}\`;
      const existingStyle = figma.getLocalPaintStyles().find(s => s.name === styleName);
      if (existingStyle) return;

      const style = figma.createPaintStyle();
      style.name = styleName;
      style.paints = [{ type: 'SOLID', color: hexToRgb(value) }];
    });
  });

  // Create text styles
  Object.entries(tokens.typography).forEach(([name, typo]) => {
    const styleName = \`Text/\${name}\`;
    const existingStyle = figma.getLocalTextStyles().find(s => s.name === styleName);
    if (existingStyle) return;

    const style = figma.createTextStyle();
    style.name = styleName;
    style.fontSize = typo.fontSize;
    style.fontName = { family: typo.fontFamily, style: 'Regular' };
    style.lineHeight = { value: typo.lineHeight, unit: 'PIXELS' };
  });
}

function createButtonComponents(tokens, x, y) {
  const variants = ['primary', 'secondary', 'danger'];
  
  variants.forEach((variant, index) => {
    const button = createAutoLayoutButton(tokens, variant);
    button.x = x;
    button.y = y + (index * 80);
    
    const component = figma.createComponent();
    component.appendChild(button);
    component.name = \`Button/\${variant}\`;
    component.x = x;
    component.y = y + (index * 80);
    figma.currentPage.appendChild(component);
  });
}

function createAutoLayoutButton(tokens, variant) {
  const frame = figma.createFrame();
  frame.name = \`Button-\${variant}\`;
  frame.layoutMode = 'HORIZONTAL';
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  frame.primaryAxisAlignItems = 'CENTER';
  frame.counterAxisAlignItems = 'CENTER';
  frame.paddingLeft = tokens.spacing.md;
  frame.paddingRight = tokens.spacing.md;
  frame.paddingTop = tokens.spacing.sm;
  frame.paddingBottom = tokens.spacing.sm;
  frame.cornerRadius = tokens.radii.md;
  
  // Set colors based on variant
  let bgColor, textColor;
  switch (variant) {
    case 'primary':
      bgColor = hexToRgb(tokens.colors.primary['500']);
      textColor = hexToRgb(tokens.colors.neutral['0']);
      break;
    case 'secondary':
      bgColor = hexToRgb(tokens.colors.neutral['50']);
      textColor = hexToRgb(tokens.colors.neutral['900']);
      frame.strokes = [{ type: 'SOLID', color: hexToRgb(tokens.colors.neutral['900']) }];
      frame.strokeWeight = 1;
      break;
    case 'danger':
      bgColor = hexToRgb(tokens.colors.danger['500']);
      textColor = hexToRgb(tokens.colors.neutral['0']);
      break;
    default:
      bgColor = hexToRgb(tokens.colors.primary['500']);
      textColor = hexToRgb(tokens.colors.neutral['0']);
  }
  
  frame.fills = [{ type: 'SOLID', color: bgColor }];
  
  // Create text with auto-resize
  const text = figma.createText();
  text.characters = \`\${variant.charAt(0).toUpperCase() + variant.slice(1)} Button\`;
  text.fontSize = tokens.typography.label.fontSize;
  text.fontName = { family: tokens.typography.label.fontFamily, style: 'Regular' };
  text.fills = [{ type: 'SOLID', color: textColor }];
  text.textAlignHorizontal = 'CENTER';
  text.textAlignVertical = 'CENTER';
  text.textAutoResize = 'WIDTH_AND_HEIGHT';
  
  frame.appendChild(text);
  return frame;
}

function createTextFieldComponents(tokens, x, y) {
  const variants = ['default', 'error', 'disabled'];
  
  variants.forEach((variant, index) => {
    const textField = createAutoLayoutTextField(tokens, variant);
    textField.x = x;
    textField.y = y + (index * 120);
    
    const component = figma.createComponent();
    component.appendChild(textField);
    component.name = \`TextField/\${variant}\`;
    component.x = x;
    component.y = y + (index * 120);
    figma.currentPage.appendChild(component);
  });
}

function createAutoLayoutTextField(tokens, variant) {
  const container = figma.createFrame();
  container.name = \`TextField-\${variant}\`;
  container.layoutMode = 'VERTICAL';
  container.primaryAxisSizingMode = 'AUTO';
  container.counterAxisSizingMode = 'FIXED';
  container.primaryAxisAlignItems = 'MIN';
  container.counterAxisAlignItems = 'STRETCH';
  container.itemSpacing = tokens.spacing.xs;
  container.fills = [];
  container.resize(250, 1); // Will auto-size based on content
  
  // Create label
  const label = figma.createText();
  label.characters = 'Label Text';
  label.fontSize = tokens.typography.label.fontSize;
  label.fontName = { family: tokens.typography.label.fontFamily, style: 'Regular' };
  label.fills = [{ type: 'SOLID', color: hexToRgb(tokens.colors.neutral['900']) }];
  label.textAutoResize = 'WIDTH_AND_HEIGHT';
  
  container.appendChild(label);
  
  // Create input field
  const input = figma.createFrame();
  input.name = 'Input';
  input.layoutMode = 'HORIZONTAL';
  input.primaryAxisSizingMode = 'FIXED';
  input.counterAxisSizingMode = 'AUTO';
  input.primaryAxisAlignItems = 'CENTER';
  input.counterAxisAlignItems = 'CENTER';
  input.paddingLeft = tokens.spacing.sm;
  input.paddingRight = tokens.spacing.sm;
  input.paddingTop = tokens.spacing.xs;
  input.paddingBottom = tokens.spacing.xs;
  input.resize(250, 40);
  input.cornerRadius = tokens.radii.sm;
  
  const bgColor = variant === 'disabled' 
    ? hexToRgb(tokens.colors.neutral['50'])
    : hexToRgb(tokens.colors.neutral['0']);
  
  input.fills = [{ type: 'SOLID', color: bgColor }];
  
  const borderColor = variant === 'error' 
    ? hexToRgb(tokens.colors.danger['500'])
    : hexToRgb(tokens.colors.neutral['50']);
  
  input.strokes = [{ type: 'SOLID', color: borderColor }];
  input.strokeWeight = 1;
  
  // Add placeholder text
  const placeholder = figma.createText();
  placeholder.characters = 'Placeholder text';
  placeholder.fontSize = tokens.typography.body.fontSize;
  placeholder.fontName = { family: tokens.typography.body.fontFamily, style: 'Regular' };
  placeholder.fills = [{ type: 'SOLID', color: hexToRgb(tokens.colors.neutral['900']) }];
  placeholder.opacity = variant === 'disabled' ? 0.5 : 1;
  placeholder.textAutoResize = 'WIDTH_AND_HEIGHT';
  
  input.appendChild(placeholder);
  container.appendChild(input);
  
  // Add error message for error variant
  if (variant === 'error') {
    const errorMsg = figma.createText();
    errorMsg.characters = 'Error message here';
    errorMsg.fontSize = tokens.typography.label.fontSize;
    errorMsg.fontName = { family: tokens.typography.label.fontFamily, style: 'Regular' };
    errorMsg.fills = [{ type: 'SOLID', color: hexToRgb(tokens.colors.danger['500']) }];
    errorMsg.textAutoResize = 'WIDTH_AND_HEIGHT';
    
    container.appendChild(errorMsg);
  }
  
  return container;
}

function createCardComponents(tokens, x, y) {
  const variants = ['default', 'elevated'];
  
  variants.forEach((variant, index) => {
    const card = createAutoLayoutCard(tokens, variant);
    card.x = x;
    card.y = y + (index * 200);
    
    const component = figma.createComponent();
    component.appendChild(card);
    component.name = \`Card/\${variant}\`;
    component.x = x;
    component.y = y + (index * 200);
    figma.currentPage.appendChild(component);
  });
}

function createAutoLayoutCard(tokens, variant) {
  const card = figma.createFrame();
  card.name = \`Card-\${variant}\`;
  card.layoutMode = 'VERTICAL';
  card.primaryAxisSizingMode = 'AUTO';
  card.counterAxisSizingMode = 'FIXED';
  card.primaryAxisAlignItems = 'MIN';
  card.counterAxisAlignItems = 'STRETCH';
  card.itemSpacing = tokens.spacing.sm;
  card.paddingTop = tokens.spacing.md;
  card.paddingRight = tokens.spacing.md;
  card.paddingBottom = tokens.spacing.md;
  card.paddingLeft = tokens.spacing.md;
  card.resize(280, 1); // Will auto-size based on content
  card.cornerRadius = tokens.radii.lg;
  
  // Set background
  card.fills = [{ type: 'SOLID', color: hexToRgb(tokens.colors.neutral['0']) }];
  
  // Add shadow effect
  const shadowLevel = variant === 'elevated' ? '2' : '1';
  const shadow = tokens.elevation[shadowLevel];
  const shadowColor = hexToRgb(shadow.color);
  
  card.effects = [{
    type: 'DROP_SHADOW',
    color: { ...shadowColor, a: 0.1 },
    offset: { x: shadow.x, y: shadow.y },
    radius: shadow.blur,
    spread: shadow.spread,
    visible: true,
    blendMode: 'NORMAL'
  }];
  
  // Add title
  const title = figma.createText();
  title.characters = 'Card Title';
  title.fontSize = tokens.typography.body.fontSize;
  title.fontName = { family: tokens.typography.label.fontFamily, style: 'Regular' };
  title.fills = [{ type: 'SOLID', color: hexToRgb(tokens.colors.neutral['900']) }];
  title.textAutoResize = 'WIDTH_AND_HEIGHT';
  
  card.appendChild(title);
  
  // Add content
  const content = figma.createText();
  content.characters = 'This is the card content area. You can add any content here.';
  content.fontSize = tokens.typography.body.fontSize;
  content.fontName = { family: tokens.typography.body.fontFamily, style: 'Regular' };
  content.fills = [{ type: 'SOLID', color: hexToRgb(tokens.colors.neutral['900']) }];
  content.textAutoResize = 'WIDTH_AND_HEIGHT';
  
  card.appendChild(content);
  
  return card;
}`;
  };

  const generatePluginUI = (): string => {
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0; 
      padding: 20px; 
      background: #f8f9fa;
    }
    .container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }
    .description {
      font-size: 12px;
      color: #666;
      margin: 0;
    }
    .button {
      background: #18a0fb;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    .button:hover {
      background: #1592e6;
    }
    .status {
      font-size: 12px;
      padding: 8px 12px;
      border-radius: 4px;
      margin: 0;
    }
    .status.success {
      background: #e8f5e8;
      color: #2d5a2d;
    }
    .status.error {
      background: #fef2f2;
      color: #991b1b;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="title">Design System Generator</h1>
    <p class="description">Generate components with auto layout and responsive properties</p>
    
    <button class="button" onclick="generateComponents()">
      Generate Components
    </button>
    
    <div id="status" style="display: none;"></div>
  </div>

  <script>
    function generateComponents() {
      const statusEl = document.getElementById('status');
      statusEl.style.display = 'block';
      statusEl.className = 'status';
      statusEl.textContent = 'Generating components...';
      
      parent.postMessage({ pluginMessage: { type: 'generate' } }, '*');
    }

    window.addEventListener('message', (event) => {
      const { type, message } = event.data.pluginMessage;
      const statusEl = document.getElementById('status');
      
      if (type === 'complete') {
        statusEl.className = 'status success';
        statusEl.textContent = 'Components generated successfully! Check the "Design System Components" page.';
      } else if (type === 'error') {
        statusEl.className = 'status error';
        statusEl.textContent = \`Error: \${message}\`;
      }
    });
  </script>
</body>
</html>`;
  };

  const generateManifest = (): string => {
    return JSON.stringify({
      "name": "Design System Generator",
      "id": "design-system-generator",
      "api": "1.0.0",
      "main": "code.js",
      "ui": "ui.html",
      "capabilities": [],
      "enableProposedApi": false,
      "editorType": [
        "figma"
      ],
      "networkAccess": {
        "allowedDomains": [
          "none"
        ]
      }
    }, null, 2);
  };

  const handleExportPlugin = async () => {
    setIsGenerating(true);
    
    try {
      // Create plugin files
      const pluginCode = generatePluginCode(tokens);
      const pluginUI = generatePluginUI();
      const manifest = generateManifest();
      
      // Create ZIP file with plugin files
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      zip.file('code.js', pluginCode);
      zip.file('ui.html', pluginUI);
      zip.file('manifest.json', manifest);
      
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Download the plugin
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'design-system-generator-plugin.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating plugin:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Download Figma Plugin</h2>
      
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <h3 className="font-medium text-blue-900 mb-2">Figma Plugin Solution:</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• <strong>Real Auto Layout</strong> - Components with proper responsive behavior</li>
          <li>• <strong>Native Components</strong> - Created directly in Figma</li>
          <li>• <strong>Design Tokens</strong> - All styles automatically created</li>
          <li>• <strong>One-Click Generation</strong> - Install once, use forever</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">What You Get:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <strong>Auto Layout Buttons</strong>
              <ul className="mt-1 text-gray-600">
                <li>• Resize with content</li>
                <li>• Proper padding</li>
                <li>• All variants</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>Responsive TextFields</strong>
              <ul className="mt-1 text-gray-600">
                <li>• Vertical auto layout</li>
                <li>• Error states</li>
                <li>• Auto-sizing</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>Flexible Cards</strong>
              <ul className="mt-1 text-gray-600">
                <li>• Content-based sizing</li>
                <li>• Drop shadows</li>
                <li>• Responsive layout</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">How to Install:</h4>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Click "Download Plugin" to get the plugin ZIP file</li>
            <li>2. Extract the ZIP file to a folder</li>
            <li>3. In Figma: Plugins → Development → Import plugin from manifest</li>
            <li>4. Select the manifest.json file from the extracted folder</li>
            <li>5. Run: Plugins → Development → Design System Generator</li>
          </ol>
        </div>

        <button
          onClick={handleExportPlugin}
          disabled={isGenerating}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating Plugin...
            </>
          ) : (
            <>
              🔌 Download Plugin
            </>
          )}
        </button>
      </div>
    </div>
  );
}
