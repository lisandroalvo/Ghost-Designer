import { z } from 'zod';

const ColorSchema = z.record(z.string().regex(/^#[0-9A-Fa-f]{6}$/));
const ColorGroupSchema = z.record(ColorSchema);

const TypographySchema = z.object({
  fontFamily: z.string(),
  fontSize: z.number(),
  lineHeight: z.number(),
  fontWeight: z.number()
});

const SpacingSchema = z.record(z.number());
const RadiiSchema = z.record(z.number());

const ElevationSchema = z.object({
  type: z.literal('drop-shadow'),
  x: z.number(),
  y: z.number(),
  blur: z.number(),
  spread: z.number(),
  color: z.string().regex(/^rgba\(\d+,\d+,\d+,[0-9.]+\)$/)
});

export const TokensSchema = z.object({
  colors: ColorGroupSchema,
  typography: z.record(TypographySchema),
  spacing: SpacingSchema,
  radii: RadiiSchema,
  elevation: z.record(ElevationSchema)
});

export type DesignTokens = z.infer<typeof TokensSchema>;

export function validateTokens(tokens: unknown): DesignTokens {
  return TokensSchema.parse(tokens);
}
