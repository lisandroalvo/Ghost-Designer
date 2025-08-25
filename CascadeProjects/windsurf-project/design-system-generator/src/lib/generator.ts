import { Tokens } from './tokens';

export interface GeneratorOptions {
  generateStyles: boolean;
  generateButton: boolean;
  generateTextField: boolean;
  generateCard: boolean;
}

export interface GeneratedComponent {
  name: string;
  code: string;
  type: 'css' | 'tsx';
}

export function generateComponents(tokens: Tokens, options: GeneratorOptions): GeneratedComponent[] {
  const components: GeneratedComponent[] = [];

  if (options.generateStyles) {
    components.push(generateStyles(tokens));
  }

  if (options.generateButton) {
    components.push(generateButton(tokens));
  }

  if (options.generateTextField) {
    components.push(generateTextField(tokens));
  }

  if (options.generateCard) {
    components.push(generateCard(tokens));
  }

  return components;
}

function generateStyles(tokens: Tokens): GeneratedComponent {
  const css = `/* Design System Styles */
:root {
  /* Colors */
${Object.entries(tokens.colors).map(([category, colors]) => 
  Object.entries(colors as Record<string, string>).map(([shade, value]) => 
    `  --color-${category}-${shade}: ${value};`
  ).join('\n')
).join('\n')}

  /* Typography */
${Object.entries(tokens.typography).map(([name, typo]) => `  --font-${name}-family: ${typo.fontFamily};
  --font-${name}-size: ${typo.fontSize}px;
  --font-${name}-weight: ${typo.fontWeight};
  --font-${name}-line-height: ${typo.lineHeight}px;`).join('\n')}

  /* Spacing */
${Object.entries(tokens.spacing).map(([name, value]) => 
  `  --spacing-${name}: ${value}px;`
).join('\n')}

  /* Radii */
${Object.entries(tokens.radii).map(([name, value]) => 
  `  --radius-${name}: ${value}px;`
).join('\n')}
}

/* Utility Classes */
${Object.entries(tokens.colors).map(([category, colors]) => 
  Object.entries(colors as Record<string, string>).map(([shade, _]) => 
    `.bg-${category}-${shade} { background-color: var(--color-${category}-${shade}); }
.text-${category}-${shade} { color: var(--color-${category}-${shade}); }`
  ).join('\n')
).join('\n')}

${Object.entries(tokens.spacing).map(([name, _]) => 
  `.p-${name} { padding: var(--spacing-${name}); }
.m-${name} { margin: var(--spacing-${name}); }`
).join('\n')}`;

  return {
    name: 'styles.css',
    code: css,
    type: 'css'
  };
}

function generateButton(tokens: Tokens): GeneratedComponent {
  const code = `import React from 'react';
import './styles.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick, 
  disabled 
}) => {
  const baseStyles = {
    border: 'none',
    borderRadius: \`var(--radius-md)\`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: \`var(--font-label-family)\`,
    fontWeight: \`var(--font-label-weight)\`,
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
  };

  const variantStyles = {
    primary: {
      backgroundColor: \`var(--color-primary-500)\`,
      color: \`var(--color-neutral-0)\`,
    },
    secondary: {
      backgroundColor: \`var(--color-neutral-50)\`,
      color: \`var(--color-neutral-900)\`,
      border: \`1px solid var(--color-neutral-900)\`,
    },
    danger: {
      backgroundColor: \`var(--color-danger-500)\`,
      color: \`var(--color-neutral-0)\`,
    },
  };

  const sizeStyles = {
    sm: {
      padding: \`var(--spacing-xs) var(--spacing-sm)\`,
      fontSize: \`var(--font-label-size)\`,
    },
    md: {
      padding: \`var(--spacing-sm) var(--spacing-md)\`,
      fontSize: \`var(--font-body-size)\`,
    },
    lg: {
      padding: \`var(--spacing-md) var(--spacing-lg)\`,
      fontSize: \`var(--font-body-size)\`,
    },
  };

  return (
    <button
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};`;

  return {
    name: 'Button.tsx',
    code,
    type: 'tsx'
  };
}

function generateTextField(tokens: Tokens): GeneratedComponent {
  const code = `import React from 'react';
import './styles.css';

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled
}) => {
  return (
    <div style={{ marginBottom: \`var(--spacing-md)\` }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: \`var(--spacing-xs)\`,
            fontFamily: \`var(--font-label-family)\`,
            fontSize: \`var(--font-label-size)\`,
            fontWeight: \`var(--font-label-weight)\`,
            color: \`var(--color-neutral-900)\`,
          }}
        >
          {label}
        </label>
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: \`var(--spacing-sm)\`,
          border: \`1px solid \${error ? 'var(--color-danger-500)' : 'var(--color-neutral-50)'}\`,
          borderRadius: \`var(--radius-sm)\`,
          fontFamily: \`var(--font-body-family)\`,
          fontSize: \`var(--font-body-size)\`,
          backgroundColor: disabled ? \`var(--color-neutral-50)\` : \`var(--color-neutral-0)\`,
          color: \`var(--color-neutral-900)\`,
          outline: 'none',
          transition: 'border-color 0.2s ease',
        }}
        onFocus={(e) => {
          if (!error) {
            e.target.style.borderColor = \`var(--color-primary-500)\`;
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.target.style.borderColor = \`var(--color-neutral-50)\`;
          }
        }}
      />
      {error && (
        <div
          style={{
            marginTop: \`var(--spacing-xs)\`,
            fontSize: \`var(--font-label-size)\`,
            color: \`var(--color-danger-500)\`,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};`;

  return {
    name: 'TextField.tsx',
    code,
    type: 'tsx'
  };
}

function generateCard(tokens: Tokens): GeneratedComponent {
  const code = `import React from 'react';
import './styles.css';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  elevation?: '1' | '2';
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  elevation = '1',
  padding = 'md'
}) => {
  const elevationStyles = {
    '1': {
      boxShadow: \`0 1px 2px 0 rgba(0,0,0,0.1)\`,
    },
    '2': {
      boxShadow: \`0 4px 8px 0 rgba(0,0,0,0.12)\`,
    },
  };

  const paddingStyles = {
    sm: \`var(--spacing-sm)\`,
    md: \`var(--spacing-md)\`,
    lg: \`var(--spacing-lg)\`,
  };

  return (
    <div
      style={{
        backgroundColor: \`var(--color-neutral-0)\`,
        borderRadius: \`var(--radius-lg)\`,
        padding: paddingStyles[padding],
        ...elevationStyles[elevation],
      }}
    >
      {title && (
        <h3
          style={{
            margin: \`0 0 var(--spacing-md) 0\`,
            fontFamily: \`var(--font-label-family)\`,
            fontSize: \`var(--font-body-size)\`,
            fontWeight: \`var(--font-label-weight)\`,
            color: \`var(--color-neutral-900)\`,
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};`;

  return {
    name: 'Card.tsx',
    code,
    type: 'tsx'
  };
}
