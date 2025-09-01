import { AI_CONFIG } from "./constants";
import { Digest, Issue, Suggestion } from "../core/types";

function compactDigest(d: Digest) {
  const layers = (d.layers || []).slice(0, 80).map(l => ({
    id: l.id, role: l.role,
    width: l.width, height: l.height,
    padding: l.padding,
    usesTypeToken: l.usesTypeToken,
    usesColorToken: l.usesColorToken,
    variant: l.variant,
    textLen: l.text ? Math.min(200, l.text.length) : 0,
  }));
  return { frameName: d.frameName, grid: d.grid, tokens: d.tokens, layers };
}

const ALLOWED_ACTIONS = `
Allowed fix.action values and params:
- "set_fill_hex":        { hex:"#RRGGBB" }
- "set_text_fill_hex":   { hex:"#RRGGBB" }
- "set_padding":         { top?:number, right?:number, bottom?:number, left?:number }
- "set_auto_layout_gap": { value:number }
- "set_min_width":       { value:number }
- "set_font_size":       { value:number }
- "bind_color_variable": { collectionName:string, variableName:string, hex:"#RRGGBB" }
`.trim();

function clamp01(n: any) {
  const x = Number(n); return Number.isFinite(x) ? Math.max(0, Math.min(1, x)) : 0.7;
}
function coerceSuggestion(o: any): Suggestion | null {
  if (!o || typeof o !== "object") return null;
  const issue = String(o.issue ?? "").trim();
  const target_id = String(o.target_id ?? "").trim();
  const why = String(o.why ?? "").trim();
  const principle = o.principle ? String(o.principle) : undefined;
  const fix = o.fix && typeof o.fix === "object" ? { action: String(o.fix.action) as any, params: o.fix.params ?? {} } : undefined;
  const confidence = clamp01(o.confidence ?? 0.7);
  if (!issue || !target_id) return null;
  return { issue, target_id, why, principle, fix, confidence };
}
function safeParse(text: string): Suggestion[] {
  const tryParse = (s: string) => {
    const json = JSON.parse(s);
    const arr = Array.isArray(json) ? json : json?.suggestions;
    return Array.isArray(arr) ? arr.map(coerceSuggestion).filter(Boolean) as Suggestion[] : [];
  };
  try { return tryParse(text); } catch {}
  const fence = text.match(/```json\s*([\s\S]*?)\s*```/i) || text.match(/```\s*([\s\S]*?)\s*```/i);
  if (fence?.[1]) { try { return tryParse(fence[1]); } catch {} }
  const bracket = text.match(/\[\s*{[\s\S]*}\s*\]/);
  if (bracket) { try { return tryParse(bracket[0]); } catch {} }
  return [];
}

export async function getAIFixes(digest: Digest, issues: Issue[]): Promise<Suggestion[]> {
  const detIssues = issues.slice(0, 120).map(i => ({
    issue: i.rule, target_id: i.target_id, severity: i.severity
  }));

  const system = [
    "You are a senior product designer and design systems reviewer.",
    "Analyze according to Nielsen's 10 Heuristics, WCAG 2.1 AA contrast, Fitts's Law, Hick's Law, and 8px spacing/alignment.",
    "Output ONLY a JSON array; no prose.",
    'Each item: { "issue", "principle", "target_id", "why", "fix": { "action", "params" }, "confidence" }',
    ALLOWED_ACTIONS
  ].join("\n");

  const user = [
    "Given this compact Figma digest and deterministic issues, propose concrete, immediately applicable fixes following the schema.",
    "Use precise px values and hex colors; ensure WCAG >= 4.5:1 for normal text. Prefer minimal changes that achieve compliance.",
    "",
    "Digest:", JSON.stringify(compactDigest(digest)),
    "",
    "Deterministic issues:", JSON.stringify(detIssues)
  ].join("\n");

  const url = `${AI_CONFIG.BASE_URL}/chat/completions`;
  const headers: Record<string,string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${AI_CONFIG.API_KEY}`,
    ...AI_CONFIG.EXTRA_HEADERS
  };
  const body = {
    model: AI_CONFIG.MODEL,
    temperature: AI_CONFIG.TEMPERATURE,
    max_tokens: AI_CONFIG.MAX_TOKENS,
    messages: [{ role:"system", content: system }, { role:"user", content: user }]
  };

  let res: Response;
  try { res = await fetch(url, { method:"POST", headers, body: JSON.stringify(body) }); }
  catch { return []; }

  if (!res.ok) { console.warn("AI error", res.status, await res.text()); return []; }
  const data = await res.json();
  return safeParse(String(data?.choices?.[0]?.message?.content ?? "[]"));
}
