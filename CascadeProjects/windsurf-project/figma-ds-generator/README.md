# Design System Generator - Figma Plugin

A Figma plugin that generates core design system components and styles from design tokens.

## Features

- Generates local styles (Paint, Text, Effect) from design tokens
- Creates production-ready components with variants:
  - Button (State, Size, Tone variants)
  - Text Field (State, Size, Label variants)
  - Card (Elevation, Padding variants)
- Idempotent updates: re-running the plugin updates existing components
- Built with TypeScript, React, and esbuild

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Start development:
```bash
npm run dev
```
4. In Figma desktop app:
   - Go to Plugins
   - Click "Development"
   - Choose "Import plugin from manifest..."
   - Select the `manifest.json` from this project

## Usage

1. Open the plugin in Figma
2. Choose components to generate
3. Use bundled tokens or upload your own `tokens.json`
4. Click "Generate Components"

## Customizing Tokens

The plugin uses a standard tokens format:

```json
{
  "colors": {
    "primary": {"500": "#4F46E5"},
    "neutral": {"900": "#111827"}
  },
  "typography": {
    "body": {
      "fontFamily": "Inter",
      "fontSize": 14,
      "lineHeight": 20,
      "fontWeight": 400
    }
  },
  "spacing": {"xs": 4, "sm": 8},
  "radii": {"sm": 4, "md": 8},
  "elevation": {
    "1": {
      "type": "drop-shadow",
      "x": 0,
      "y": 1,
      "blur": 2,
      "spread": 0,
      "color": "rgba(0,0,0,0.1)"
    }
  }
}
```

## Idempotency

The plugin uses two strategies to ensure idempotent updates:

1. **Name-based lookup**: Components and styles are found by their standardized names
2. **Plugin data**: Each generated node stores version information using `setPluginData`

This means you can safely re-run the plugin to update existing components when your tokens change.

## Development

- `npm run dev`: Watch mode with esbuild
- `npm run build`: Production build
- `npm start`: Serve UI for development

## Project Structure

```
/src
  code.ts              # Plugin main
  ui.tsx              # React UI panel
  tokens.json         # Default tokens
  /lib
    tokens.ts         # Token validation
    styles.ts         # Style generators
    /components       # Component generators
    utils.ts          # Helper functions
```
