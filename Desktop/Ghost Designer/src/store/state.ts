import { create } from "zustand";
import { Digest, Issue, Score, Suggestion } from "../core/types";
import { getAIFixes } from "../ai/critic";
import { send } from "../bridge/ipc";

// If you already have runRules/computeScore, keep them. Otherwise, add minimal stubs:
import { runRules } from "../core/rules";
import { computeScore } from "../core/score";

interface AppState {
  digest: Digest | null;
  issues: Issue[];
  suggestions: Suggestion[];
  score: Score | null;

  analyzeAndFixWithAI: () => Promise<{ applied: number }>;
}

export const useApp = create<AppState>((set) => ({
  digest: null,
  issues: [],
  suggestions: [],
  score: null,

  analyzeAndFixWithAI: async () => {
    // 1) digest selection
    const digest: Digest = await send("analyze_selection");
    const issues = runRules(digest);

    // 2) ask AI for fixes
    const fixes = await getAIFixes(digest, issues);

    // 3) apply fixes automatically
    let applied = 0;
    for (const s of fixes) {
      if (!s.fix) continue;
      try {
        await send("apply_fix", { targetId: s.target_id, fix: s.fix });
        applied++;
      } catch (e) { console.warn("apply_fix failed", s, e); }
    }

    // 4) rescan & recompute score
    const digest2: Digest = await send("analyze_selection");
    const issues2 = runRules(digest2);
    const score2 = computeScore(issues2);

    set({ digest: digest2, issues: issues2, score: score2, suggestions: fixes });
    return { applied };
  }
}));
