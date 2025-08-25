import { Tokens } from './tokens';

export interface FigmaComponent {
  name: string;
  content: string;
  type: 'figma-tokens' | 'figma-styles' | 'figma-components';
  instructions: string;
}

export function generateFigmaAssets(tokens: Tokens): FigmaComponent[] {
  const assets: FigmaComponent[] = [];

  // Generate Figma Design Tokens JSON
  assets.push(generateFigmaTokens(tokens));
  
  // Generate Figma Styles Import Guide
  assets.push(generateFigmaStylesGuide(tokens));
  
  // Generate Component Specifications
  assets.push(generateFigmaComponentSpecs(tokens));

  return assets;
}

function generateFigmaTokens(tokens: Tokens): FigmaComponent {
  const figmaTokens = {
    "global": {
      "colors": {},
      "typography": {},
      "spacing": {},
      "borderRadius": {},
      "boxShadow": {}
    }
  };

  // Convert colors to Figma format
  Object.entries(tokens.colors).forEach(([category, shades]) => {
    Object.entries(shades).forEach(([shade, value]) => {
      (figmaTokens.global.colors as any)[`${category}-${shade}`] = {
        "value": value,
        "type": "color"
      };
    });
  });

  // Convert typography to Figma format
  Object.entries(tokens.typography).forEach(([name, typo]) => {
    (figmaTokens.global.typography as any)[name] = {
      "value": {
        "fontFamily": typo.fontFamily,
        "fontWeight": typo.fontWeight,
        "fontSize": typo.fontSize,
        "lineHeight": typo.lineHeight
      },
      "type": "typography"
    };
  });

  // Convert spacing to Figma format
  Object.entries(tokens.spacing).forEach(([name, value]) => {
    (figmaTokens.global.spacing as any)[name] = {
      "value": `${value}px`,
      "type": "spacing"
    };
  });

  // Convert border radius to Figma format
  Object.entries(tokens.radii).forEach(([name, value]) => {
    (figmaTokens.global.borderRadius as any)[name] = {
      "value": `${value}px`,
      "type": "borderRadius"
    };
  });

  // Convert elevation to Figma format
  Object.entries(tokens.elevation).forEach(([name, shadow]) => {
    (figmaTokens.global.boxShadow as any)[name] = {
      "value": {
        "x": shadow.x,
        "y": shadow.y,
        "blur": shadow.blur,
        "spread": shadow.spread,
        "color": shadow.color,
        "type": shadow.type
      },
      "type": "boxShadow"
    };
  });

  return {
    name: 'figma-tokens.json',
    content: JSON.stringify(figmaTokens, null, 2),
    type: 'figma-tokens',
    instructions: `
📋 **How to Import Design Tokens to Figma:**

1. **Install Figma Tokens Plugin:**
   - Go to Figma → Plugins → Browse all plugins
   - Search for "Figma Tokens" by Jan Six
   - Install the plugin

2. **Import Tokens:**
   - Open your Figma file
   - Run the Figma Tokens plugin
   - Click "Load from JSON"
   - Upload this figma-tokens.json file
   - Click "Update Figma" to apply all tokens

3. **Your tokens will be available as:**
   - Color styles (primary-500, neutral-0, etc.)
   - Text styles (body, label, etc.)
   - Effect styles (elevation-1, elevation-2, etc.)

✅ **Ready to use in your Figma designs!**
    `
  };
}

function generateFigmaStylesGuide(tokens: Tokens): FigmaComponent {
  const guide = `# Figma Styles Setup Guide

## 🎨 Color Styles
Create these color styles in Figma:

${Object.entries(tokens.colors).map(([category, shades]) => 
  `### ${category.charAt(0).toUpperCase() + category.slice(1)}
${Object.entries(shades).map(([shade, value]) => 
  `- **${category}-${shade}**: ${value}`
).join('\n')}`
).join('\n\n')}

## 📝 Text Styles
Create these text styles in Figma:

${Object.entries(tokens.typography).map(([name, typo]) => 
  `### ${name.charAt(0).toUpperCase() + name.slice(1)}
- Font: ${typo.fontFamily}
- Size: ${typo.fontSize}px
- Weight: ${typo.fontWeight}
- Line Height: ${typo.lineHeight}px`
).join('\n\n')}

## ✨ Effect Styles (Shadows)
Create these effect styles in Figma:

${Object.entries(tokens.elevation).map(([name, shadow]) => 
  `### Elevation ${name}
- Type: Drop Shadow
- X: ${shadow.x}px
- Y: ${shadow.y}px
- Blur: ${shadow.blur}px
- Spread: ${shadow.spread}px
- Color: ${shadow.color}`
).join('\n\n')}

## 📐 Layout Grid (Spacing)
Use these spacing values for layout grids and auto-layout:

${Object.entries(tokens.spacing).map(([name, value]) => 
  `- **${name}**: ${value}px`
).join('\n')}

---

## 🚀 Quick Setup Steps:

1. **Create Color Styles:**
   - Select a shape → Right panel → Fill → Create style
   - Name it exactly as shown above (e.g., "primary-500")

2. **Create Text Styles:**
   - Select text → Right panel → Text → Create style
   - Set font properties as specified above

3. **Create Effect Styles:**
   - Select shape → Right panel → Effects → + → Drop shadow
   - Set values as specified → Create style

4. **Set up Auto Layout:**
   - Use spacing values for consistent padding/gaps
   - Create layout grids with these measurements
`;

  return {
    name: 'figma-setup-guide.md',
    content: guide,
    type: 'figma-styles',
    instructions: `
📖 **Manual Setup Guide**

This guide helps you manually create all styles in Figma.
Follow the step-by-step instructions to set up your design system.

**Tip:** Use the figma-tokens.json file for automatic setup instead!
    `
  };
}

function generateFigmaComponentSpecs(tokens: Tokens): FigmaComponent {
  const specs = `# Figma Component Specifications

## 🔘 Button Component

### Variants:
- **Primary**: Background: primary-500, Text: neutral-0
- **Secondary**: Background: neutral-50, Text: neutral-900, Border: 1px neutral-900
- **Danger**: Background: danger-500, Text: neutral-0

### Sizes:
- **Small**: Padding: ${tokens.spacing.xs}px ${tokens.spacing.sm}px, Font: label
- **Medium**: Padding: ${tokens.spacing.sm}px ${tokens.spacing.md}px, Font: body
- **Large**: Padding: ${tokens.spacing.md}px ${tokens.spacing.lg}px, Font: body

### Properties:
- Border Radius: ${tokens.radii.md}px
- States: Default, Hover, Pressed, Disabled

---

## 📝 Text Field Component

### Structure:
1. **Label** (optional)
   - Font: label style
   - Color: neutral-900
   - Margin bottom: ${tokens.spacing.xs}px

2. **Input Container**
   - Background: neutral-0
   - Border: 1px neutral-50 (default), primary-500 (focus), danger-500 (error)
   - Border Radius: ${tokens.radii.sm}px
   - Padding: ${tokens.spacing.sm}px

3. **Input Text**
   - Font: body style
   - Color: neutral-900

4. **Error Message** (optional)
   - Font: label style
   - Color: danger-500
   - Margin top: ${tokens.spacing.xs}px

### States:
- Default, Focus, Error, Disabled

---

## 🃏 Card Component

### Structure:
- Background: neutral-0
- Border Radius: ${tokens.radii.lg}px
- Padding: ${tokens.spacing.md}px (default)
- Shadow: elevation-1 (default), elevation-2 (hover)

### Variants:
- **Small Padding**: ${tokens.spacing.sm}px
- **Medium Padding**: ${tokens.spacing.md}px
- **Large Padding**: ${tokens.spacing.lg}px

### Optional Elements:
- **Title**: Font: label style, Color: neutral-900, Margin bottom: ${tokens.spacing.md}px

---

## 🎯 How to Build in Figma:

### 1. Create Master Components:
- Use Auto Layout for flexible sizing
- Set up component properties for variants
- Apply your created styles consistently

### 2. Component Properties to Add:
**Button:**
- Variant: Primary | Secondary | Danger
- Size: Small | Medium | Large
- State: Default | Hover | Pressed | Disabled
- Text: Instance swap

**Text Field:**
- State: Default | Focus | Error | Disabled
- Has Label: Boolean
- Has Error: Boolean
- Label Text: Text property
- Placeholder: Text property

**Card:**
- Padding: Small | Medium | Large
- Elevation: 1 | 2
- Has Title: Boolean
- Title Text: Text property

### 3. Instance Swaps:
- Create text components for labels, body text
- Create icon components for interactive elements
- Use instance swap properties for flexible content

---

## ✅ Final Checklist:

- [ ] All color styles created and applied
- [ ] All text styles created and applied  
- [ ] All effect styles created and applied
- [ ] Button component with all variants
- [ ] Text Field component with all states
- [ ] Card component with all options
- [ ] Components use Auto Layout
- [ ] Component properties configured
- [ ] Instance swaps set up for flexible content

**Your design system is now ready for production use! 🚀**
`;

  return {
    name: 'figma-component-specs.md',
    content: specs,
    type: 'figma-components',
    instructions: `
🔧 **Component Building Guide**

This specification shows you exactly how to build each component in Figma:
- Exact measurements and spacing
- Color and text style assignments  
- Component properties to set up
- Auto Layout configurations

Follow this guide to create production-ready Figma components!
    `
  };
}
