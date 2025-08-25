import { DesignTokens } from '../tokens';
import { createVariantGroupName, findNodeByName, setPluginData } from '../utils';

interface ButtonProps {
  state: 'Default' | 'Hover' | 'Pressed' | 'Disabled';
  size: 'Sm' | 'Md' | 'Lg';
  tone: 'Primary' | 'Neutral' | 'Danger';
}

export async function createButtonComponent(tokens: DesignTokens, parent: FrameNode): Promise<ComponentSetNode> {
  const existingSet = await findNodeByName('DS/Button', parent);
  if (existingSet?.type === 'COMPONENT_SET') {
    return updateButtonComponent(existingSet as ComponentSetNode, tokens);
  }

  const componentSet = figma.createComponentSet();
  componentSet.name = 'DS/Button';
  parent.appendChild(componentSet);

  const variants: ButtonProps[] = [];
  ['Default', 'Hover', 'Pressed', 'Disabled'].forEach(state => {
    ['Sm', 'Md', 'Lg'].forEach(size => {
      ['Primary', 'Neutral', 'Danger'].forEach(tone => {
        variants.push({ state, size, tone } as ButtonProps);
      });
    });
  });

  for (const variant of variants) {
    await createButtonVariant(componentSet, variant, tokens);
  }

  setPluginData(componentSet, 'version', '1.0.0');
  return componentSet;
}

async function createButtonVariant(
  componentSet: ComponentSetNode,
  props: ButtonProps,
  tokens: DesignTokens
): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = [
    `State=${props.state}`,
    `Size=${props.size}`,
    `Tone=${props.tone}`
  ].join(', ');

  // Set up auto layout
  component.layoutMode = 'HORIZONTAL';
  component.primaryAxisAlignItems = 'CENTER';
  component.counterAxisAlignItems = 'CENTER';
  component.horizontalPadding = tokens.spacing[props.size === 'Sm' ? 'md' : props.size === 'Md' ? 'lg' : 'xl'];
  component.verticalPadding = tokens.spacing[props.size === 'Sm' ? 'xs' : props.size === 'md' ? 'sm' : 'md'];
  component.itemSpacing = tokens.spacing.sm;
  component.cornerRadius = tokens.radii.md;

  // Create text node
  const text = figma.createText();
  await figma.loadFontAsync({ family: tokens.typography.label.fontFamily, style: 'Regular' });
  text.fontName = { family: tokens.typography.label.fontFamily, style: 'Regular' };
  text.fontSize = tokens.typography.label.fontSize;
  text.characters = 'Button';
  
  // Apply styles based on variant
  const colorKey = props.tone.toLowerCase();
  const baseColor = tokens.colors[colorKey]['500'];
  const rgb = hexToRgb(baseColor);

  switch (props.state) {
    case 'Default':
      component.fills = [{ type: 'SOLID', color: rgb }];
      text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      break;
    case 'Hover':
      component.fills = [{ type: 'SOLID', color: rgb, opacity: 0.9 }];
      text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      break;
    case 'Pressed':
      component.fills = [{ type: 'SOLID', color: rgb, opacity: 0.8 }];
      text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      break;
    case 'Disabled':
      component.fills = [{ type: 'SOLID', color: rgb, opacity: 0.5 }];
      text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.7 }];
      break;
  }

  component.appendChild(text);
  componentSet.appendChild(component);
  return component;
}

async function updateButtonComponent(
  componentSet: ComponentSetNode,
  tokens: DesignTokens
): Promise<ComponentSetNode> {
  // Update existing variants
  for (const component of componentSet.children) {
    if (component.type !== 'COMPONENT') continue;

    const props = parseButtonVariantName(component.name);
    if (!props) continue;

    // Update layout and styles
    component.layoutMode = 'HORIZONTAL';
    component.primaryAxisAlignItems = 'CENTER';
    component.counterAxisAlignItems = 'CENTER';
    component.horizontalPadding = tokens.spacing[props.size === 'Sm' ? 'md' : props.size === 'Md' ? 'lg' : 'xl'];
    component.verticalPadding = tokens.spacing[props.size === 'Sm' ? 'xs' : props.size === 'md' ? 'sm' : 'md'];
    component.itemSpacing = tokens.spacing.sm;
    component.cornerRadius = tokens.radii.md;

    // Update text styles
    const text = component.findOne(node => node.type === 'TEXT') as TextNode;
    if (text) {
      await figma.loadFontAsync({ family: tokens.typography.label.fontFamily, style: 'Regular' });
      text.fontName = { family: tokens.typography.label.fontFamily, style: 'Regular' };
      text.fontSize = tokens.typography.label.fontSize;
    }

    // Update colors
    const colorKey = props.tone.toLowerCase();
    const baseColor = tokens.colors[colorKey]['500'];
    const rgb = hexToRgb(baseColor);

    switch (props.state) {
      case 'Default':
        component.fills = [{ type: 'SOLID', color: rgb }];
        if (text) text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        break;
      case 'Hover':
        component.fills = [{ type: 'SOLID', color: rgb, opacity: 0.9 }];
        if (text) text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        break;
      case 'Pressed':
        component.fills = [{ type: 'SOLID', color: rgb, opacity: 0.8 }];
        if (text) text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        break;
      case 'Disabled':
        component.fills = [{ type: 'SOLID', color: rgb, opacity: 0.5 }];
        if (text) text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.7 }];
        break;
    }
  }

  return componentSet;
}

function parseButtonVariantName(name: string): ButtonProps | null {
  const match = name.match(/State=(\w+),\s*Size=(\w+),\s*Tone=(\w+)/);
  if (!match) return null;

  return {
    state: match[1] as ButtonProps['state'],
    size: match[2] as ButtonProps['size'],
    tone: match[3] as ButtonProps['tone']
  };
}
