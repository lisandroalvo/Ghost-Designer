import React, { useState } from "react";
import { useApp } from "../store/state";
import { IssuesList } from "./IssuesList";

export const Panel: React.FC = () => {
  const { analyzeAndFixWithAI } = useApp.getState();
  const { score, issues, suggestions } = useApp(s => ({
    score: s.score, issues: s.issues, suggestions: s.suggestions
  }));
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<number | null>(null);

  const run = async () => {
    setBusy(true); setLast(null);
    try {
      const { applied } = await analyzeAndFixWithAI();
      setLast(applied);
    } finally { setBusy(false); }
  };

  return (
    <div style={{ padding:16, display:"grid", gap:12 }}>
      <h1 style={{ margin:0 }}>Ghost Designer</h1>
      <div style={{ opacity:0.75 }}>Select a component/frame and click once. The AI will analyze and fix issues automatically.</div>

      <button onClick={run} disabled={busy} style={{ padding:"10px 14px" }}>
        {busy ? "Analyzing & Fixing…" : "Analyze & Fix with AI"}
      </button>

      {typeof score?.value === "number" && (
        <div style={{ fontSize:12, opacity:0.8 }}>
          Health Score: <b>{Math.round(score.value)}</b> {last!=null ? `· Applied ${last} fix${last===1?"":"es"}` : ""}
        </div>
      )}

      <IssuesList issues={issues} />

      {!!suggestions?.length && (
        <div>
          <div style={{ fontWeight:700, marginTop:8 }}>What changed (AI plan)</div>
          {suggestions.map((s, i) => (
            <div key={i} style={{ border:"1px solid #eee", borderRadius:8, padding:8, marginTop:8 }}>
              <div style={{ fontWeight:600 }}>{s.issue}{s.principle ? ` · ${s.principle}` : ""}</div>
              {s.why && <div style={{ fontSize:12, opacity:0.8 }}>{s.why}</div>}
              {s.fix && <div style={{ fontSize:11, opacity:0.7, marginTop:4 }}>
                <code>{s.fix.action}</code> {JSON.stringify(s.fix.params)}
              </div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
