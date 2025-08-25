import { z } from 'zod';

// Token schemas
const ColorTokenSchema = z.record(z.string(), z.string());
const TypographyTokenSchema = z.object({
  fontFamily: z.string(),
  fontSize: z.number(),
  lineHeight: z.number(),
  fontWeight: z.number(),
});
const SpacingTokenSchema = z.record(z.string(), z.number());
const RadiiTokenSchema = z.record(z.string(), z.number());
const ElevationTokenSchema = z.object({
  type: z.string(),
  x: z.number(),
  y: z.number(),
  blur: z.number(),
  spread: z.number(),
  color: z.string(),
});

// Main token schema
const TokenSchema = z.object({
  colors: z.record(z.string(), ColorTokenSchema),
  typography: z.record(z.string(), TypographyTokenSchema),
  spacing: SpacingTokenSchema,
  radii: RadiiTokenSchema,
  elevation: z.record(z.string(), ElevationTokenSchema),
});

export type Tokens = z.infer<typeof TokenSchema>;

export function validateTokens(data: unknown): { success: true; data: Tokens } | { success: false; error: string } {
  try {
    const tokens = TokenSchema.parse(data);
    return { success: true, data: tokens };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    }
    return { success: false, error: 'Invalid token format' };
  }
}
