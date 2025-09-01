export const AI_CONFIG = {
  // OpenRouter (works inside Figma plugin UI)
  BASE_URL: "https://openrouter.ai/api/v1",
  MODEL: "openai/gpt-4o-mini", // good cost/quality; you can swap to anthropic/claude-3.5-sonnet
  // ⛔️ Paste your key here for the demo. Do NOT ship a public build with a real key.
  API_KEY: "sk-or-PASTE_YOUR_KEY_HERE",
  EXTRA_HEADERS: {
    "HTTP-Referer": "http://localhost", // any URL you control is fine
    "X-Title": "Ghost Designer"
  },
  TEMPERATURE: 0.2,
  MAX_TOKENS: 900
} as const;
