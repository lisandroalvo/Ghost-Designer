// Design system tokens for Ghost Designer

// 4/8 grid spacing scale
export const SPACING_GRID = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;

// WCAG contrast minimum
export const MIN_CONTRAST_RATIO = 4.5;

export const DESIGN_TOKENS = {
  // Spacing scale (4/8 grid)
  spacing: SPACING_GRID,

  // Color tokens
  colors: {
    // Base colors
    black: '#000000',
    white: '#ffffff',
    
    // Gray scale
    gray50: '#f8f9fa',
    gray100: '#e9ecef',
    gray200: '#dee2e6',
    gray300: '#ced4da',
    gray400: '#adb5bd',
    gray500: '#6c757d',
    gray600: '#495057',
    gray700: '#343a40',
    gray800: '#212529',
    gray900: '#1a1a1a',

    // Brand colors
    primary: '#007bff',
    primaryDark: '#0056b3',
    
    // Semantic colors
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8'
  },

  // Typography tokens
  typography: {
    fontSize: {
      sm: 14,
      base: 16,
      lg: 18,
      xl: 24,
      '2xl': 32,
      '3xl': 48
    },
    
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700
    }
  }
} as const;

// Validation helpers
export const isValidSpacing = (value: number): boolean => {
  return SPACING_GRID.includes(value as typeof SPACING_GRID[number]);
};

export const isValidColor = (color: string): boolean => {
  const validColors = Object.values(DESIGN_TOKENS.colors) as string[];
  return validColors.includes(color);
};

export const findClosestSpacing = (value: number): number => {
  return SPACING_GRID.reduce((prev, curr) => 
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
};
