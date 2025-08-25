import { DesignTokens } from '../tokens';
import { findNodeByName, setPluginData } from '../utils';

interface TextFieldProps {
  state: 'Default' | 'Focus' | 'Error';
  size: 'Sm' | 'Md' | 'Lg';
  hasLabel: boolean;
}

export async function createTextFieldComponent(tokens: DesignTokens, parent: FrameNode): Promise<ComponentSetNode> {
  const existingSet = await findNodeByName('DS/TextField', parent);
  if (existingSet?.type === 'COMPONENT_SET') {
    return updateTextFieldComponent(existingSet as ComponentSetNode, tokens);
  }

  const componentSet = figma.createComponentSet();
  componentSet.name = 'DS/TextField';
  parent.appendChild(componentSet);

  const variants: TextFieldProps[] = [];
  ['Default', 'Focus', 'Error'].forEach(state => {
    ['Sm', 'Md', 'Lg'].forEach(size => {
      [true, false].forEach(hasLabel => {
        variants.push({ 
          state: state as TextFieldProps['state'], 
          size: size as TextFieldProps['size'],
          hasLabel 
        });
      });
    });
  });

  for (const variant of variants) {
    await createTextFieldVariant(componentSet, variant, tokens);
  }

  setPluginData(componentSet, 'version', '1.0.0');
  return componentSet;
}

async function createTextFieldVariant(
  componentSet: ComponentSetNode,
  props: TextFieldProps,
  tokens: DesignTokens
): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = [
    `State=${props.state}`,
    `Size=${props.size}`,
    `HasLabel=${props.hasLabel}`
  ].join(', ');

  // Set up auto layout
  component.layoutMode = 'VERTICAL';
  component.primaryAxisAlignItems = 'START';
  component.counterAxisAlignItems = 'START';
  component.itemSpacing = tokens.spacing.xs;

  // Create label if needed
  if (props.hasLabel) {
    const label = figma.createText();
    await figma.loadFontAsync({ family: tokens.typography.label.fontFamily, style: 'Regular' });
    label.fontName = { family: tokens.typography.label.fontFamily, style: 'Regular' };
    label.fontSize = tokens.typography.label.fontSize;
    label.characters = 'Label';
    label.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    component.appendChild(label);
  }

  // Create input container
  const inputContainer = figma.createFrame();
  inputContainer.name = 'Input Container';
  inputContainer.layoutMode = 'HORIZONTAL';
  inputContainer.primaryAxisAlignItems = 'CENTER';
  inputContainer.counterAxisAlignItems = 'CENTER';
  inputContainer.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  inputContainer.cornerRadius = tokens.radii.md;
  
  // Set size-specific properties
  const sizeMap = {
    'Sm': { height: 32, fontSize: tokens.typography.body.fontSize - 2 },
    'Md': { height: 40, fontSize: tokens.typography.body.fontSize },
    'Lg': { height: 48, fontSize: tokens.typography.body.fontSize + 2 }
  };
  inputContainer.resize(240, sizeMap[props.size].height);
  inputContainer.paddingLeft = tokens.spacing.md;
  inputContainer.paddingRight = tokens.spacing.md;

  // Create placeholder text
  const placeholder = figma.createText();
  await figma.loadFontAsync({ family: tokens.typography.body.fontFamily, style: 'Regular' });
  placeholder.fontName = { family: tokens.typography.body.fontFamily, style: 'Regular' };
  placeholder.fontSize = sizeMap[props.size].fontSize;
  placeholder.characters = 'Placeholder text';
  placeholder.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.4 }];
  inputContainer.appendChild(placeholder);

  // Apply state-specific styles
  switch (props.state) {
    case 'Default':
      inputContainer.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 0.1 } }];
      break;
    case 'Focus':
      inputContainer.strokes = [{ type: 'SOLID', color: tokens.colors.primary['500'] }];
      inputContainer.effects = [
        {
          type: 'DROP_SHADOW',
          color: { ...tokens.colors.primary['500'], a: 0.2 },
          offset: { x: 0, y: 0 },
          radius: 4,
          spread: 0,
          visible: true,
          blendMode: 'NORMAL'
        }
      ];
      break;
    case 'Error':
      inputContainer.strokes = [{ type: 'SOLID', color: tokens.colors.danger['500'] }];
      const errorText = figma.createText();
      await figma.loadFontAsync({ family: tokens.typography.label.fontFamily, style: 'Regular' });
      errorText.fontName = { family: tokens.typography.label.fontFamily, style: 'Regular' };
      errorText.fontSize = tokens.typography.label.fontSize;
      errorText.characters = 'Error message';
      errorText.fills = [{ type: 'SOLID', color: tokens.colors.danger['500'] }];
      component.appendChild(errorText);
      break;
  }

  component.appendChild(inputContainer);
  componentSet.appendChild(component);
  return component;
}

async function updateTextFieldComponent(
  componentSet: ComponentSetNode,
  tokens: DesignTokens
): Promise<ComponentSetNode> {
  // Update existing variants
  for (const component of componentSet.children) {
    if (component.type !== 'COMPONENT') continue;

    const props = parseTextFieldVariantName(component.name);
    if (!props) continue;

    // Update layout
    component.layoutMode = 'VERTICAL';
    component.primaryAxisAlignItems = 'START';
    component.counterAxisAlignItems = 'START';
    component.itemSpacing = tokens.spacing.xs;

    // Update input container
    const inputContainer = component.findOne(node => 
      node.type === 'FRAME' && node.name === 'Input Container'
    ) as FrameNode;

    if (inputContainer) {
      const sizeMap = {
        'Sm': { height: 32, fontSize: tokens.typography.body.fontSize - 2 },
        'Md': { height: 40, fontSize: tokens.typography.body.fontSize },
        'Lg': { height: 48, fontSize: tokens.typography.body.fontSize + 2 }
      };

      inputContainer.resize(240, sizeMap[props.size].height);
      inputContainer.paddingLeft = tokens.spacing.md;
      inputContainer.paddingRight = tokens.spacing.md;

      // Update state-specific styles
      switch (props.state) {
        case 'Default':
          inputContainer.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 0.1 } }];
          inputContainer.effects = [];
          break;
        case 'Focus':
          inputContainer.strokes = [{ type: 'SOLID', color: tokens.colors.primary['500'] }];
          inputContainer.effects = [
            {
              type: 'DROP_SHADOW',
              color: { ...tokens.colors.primary['500'], a: 0.2 },
              offset: { x: 0, y: 0 },
              radius: 4,
              spread: 0,
              visible: true,
              blendMode: 'NORMAL'
            }
          ];
          break;
        case 'Error':
          inputContainer.strokes = [{ type: 'SOLID', color: tokens.colors.danger['500'] }];
          break;
      }
    }
  }

  return componentSet;
}

function parseTextFieldVariantName(name: string): TextFieldProps | null {
  const match = name.match(/State=(\w+),\s*Size=(\w+),\s*HasLabel=(\w+)/);
  if (!match) return null;

  return {
    state: match[1] as TextFieldProps['state'],
    size: match[2] as TextFieldProps['size'],
    hasLabel: match[3] === 'true'
  };
}
