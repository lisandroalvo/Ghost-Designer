import { DesignTokens } from './tokens';
import { hexToRgb, parseRgba } from './utils';

export async function createOrUpdateStyles(tokens: DesignTokens): Promise<void> {
  await createColorStyles(tokens.colors);
  await createTypographyStyles(tokens.typography);
  await createEffectStyles(tokens.elevation);
}

async function createColorStyles(colors: DesignTokens['colors']): Promise<void> {
  for (const [group, shades] of Object.entries(colors)) {
    for (const [shade, value] of Object.entries(shades)) {
      const name = `Color/${group}/${shade}`;
      const style = await findOrCreatePaintStyle(name);
      const rgb = hexToRgb(value);
      style.paints = [{
        type: 'SOLID',
        color: rgb,
        opacity: 1
      }];
    }
  }
}

async function createTypographyStyles(typography: DesignTokens['typography']): Promise<void> {
  for (const [name, style] of Object.entries(typography)) {
    const styleName = `Type/${name}`;
    const textStyle = await findOrCreateTextStyle(styleName);
    
    await figma.loadFontAsync({ 
      family: style.fontFamily, 
      style: 'Regular'
    });

    textStyle.fontSize = style.fontSize;
    textStyle.lineHeight = { value: style.lineHeight, unit: 'PIXELS' };
    textStyle.fontName = { 
      family: style.fontFamily, 
      style: 'Regular'
    };
  }
}

async function createEffectStyles(elevation: DesignTokens['elevation']): Promise<void> {
  for (const [level, effect] of Object.entries(elevation)) {
    const name = `Elevation/${level}`;
    const style = await findOrCreateEffectStyle(name);
    const rgba = parseRgba(effect.color);
    
    style.effects = [{
      type: 'DROP_SHADOW',
      color: { 
        r: rgba.r, 
        g: rgba.g, 
        b: rgba.b, 
        a: rgba.a 
      },
      offset: { x: effect.x, y: effect.y },
      radius: effect.blur,
      spread: effect.spread,
      visible: true,
      blendMode: 'NORMAL'
    }];
  }
}

async function findOrCreatePaintStyle(name: string): Promise<PaintStyle> {
  const style = figma.getLocalPaintStyles().find(s => s.name === name);
  if (style) return style;
  
  const newStyle = figma.createPaintStyle();
  newStyle.name = name;
  return newStyle;
}

async function findOrCreateTextStyle(name: string): Promise<TextStyle> {
  const style = figma.getLocalTextStyles().find(s => s.name === name);
  if (style) return style;
  
  const newStyle = figma.createTextStyle();
  newStyle.name = name;
  return newStyle;
}

async function findOrCreateEffectStyle(name: string): Promise<EffectStyle> {
  const style = figma.getLocalEffectStyles().find(s => s.name === name);
  if (style) return style;
  
  const newStyle = figma.createEffectStyle();
  newStyle.name = name;
  return newStyle;
}
