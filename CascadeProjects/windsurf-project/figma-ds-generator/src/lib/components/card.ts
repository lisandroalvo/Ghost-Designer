import { DesignTokens } from '../tokens';
import { findNodeByName, setPluginData } from '../utils';

interface CardProps {
  elevation: '0' | '1' | '2';
  padding: 'Sm' | 'Md' | 'Lg';
}

export async function createCardComponent(tokens: DesignTokens, parent: FrameNode): Promise<ComponentSetNode> {
  const existingSet = await findNodeByName('DS/Card', parent);
  if (existingSet?.type === 'COMPONENT_SET') {
    return updateCardComponent(existingSet as ComponentSetNode, tokens);
  }

  const componentSet = figma.createComponentSet();
  componentSet.name = 'DS/Card';
  parent.appendChild(componentSet);

  const variants: CardProps[] = [];
  ['0', '1', '2'].forEach(elevation => {
    ['Sm', 'Md', 'Lg'].forEach(padding => {
      variants.push({ 
        elevation: elevation as CardProps['elevation'],
        padding: padding as CardProps['padding']
      });
    });
  });

  for (const variant of variants) {
    await createCardVariant(componentSet, variant, tokens);
  }

  setPluginData(componentSet, 'version', '1.0.0');
  return componentSet;
}

async function createCardVariant(
  componentSet: ComponentSetNode,
  props: CardProps,
  tokens: DesignTokens
): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = [
    `Elevation=${props.elevation}`,
    `Padding=${props.padding}`
  ].join(', ');

  // Set up auto layout
  component.layoutMode = 'VERTICAL';
  component.primaryAxisAlignItems = 'START';
  component.counterAxisAlignItems = 'START';
  component.itemSpacing = tokens.spacing.md;
  
  // Set padding based on size
  const padding = tokens.spacing[props.padding.toLowerCase()];
  component.paddingTop = padding;
  component.paddingBottom = padding;
  component.paddingLeft = padding;
  component.paddingRight = padding;

  // Set background and corner radius
  component.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  component.cornerRadius = tokens.radii.lg;

  // Create title
  const title = figma.createText();
  await figma.loadFontAsync({ family: tokens.typography.label.fontFamily, style: 'Regular' });
  title.fontName = { family: tokens.typography.label.fontFamily, style: 'Regular' };
  title.fontSize = tokens.typography.label.fontSize;
  title.characters = 'Card Title';
  title.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];

  // Create body text
  const body = figma.createText();
  await figma.loadFontAsync({ family: tokens.typography.body.fontFamily, style: 'Regular' });
  body.fontName = { family: tokens.typography.body.fontFamily, style: 'Regular' };
  body.fontSize = tokens.typography.body.fontSize;
  body.characters = 'Card content goes here. This is a placeholder text to demonstrate the layout.';
  body.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 0.7 } }];

  // Apply elevation
  if (props.elevation !== '0') {
    const elevation = tokens.elevation[props.elevation];
    component.effects = [{
      type: 'DROP_SHADOW',
      color: { 
        r: 0, 
        g: 0, 
        b: 0, 
        a: Number(props.elevation) * 0.1 
      },
      offset: { x: elevation.x, y: elevation.y },
      radius: elevation.blur,
      spread: elevation.spread,
      visible: true,
      blendMode: 'NORMAL'
    }];
  }

  component.appendChild(title);
  component.appendChild(body);
  component.resize(320, 'AUTO');
  componentSet.appendChild(component);
  return component;
}

async function updateCardComponent(
  componentSet: ComponentSetNode,
  tokens: DesignTokens
): Promise<ComponentSetNode> {
  // Update existing variants
  for (const component of componentSet.children) {
    if (component.type !== 'COMPONENT') continue;

    const props = parseCardVariantName(component.name);
    if (!props) continue;

    // Update layout
    component.layoutMode = 'VERTICAL';
    component.primaryAxisAlignItems = 'START';
    component.counterAxisAlignItems = 'START';
    component.itemSpacing = tokens.spacing.md;

    // Update padding
    const padding = tokens.spacing[props.padding.toLowerCase()];
    component.paddingTop = padding;
    component.paddingBottom = padding;
    component.paddingLeft = padding;
    component.paddingRight = padding;

    // Update corner radius
    component.cornerRadius = tokens.radii.lg;

    // Update elevation
    if (props.elevation !== '0') {
      const elevation = tokens.elevation[props.elevation];
      component.effects = [{
        type: 'DROP_SHADOW',
        color: { 
          r: 0, 
          g: 0, 
          b: 0, 
          a: Number(props.elevation) * 0.1 
        },
        offset: { x: elevation.x, y: elevation.y },
        radius: elevation.blur,
        spread: elevation.spread,
        visible: true,
        blendMode: 'NORMAL'
      }];
    } else {
      component.effects = [];
    }
  }

  return componentSet;
}

function parseCardVariantName(name: string): CardProps | null {
  const match = name.match(/Elevation=(\d),\s*Padding=(\w+)/);
  if (!match) return null;

  return {
    elevation: match[1] as CardProps['elevation'],
    padding: match[2] as CardProps['padding']
  };
}
