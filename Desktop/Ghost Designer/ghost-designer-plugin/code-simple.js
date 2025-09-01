// Ghost Designer - Component Analysis Plugin
figma.showUI(__html__, { width: 400, height: 600 });

// Analyze selected components
function analyzeSelection() {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.ui.postMessage({ 
      type: 'analysis-result', 
      data: { error: 'Please select some components to analyze' }
    });
    return;
  }

  const analysis = {
    totalComponents: selection.length,
    components: []
  };

  selection.forEach(node => {
    const componentData = analyzeComponent(node);
    analysis.components.push(componentData);
  });

  figma.ui.postMessage({ type: 'analysis-result', data: analysis });
}

// Analyze individual component
function analyzeComponent(node) {
  const component = {
    id: node.id,
    name: node.name,
    type: node.type,
    bounds: {
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height
    },
    issues: [],
    suggestions: []
  };

  // Check for design issues
  checkSpacing(node, component);
  checkColors(node, component);
  checkTypography(node, component);
  checkAccessibility(node, component);

  // Add fix IDs to issues for action buttons
  component.issues.forEach((issue, index) => {
    issue.fixId = `${component.id}_${index}`;
    issue.nodeId = component.id;
  });

  return component;
}

// Check spacing issues
function checkSpacing(node, component) {
  const validSpacings = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
  
  // Skip spacing checks for text elements - their width is determined by content
  if (node.type === 'TEXT') {
    return;
  }
  
  // Only check spacing for containers, shapes, and frames that should follow grid
  const shouldCheckSpacing = ['RECTANGLE', 'ELLIPSE', 'FRAME', 'COMPONENT', 'INSTANCE'].includes(node.type);
  
  if (shouldCheckSpacing) {
    // Check width - only flag if it's clearly meant to be a specific size
    if (!validSpacings.includes(node.width) && node.width < 200 && node.width > 8) {
      const closest = findClosestSpacing(node.width);
      const difference = Math.abs(node.width - closest);
      
      // Only suggest if the difference is small (likely intended to be on grid)
      if (difference <= 4) {
        component.issues.push({
          type: 'spacing',
          severity: 'info',
          message: `Width ${node.width}px is close to grid value`,
          suggestion: `Consider using ${closest}px for consistency`,
          fixAction: 'resize',
          fixValue: { width: closest }
        });
      }
    }
    
    // Check height
    if (!validSpacings.includes(node.height) && node.height < 200 && node.height > 8) {
      const closest = findClosestSpacing(node.height);
      const difference = Math.abs(node.height - closest);
      
      if (difference <= 4) {
        component.issues.push({
          type: 'spacing',
          severity: 'info',
          message: `Height ${node.height}px is close to grid value`,
          suggestion: `Consider using ${closest}px for consistency`,
          fixAction: 'resize',
          fixValue: { height: closest }
        });
      }
    }
  }
  
  // Check padding/margins if available (for frames with auto-layout)
  if (node.type === 'FRAME' && 'paddingLeft' in node) {
    const paddings = [node.paddingLeft, node.paddingRight, node.paddingTop, node.paddingBottom];
    paddings.forEach((padding, index) => {
      if (padding && !validSpacings.includes(padding)) {
        const sides = ['left', 'right', 'top', 'bottom'];
        component.issues.push({
          type: 'spacing',
          severity: 'warning',
          message: `${sides[index]} padding ${padding}px doesn't follow 4px grid`,
          suggestion: `Consider using ${findClosestSpacing(padding)}px`
        });
      }
    });
  }
}

// Check color issues
function checkColors(node, component) {
  if ('fills' in node && node.fills && node.fills.length > 0) {
    node.fills.forEach(fill => {
      if (fill.type === 'SOLID') {
        const color = rgbToHex(fill.color);
        
        // Check if color follows design system
        const designColors = ['#FFFFFF', '#000000', '#F3F4F6', '#E5E7EB', '#6B7280', '#374151', '#1F2937'];
        
        if (!designColors.includes(color)) {
          component.issues.push({
            type: 'color',
            severity: 'info',
            message: `Color ${color} may not be from design system`,
            suggestion: 'Consider using design system colors'
          });
        }
      }
    });
  }
}

// Check typography issues
function checkTypography(node, component) {
  if (node.type === 'TEXT') {
    const fontSize = node.fontSize;
    const validSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];
    
    if (!validSizes.includes(fontSize)) {
      const closest = findClosestSize(fontSize, validSizes);
      const difference = Math.abs(fontSize - closest);
      
      // Only suggest if difference is significant (more than 1px)
      if (difference > 1) {
        component.issues.push({
          type: 'typography',
          severity: 'info',
          message: `Font size ${fontSize}px could follow type scale`,
          suggestion: `Consider using ${closest}px for consistency`
        });
      }
    }
    
    // Check for very small or very large text that might be accessibility issues
    if (fontSize < 12) {
      component.issues.push({
        type: 'accessibility',
        severity: 'warning',
        message: `Font size ${fontSize}px may be too small for accessibility`,
        suggestion: 'Use at least 12px for better readability'
      });
    }
    
    if (fontSize > 72) {
      component.issues.push({
        type: 'typography',
        severity: 'info',
        message: `Font size ${fontSize}px is very large`,
        suggestion: 'Consider if this size is intentional for the design hierarchy'
      });
    }
    
    // Check if text is in auto-layout and should use hug sizing
    checkTextInAutoLayout(node, component);
  }
}

// Check if text element is properly configured for auto-layout
function checkTextInAutoLayout(node, component) {
  const parent = node.parent;
  
  // Check if parent is an auto-layout frame
  if (parent && parent.type === 'FRAME' && parent.layoutMode !== 'NONE') {
    // Check horizontal resize behavior
    if (parent.layoutMode === 'HORIZONTAL' || parent.layoutMode === 'VERTICAL') {
      if (node.layoutAlign === 'STRETCH' && node.textAutoResize === 'WIDTH_AND_HEIGHT') {
        // This is problematic - text stretching in auto-layout
        component.issues.push({
          type: 'layout',
          severity: 'warning',
          message: 'Text is set to stretch in auto-layout container',
          suggestion: 'Set text to "Hug contents" for proper auto-layout behavior',
          fixAction: 'setTextHug',
          fixValue: { textAutoResize: 'WIDTH_AND_HEIGHT', layoutAlign: 'MIN' }
        });
      }
      
      if (node.textAutoResize === 'NONE') {
        // Fixed width text in auto-layout
        component.issues.push({
          type: 'layout',
          severity: 'info',
          message: 'Text has fixed width in auto-layout container',
          suggestion: 'Consider using "Hug contents" for responsive behavior',
          fixAction: 'setTextHug',
          fixValue: { textAutoResize: 'WIDTH_AND_HEIGHT' }
        });
      }
      
      // Check if text should hug contents
      if (node.textAutoResize !== 'WIDTH_AND_HEIGHT' && node.textAutoResize !== 'HEIGHT') {
        component.issues.push({
          type: 'layout',
          severity: 'warning',
          message: 'Text in auto-layout should hug contents',
          suggestion: 'Set text resize to "Hug contents" (width and height)',
          fixAction: 'setTextHug',
          fixValue: { textAutoResize: 'WIDTH_AND_HEIGHT' }
        });
      }
    }
  }
}

// Check accessibility issues
function checkAccessibility(node, component) {
  if (node.type === 'TEXT' && 'fills' in node && node.fills) {
    // Basic contrast check (simplified)
    const textFill = node.fills.find(f => f.type === 'SOLID');
    if (textFill) {
      const textColor = rgbToHex(textFill.color);
      
      // Check against common backgrounds
      if (isLowContrast(textColor, '#FFFFFF')) {
        component.issues.push({
          type: 'accessibility',
          severity: 'error',
          message: 'Text may have low contrast against white background',
          suggestion: 'Use darker text color for better readability'
        });
      }
    }
  }
}

// Helper functions
function findClosestSpacing(value) {
  const spacings = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
  return spacings.reduce((prev, curr) => 
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

function findClosestSize(value, sizes) {
  return sizes.reduce((prev, curr) => 
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

function rgbToHex(color) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

function isLowContrast(color1, color2) {
  // Simplified contrast check
  return color1 === '#FFFFFF' || color1 === '#F3F4F6' || color1 === '#E5E7EB';
}

// Apply fix actions
function applyFix(fixData) {
  console.log('applyFix called with:', fixData);
  const { nodeId, fixAction, fixValue } = fixData;
  const node = figma.getNodeById(nodeId);
  
  if (!node) {
    console.error('Node not found:', nodeId);
    figma.ui.postMessage({ 
      type: 'fix-result', 
      success: false, 
      message: 'Node not found' 
    });
    return;
  }

  console.log('Found node:', node.name, node.type);
  console.log('Fix action:', fixAction);
  console.log('Fix value:', fixValue);

  try {
    switch (fixAction) {
      case 'setTextHug':
        console.log('Setting text to hug contents');
        if (node.type === 'TEXT') {
          console.log('Current textAutoResize:', node.textAutoResize);
          console.log('Current layoutAlign:', node.layoutAlign);
          
          if (fixValue.textAutoResize) {
            node.textAutoResize = fixValue.textAutoResize;
            console.log('Set textAutoResize to:', fixValue.textAutoResize);
          }
          if (fixValue.layoutAlign) {
            node.layoutAlign = fixValue.layoutAlign;
            console.log('Set layoutAlign to:', fixValue.layoutAlign);
          }
          
          console.log('Text hug fix applied successfully');
          figma.ui.postMessage({ 
            type: 'fix-result', 
            success: true, 
            message: 'Text set to hug contents' 
          });
        } else {
          console.error('Node is not TEXT type:', node.type);
          figma.ui.postMessage({ 
            type: 'fix-result', 
            success: false, 
            message: 'Node is not a text element' 
          });
        }
        break;
        
      case 'resize':
        console.log('Resizing node');
        let newWidth = node.width;
        let newHeight = node.height;
        
        if (fixValue.width !== undefined) {
          newWidth = fixValue.width;
        }
        if (fixValue.height !== undefined) {
          newHeight = fixValue.height;
        }
        
        node.resize(newWidth, newHeight);
        console.log('Resized to:', newWidth, 'x', newHeight);
        
        figma.ui.postMessage({ 
          type: 'fix-result', 
          success: true, 
          message: `Resized to ${newWidth}×${newHeight}px` 
        });
        break;
        
      case 'setFontSize':
        console.log('Setting font size');
        if (node.type === 'TEXT') {
          node.fontSize = fixValue.fontSize;
          console.log('Set font size to:', fixValue.fontSize);
          figma.ui.postMessage({ 
            type: 'fix-result', 
            success: true, 
            message: `Font size changed to ${fixValue.fontSize}px` 
          });
        } else {
          figma.ui.postMessage({ 
            type: 'fix-result', 
            success: false, 
            message: 'Node is not a text element' 
          });
        }
        break;
        
      default:
        console.error('Unknown fix action:', fixAction);
        figma.ui.postMessage({ 
          type: 'fix-result', 
          success: false, 
          message: 'Unknown fix action: ' + fixAction 
        });
    }
  } catch (error) {
    console.error('Error applying fix:', error);
    figma.ui.postMessage({ 
      type: 'fix-result', 
      success: false, 
      message: `Error applying fix: ${error.message}` 
    });
  }
}

// Message handler
figma.ui.onmessage = async (msg) => {
  console.log('Main thread received message:', msg.type, msg);
  
  if (msg.type === 'analyze') {
    analyzeSelection();
  }
  
  if (msg.type === 'apply-fix') {
    console.log('Applying fix with data:', msg.fixData);
    applyFix(msg.fixData);
  }
  
  if (msg.type === 'test') {
    figma.ui.postMessage({ type: 'test-response', data: 'Plugin is working!' });
  }
  
  if (msg.type === 'close') {
    figma.closePlugin();
  }
  
  // Handle settings storage
  if (msg.type === 'save-settings') {
    await figma.clientStorage.setAsync('ghost-ai-key', msg.apiKey || '');
    await figma.clientStorage.setAsync('ghost-ai-model', msg.model || 'gpt-4o-mini');
    await figma.clientStorage.setAsync('ghost-ai-baseurl', msg.baseUrl || 'https://api.openai.com/v1');
    console.log('Settings saved to Figma storage');
  }
  
  if (msg.type === 'load-settings') {
    const apiKey = await figma.clientStorage.getAsync('ghost-ai-key') || '';
    const model = await figma.clientStorage.getAsync('ghost-ai-model') || 'gpt-4o-mini';
    const baseUrl = await figma.clientStorage.getAsync('ghost-ai-baseurl') || 'https://api.openai.com/v1';
    figma.ui.postMessage({ type: 'settings-loaded', apiKey, model, baseUrl });
  }
  
  if (msg.type === 'apply_structured_fix') {
    try {
      const node = figma.getNodeById(msg.target_id);
      if (!node) {
        figma.ui.postMessage({ type: 'fix_result', success: false, error: 'Node not found' });
        return;
      }
      
      const { action, params } = msg.fix;
      
      if (action === 'set_fill_hex' && params.hex) {
        const color = hexToRgb(params.hex);
        if (color && 'fills' in node) {
          node.fills = [{ type: 'SOLID', color }];
        }
      } else if (action === 'set_text_fill_hex' && params.hex) {
        const color = hexToRgb(params.hex);
        if (color && 'fills' in node) {
          node.fills = [{ type: 'SOLID', color }];
        }
      } else if (action === 'set_padding' && 'paddingLeft' in node) {
        if (params.top !== undefined) node.paddingTop = params.top;
        if (params.right !== undefined) node.paddingRight = params.right;
        if (params.bottom !== undefined) node.paddingBottom = params.bottom;
        if (params.left !== undefined) node.paddingLeft = params.left;
      } else if (action === 'set_auto_layout_gap' && params.value !== undefined && 'itemSpacing' in node) {
        node.itemSpacing = params.value;
      } else if (action === 'set_min_width' && params.value !== undefined && 'resize' in node) {
        node.resize(Math.max(node.width, params.value), node.height);
      } else if (action === 'set_font_size' && params.value !== undefined && 'fontSize' in node) {
        node.fontSize = params.value;
      }
      
      figma.ui.postMessage({ type: 'fix_result', success: true, action, params });
    } catch (error) {
      figma.ui.postMessage({ type: 'fix_result', success: false, error: error.message });
    }
  }
  
  if (msg.type === 'apply_fix') {
    try {
      const node = figma.getNodeById(msg.target_id);
      if (!node) {
        figma.ui.postMessage({ type: 'fix_result', success: false, error: 'Node not found' });
        return;
      }
      
      const { property, new_value } = msg.fix;
      
      if (property === 'fillColor') {
        const color = hexToRgb(new_value);
        if (color && 'fills' in node) {
          node.fills = [{ type: 'SOLID', color }];
        }
      } else if (property === 'minWidth') {
        if ('resize' in node) {
          node.resize(Math.max(node.width, parseFloat(new_value)), node.height);
        }
      } else if (property === 'minHeight') {
        if ('resize' in node) {
          node.resize(node.width, Math.max(node.height, parseFloat(new_value)));
        }
      } else if (property === 'fontSize') {
        if ('fontSize' in node) {
          node.fontSize = parseFloat(new_value);
        }
      } else if (property === 'paddingHorizontal') {
        if ('paddingLeft' in node) {
          const padding = parseFloat(new_value);
          node.paddingLeft = padding;
          node.paddingRight = padding;
        }
      } else if (property === 'paddingVertical') {
        if ('paddingTop' in node) {
          const padding = parseFloat(new_value);
          node.paddingTop = padding;
          node.paddingBottom = padding;
        }
      }
      
      figma.ui.postMessage({ type: 'fix_result', success: true, property, new_value });
    } catch (error) {
      figma.ui.postMessage({ type: 'fix_result', success: false, error: error.message });
    }
  }
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}
