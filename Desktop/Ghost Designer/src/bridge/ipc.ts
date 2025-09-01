let _req = 0;
const pending = new Map<number, {resolve: Function, reject: Function, type: string}>();

export function send<T = any>(type: string, payload?: any): Promise<T> {
  const _reqId = ++_req;
  return new Promise((resolve, reject) => {
    pending.set(_reqId, { resolve, reject, type });
    parent.postMessage({ pluginMessage: { type, payload, _reqId } }, '*');
  });
}

window.addEventListener('message', (event) => {
  const msg = event?.data?.pluginMessage;
  if (!msg || msg._reqId == null) return;
  const entry = pending.get(msg._reqId);
  if (!entry) return;
  if (msg.type === `${entry.type}:result`) { entry.resolve(msg.result); pending.delete(msg._reqId); }
  if (msg.type === `${entry.type}:error`)  { entry.reject(new Error(msg.error)); pending.delete(msg._reqId); }
});

export const inFigma = typeof parent !== 'undefined' && location.ancestorOrigins && location.ancestorOrigins.length > 0;

// Demo mode fallbacks for web preview
if (!inFigma) {
  // Override send function for demo mode
  const demoSend = function<T=any>(type: string, payload?: any): Promise<T> {
    // Provide demo responses for variable operations
    if (type === 'ensure_color_variable') {
      return Promise.resolve({ 
        variableId: 'demo-var-' + Date.now(), 
        name: payload?.variableName || 'demo-variable',
        collectionId: 'demo-collection',
        modeId: 'demo-mode'
      } as T);
    }
    if (type === 'apply_color_variable') {
      return Promise.resolve({ 
        nodeId: payload?.nodeId || 'demo-node', 
        variableId: 'demo-var-' + Date.now() 
      } as T);
    }
    // Return empty promise for other types in demo mode
    return Promise.resolve({} as T);
  };
  
  // Replace the export
  (globalThis as any).demoSend = demoSend;
}
