import { validateTokens } from './lib/tokens';
import exampleTokens from './tokens.json';

interface GeneratorOptions {
  useBuiltInTokens: boolean;
  generateStyles: boolean;
  generateButton: boolean;
  generateTextField: boolean;
  generateCard: boolean;
  tokensJson?: string;
}

// Show the plugin UI
figma.showUI(__html__, { width: 320, height: 480 });

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    try {
      const options: GeneratorOptions = msg.options;
      let tokens: any;

      // Load tokens
      if (options.useBuiltInTokens) {
        tokens = exampleTokens;
      } else if (options.tokensJson) {
        try {
          tokens = JSON.parse(options.tokensJson);
        } catch (e) {
          figma.ui.postMessage({ type: 'error', message: `Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}` });
          return;
        }
      } else {
        figma.ui.postMessage({ type: 'error', message: 'No tokens provided' });
        return;
      }

      // Create or get the design system page
      let page = figma.root.children.find(p => p.name === 'Design System') as PageNode;
      if (!page) {
        page = figma.createPage();
        page.name = 'Design System';
      }
      figma.currentPage = page;

      // Clear existing nodes on the page
      page.children.forEach((node) => node.remove());

      // Create styles first
      if (options.generateStyles) {
        createStyles(tokens);
      }

      let xOffset = 50;
      const yOffset = 50;

      // Generate components
      if (options.generateButton) {
        createButtonComponents(tokens, xOffset, yOffset);
        xOffset += 400;
      }

      if (options.generateTextField) {
        createTextFieldComponents(tokens, xOffset, yOffset);
        xOffset += 400;
      }

      if (options.generateCard) {
        createCardComponents(tokens, xOffset, yOffset);
      }

      // Zoom to fit all content
      figma.viewport.scrollAndZoomIntoView(page.children);

      figma.ui.postMessage({ type: 'complete' });
    } catch (error) {
      console.error('Generation error:', error);
      figma.ui.postMessage({ 
        type: 'error', 
        message: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  }
};

// Helper functions
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

function createStyles(tokens: any) {
  // Create color styles
  Object.entries(tokens.colors).forEach(([category, shades]: [string, any]) => {
    Object.entries(shades).forEach(([shade, value]: [string, any]) => {
      const styleName = `${category}/${shade}`;
      
      // Check if style already exists
      const existingStyle = figma.getLocalPaintStyles().find(s => s.name === styleName);
      if (existingStyle) return;

      const style = figma.createPaintStyle();
      style.name = styleName;
      
      const rgb = hexToRgb(value);
      style.paints = [{
        type: 'SOLID',
        color: rgb
      }];
    });
  });

  // Create text styles
  Object.entries(tokens.typography).forEach(([name, typo]: [string, any]) => {
    const styleName = `Text/${name}`;
    
    const existingStyle = figma.getLocalTextStyles().find(s => s.name === styleName);
    if (existingStyle) return;

    const style = figma.createTextStyle();
    style.name = styleName;
    style.fontSize = typo.fontSize;
    style.fontName = { family: typo.fontFamily, style: 'Regular' };
    style.lineHeight = { value: typo.lineHeight, unit: 'PIXELS' };
  });
}

function createButtonComponents(tokens: any, x: number, y: number) {
  const variants = ['primary', 'secondary', 'danger'];
  
  variants.forEach((variant, index) => {
    const button = createButton(tokens, variant);
    button.x = x;
    button.y = y + (index * 80);
    
    // Create component
    const component = figma.createComponent();
    component.appendChild(button);
    component.name = `Button/${variant}`;
    figma.currentPage.appendChild(component);
  });
}

function createButton(tokens: any, variant: string) {
  const frame = figma.createFrame();
  frame.name = `Button-${variant}`;
  frame.resize(120, 40);
  frame.cornerRadius = tokens.radii.md;
  
  // Set background based on variant
  let bgColor: { r: number; g: number; b: number };
  let textColor: { r: number; g: number; b: number };
  
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
  
  // Create text
  const text = figma.createText();
  text.characters = `${variant.charAt(0).toUpperCase() + variant.slice(1)} Button`;
  text.fontSize = tokens.typography.label.fontSize;
  text.fontName = { family: tokens.typography.label.fontFamily, style: 'Regular' };
  text.fills = [{ type: 'SOLID', color: textColor }];
  text.textAlignHorizontal = 'CENTER';
  text.textAlignVertical = 'CENTER';
  text.resize(frame.width, frame.height);
  
  frame.appendChild(text);
  return frame;
}

function createTextFieldComponents(tokens: any, x: number, y: number) {
  const variants = ['default', 'error', 'disabled'];
  
  variants.forEach((variant, index) => {
    const textField = createTextField(tokens, variant);
    textField.x = x;
    textField.y = y + (index * 120);
    
    // Create component
    const component = figma.createComponent();
    component.appendChild(textField);
    component.name = `TextField/${variant}`;
    figma.currentPage.appendChild(component);
  });
}

function createTextField(tokens: any, variant: string) {
  const container = figma.createFrame();
  container.name = `TextField-${variant}`;
  container.layoutMode = 'VERTICAL';
  container.itemSpacing = tokens.spacing.xs;
  container.fills = [];
  
  // Create label
  const label = figma.createText();
  label.characters = 'Label Text';
  label.fontSize = tokens.typography.label.fontSize;
  label.fontName = { family: tokens.typography.label.fontFamily, style: 'Regular' };
  label.fills = [{ type: 'SOLID', color: hexToRgb(tokens.colors.neutral['900']) }];
  
  container.appendChild(label);
  
  // Create input field
  const input = figma.createFrame();
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
  
  placeholder.x = tokens.spacing.sm;
  placeholder.y = (input.height - placeholder.height) / 2;
  
  input.appendChild(placeholder);
  container.appendChild(input);
  
  // Add error message for error variant
  if (variant === 'error') {
    const errorMsg = figma.createText();
    errorMsg.characters = 'Error message here';
    errorMsg.fontSize = tokens.typography.label.fontSize;
    errorMsg.fontName = { family: tokens.typography.label.fontFamily, style: 'Regular' };
    errorMsg.fills = [{ type: 'SOLID', color: hexToRgb(tokens.colors.danger['500']) }];
    
    container.appendChild(errorMsg);
  }
  
  return container;
}

function createCardComponents(tokens: any, x: number, y: number) {
  const variants = ['default', 'elevated'];
  
  variants.forEach((variant, index) => {
    const card = createCard(tokens, variant);
    card.x = x;
    card.y = y + (index * 200);
    
    // Create component
    const component = figma.createComponent();
    component.appendChild(card);
    component.name = `Card/${variant}`;
    figma.currentPage.appendChild(component);
  });
}

function createCard(tokens: any, variant: string) {
  const card = figma.createFrame();
  card.name = `Card-${variant}`;
  card.resize(280, 160);
  card.cornerRadius = tokens.radii.lg;
  card.layoutMode = 'VERTICAL';
  card.itemSpacing = tokens.spacing.md;
  card.paddingTop = tokens.spacing.md;
  card.paddingRight = tokens.spacing.md;
  card.paddingBottom = tokens.spacing.md;
  card.paddingLeft = tokens.spacing.md;
  
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
  
  card.appendChild(title);
  
  // Add content
  const content = figma.createText();
  content.characters = 'This is the card content area. You can add any content here.';
  content.fontSize = tokens.typography.body.fontSize;
  content.fontName = { family: tokens.typography.body.fontFamily, style: 'Regular' };
  content.fills = [{ type: 'SOLID', color: hexToRgb(tokens.colors.neutral['900']) }];
  content.resize(card.width - (tokens.spacing.md * 2), content.height);
  
  card.appendChild(content);
  
  return card;
}
