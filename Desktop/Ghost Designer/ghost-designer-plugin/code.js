// Main thread for Figma plugin

figma.showUI(__html__, { width: 1000, height: 700 });

// ---------- Digest helpers ----------
function solidPaintToHex(paint) {
  if (!paint || paint.type !== 'SOLID') return null;
  const toHex = (n) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, '0').toUpperCase();
  const { r, g, b } = paint.color;
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function getTextFillHex(node) {
  if (node.type !== 'TEXT') return null;
  const fills = node.fills;
  if (!Array.isArray(fills) || !fills.length) return null;
  const first = fills.find(f => f.type === 'SOLID');
  return first ? solidPaintToHex(first) : null;
}
function getBgFillHex(node) {
  if (!("fills" in node)) return null;
  const fills = node.fills;
  if (!Array.isArray(fills) || !fills.length) return null;
  const first = fills.find(f => f.type === 'SOLID');
  return first ? solidPaintToHex(first) : null;
}
function nodeRole(node) {
  const n = (node.name || "").toLowerCase();
  if (node.type === 'TEXT') return /h1|headline|title/.test(n) ? "headline" : "body";
  if (/button|cta/.test(n)) return "button";
  if (/icon/.test(n)) return "icon";
  return "container";
}
function paddingFromAutoLayout(node) {
  if (!("paddingLeft" in node)) return undefined;
  const { paddingTop, paddingRight, paddingBottom, paddingLeft } = node;
  return [paddingTop, paddingRight, paddingBottom, paddingLeft];
}
function usesBoundColorVariable(node) {
  try {
    if ("boundVariables" in node && node.boundVariables?.fills?.id) return true;
    if (typeof node.getBoundVariableId === 'function') return !!node.getBoundVariableId("fills");
  } catch {}
  return false;
}
function layerDigestFromNode(node) {
  return {
    id: node.id,
    role: nodeRole(node),
    width: "width" in node ? node.width : undefined,
    height: "height" in node ? node.height : undefined,
    padding: "layoutMode" in node ? paddingFromAutoLayout(node) : undefined,
    usesTypeToken: node.type === 'TEXT' ? !!node.textStyleId : false,
    usesColorToken: usesBoundColorVariable(node),
    variant: /primary/.test((node.name||"").toLowerCase()) ? "primary" :
             /secondary/.test((node.name||"").toLowerCase()) ? "secondary" : undefined,
    text: node.type === 'TEXT' ? node.characters : undefined,
    textColor: node.type === 'TEXT' ? getTextFillHex(node) : null,
    bgColor: getBgFillHex(node)
  };
}
function collectNodes(root) {
  const out = [];
  const walk = (n) => { out.push(n); if ("children" in n) n.children.forEach(walk); };
  walk(root);
  return out;
}
async function handleAnalyzeSelection() {
  const sel = figma.currentPage.selection;
  if (!sel.length) throw new Error("Select a frame or component first.");
  const root = sel.find(n => n.type === "FRAME" || n.type === "COMPONENT" || n.type === "COMPONENT_SET") || sel[0];
  const nodes = collectNodes(root);
  const layers = nodes.map(layerDigestFromNode);
  return {
    frameName: root.name || "Selection",
    grid: { type: "columns", count: 12, gutter: 16 },
    tokens: { space: [4,8,12,16,24,32], type: ["H1","Body","Caption"], color: ["Primary/500","Neutral/700","Neutral/900"], minContrast: 4.5 },
    layers
  };
}

// ---------- Fix helpers ----------
function hexToRgb01(hex) {
  const h = hex.replace("#","").trim();
  const r = parseInt(h.slice(0,2),16) / 255;
  const g = parseInt(h.slice(2,4),16) / 255;
  const b = parseInt(h.slice(4,6),16) / 255;
  return { r,g,b };
}
async function withTextFont(node, fn) {
  if (node.type !== "TEXT") return fn();
  const font = node.fontName === figma.mixed ? { family: "Inter", style: "Regular" } : node.fontName;
  try { await figma.loadFontAsync(font); } catch {}
  return fn();
}
function setPadding(node, p) {
  if (!("paddingLeft" in node)) throw new Error("Node has no padding props");
  if (p.top != null) node.paddingTop = p.top;
  if (p.right != null) node.paddingRight = p.right;
  if (p.bottom != null) node.paddingBottom = p.bottom;
  if (p.left != null) node.paddingLeft = p.left;
}
function setAutoLayoutGap(node, value) {
  if (!("itemSpacing" in node)) throw new Error("Node has no auto-layout gap");
  node.itemSpacing = value;
}
function setMinWidth(node, value) {
  if (!("resize" in node)) throw new Error("Node cannot be resized");
  node.resize(Math.max(node.width, value), node.height);
}

async function applyFix(payload) {
  const { targetId, fix } = payload;
  const node = figma.getNodeById(targetId);
  if (!node) throw new Error("Target node not found");

  switch (fix.action) {
    case "set_fill_hex": {
      if (!("fills" in node)) throw new Error("Node has no fills");
      const rgb = hexToRgb01(fix.params.hex);
      node.fills = [{ type: "SOLID", color: rgb }];
      return { ok: true };
    }
    case "set_text_fill_hex": {
      if (node.type !== "TEXT") throw new Error("Not a text node");
      const rgb = hexToRgb01(fix.params.hex);
      await withTextFont(node, () => { node.fills = [{ type:"SOLID", color: rgb }]; });
      return { ok: true };
    }
    case "set_padding": {
      setPadding(node, fix.params || {});
      return { ok: true };
    }
    case "set_auto_layout_gap": {
      setAutoLayoutGap(node, Number(fix.params?.value ?? 8));
      return { ok: true };
    }
    case "set_min_width": {
      setMinWidth(node, Number(fix.params?.value ?? 48));
      return { ok: true };
    }
    case "set_font_size": {
      if (node.type !== "TEXT") throw new Error("Not a text node");
      const val = Number(fix.params?.value ?? 16);
      await withTextFont(node, () => { node.fontSize = val; });
      return { ok: true };
    }
    case "bind_color_variable": {
      const { collectionName, variableName, hex } = fix.params || {};
      let coll = figma.variables.getLocalVariableCollections().find(c => c.name === collectionName);
      if (!coll) { coll = figma.variables.createVariableCollection(collectionName); coll.renameMode = 'HIERARCHICAL'; }
      let v = figma.variables.getLocalVariables().find(v => v.name === variableName && v.variableCollectionId === coll.id);
      if (!v) v = figma.variables.createVariable(variableName, coll, "COLOR");
      const { r,g,b } = hexToRgb01(hex || "#000000");
      v.setValueForMode(coll.defaultModeId, { r, g, b, a: 1 });
      if (!("setBoundVariable" in node)) throw new Error("Cannot bind variable on this node");
      node.setBoundVariable("fills", v);
      return { ok: true, variableId: v.id };
    }
    default:
      throw new Error("Unsupported fix.action: " + fix.action);
  }
}

// ---------- Router ----------
const handlers = {
  "analyze_selection": handleAnalyzeSelection,
  "apply_fix": async (payload) => applyFix(payload)
};

figma.ui.onmessage = async (msg) => {
  const { type, payload, _reqId } = msg || {};
  try {
    if (handlers[type]) {
      const result = await handlers[type](payload);
      figma.ui.postMessage({ type: `${type}:result`, _reqId, result });
    }
  } catch (err) {
    figma.ui.postMessage({ type: `${type}:error`, _reqId, error: String(err) });
  }
};
