// Minimal shared types for AI fixes and issues

export type AIFixAction =
  | "set_fill_hex"
  | "set_text_fill_hex"
  | "set_padding"
  | "set_auto_layout_gap"
  | "set_min_width"
  | "set_font_size"
  | "bind_color_variable";

export interface AIFixPlan {
  action: AIFixAction;
  params: Record<string, unknown>;
}

export interface Suggestion {
  issue: string;
  target_id: string;
  why: string;
  principle?: string;
  fix?: AIFixPlan;
  confidence: number;
}

// Keep existing Digest/Issue/Score types if you already have them.
// If not, add these light versions:
export interface DigestLayer {
  id: string;
  role?: string;
  width?: number;
  height?: number;
  padding?: number[];
  usesTypeToken?: boolean;
  usesColorToken?: boolean;
  variant?: string;
  text?: string;
  textColor?: string | null;
  bgColor?: string | null;
}
export interface Digest {
  frameName: string;
  grid?: unknown;
  tokens?: unknown;
  layers: DigestLayer[];
}

export interface Issue {
  target_id: string;
  severity: "error" | "warning" | "info";
  description: string;
  rule: string;
}

export interface Score { value: number }
