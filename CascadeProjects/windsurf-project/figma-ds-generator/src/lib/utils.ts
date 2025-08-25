/**
 * Utility functions for the Figma Design System Generator
 */

export const PLUGIN_VERSION = '1.0.0';

interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex color: ${hex}`);
  
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  };
}

export function parseRgba(rgba: string): RGB & { a: number } {
  const match = rgba.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)$/);
  if (!match) throw new Error(`Invalid rgba color: ${rgba}`);
  
  return {
    r: parseInt(match[1], 10) / 255,
    g: parseInt(match[2], 10) / 255,
    b: parseInt(match[3], 10) / 255,
    a: parseFloat(match[4])
  };
}

export async function findOrCreatePage(name: string): Promise<PageNode> {
  const page = figma.root.children.find(p => p.name === name);
  if (page) return page;
  
  const newPage = figma.createPage();
  newPage.name = name;
  return newPage;
}

export async function findNodeByName(name: string, parent: BaseNode = figma.root): Promise<SceneNode | null> {
  if ('findOne' in parent) {
    return parent.findOne(node => node.name === name) as SceneNode;
  }
  return null;
}

export function getPluginData(node: BaseNode, key: string): string | null {
  return node.getPluginData(`dsgen_${key}`);
}

export function setPluginData(node: BaseNode, key: string, value: string): void {
  node.setPluginData(`dsgen_${key}`, value);
}

export async function findOrCreateFrame(name: string, parent: BaseNode): Promise<FrameNode> {
  const existing = await findNodeByName(name, parent);
  if (existing && existing.type === 'FRAME') return existing as FrameNode;
  
  const frame = figma.createFrame();
  frame.name = name;
  if ('appendChild' in parent) {
    parent.appendChild(frame);
  }
  return frame;
}

export function createVariantGroupName(component: string, property: string, value: string): string {
  return `DS/${component}/${property}=${value}`;
}

export async function loadFonts(fontNames: string[]): Promise<void> {
  await Promise.all(
    fontNames.map(font => figma.loadFontAsync({ family: font, style: 'Regular' }))
  );
}
