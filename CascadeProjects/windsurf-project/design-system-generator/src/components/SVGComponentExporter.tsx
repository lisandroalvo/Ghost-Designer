'use client';

import { useRef } from 'react';
import { Tokens } from '@/lib/tokens';

interface SVGComponentExporterProps {
  tokens: Tokens;
  componentType: 'button' | 'textfield' | 'card';
  variant?: string;
}

export const SVGComponentExporter: React.FC<SVGComponentExporterProps> = ({
  tokens,
  componentType,
  variant = 'default'
}) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const exportAsSVG = () => {
    const svgContent = generateSVGComponent(tokens, componentType, variant);
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${componentType}-${variant}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderPreview = () => {
    const styles = generateComponentStyles(tokens);

    switch (componentType) {
      case 'button':
        return renderButton(variant, styles);
      case 'textfield':
        return renderTextField(variant, styles);
      case 'card':
        return renderCard(variant, styles);
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium capitalize">{componentType} - {variant}</h3>
        <button
          onClick={exportAsSVG}
          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
        >
          Export SVG
        </button>
      </div>
      
      <div 
        ref={componentRef}
        className="p-8 bg-gray-50 rounded-md inline-block"
        style={{ minWidth: '200px' }}
      >
        {renderPreview()}
      </div>
    </div>
  );
};

function generateSVGComponent(tokens: Tokens, componentType: string, variant: string): string {
  switch (componentType) {
    case 'button':
      return generateButtonSVG(tokens, variant);
    case 'textfield':
      return generateTextFieldSVG(tokens, variant);
    case 'card':
      return generateCardSVG(tokens, variant);
    default:
      return '';
  }
}

function generateButtonSVG(tokens: Tokens, variant: string): string {
  const width = 120;
  const height = 40;
  const cornerRadius = tokens.radii.md;
  
  let bgColor: string;
  let textColor: string;
  let strokeColor = 'none';
  let strokeWidth = 0;
  
  switch (variant) {
    case 'primary':
      bgColor = tokens.colors.primary['500'];
      textColor = tokens.colors.neutral['0'];
      break;
    case 'secondary':
      bgColor = tokens.colors.neutral['50'];
      textColor = tokens.colors.neutral['900'];
      strokeColor = tokens.colors.neutral['900'];
      strokeWidth = 1;
      break;
    case 'danger':
      bgColor = tokens.colors.danger['500'];
      textColor = tokens.colors.neutral['0'];
      break;
    default:
      bgColor = tokens.colors.primary['500'];
      textColor = tokens.colors.neutral['0'];
  }

  const buttonText = `${variant.charAt(0).toUpperCase() + variant.slice(1)} Button`;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .button-text { 
        font-family: ${tokens.typography.label.fontFamily}; 
        font-size: ${tokens.typography.label.fontSize}px; 
        font-weight: ${tokens.typography.label.fontWeight};
        text-anchor: middle;
        dominant-baseline: central;
      }
    </style>
  </defs>
  <rect 
    width="${width}" 
    height="${height}" 
    rx="${cornerRadius}" 
    fill="${bgColor}"
    stroke="${strokeColor}"
    stroke-width="${strokeWidth}"
  />
  <text 
    x="${width / 2}" 
    y="${height / 2}" 
    class="button-text" 
    fill="${textColor}"
  >${buttonText}</text>
</svg>`;
}

function generateTextFieldSVG(tokens: Tokens, variant: string): string {
  const width = 250;
  const inputHeight = 40;
  const labelHeight = 20;
  const spacing = tokens.spacing.xs;
  const errorHeight = variant === 'error' ? 16 : 0;
  const totalHeight = labelHeight + spacing + inputHeight + (errorHeight ? spacing + errorHeight : 0);
  
  const isDisabled = variant === 'disabled';
  const hasError = variant === 'error';
  
  const bgColor = isDisabled ? tokens.colors.neutral['50'] : tokens.colors.neutral['0'];
  const borderColor = hasError ? tokens.colors.danger['500'] : tokens.colors.neutral['50'];
  const textOpacity = isDisabled ? 0.5 : 1;

  let svgContent = `<svg width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .label-text { 
        font-family: ${tokens.typography.label.fontFamily}; 
        font-size: ${tokens.typography.label.fontSize}px; 
        font-weight: ${tokens.typography.label.fontWeight};
      }
      .input-text { 
        font-family: ${tokens.typography.body.fontFamily}; 
        font-size: ${tokens.typography.body.fontSize}px;
      }
    </style>
  </defs>
  
  <!-- Label -->
  <text x="0" y="${tokens.typography.label.fontSize}" class="label-text" fill="${tokens.colors.neutral['900']}">Label Text</text>
  
  <!-- Input Field -->
  <rect 
    x="0" 
    y="${labelHeight + spacing}" 
    width="${width}" 
    height="${inputHeight}" 
    rx="${tokens.radii.sm}" 
    fill="${bgColor}"
    stroke="${borderColor}"
    stroke-width="1"
  />
  
  <!-- Placeholder Text -->
  <text 
    x="${tokens.spacing.sm}" 
    y="${labelHeight + spacing + inputHeight / 2 + tokens.typography.body.fontSize / 3}" 
    class="input-text" 
    fill="${tokens.colors.neutral['900']}"
    opacity="${textOpacity}"
  >Placeholder text</text>`;

  if (hasError) {
    svgContent += `
  <!-- Error Message -->
  <text 
    x="0" 
    y="${labelHeight + spacing + inputHeight + spacing + tokens.typography.label.fontSize}" 
    class="label-text" 
    fill="${tokens.colors.danger['500']}"
  >Error message here</text>`;
  }

  svgContent += `</svg>`;
  return svgContent;
}

function generateCardSVG(tokens: Tokens, variant: string): string {
  const width = 280;
  const height = 160;
  const padding = tokens.spacing.md;
  const cornerRadius = tokens.radii.lg;
  
  // Shadow for elevated variant
  const shadowOffset = variant === 'elevated' ? 4 : 1;
  const shadowBlur = variant === 'elevated' ? 8 : 2;

  return `<svg width="${width + shadowOffset}" height="${height + shadowOffset}" viewBox="0 0 ${width + shadowOffset} ${height + shadowOffset}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .title-text { 
        font-family: ${tokens.typography.label.fontFamily}; 
        font-size: ${tokens.typography.body.fontSize}px; 
        font-weight: ${tokens.typography.label.fontWeight};
      }
      .body-text { 
        font-family: ${tokens.typography.body.fontFamily}; 
        font-size: ${tokens.typography.body.fontSize}px;
      }
    </style>
    <filter id="shadow">
      <feDropShadow dx="${shadowOffset}" dy="${shadowOffset}" stdDeviation="${shadowBlur / 2}" flood-opacity="0.1"/>
    </filter>
  </defs>
  
  <!-- Card Background -->
  <rect 
    width="${width}" 
    height="${height}" 
    rx="${cornerRadius}" 
    fill="${tokens.colors.neutral['0']}"
    filter="url(#shadow)"
  />
  
  <!-- Title -->
  <text 
    x="${padding}" 
    y="${padding + tokens.typography.body.fontSize}" 
    class="title-text" 
    fill="${tokens.colors.neutral['900']}"
  >Card Title</text>
  
  <!-- Content -->
  <foreignObject x="${padding}" y="${padding + tokens.typography.body.fontSize + tokens.spacing.md}" width="${width - padding * 2}" height="${height - padding * 3 - tokens.typography.body.fontSize}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: ${tokens.typography.body.fontFamily}; font-size: ${tokens.typography.body.fontSize}px; color: ${tokens.colors.neutral['900']}; line-height: ${tokens.typography.body.lineHeight}px;">
      This is the card content area. You can add any content here including text, images, or other components.
    </div>
  </foreignObject>
</svg>`;
}

// Preview rendering functions (same as before)
function generateComponentStyles(tokens: Tokens) {
  return {
    colors: tokens.colors,
    typography: tokens.typography,
    spacing: tokens.spacing,
    radii: tokens.radii,
    elevation: tokens.elevation,
  };
}

function renderButton(variant: string, styles: any) {
  const getButtonStyles = (variant: string) => {
    const base = {
      border: 'none',
      borderRadius: `${styles.radii.md}px`,
      cursor: 'pointer',
      fontFamily: styles.typography.label.fontFamily,
      fontSize: `${styles.typography.label.fontSize}px`,
      fontWeight: styles.typography.label.fontWeight,
      lineHeight: `${styles.typography.label.lineHeight}px`,
      padding: `${styles.spacing.sm}px ${styles.spacing.md}px`,
      transition: 'all 0.2s ease',
    };

    switch (variant) {
      case 'primary':
        return {
          ...base,
          backgroundColor: styles.colors.primary['500'],
          color: styles.colors.neutral['0'],
        };
      case 'secondary':
        return {
          ...base,
          backgroundColor: styles.colors.neutral['50'],
          color: styles.colors.neutral['900'],
          border: `1px solid ${styles.colors.neutral['900']}`,
        };
      case 'danger':
        return {
          ...base,
          backgroundColor: styles.colors.danger['500'],
          color: styles.colors.neutral['0'],
        };
      default:
        return {
          ...base,
          backgroundColor: styles.colors.primary['500'],
          color: styles.colors.neutral['0'],
        };
    }
  };

  return (
    <button style={getButtonStyles(variant)}>
      {variant.charAt(0).toUpperCase() + variant.slice(1)} Button
    </button>
  );
}

function renderTextField(variant: string, styles: any) {
  const hasError = variant === 'error';
  const isDisabled = variant === 'disabled';

  return (
    <div style={{ minWidth: '250px' }}>
      <label
        style={{
          display: 'block',
          marginBottom: `${styles.spacing.xs}px`,
          fontFamily: styles.typography.label.fontFamily,
          fontSize: `${styles.typography.label.fontSize}px`,
          fontWeight: styles.typography.label.fontWeight,
          color: styles.colors.neutral['900'],
        }}
      >
        Label Text
      </label>
      
      <input
        type="text"
        placeholder="Placeholder text"
        disabled={isDisabled}
        style={{
          width: '100%',
          padding: `${styles.spacing.sm}px`,
          border: `1px solid ${hasError ? styles.colors.danger['500'] : styles.colors.neutral['50']}`,
          borderRadius: `${styles.radii.sm}px`,
          fontFamily: styles.typography.body.fontFamily,
          fontSize: `${styles.typography.body.fontSize}px`,
          backgroundColor: isDisabled ? styles.colors.neutral['50'] : styles.colors.neutral['0'],
          color: styles.colors.neutral['900'],
          outline: 'none',
        }}
      />
      
      {hasError && (
        <div
          style={{
            marginTop: `${styles.spacing.xs}px`,
            fontSize: `${styles.typography.label.fontSize}px`,
            color: styles.colors.danger['500'],
          }}
        >
          Error message here
        </div>
      )}
    </div>
  );
}

function renderCard(variant: string, styles: any) {
  const getElevation = (variant: string) => {
    const shadow = styles.elevation[variant === 'elevated' ? '2' : '1'];
    return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
  };

  return (
    <div
      style={{
        backgroundColor: styles.colors.neutral['0'],
        borderRadius: `${styles.radii.lg}px`,
        padding: `${styles.spacing.md}px`,
        boxShadow: getElevation(variant),
        minWidth: '280px',
      }}
    >
      <h3
        style={{
          margin: `0 0 ${styles.spacing.md}px 0`,
          fontFamily: styles.typography.label.fontFamily,
          fontSize: `${styles.typography.body.fontSize}px`,
          fontWeight: styles.typography.label.fontWeight,
          color: styles.colors.neutral['900'],
        }}
      >
        Card Title
      </h3>
      
      <p
        style={{
          margin: 0,
          fontFamily: styles.typography.body.fontFamily,
          fontSize: `${styles.typography.body.fontSize}px`,
          lineHeight: `${styles.typography.body.lineHeight}px`,
          color: styles.colors.neutral['900'],
        }}
      >
        This is the card content area. You can add any content here including text, images, or other components.
      </p>
    </div>
  );
}
