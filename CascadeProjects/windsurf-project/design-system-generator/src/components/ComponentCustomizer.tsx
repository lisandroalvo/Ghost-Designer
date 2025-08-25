'use client';

import { useState, useEffect } from 'react';
import { Tokens } from '@/lib/tokens';

interface ComponentCustomizerProps {
  tokens: Tokens;
}

interface ComponentStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  cornerRadius: number;
  padding: number;
  fontSize: number;
  width: number;
  height: number;
  borderWidth: number;
  strokeColor: string;
  strokeWidth: number;
  strokePosition: 'inside' | 'outside' | 'center';
}

interface ComponentVariant {
  name: string;
  style: ComponentStyle;
}

interface ComponentWithVariants extends Component {
  variants?: ComponentVariant[];
}

interface Component {
  id: string;
  name: string;
  category: string;
  type: 'button' | 'input' | 'card' | 'badge' | 'avatar' | 'toggle';
  defaultStyle: ComponentStyle;
  tags: string[];
}

const COMPONENT_LIBRARY: Component[] = [
  {
    id: 'btn-primary',
    name: 'Primary Button',
    category: 'Buttons',
    type: 'button',
    tags: ['button', 'primary', 'cta', 'action'],
    defaultStyle: {
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      borderColor: '#3B82F6',
      cornerRadius: 8,
      padding: 12,
      fontSize: 14,
      width: 120,
      height: 40,
      borderWidth: 0,
      strokeColor: '#2563EB',
      strokeWidth: 2,
      strokePosition: 'center'
    }
  },
  {
    id: 'btn-secondary',
    name: 'Secondary Button',
    category: 'Buttons',
    type: 'button',
    tags: ['button', 'secondary', 'outline'],
    defaultStyle: {
      backgroundColor: 'transparent',
      textColor: '#3B82F6',
      borderColor: '#3B82F6',
      cornerRadius: 8,
      padding: 12,
      fontSize: 14,
      width: 120,
      height: 40,
      borderWidth: 1,
      strokeColor: '#3B82F6',
      strokeWidth: 1,
      strokePosition: 'center'
    }
  },
  {
    id: 'input-text',
    name: 'Text Input',
    category: 'Inputs',
    type: 'input',
    tags: ['input', 'text', 'form', 'field'],
    defaultStyle: {
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      borderColor: '#D1D5DB',
      cornerRadius: 6,
      padding: 12,
      fontSize: 14,
      width: 200,
      height: 40,
      borderWidth: 1,
      strokeColor: '#9CA3AF',
      strokeWidth: 1,
      strokePosition: 'center'
    }
  },
  {
    id: 'card-basic',
    name: 'Basic Card',
    category: 'Cards',
    type: 'card',
    tags: ['card', 'container', 'content'],
    defaultStyle: {
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      borderColor: '#E5E7EB',
      cornerRadius: 8,
      padding: 16,
      fontSize: 14,
      width: 300,
      height: 200,
      borderWidth: 1,
      strokeColor: '#D1D5DB',
      strokeWidth: 1,
      strokePosition: 'center'
    }
  },
  {
    id: 'badge-success',
    name: 'Success Badge',
    category: 'Badges',
    type: 'badge',
    tags: ['badge', 'status', 'success', 'label'],
    defaultStyle: {
      backgroundColor: '#10B981',
      textColor: '#FFFFFF',
      borderColor: '#10B981',
      cornerRadius: 16,
      padding: 4,
      fontSize: 12,
      width: 60,
      height: 24,
      borderWidth: 0,
      strokeColor: '#059669',
      strokeWidth: 1,
      strokePosition: 'center'
    }
  },
  {
    id: 'avatar-round',
    name: 'Round Avatar',
    category: 'Avatars',
    type: 'avatar',
    tags: ['avatar', 'profile', 'user', 'image'],
    defaultStyle: {
      backgroundColor: '#6B7280',
      textColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      cornerRadius: 50,
      padding: 0,
      fontSize: 16,
      width: 48,
      height: 48,
      borderWidth: 2,
      strokeColor: '#9CA3AF',
      strokeWidth: 2,
      strokePosition: 'center'
    }
  }
];

export function ComponentCustomizer({ tokens }: ComponentCustomizerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [customStyle, setCustomStyle] = useState<ComponentStyle | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [componentVariants, setComponentVariants] = useState<ComponentVariant[]>([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Set<number>>(new Set());

  const categories = ['All', ...Array.from(new Set(COMPONENT_LIBRARY.map(c => c.category)))];

  const filteredComponents = COMPONENT_LIBRARY.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (selectedComponent) {
      setCustomStyle({ ...selectedComponent.defaultStyle });
      setComponentVariants([]);
      setHasVariants(false);
      setSelectedVariants(new Set());
    }
  }, [selectedComponent]);

  const generateComponentVariants = () => {
    if (!customStyle) return;

    // Generate multiple options for each state following UX/UI best practices
    const variantOptions = {
      default: [
        { name: 'Default', style: { ...customStyle } }
      ],
      hover: [
        {
          name: 'Hover - Subtle',
          style: {
            ...customStyle,
            backgroundColor: adjustColor(customStyle.backgroundColor, -20),
            strokeColor: adjustColor(customStyle.strokeColor, -20)
          }
        },
        {
          name: 'Hover - Lift',
          style: {
            ...customStyle,
            backgroundColor: adjustColor(customStyle.backgroundColor, -25),
            strokeColor: adjustColor(customStyle.strokeColor, -25)
          }
        },
        {
          name: 'Hover - Bright',
          style: {
            ...customStyle,
            backgroundColor: adjustColor(customStyle.backgroundColor, 15),
            strokeColor: adjustColor(customStyle.strokeColor, 15)
          }
        }
      ],
      focus: [
        {
          name: 'Focus - Ring',
          style: {
            ...customStyle,
            strokeWidth: Math.max(customStyle.strokeWidth, 3),
            strokeColor: '#3B82F6',
            strokePosition: 'outside' as const
          }
        },
        {
          name: 'Focus - Glow',
          style: {
            ...customStyle,
            strokeWidth: Math.max(customStyle.strokeWidth, 2),
            strokeColor: '#60A5FA',
            strokePosition: 'outside' as const
          }
        },
        {
          name: 'Focus - Shadow',
          style: {
            ...customStyle,
            strokeWidth: Math.max(customStyle.strokeWidth, 4),
            strokeColor: '#1D4ED8',
            strokePosition: 'outside' as const
          }
        }
      ],
      active: [
        {
          name: 'Active - Pressed',
          style: {
            ...customStyle,
            backgroundColor: adjustColor(customStyle.backgroundColor, -15),
            strokeColor: adjustColor(customStyle.strokeColor, -15)
          }
        },
        {
          name: 'Active - Scale',
          style: {
            ...customStyle,
            backgroundColor: adjustColor(customStyle.backgroundColor, -12),
            strokeColor: adjustColor(customStyle.strokeColor, -12),
            width: Math.max(customStyle.width - 4, 60),
            height: Math.max(customStyle.height - 2, 24)
          }
        },
        {
          name: 'Active - Deep',
          style: {
            ...customStyle,
            backgroundColor: adjustColor(customStyle.backgroundColor, -30),
            strokeColor: adjustColor(customStyle.strokeColor, -30)
          }
        }
      ],
      warning: [
        {
          name: 'Warning - Amber',
          style: {
            ...customStyle,
            backgroundColor: '#F59E0B',
            textColor: '#FFFFFF',
            strokeColor: '#D97706'
          }
        },
        {
          name: 'Warning - Orange',
          style: {
            ...customStyle,
            backgroundColor: '#EA580C',
            textColor: '#FFFFFF',
            strokeColor: '#C2410C'
          }
        },
        {
          name: 'Warning - Yellow',
          style: {
            ...customStyle,
            backgroundColor: '#EAB308',
            textColor: '#000000',
            strokeColor: '#CA8A04'
          }
        }
      ],
      error: [
        {
          name: 'Error - Red',
          style: {
            ...customStyle,
            backgroundColor: '#EF4444',
            textColor: '#FFFFFF',
            strokeColor: '#DC2626'
          }
        },
        {
          name: 'Error - Crimson',
          style: {
            ...customStyle,
            backgroundColor: '#DC2626',
            textColor: '#FFFFFF',
            strokeColor: '#B91C1C'
          }
        }
      ],
      success: [
        {
          name: 'Success - Green',
          style: {
            ...customStyle,
            backgroundColor: '#10B981',
            textColor: '#FFFFFF',
            strokeColor: '#059669'
          }
        },
        {
          name: 'Success - Emerald',
          style: {
            ...customStyle,
            backgroundColor: '#059669',
            textColor: '#FFFFFF',
            strokeColor: '#047857'
          }
        }
      ],
      disabled: [
        {
          name: 'Disabled - Gray',
          style: {
            ...customStyle,
            backgroundColor: '#F3F4F6',
            textColor: '#9CA3AF',
            strokeColor: '#D1D5DB'
          }
        },
        {
          name: 'Disabled - Muted',
          style: {
            ...customStyle,
            backgroundColor: '#E5E7EB',
            textColor: '#6B7280',
            strokeColor: '#9CA3AF'
          }
        }
      ]
    };

    // Flatten all variants into a single array
    const allVariants: ComponentVariant[] = [
      ...variantOptions.default,
      ...variantOptions.hover,
      ...variantOptions.focus,
      ...variantOptions.active,
      ...variantOptions.warning,
      ...variantOptions.error,
      ...variantOptions.success,
      ...variantOptions.disabled
    ];

    setComponentVariants(allVariants);
    setHasVariants(true);
    // Auto-select the default variant
    setSelectedVariants(new Set([0]));
  };

  const toggleVariantSelection = (index: number) => {
    const newSelection = new Set(selectedVariants);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedVariants(newSelection);
  };

  const selectAllVariants = () => {
    setSelectedVariants(new Set(componentVariants.map((_, index) => index)));
  };

  const clearAllVariants = () => {
    setSelectedVariants(new Set([0])); // Keep default selected
  };

  const adjustColor = (color: string, amount: number): string => {
    if (color === 'transparent') return color;
    
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const renderComponent = (component: Component, style: ComponentStyle) => {
    const getStrokeStyle = () => {
      if (style.strokeWidth === 0) return {};
      
      switch (style.strokePosition) {
        case 'outside':
          return {
            boxShadow: `0 0 0 ${style.strokeWidth}px ${style.strokeColor}`
          };
        case 'inside':
          return {
            boxShadow: `inset 0 0 0 ${style.strokeWidth}px ${style.strokeColor}`
          };
        case 'center':
        default:
          return {
            outline: `${style.strokeWidth}px solid ${style.strokeColor}`,
            outlineOffset: '0px'
          };
      }
    };

    const commonStyle = {
      backgroundColor: style.backgroundColor,
      color: style.textColor,
      borderColor: style.borderColor,
      borderRadius: `${style.cornerRadius}px`,
      padding: `${style.padding}px`,
      fontSize: `${style.fontSize}px`,
      width: `${style.width}px`,
      height: `${style.height}px`,
      borderWidth: `${style.borderWidth}px`,
      borderStyle: style.borderWidth > 0 ? 'solid' : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ...getStrokeStyle()
    };

    switch (component.type) {
      case 'button':
        return (
          <button style={commonStyle}>
            {component.name}
          </button>
        );
      case 'input':
        return (
          <input
            style={{
              ...commonStyle,
              justifyContent: 'flex-start',
              paddingLeft: `${style.padding}px`
            }}
            placeholder="Placeholder text"
            readOnly
          />
        );
      case 'card':
        return (
          <div style={commonStyle}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>Card Title</div>
              <div style={{ fontSize: `${style.fontSize - 2}px`, opacity: 0.7 }}>Card content</div>
            </div>
          </div>
        );
      case 'badge':
        return (
          <div style={commonStyle}>
            Success
          </div>
        );
      case 'avatar':
        return (
          <div style={{
            ...commonStyle,
            borderRadius: style.cornerRadius > 25 ? '50%' : `${style.cornerRadius}px`
          }}>
            JD
          </div>
        );
      default:
        return (
          <div style={commonStyle}>
            {component.name}
          </div>
        );
    }
  };

  const generateFigmaPluginCode = (component: Component, style: ComponentStyle, variants?: ComponentVariant[]) => {
    return `
figma.showUI(__html__, { width: 300, height: 200 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-component') {
    try {
      // Load fonts before creating text nodes
      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
      await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
      
      ${variants ? 'const componentSet = await createComponentWithVariants();' : 'const component = await createCustomComponent();'}
      figma.currentPage.appendChild(${variants ? 'componentSet' : 'component'});
      figma.viewport.scrollAndZoomIntoView([${variants ? 'componentSet' : 'component'}]);
      figma.ui.postMessage({ type: 'complete' });
    } catch (error) {
      figma.ui.postMessage({ type: 'error', message: error.message });
    }
  }
  
  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

${variants ? generateVariantComponentCode(component, variants) : generateSingleComponentCode(component, style)}
`;
  };

  const generateVariantComponentCode = (component: Component, variants: ComponentVariant[]): string => {
    return `
async function createComponentWithVariants() {
  const componentSet = figma.createComponentSet();
  componentSet.name = "${component.name}";
  
  ${variants.map((variant, index) => `
  // Create ${variant.name} variant
  const variant${index} = figma.createComponent();
  variant${index}.name = "${variant.name}";
  ${generateComponentImplementation(component, variant.style, `variant${index}`)}
  componentSet.appendChild(variant${index});
  `).join('')}
  
  componentSet.resizeWithoutConstraints(
    Math.max(...componentSet.children.map(child => child.width + child.x)) + 20,
    Math.max(...componentSet.children.map(child => child.height + child.y)) + 20
  );
  
  return componentSet;
}`;
  };

  const generateSingleComponentCode = (component: Component, style: ComponentStyle): string => {
    return `
async function createCustomComponent() {
  const component = figma.createComponent();
  component.name = "${component.name}";
  ${generateComponentImplementation(component, style, 'component')}
  return component;
}`;
  };

  const generateComponentCode = (component: Component, style: ComponentStyle): string => {
    return generateComponentImplementation(component, style, 'component');
  };

  const generateComponentImplementation = (component: Component, style: ComponentStyle, varName: string): string => {
    const bgColor = style.backgroundColor === 'transparent' ? '[]' : `[{ type: 'SOLID', color: hexToRgb('${style.backgroundColor}') }]`;
    const textColor = `hexToRgb('${style.textColor}')`;
    const borderColor = style.borderWidth > 0 ? `[{ type: 'SOLID', color: hexToRgb('${style.borderColor}') }]` : '[]';
    const strokeColor = style.strokeWidth > 0 ? `[{ type: 'SOLID', color: hexToRgb('${style.strokeColor}') }]` : '[]';

    switch (component.type) {
      case 'button':
        return `
  const frame = figma.createFrame();
  frame.name = '${component.name}';
  frame.resize(${style.width}, ${style.height});
  frame.cornerRadius = ${style.cornerRadius};
  frame.fills = ${bgColor};
  frame.strokes = ${borderColor};
  frame.strokeWeight = ${style.borderWidth};
  
  // Add stroke if specified
  ${style.strokeWidth > 0 ? `
  const strokeEffect = {
    type: 'DROP_SHADOW',
    color: hexToRgb('${style.strokeColor}'),
    offset: { x: 0, y: 0 },
    radius: 0,
    spread: ${style.strokeWidth},
    visible: true,
    blendMode: 'NORMAL'
  };
  frame.effects = [strokeEffect];` : ''}
  
  frame.layoutMode = 'HORIZONTAL';
  frame.primaryAxisAlignItems = 'CENTER';
  frame.counterAxisAlignItems = 'CENTER';
  frame.paddingLeft = ${style.padding};
  frame.paddingRight = ${style.padding};
  frame.paddingTop = ${Math.floor(style.padding * 0.75)};
  frame.paddingBottom = ${Math.floor(style.padding * 0.75)};
  
  const text = figma.createText();
  text.characters = '${component.name}';
  text.fontSize = ${style.fontSize};
  text.fontName = { family: 'Inter', style: 'Medium' };
  text.fills = [{ type: 'SOLID', color: ${textColor} }];
  text.textAlignHorizontal = 'CENTER';
  text.textAutoResize = 'WIDTH_AND_HEIGHT';
  
  frame.appendChild(text);
  
  const component = figma.createComponent();
  component.appendChild(frame);
  component.name = '${component.name}';
  
  return component;`;

      case 'input':
        return `
  const frame = figma.createFrame();
  frame.name = '${component.name}';
  frame.resize(${style.width}, ${style.height});
  frame.cornerRadius = ${style.cornerRadius};
  frame.fills = ${bgColor};
  frame.strokes = ${borderColor};
  frame.strokeWeight = ${style.borderWidth};
  frame.layoutMode = 'HORIZONTAL';
  frame.primaryAxisAlignItems = 'CENTER';
  frame.counterAxisAlignItems = 'CENTER';
  frame.paddingLeft = ${style.padding};
  frame.paddingRight = ${style.padding};
  
  const text = figma.createText();
  text.characters = 'Placeholder text';
  text.fontSize = ${style.fontSize};
  text.fontName = { family: 'Inter', style: 'Regular' };
  text.fills = [{ type: 'SOLID', color: { ...${textColor}, a: 0.6 } }];
  text.textAutoResize = 'WIDTH_AND_HEIGHT';
  
  frame.appendChild(text);
  
  const component = figma.createComponent();
  component.appendChild(frame);
  component.name = '${component.name}';
  
  return component;`;

      case 'card':
        return `
  const frame = figma.createFrame();
  frame.name = '${component.name}';
  frame.resize(${style.width}, ${style.height});
  frame.cornerRadius = ${style.cornerRadius};
  frame.fills = ${bgColor};
  frame.strokes = ${borderColor};
  frame.strokeWeight = ${style.borderWidth};
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisAlignItems = 'CENTER';
  frame.counterAxisAlignItems = 'CENTER';
  frame.itemSpacing = 8;
  frame.paddingLeft = ${style.padding};
  frame.paddingRight = ${style.padding};
  frame.paddingTop = ${style.padding};
  frame.paddingBottom = ${style.padding};
  
  const title = figma.createText();
  title.characters = 'Card Title';
  title.fontSize = ${style.fontSize + 2};
  title.fontName = { family: 'Inter', style: 'SemiBold' };
  title.fills = [{ type: 'SOLID', color: ${textColor} }];
  title.textAutoResize = 'WIDTH_AND_HEIGHT';
  
  const content = figma.createText();
  content.characters = 'Card content area';
  content.fontSize = ${style.fontSize};
  content.fontName = { family: 'Inter', style: 'Regular' };
  content.fills = [{ type: 'SOLID', color: { ...${textColor}, a: 0.8 } }];
  content.textAutoResize = 'WIDTH_AND_HEIGHT';
  
  frame.appendChild(title);
  frame.appendChild(content);
  
  const component = figma.createComponent();
  component.appendChild(frame);
  component.name = '${component.name}';
  
  return component;`;

      default:
        return `
  const frame = figma.createFrame();
  frame.name = '${component.name}';
  frame.resize(${style.width}, ${style.height});
  frame.cornerRadius = ${style.cornerRadius};
  frame.fills = ${bgColor};
  frame.strokes = ${borderColor};
  frame.strokeWeight = ${style.borderWidth};
  
  const component = figma.createComponent();
  component.appendChild(frame);
  component.name = '${component.name}';
  
  return component;`;
    }
  };

  const generatePluginUI = (componentName: string, hasVariants?: boolean): string => {
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
      max-width: 260px; 
      margin: 0 auto; 
      text-align: center; 
    }
    .title { 
      font-size: 16px; 
      font-weight: 600; 
      margin-bottom: 16px; 
      color: #333;
    }
    .subtitle {
      font-size: 12px;
      color: #666;
      margin-bottom: 16px;
    }
    .button { 
      width: 100%; 
      padding: 12px 16px; 
      margin: 8px 0; 
      border: none; 
      border-radius: 6px; 
      font-size: 14px; 
      font-weight: 500; 
      cursor: pointer; 
      transition: background-color 0.2s;
    }
    .primary { 
      background: #18a0fb; 
      color: white; 
    }
    .primary:hover { 
      background: #0d8ce8; 
    }
    .secondary { 
      background: #f1f3f4; 
      color: #333; 
    }
    .secondary:hover { 
      background: #e8eaed; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">Create ${componentName}</div>
    ${hasVariants ? `<div class="subtitle">✨ With ${componentVariants ? componentVariants.length : 8} component variants</div>` : ''}
    <button class="button primary" onclick="create()">Create Component${hasVariants ? ' Set' : ''}</button>
    <button class="button secondary" onclick="cancel()">Cancel</button>
  </div>
  
  <script>
    function create() {
      parent.postMessage({ pluginMessage: { type: 'create-component' } }, '*');
    }
    
    function cancel() {
      parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
    }
    window.addEventListener('message', (event) => {
      const { type, message } = event.data.pluginMessage;
      const statusEl = document.getElementById('status');
      
      if (type === 'success') {
        statusEl.className = 'status success';
        statusEl.textContent = 'Component created successfully!';
      } else if (type === 'error') {
        statusEl.className = 'status error';
        statusEl.textContent = \`Error: \${message}\`;
      }
    });
  </script>
</body>
</html>`;
  };

  const handleExportComponent = async () => {
    if (!selectedComponent || !customStyle) return;
    
    setIsExporting(true);
    
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      const selectedVariantsList = componentVariants.filter((_, index) => selectedVariants.has(index));
      const pluginCode = generateFigmaPluginCode(selectedComponent, customStyle, hasVariants ? selectedVariantsList : undefined);
      const pluginUI = generatePluginUI(selectedComponent.name, hasVariants);
      const manifest = JSON.stringify({
        "name": `Custom ${selectedComponent.name}${hasVariants ? ` with ${selectedVariants.size} Variants` : ''}`,
        "id": `custom-${selectedComponent.id}${hasVariants ? '-variants' : ''}`,
        "api": "1.0.0",
        "main": "code.js",
        "ui": "ui.html",
        "capabilities": [],
        "enableProposedApi": false,
        "editorType": ["figma"],
        "networkAccess": { "allowedDomains": ["none"] }
      }, null, 2);
      
      zip.file('code.js', pluginCode);
      zip.file('ui.html', pluginUI);
      zip.file('manifest.json', manifest);
      
      const content = await zip.generateAsync({ 
        type: 'uint8array',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9
        }
      });
      
      // Create proper ZIP blob with correct MIME type
      const zipBlob = new Blob([content], { 
        type: 'application/zip, application/octet-stream' 
      });
      
      const fileName = `${selectedComponent.name.toLowerCase().replace(/\s+/g, '-')}-figma-plugin${hasVariants ? '-variants' : ''}.zip`;
      
      // Try using the File System Access API if available
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: 'ZIP files',
              accept: { 'application/zip': ['.zip'] }
            }]
          });
          const writable = await fileHandle.createWritable();
          await writable.write(zipBlob);
          await writable.close();
          return;
        } catch (e) {
          // Fall back to regular download if user cancels or API fails
        }
      }
      
      // Fallback to traditional download
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.type = 'application/zip';
      
      // Force download by simulating click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
    } catch (error) {
      console.error('Error exporting component:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Custom Component Creator</h2>
      
      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component Library */}
        <div>
          <h3 className="text-lg font-medium mb-4">Component Library</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredComponents.map(component => (
              <div
                key={component.id}
                onClick={() => setSelectedComponent(component)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedComponent?.id === component.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="mb-2">
                  <h4 className="font-medium text-sm">{component.name}</h4>
                  <p className="text-xs text-gray-500">{component.category}</p>
                </div>
                <div className="flex justify-center">
                  {renderComponent(component, component.defaultStyle)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customization Panel */}
        <div>
          <h3 className="text-lg font-medium mb-4">Customize Component</h3>
          {selectedComponent && customStyle ? (
            <div className="space-y-6">
              {/* Preview */}
              <div className="p-6 bg-gray-50 rounded-lg flex justify-center items-center">
                {renderComponent(selectedComponent, customStyle)}
              </div>

              {/* Style Controls */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={customStyle.backgroundColor === 'transparent' ? '#ffffff' : customStyle.backgroundColor}
                      onChange={(e) => setCustomStyle({
                        ...customStyle,
                        backgroundColor: e.target.value
                      })}
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={customStyle.textColor}
                      onChange={(e) => setCustomStyle({
                        ...customStyle,
                        textColor: e.target.value
                      })}
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Corner Radius: {customStyle.cornerRadius}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={customStyle.cornerRadius}
                      onChange={(e) => setCustomStyle({
                        ...customStyle,
                        cornerRadius: parseInt(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Padding: {customStyle.padding}px
                    </label>
                    <input
                      type="range"
                      min="4"
                      max="32"
                      value={customStyle.padding}
                      onChange={(e) => setCustomStyle({
                        ...customStyle,
                        padding: parseInt(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width: {customStyle.width}px
                    </label>
                    <input
                      type="range"
                      min="60"
                      max="400"
                      value={customStyle.width}
                      onChange={(e) => setCustomStyle({
                        ...customStyle,
                        width: parseInt(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height: {customStyle.height}px
                    </label>
                    <input
                      type="range"
                      min="24"
                      max="200"
                      value={customStyle.height}
                      onChange={(e) => setCustomStyle({
                        ...customStyle,
                        height: parseInt(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                </div>

                {customStyle.borderWidth > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Border Color
                    </label>
                    <input
                      type="color"
                      value={customStyle.borderColor}
                      onChange={(e) => setCustomStyle({
                        ...customStyle,
                        borderColor: e.target.value
                      })}
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                )}

                {/* Stroke Controls */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Stroke Settings</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stroke Width: {customStyle.strokeWidth}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={customStyle.strokeWidth}
                      onChange={(e) => setCustomStyle({
                        ...customStyle,
                        strokeWidth: parseInt(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>

                  {customStyle.strokeWidth > 0 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stroke Color
                        </label>
                        <input
                          type="color"
                          value={customStyle.strokeColor}
                          onChange={(e) => setCustomStyle({
                            ...customStyle,
                            strokeColor: e.target.value
                          })}
                          className="w-full h-10 rounded border border-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stroke Position
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['inside', 'center', 'outside'] as const).map((position) => (
                            <button
                              key={position}
                              onClick={() => setCustomStyle({
                                ...customStyle,
                                strokePosition: position
                              })}
                              className={`px-3 py-2 text-xs rounded font-medium ${
                                customStyle.strokePosition === position
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {position.charAt(0).toUpperCase() + position.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Create Status Button */}
              <button
                onClick={generateComponentVariants}
                disabled={hasVariants}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
              >
                <span className="text-lg">✨</span>
                {hasVariants ? 'Component States Created' : 'Create Status (AI Magic)'}
              </button>

              {/* Variants Preview */}
              {hasVariants && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">Component Variants ({selectedVariants.size}/{componentVariants.length} selected)</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllVariants}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Select All
                      </button>
                      <button
                        onClick={clearAllVariants}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Group variants by state */}
                    {[
                      { title: 'Default State', variants: componentVariants.filter(v => v.name.includes('Default')) },
                      { title: 'Hover States', variants: componentVariants.filter(v => v.name.includes('Hover')) },
                      { title: 'Focus States', variants: componentVariants.filter(v => v.name.includes('Focus')) },
                      { title: 'Active States', variants: componentVariants.filter(v => v.name.includes('Active')) },
                      { title: 'Warning States', variants: componentVariants.filter(v => v.name.includes('Warning')) },
                      { title: 'Error States', variants: componentVariants.filter(v => v.name.includes('Error')) },
                      { title: 'Success States', variants: componentVariants.filter(v => v.name.includes('Success')) },
                      { title: 'Disabled States', variants: componentVariants.filter(v => v.name.includes('Disabled')) }
                    ].filter(group => group.variants.length > 0).map((group, groupIndex) => (
                      <div key={groupIndex} className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">{group.title}</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {group.variants.map((variant, variantIndex) => {
                            const globalIndex = componentVariants.findIndex(v => v.name === variant.name);
                            const isSelected = selectedVariants.has(globalIndex);
                            return (
                              <div 
                                key={variantIndex} 
                                onClick={() => toggleVariantSelection(globalIndex)}
                                className={`bg-white p-3 rounded border cursor-pointer transition-all duration-200 ${
                                  isSelected 
                                    ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200' 
                                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-xs font-medium text-gray-600">{variant.name}</div>
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                  }`}>
                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                  </div>
                                </div>
                                <div className="flex justify-center">
                                  {renderComponent(selectedComponent!, variant.style)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={handleExportComponent}
                disabled={isExporting}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    🚀 Export {hasVariants ? `${selectedVariants.size} Selected Variants` : 'as Figma Component'}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Select a component from the library to start customizing
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
