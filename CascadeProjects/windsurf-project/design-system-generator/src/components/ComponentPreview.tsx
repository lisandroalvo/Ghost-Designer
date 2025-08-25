'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Tokens } from '@/lib/tokens';

interface ComponentPreviewProps {
  tokens: Tokens;
  componentType: 'button' | 'textfield' | 'card';
  variant?: string;
  onExport?: (dataUrl: string, filename: string) => void;
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  tokens,
  componentType,
  variant = 'default',
  onExport
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const exportAsImage = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: 'transparent',
        scale: 2, // Higher resolution
        useCORS: true,
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const filename = `${componentType}-${variant}.png`;
      
      if (onExport) {
        onExport(dataUrl, filename);
      } else {
        // Direct download
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const renderComponent = () => {
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
          onClick={exportAsImage}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          Export PNG
        </button>
      </div>
      
      <div 
        ref={previewRef}
        className="p-8 bg-gray-50 rounded-md inline-block"
        style={{ minWidth: '200px' }}
      >
        {renderComponent()}
      </div>
    </div>
  );
};

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
