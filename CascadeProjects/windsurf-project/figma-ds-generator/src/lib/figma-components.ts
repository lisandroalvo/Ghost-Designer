import { Tokens } from './tokens';

export interface FigmaComponentGenerator {
  createButton(tokens: Tokens, variant: 'primary' | 'secondary' | 'danger'): void;
  createTextField(tokens: Tokens, variant: 'default' | 'error' | 'disabled'): void;
  createCard(tokens: Tokens, variant: 'default' | 'elevated'): void;
  createStyles(tokens: Tokens): void;
}

export class FigmaComponentCreator implements FigmaComponentGenerator {
  private page: PageNode;

  constructor() {
    // Create or get the design system page
    this.page = this.getOrCreateDesignSystemPage();
  }

  private getOrCreateDesignSystemPage(): PageNode {
    let page = figma.root.children.find(p => p.name === 'Design System') as PageNode;
    if (!page) {
      page = figma.createPage();
      page.name = 'Design System';
    }
    figma.currentPage = page;
    return page;
  }

  createStyles(tokens: Tokens): void {
    this.createColorStyles(tokens.colors);
    this.createTextStyles(tokens.typography);
    this.createEffectStyles(tokens.elevation);
  }

  private createColorStyles(colors: any): void {
    Object.entries(colors).forEach(([category, shades]) => {
      Object.entries(shades as Record<string, string>).forEach(([shade, value]) => {
        const styleName = `${category}/${shade}`;
        
        // Check if style already exists
        const existingStyle = figma.getLocalPaintStyles().find(s => s.name === styleName);
        if (existingStyle) return;

        const style = figma.createPaintStyle();
        style.name = styleName;
        
        const rgb = this.hexToRgb(value);
        style.paints = [{
          type: 'SOLID',
          color: { r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 }
        }];
      });
    });
  }

  private createTextStyles(typography: any): void {
    Object.entries(typography).forEach(([name, typo]: [string, any]) => {
      const styleName = `Text/${name}`;
      
      // Check if style already exists
      const existingStyle = figma.getLocalTextStyles().find(s => s.name === styleName);
      if (existingStyle) return;

      const style = figma.createTextStyle();
      style.name = styleName;
      style.fontSize = typo.fontSize;
      style.fontName = { family: typo.fontFamily, style: 'Regular' };
      style.lineHeight = { value: typo.lineHeight, unit: 'PIXELS' };
    });
  }

  private createEffectStyles(elevation: any): void {
    Object.entries(elevation).forEach(([name, shadow]: [string, any]) => {
      const styleName = `Effects/elevation-${name}`;
      
      // Check if style already exists
      const existingStyle = figma.getLocalEffectStyles().find(s => s.name === styleName);
      if (existingStyle) return;

      const style = figma.createEffectStyle();
      style.name = styleName;
      
      const shadowColor = this.hexToRgb(shadow.color);
      style.effects = [{
        type: 'DROP_SHADOW',
        color: { 
          r: shadowColor.r / 255, 
          g: shadowColor.g / 255, 
          b: shadowColor.b / 255, 
          a: 0.1 
        },
        offset: { x: shadow.x, y: shadow.y },
        radius: shadow.blur,
        spread: shadow.spread,
        visible: true,
        blendMode: 'NORMAL'
      }];
    });
  }

  createButton(tokens: Tokens, variant: 'primary' | 'secondary' | 'danger'): void {
    const frame = figma.createFrame();
    frame.name = `Button/${variant}`;
    frame.resize(120, 40);
    
    // Set background based on variant
    const bgColor = this.getButtonBackground(tokens, variant);
    frame.fills = [{ type: 'SOLID', color: bgColor }];
    
    // Set border radius
    frame.cornerRadius = tokens.radii.md;
    
    // Add border for secondary variant
    if (variant === 'secondary') {
      const borderColor = this.hexToRgb(tokens.colors.neutral['900']);
      frame.strokes = [{
        type: 'SOLID',
        color: { r: borderColor.r / 255, g: borderColor.g / 255, b: borderColor.b / 255 }
      }];
      frame.strokeWeight = 1;
    }

    // Create text
    const text = figma.createText();
    text.characters = `${variant.charAt(0).toUpperCase() + variant.slice(1)} Button`;
    text.fontSize = tokens.typography.label.fontSize;
    text.fontName = { family: tokens.typography.label.fontFamily, style: 'Regular' };
    
    // Set text color
    const textColor = this.getButtonTextColor(tokens, variant);
    text.fills = [{ type: 'SOLID', color: textColor }];
    
    // Center text
    text.textAlignHorizontal = 'CENTER';
    text.textAlignVertical = 'CENTER';
    text.resize(frame.width, frame.height);
    
    // Add text to frame
    frame.appendChild(text);
    
    // Position frame
    frame.x = this.getNextX();
    frame.y = 100;
    
    // Add to page
    this.page.appendChild(frame);
    
    // Create component
    const component = figma.createComponent();
    component.appendChild(frame);
    component.name = `Button/${variant}`;
    this.page.appendChild(component);
  }

  createTextField(tokens: Tokens, variant: 'default' | 'error' | 'disabled'): void {
    const container = figma.createFrame();
    container.name = `TextField/${variant}`;
    container.layoutMode = 'VERTICAL';
    container.itemSpacing = tokens.spacing.xs;
    container.fills = [];
    
    // Create label
    const label = figma.createText();
    label.characters = 'Label Text';
    label.fontSize = tokens.typography.label.fontSize;
    label.fontName = { family: tokens.typography.label.fontFamily, style: 'Regular' };
    
    const labelColor = this.hexToRgb(tokens.colors.neutral['900']);
    label.fills = [{ type: 'SOLID', color: { r: labelColor.r / 255, g: labelColor.g / 255, b: labelColor.b / 255 } }];
    
    container.appendChild(label);
    
    // Create input field
    const input = figma.createFrame();
    input.resize(250, 40);
    input.cornerRadius = tokens.radii.sm;
    
    // Set background and border based on variant
    const bgColor = variant === 'disabled' 
      ? this.hexToRgb(tokens.colors.neutral['50'])
      : this.hexToRgb(tokens.colors.neutral['0']);
    
    input.fills = [{ type: 'SOLID', color: { r: bgColor.r / 255, g: bgColor.g / 255, b: bgColor.b / 255 } }];
    
    // Set border color based on variant
    const borderColor = variant === 'error' 
      ? this.hexToRgb(tokens.colors.danger['500'])
      : this.hexToRgb(tokens.colors.neutral['50']);
    
    input.strokes = [{ type: 'SOLID', color: { r: borderColor.r / 255, g: borderColor.g / 255, b: borderColor.b / 255 } }];
    input.strokeWeight = 1;
    
    // Add placeholder text
    const placeholder = figma.createText();
    placeholder.characters = 'Placeholder text';
    placeholder.fontSize = tokens.typography.body.fontSize;
    placeholder.fontName = { family: tokens.typography.body.fontFamily, style: 'Regular' };
    
    const placeholderColor = this.hexToRgb(tokens.colors.neutral['900']);
    placeholder.fills = [{ type: 'SOLID', color: { r: placeholderColor.r / 255, g: placeholderColor.g / 255, b: placeholderColor.b / 255 } }];
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
      
      const errorColor = this.hexToRgb(tokens.colors.danger['500']);
      errorMsg.fills = [{ type: 'SOLID', color: { r: errorColor.r / 255, g: errorColor.g / 255, b: errorColor.b / 255 } }];
      
      container.appendChild(errorMsg);
    }
    
    // Position and add to page
    container.x = this.getNextX();
    container.y = 200;
    this.page.appendChild(container);
    
    // Create component
    const component = figma.createComponent();
    component.appendChild(container);
    component.name = `TextField/${variant}`;
    this.page.appendChild(component);
  }

  createCard(tokens: Tokens, variant: 'default' | 'elevated'): void {
    const card = figma.createFrame();
    card.name = `Card/${variant}`;
    card.resize(280, 160);
    card.cornerRadius = tokens.radii.lg;
    card.layoutMode = 'VERTICAL';
    card.itemSpacing = tokens.spacing.md;
    card.paddingTop = tokens.spacing.md;
    card.paddingRight = tokens.spacing.md;
    card.paddingBottom = tokens.spacing.md;
    card.paddingLeft = tokens.spacing.md;
    
    // Set background
    const bgColor = this.hexToRgb(tokens.colors.neutral['0']);
    card.fills = [{ type: 'SOLID', color: { r: bgColor.r / 255, g: bgColor.g / 255, b: bgColor.b / 255 } }];
    
    // Add shadow effect
    const shadowLevel = variant === 'elevated' ? '2' : '1';
    const shadow = tokens.elevation[shadowLevel];
    const shadowColor = this.hexToRgb(shadow.color);
    
    card.effects = [{
      type: 'DROP_SHADOW',
      color: { r: shadowColor.r / 255, g: shadowColor.g / 255, b: shadowColor.b / 255, a: 0.1 },
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
    
    const titleColor = this.hexToRgb(tokens.colors.neutral['900']);
    title.fills = [{ type: 'SOLID', color: { r: titleColor.r / 255, g: titleColor.g / 255, b: titleColor.b / 255 } }];
    
    card.appendChild(title);
    
    // Add content
    const content = figma.createText();
    content.characters = 'This is the card content area. You can add any content here including text, images, or other components.';
    content.fontSize = tokens.typography.body.fontSize;
    content.fontName = { family: tokens.typography.body.fontFamily, style: 'Regular' };
    
    const contentColor = this.hexToRgb(tokens.colors.neutral['900']);
    content.fills = [{ type: 'SOLID', color: { r: contentColor.r / 255, g: contentColor.g / 255, b: contentColor.b / 255 } }];
    
    content.resize(card.width - (tokens.spacing.md * 2), content.height);
    card.appendChild(content);
    
    // Position and add to page
    card.x = this.getNextX();
    card.y = 350;
    this.page.appendChild(card);
    
    // Create component
    const component = figma.createComponent();
    component.appendChild(card);
    component.name = `Card/${variant}`;
    this.page.appendChild(component);
  }

  private getButtonBackground(tokens: Tokens, variant: string) {
    switch (variant) {
      case 'primary':
        return this.hexToRgbNormalized(tokens.colors.primary['500']);
      case 'secondary':
        return this.hexToRgbNormalized(tokens.colors.neutral['50']);
      case 'danger':
        return this.hexToRgbNormalized(tokens.colors.danger['500']);
      default:
        return this.hexToRgbNormalized(tokens.colors.primary['500']);
    }
  }

  private getButtonTextColor(tokens: Tokens, variant: string) {
    switch (variant) {
      case 'primary':
      case 'danger':
        return this.hexToRgbNormalized(tokens.colors.neutral['0']);
      case 'secondary':
        return this.hexToRgbNormalized(tokens.colors.neutral['900']);
      default:
        return this.hexToRgbNormalized(tokens.colors.neutral['0']);
    }
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private hexToRgbNormalized(hex: string): { r: number; g: number; b: number } {
    const rgb = this.hexToRgb(hex);
    return {
      r: rgb.r / 255,
      g: rgb.g / 255,
      b: rgb.b / 255
    };
  }

  private getNextX(): number {
    const existingNodes = this.page.children;
    if (existingNodes.length === 0) return 50;
    
    const rightmostX = Math.max(...existingNodes.map(node => node.x + node.width));
    return rightmostX + 50;
  }
}
