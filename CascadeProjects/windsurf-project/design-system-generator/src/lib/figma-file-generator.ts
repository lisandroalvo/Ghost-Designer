import { Tokens } from './tokens';

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  [key: string]: any;
}

interface FigmaComponent extends FigmaNode {
  type: 'COMPONENT';
  children: FigmaNode[];
}

interface FigmaFile {
  name: string;
  role: string;
  lastModified: string;
  editorType: string;
  thumbnailUrl: string;
  version: string;
  document: {
    id: string;
    name: string;
    type: 'DOCUMENT';
    children: FigmaNode[];
  };
  components: Record<string, FigmaComponent>;
  componentSets: Record<string, any>;
  schemaVersion: number;
  styles: Record<string, any>;
}

export class FigmaFileGenerator {
  private nodeId = 1;
  private components: Record<string, FigmaComponent> = {};
  private styles: Record<string, any> = {};

  generateFigmaFile(tokens: Tokens): string {
    // Create the main document structure
    const figmaFile: FigmaFile = {
      name: "Design System Components",
      role: "owner",
      lastModified: new Date().toISOString(),
      editorType: "figma",
      thumbnailUrl: "",
      version: "1.0.0",
      document: {
        id: this.generateId(),
        name: "Document",
        type: "DOCUMENT",
        children: []
      },
      components: {},
      componentSets: {},
      schemaVersion: 0,
      styles: {}
    };

    // Create a page for components
    const page = this.createPage("Design System");
    figmaFile.document.children.push(page);

    // Generate styles
    this.createStyles(tokens);
    figmaFile.styles = this.styles;

    // Generate components
    const buttonComponents = this.createButtonComponents(tokens);
    const textFieldComponents = this.createTextFieldComponents(tokens);
    const cardComponents = this.createCardComponents(tokens);

    // Add components to page
    page.children.push(...buttonComponents, ...textFieldComponents, ...cardComponents);

    // Add components to file
    [...buttonComponents, ...textFieldComponents, ...cardComponents].forEach(comp => {
      if (comp.type === 'COMPONENT') {
        this.components[comp.id] = comp as FigmaComponent;
      }
    });

    figmaFile.components = this.components;

    return JSON.stringify(figmaFile, null, 2);
  }

  private generateId(): string {
    return `${this.nodeId++}:${Math.random().toString(36).substr(2, 9)}`;
  }

  private createPage(name: string): FigmaNode {
    return {
      id: this.generateId(),
      name,
      type: 'CANVAS',
      children: [],
      backgroundColor: { r: 0.96, g: 0.96, b: 0.96 },
      prototypeStartNodeID: null,
      flowStartingPoints: [],
      prototypeDevice: {
        type: 'NONE',
        rotation: 'CCW_0'
      }
    };
  }

  private createStyles(tokens: Tokens): void {
    // Create color styles
    Object.entries(tokens.colors).forEach(([category, shades]) => {
      Object.entries(shades).forEach(([shade, value]) => {
        const styleId = this.generateId();
        this.styles[styleId] = {
          key: styleId,
          name: `${category}/${shade}`,
          description: "",
          remote: false,
          styleType: 'FILL',
          paints: [{
            blendMode: 'NORMAL',
            type: 'SOLID',
            color: this.hexToRgb(value)
          }]
        };
      });
    });

    // Create text styles
    Object.entries(tokens.typography).forEach(([name, typo]) => {
      const styleId = this.generateId();
      this.styles[styleId] = {
        key: styleId,
        name: `Text/${name}`,
        description: "",
        remote: false,
        styleType: 'TEXT',
        fontSize: typo.fontSize,
        fontName: {
          family: typo.fontFamily,
          style: 'Regular'
        },
        lineHeight: {
          value: typo.lineHeight,
          unit: 'PIXELS'
        },
        fontWeight: typo.fontWeight
      };
    });
  }

  private createButtonComponents(tokens: Tokens): FigmaNode[] {
    const variants = ['primary', 'secondary', 'danger'];
    return variants.map((variant, index) => {
      const component = this.createButtonComponent(tokens, variant);
      component.x = 50;
      component.y = 50 + (index * 80);
      return component;
    });
  }

  private createButtonComponent(tokens: Tokens, variant: string): FigmaComponent {
    const componentId = this.generateId();
    const frameId = this.generateId();
    const textId = this.generateId();

    // Get colors based on variant
    let bgColor: { r: number; g: number; b: number };
    let textColor: { r: number; g: number; b: number };
    let strokes: any[] = [];

    switch (variant) {
      case 'primary':
        bgColor = this.hexToRgb(tokens.colors.primary['500']);
        textColor = this.hexToRgb(tokens.colors.neutral['0']);
        break;
      case 'secondary':
        bgColor = this.hexToRgb(tokens.colors.neutral['50']);
        textColor = this.hexToRgb(tokens.colors.neutral['900']);
        strokes = [{
          blendMode: 'NORMAL',
          type: 'SOLID',
          color: this.hexToRgb(tokens.colors.neutral['900'])
        }];
        break;
      case 'danger':
        bgColor = this.hexToRgb(tokens.colors.danger['500']);
        textColor = this.hexToRgb(tokens.colors.neutral['0']);
        break;
      default:
        bgColor = this.hexToRgb(tokens.colors.primary['500']);
        textColor = this.hexToRgb(tokens.colors.neutral['0']);
    }

    const buttonText = `${variant.charAt(0).toUpperCase() + variant.slice(1)} Button`;

    return {
      id: componentId,
      name: `Button/${variant}`,
      type: 'COMPONENT',
      x: 0,
      y: 0,
      width: 120,
      height: 40,
      // Component properties
      componentPropertyDefinitions: {},
      // Auto Layout properties
      layoutMode: 'HORIZONTAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'FIXED',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      paddingLeft: tokens.spacing.md,
      paddingRight: tokens.spacing.md,
      paddingTop: tokens.spacing.sm,
      paddingBottom: tokens.spacing.sm,
      itemSpacing: tokens.spacing.xs,
      // Responsive properties
      constraints: {
        horizontal: 'MIN',
        vertical: 'MIN'
      },
      children: [{
        id: frameId,
        name: 'Button Frame',
        type: 'FRAME',
        x: 0,
        y: 0,
        width: 120,
        height: 40,
        // Auto Layout
        layoutMode: 'HORIZONTAL',
        primaryAxisSizingMode: 'AUTO',
        counterAxisSizingMode: 'FIXED',
        primaryAxisAlignItems: 'CENTER',
        counterAxisAlignItems: 'CENTER',
        paddingLeft: tokens.spacing.md,
        paddingRight: tokens.spacing.md,
        paddingTop: tokens.spacing.sm,
        paddingBottom: tokens.spacing.sm,
        itemSpacing: tokens.spacing.xs,
        fills: [{
          blendMode: 'NORMAL',
          type: 'SOLID',
          color: bgColor
        }],
        strokes,
        strokeWeight: strokes.length > 0 ? 1 : 0,
        cornerRadius: tokens.radii.md,
        // Responsive constraints
        constraints: {
          horizontal: 'STRETCH',
          vertical: 'STRETCH'
        },
        children: [{
          id: textId,
          name: 'Button Text',
          type: 'TEXT',
          x: 0,
          y: 0,
          width: 'AUTO',
          height: 'AUTO',
          characters: buttonText,
          fontSize: tokens.typography.label.fontSize,
          fontName: {
            family: tokens.typography.label.fontFamily,
            style: 'Regular'
          },
          fontWeight: tokens.typography.label.fontWeight,
          textAlignHorizontal: 'CENTER',
          textAlignVertical: 'CENTER',
          // Text auto-resize
          textAutoResize: 'WIDTH_AND_HEIGHT',
          // Responsive constraints
          constraints: {
            horizontal: 'CENTER',
            vertical: 'CENTER'
          },
          fills: [{
            blendMode: 'NORMAL',
            type: 'SOLID',
            color: textColor
          }]
        }]
      }]
    };
  }

  private createTextFieldComponents(tokens: Tokens): FigmaNode[] {
    const variants = ['default', 'error', 'disabled'];
    return variants.map((variant, index) => {
      const component = this.createTextFieldComponent(tokens, variant);
      component.x = 200;
      component.y = 50 + (index * 120);
      return component;
    });
  }

  private createTextFieldComponent(tokens: Tokens, variant: string): FigmaComponent {
    const componentId = this.generateId();
    const containerId = this.generateId();
    const labelId = this.generateId();
    const inputId = this.generateId();
    const placeholderId = this.generateId();

    const isDisabled = variant === 'disabled';
    const hasError = variant === 'error';

    const bgColor = isDisabled 
      ? this.hexToRgb(tokens.colors.neutral['50'])
      : this.hexToRgb(tokens.colors.neutral['0']);

    const borderColor = hasError 
      ? this.hexToRgb(tokens.colors.danger['500'])
      : this.hexToRgb(tokens.colors.neutral['50']);

    const children: FigmaNode[] = [
      {
        id: labelId,
        name: 'Label',
        type: 'TEXT',
        x: 0,
        y: 0,
        width: 'AUTO',
        height: 'AUTO',
        characters: 'Label Text',
        fontSize: tokens.typography.label.fontSize,
        fontName: {
          family: tokens.typography.label.fontFamily,
          style: 'Regular'
        },
        fontWeight: tokens.typography.label.fontWeight,
        textAutoResize: 'WIDTH_AND_HEIGHT',
        constraints: {
          horizontal: 'LEFT',
          vertical: 'TOP'
        },
        fills: [{
          blendMode: 'NORMAL',
          type: 'SOLID',
          color: this.hexToRgb(tokens.colors.neutral['900'])
        }]
      },
      {
        id: inputId,
        name: 'Input Field',
        type: 'FRAME',
        x: 0,
        y: 0,
        width: 250,
        height: 40,
        layoutMode: 'HORIZONTAL',
        primaryAxisSizingMode: 'FIXED',
        counterAxisSizingMode: 'FIXED',
        primaryAxisAlignItems: 'CENTER',
        counterAxisAlignItems: 'CENTER',
        paddingLeft: tokens.spacing.sm,
        paddingRight: tokens.spacing.sm,
        paddingTop: tokens.spacing.xs,
        paddingBottom: tokens.spacing.xs,
        fills: [{
          blendMode: 'NORMAL',
          type: 'SOLID',
          color: bgColor
        }],
        strokes: [{
          blendMode: 'NORMAL',
          type: 'SOLID',
          color: borderColor
        }],
        strokeWeight: 1,
        cornerRadius: tokens.radii.sm,
        constraints: {
          horizontal: 'STRETCH',
          vertical: 'MIN'
        },
        children: [{
          id: placeholderId,
          name: 'Placeholder',
          type: 'TEXT',
          x: 0,
          y: 0,
          width: 'AUTO',
          height: 'AUTO',
          characters: 'Placeholder text',
          fontSize: tokens.typography.body.fontSize,
          fontName: {
            family: tokens.typography.body.fontFamily,
            style: 'Regular'
          },
          textAutoResize: 'WIDTH_AND_HEIGHT',
          opacity: isDisabled ? 0.5 : 1,
          constraints: {
            horizontal: 'LEFT',
            vertical: 'CENTER'
          },
          fills: [{
            blendMode: 'NORMAL',
            type: 'SOLID',
            color: this.hexToRgb(tokens.colors.neutral['900'])
          }]
        }]
      }
    ];

    if (hasError) {
      children.push({
        id: this.generateId(),
        name: 'Error Message',
        type: 'TEXT',
        x: 0,
        y: 0,
        width: 'AUTO',
        height: 'AUTO',
        characters: 'Error message here',
        fontSize: tokens.typography.label.fontSize,
        fontName: {
          family: tokens.typography.label.fontFamily,
          style: 'Regular'
        },
        textAutoResize: 'WIDTH_AND_HEIGHT',
        constraints: {
          horizontal: 'LEFT',
          vertical: 'TOP'
        },
        fills: [{
          blendMode: 'NORMAL',
          type: 'SOLID',
          color: this.hexToRgb(tokens.colors.danger['500'])
        }]
      });
    }

    return {
      id: componentId,
      name: `TextField/${variant}`,
      type: 'COMPONENT',
      x: 0,
      y: 0,
      width: 250,
      height: 'AUTO',
      layoutMode: 'VERTICAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'FIXED',
      primaryAxisAlignItems: 'MIN',
      counterAxisAlignItems: 'MIN',
      itemSpacing: tokens.spacing.xs,
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      constraints: {
        horizontal: 'MIN',
        vertical: 'MIN'
      },
      children: [{
        id: containerId,
        name: 'TextField Container',
        type: 'FRAME',
        x: 0,
        y: 0,
        width: 250,
        height: 'AUTO',
        layoutMode: 'VERTICAL',
        primaryAxisSizingMode: 'AUTO',
        counterAxisSizingMode: 'FIXED',
        primaryAxisAlignItems: 'MIN',
        counterAxisAlignItems: 'MIN',
        itemSpacing: tokens.spacing.xs,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
        fills: [],
        constraints: {
          horizontal: 'STRETCH',
          vertical: 'MIN'
        },
        children
      }]
    };
  }

  private createCardComponents(tokens: Tokens): FigmaNode[] {
    const variants = ['default', 'elevated'];
    return variants.map((variant, index) => {
      const component = this.createCardComponent(tokens, variant);
      component.x = 500;
      component.y = 50 + (index * 200);
      return component;
    });
  }

  private createCardComponent(tokens: Tokens, variant: string): FigmaComponent {
    const componentId = this.generateId();
    const frameId = this.generateId();
    const titleId = this.generateId();
    const contentId = this.generateId();

    const shadowLevel = variant === 'elevated' ? '2' : '1';
    const shadow = tokens.elevation[shadowLevel];

    return {
      id: componentId,
      name: `Card/${variant}`,
      type: 'COMPONENT',
      x: 0,
      y: 0,
      width: 280,
      height: 'AUTO',
      layoutMode: 'VERTICAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'FIXED',
      primaryAxisAlignItems: 'MIN',
      counterAxisAlignItems: 'MIN',
      itemSpacing: 0,
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      constraints: {
        horizontal: 'MIN',
        vertical: 'MIN'
      },
      children: [{
        id: frameId,
        name: 'Card Frame',
        type: 'FRAME',
        x: 0,
        y: 0,
        width: 280,
        height: 'AUTO',
        layoutMode: 'VERTICAL',
        primaryAxisSizingMode: 'AUTO',
        counterAxisSizingMode: 'FIXED',
        primaryAxisAlignItems: 'MIN',
        counterAxisAlignItems: 'STRETCH',
        itemSpacing: tokens.spacing.sm,
        paddingLeft: tokens.spacing.md,
        paddingRight: tokens.spacing.md,
        paddingTop: tokens.spacing.md,
        paddingBottom: tokens.spacing.md,
        fills: [{
          blendMode: 'NORMAL',
          type: 'SOLID',
          color: this.hexToRgb(tokens.colors.neutral['0'])
        }],
        cornerRadius: tokens.radii.lg,
        constraints: {
          horizontal: 'STRETCH',
          vertical: 'MIN'
        },
        effects: [{
          type: 'DROP_SHADOW',
          color: { ...this.hexToRgb(shadow.color), a: 0.1 },
          offset: { x: shadow.x, y: shadow.y },
          radius: shadow.blur,
          spread: shadow.spread,
          visible: true,
          blendMode: 'NORMAL'
        }],
        children: [
          {
            id: titleId,
            name: 'Card Title',
            type: 'TEXT',
            x: 0,
            y: 0,
            width: 'AUTO',
            height: 'AUTO',
            characters: 'Card Title',
            fontSize: tokens.typography.body.fontSize,
            fontName: {
              family: tokens.typography.label.fontFamily,
              style: 'Regular'
            },
            fontWeight: tokens.typography.label.fontWeight,
            textAutoResize: 'WIDTH_AND_HEIGHT',
            constraints: {
              horizontal: 'LEFT',
              vertical: 'TOP'
            },
            fills: [{
              blendMode: 'NORMAL',
              type: 'SOLID',
              color: this.hexToRgb(tokens.colors.neutral['900'])
            }]
          },
          {
            id: contentId,
            name: 'Card Content',
            type: 'TEXT',
            x: 0,
            y: 0,
            width: 'AUTO',
            height: 'AUTO',
            characters: 'This is the card content area. You can add any content here including text, images, or other components.',
            fontSize: tokens.typography.body.fontSize,
            fontName: {
              family: tokens.typography.body.fontFamily,
              style: 'Regular'
            },
            lineHeight: {
              value: tokens.typography.body.lineHeight,
              unit: 'PIXELS'
            },
            textAutoResize: 'WIDTH_AND_HEIGHT',
            constraints: {
              horizontal: 'LEFT',
              vertical: 'TOP'
            },
            fills: [{
              blendMode: 'NORMAL',
              type: 'SOLID',
              color: this.hexToRgb(tokens.colors.neutral['900'])
            }]
          }
        ]
      }]
    };
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  }
}
