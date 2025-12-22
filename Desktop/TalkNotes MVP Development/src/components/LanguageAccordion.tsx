import React, { useState } from 'react';

interface LanguageAccordionProps {
  value: string;
  onChange: (language: string) => void;
  disabled?: boolean;
}

const languages = {
  original: { name: 'Original language', flag: '🌐' },
  popular: [
    { name: 'English', flag: '🇬🇧' },
    { name: 'Spanish', flag: '🇪🇸' },
    { name: 'French', flag: '🇫🇷' },
    { name: 'German', flag: '🇩🇪' },
    { name: 'Italian', flag: '🇮🇹' },
    { name: 'Portuguese', flag: '🇵🇹' },
    { name: 'Chinese (Mandarin)', flag: '🇨🇳' },
    { name: 'Japanese', flag: '🇯🇵' },
    { name: 'Korean', flag: '🇰🇷' },
    { name: 'Arabic', flag: '🇸🇦' },
    { name: 'Russian', flag: '🇷🇺' },
    { name: 'Hindi', flag: '🇮🇳' },
  ],
  asian: [
    { name: 'Bengali', flag: '🇧🇩' },
    { name: 'Thai', flag: '🇹🇭' },
    { name: 'Vietnamese', flag: '🇻🇳' },
    { name: 'Indonesian', flag: '🇮🇩' },
    { name: 'Malay', flag: '🇲🇾' },
    { name: 'Filipino (Tagalog)', flag: '🇵🇭' },
    { name: 'Burmese', flag: '🇲🇲' },
    { name: 'Khmer (Cambodian)', flag: '🇰🇭' },
    { name: 'Lao', flag: '🇱🇦' },
    { name: 'Nepali', flag: '🇳🇵' },
    { name: 'Sinhala', flag: '🇱🇰' },
    { name: 'Urdu', flag: '🇵🇰' },
    { name: 'Persian (Farsi)', flag: '🇮🇷' },
    { name: 'Mongolian', flag: '🇲🇳' },
  ],
  european: [
    { name: 'Turkish', flag: '🇹🇷' },
    { name: 'Polish', flag: '🇵🇱' },
    { name: 'Dutch', flag: '🇳🇱' },
    { name: 'Swedish', flag: '🇸🇪' },
    { name: 'Norwegian', flag: '🇳🇴' },
    { name: 'Danish', flag: '🇩🇰' },
    { name: 'Finnish', flag: '🇫🇮' },
    { name: 'Greek', flag: '🇬🇷' },
    { name: 'Czech', flag: '🇨🇿' },
    { name: 'Romanian', flag: '🇷🇴' },
    { name: 'Hungarian', flag: '🇭🇺' },
    { name: 'Ukrainian', flag: '🇺🇦' },
    { name: 'Catalan', flag: '🇦🇩' },
    { name: 'Croatian', flag: '🇭🇷' },
    { name: 'Serbian', flag: '🇷🇸' },
    { name: 'Bulgarian', flag: '🇧🇬' },
    { name: 'Slovak', flag: '🇸🇰' },
    { name: 'Slovenian', flag: '🇸🇮' },
    { name: 'Lithuanian', flag: '🇱🇹' },
    { name: 'Latvian', flag: '🇱🇻' },
    { name: 'Estonian', flag: '🇪🇪' },
    { name: 'Icelandic', flag: '🇮🇸' },
    { name: 'Irish', flag: '🇮🇪' },
    { name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    { name: 'Basque', flag: '🇪🇸' },
    { name: 'Galician', flag: '🇪🇸' },
    { name: 'Albanian', flag: '🇦🇱' },
    { name: 'Macedonian', flag: '🇲🇰' },
    { name: 'Bosnian', flag: '🇧🇦' },
  ],
  middleEastern: [
    { name: 'Hebrew', flag: '🇮🇱' },
    { name: 'Pashto', flag: '🇦🇫' },
    { name: 'Kurdish', flag: '🇮🇶' },
    { name: 'Azerbaijani', flag: '🇦🇿' },
    { name: 'Georgian', flag: '🇬🇪' },
    { name: 'Armenian', flag: '🇦🇲' },
    { name: 'Kazakh', flag: '🇰🇿' },
    { name: 'Uzbek', flag: '🇺🇿' },
  ],
  african: [
    { name: 'Amharic', flag: '🇪🇹' },
    { name: 'Swahili', flag: '🇰🇪' },
    { name: 'Yoruba', flag: '🇳🇬' },
    { name: 'Igbo', flag: '🇳🇬' },
    { name: 'Zulu', flag: '🇿🇦' },
    { name: 'Afrikaans', flag: '🇿🇦' },
    { name: 'Somali', flag: '🇸🇴' },
    { name: 'Hausa', flag: '🇳🇬' },
    { name: 'Oromo', flag: '🇪🇹' },
    { name: 'Malagasy', flag: '🇲🇬' },
  ],
};

export function LanguageAccordion({ value, onChange, disabled }: LanguageAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const trimmedValue = value.trim();
  
  // Find the language object that matches the current value
  const findLanguageByName = (name: string) => {
    if (name === '' || name === languages.original.name) return languages.original;
    const allLanguages = [...languages.popular, ...languages.asian, ...languages.european, ...languages.middleEastern, ...languages.african];
    return allLanguages.find(lang => lang.name === name) || { name, flag: '🌐' };
  };
  
  const currentLanguage = findLanguageByName(trimmedValue);

  const handleSelect = (lang: { name: string; flag: string }) => {
    onChange(lang.name === languages.original.name ? '' : lang.name);
    setIsOpen(false);
  };

  return (
    <div className="language-accordion">
      <button
        className="accordion-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
      >
        <span className="accordion-value">
          <span className="flag-emoji">{currentLanguage.flag}</span>
          {currentLanguage.name}
        </span>
        <svg
          className={`accordion-icon ${isOpen ? 'open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
        >
          <path d="M4 6l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="accordion-content">
          <button
            className={`language-option ${currentLanguage.name === languages.original.name ? 'selected' : ''}`}
            onClick={() => handleSelect(languages.original)}
            type="button"
          >
            <span className="flag-emoji">{languages.original.flag}</span>
            {languages.original.name}
          </button>

          <div className="language-group-label">Popular</div>
          {languages.popular.map((lang) => (
            <button
              key={lang.name}
              className={`language-option ${currentLanguage.name === lang.name ? 'selected' : ''}`}
              onClick={() => handleSelect(lang)}
              type="button"
            >
              <span className="flag-emoji">{lang.flag}</span>
              {lang.name}
            </button>
          ))}

          <div className="language-group-label">Asian</div>
          {languages.asian.map((lang) => (
            <button
              key={lang.name}
              className={`language-option ${currentLanguage.name === lang.name ? 'selected' : ''}`}
              onClick={() => handleSelect(lang)}
              type="button"
            >
              <span className="flag-emoji">{lang.flag}</span>
              {lang.name}
            </button>
          ))}

          <div className="language-group-label">European</div>
          {languages.european.map((lang) => (
            <button
              key={lang.name}
              className={`language-option ${currentLanguage.name === lang.name ? 'selected' : ''}`}
              onClick={() => handleSelect(lang)}
              type="button"
            >
              <span className="flag-emoji">{lang.flag}</span>
              {lang.name}
            </button>
          ))}

          <div className="language-group-label">Middle Eastern & Caucasus</div>
          {languages.middleEastern.map((lang) => (
            <button
              key={lang.name}
              className={`language-option ${currentLanguage.name === lang.name ? 'selected' : ''}`}
              onClick={() => handleSelect(lang)}
              type="button"
            >
              <span className="flag-emoji">{lang.flag}</span>
              {lang.name}
            </button>
          ))}

          <div className="language-group-label">African</div>
          {languages.african.map((lang) => (
            <button
              key={lang.name}
              className={`language-option ${currentLanguage.name === lang.name ? 'selected' : ''}`}
              onClick={() => handleSelect(lang)}
              type="button"
            >
              <span className="flag-emoji">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .language-accordion {
          width: 100%;
          max-width: 380px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        .accordion-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.85);
          font-size: 14px;
          font-weight: 400;
          cursor: pointer;
          transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
        }

        .accordion-trigger:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .accordion-trigger:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .accordion-value {
          flex: 1;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .flag-emoji {
          font-size: 16px;
          line-height: 1;
          opacity: 0.75;
          filter: grayscale(0.15) brightness(0.95);
        }

        .accordion-icon {
          color: rgba(255, 255, 255, 0.4);
          transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          margin-left: 8px;
        }

        .accordion-icon.open {
          transform: rotate(180deg);
        }

        .accordion-content {
          margin-top: 6px;
          padding: 6px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          max-height: 320px;
          overflow-y: auto;
          animation: accordionSlideDown 280ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes accordionSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .accordion-content::-webkit-scrollbar {
          width: 8px;
        }

        .accordion-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .accordion-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .accordion-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .language-option {
          width: 100%;
          padding: 9px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.75);
          font-size: 14px;
          font-weight: 400;
          text-align: left;
          cursor: pointer;
          transition: all 140ms cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .language-option:hover {
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.9);
        }

        .language-option.selected {
          background: rgba(52, 201, 143, 0.08);
          color: rgb(52, 201, 143);
          font-weight: 500;
          box-shadow: 0 0 12px rgba(52, 201, 143, 0.15);
        }

        .language-option.selected:hover {
          background: rgba(52, 201, 143, 0.12);
        }

        .language-group-label {
          padding: 12px 12px 6px 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.35);
          margin-top: 6px;
        }

        .language-group-label:first-child {
          margin-top: 0;
        }

        @media (prefers-color-scheme: light) {
          .accordion-trigger {
            background: rgba(0, 0, 0, 0.02);
            border-color: rgba(0, 0, 0, 0.08);
            color: rgba(0, 0, 0, 0.85);
          }

          .accordion-trigger:hover:not(:disabled) {
            background: rgba(0, 0, 0, 0.04);
            border-color: rgba(0, 0, 0, 0.12);
          }

          .accordion-icon {
            color: rgba(0, 0, 0, 0.4);
          }

          .accordion-content {
            background: rgba(0, 0, 0, 0.02);
            border-color: rgba(0, 0, 0, 0.06);
          }

          .accordion-content::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.1);
          }

          .accordion-content::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.15);
          }

          .language-option {
            color: rgba(0, 0, 0, 0.75);
          }

          .language-option:hover {
            background: rgba(0, 0, 0, 0.04);
            color: rgba(0, 0, 0, 0.9);
          }

          .language-option.selected {
            background: rgba(30, 142, 94, 0.12);
            color: rgb(30, 142, 94);
          }

          .language-option.selected:hover {
            background: rgba(30, 142, 94, 0.16);
          }

          .language-group-label {
            color: rgba(0, 0, 0, 0.35);
          }
        }
      `}</style>
    </div>
  );
}
