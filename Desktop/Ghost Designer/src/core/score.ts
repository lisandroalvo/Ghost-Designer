import { Issue, Score } from "./types";

// Scoring weights
// const SEVERITY_WEIGHTS = {
//   error: 8,
//   warning: 3,
//   info: 1
// } as const;

export interface ScoreResult {
  value: number;
  breakdown: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
}

export function computeScore(issues: Issue[]): Score {
  // Stub implementation - replace with actual scoring logic
  const penalty = issues.length * 5;
  const value = Math.max(0, 100 - penalty);
  return { value };
}
