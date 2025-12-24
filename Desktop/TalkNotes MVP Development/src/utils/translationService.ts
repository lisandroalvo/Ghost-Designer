// Real-time translation service with streaming support

interface TranslationSegment {
  original: string;
  translated: string;
  isFinal: boolean;
  timestamp: number;
}

class TranslationService {
  private segments: TranslationSegment[] = [];
  private pendingTranslation: string = '';
  private translationTimeout: number | null = null;
  private debounceMs: number = 300;
  private lastTranslatedLength: number = 0;

  async translateDelta(
    newText: string,
    targetLanguage: string,
    isFinal: boolean = false
  ): Promise<string> {
    // Skip translation if target is "Original" or empty
    if (!targetLanguage || targetLanguage.toLowerCase() === 'original') {
      return newText;
    }

    // Only translate the new delta (text that hasn't been translated yet)
    const delta = newText.substring(this.lastTranslatedLength);
    
    if (!delta.trim()) {
      // No new text to translate
      return this.getFullTranslatedText();
    }

    // If final, translate immediately
    if (isFinal) {
      if (this.translationTimeout) {
        clearTimeout(this.translationTimeout);
        this.translationTimeout = null;
      }
      return await this.performTranslation(delta, targetLanguage, true);
    }

    // Otherwise, debounce interim translations
    this.pendingTranslation = delta;
    
    return new Promise((resolve) => {
      if (this.translationTimeout) {
        clearTimeout(this.translationTimeout);
      }

      this.translationTimeout = window.setTimeout(async () => {
        const translated = await this.performTranslation(
          this.pendingTranslation,
          targetLanguage,
          false
        );
        this.pendingTranslation = '';
        resolve(translated);
      }, this.debounceMs);
    });
  }

  private async performTranslation(
    text: string,
    targetLanguage: string,
    isFinal: boolean
  ): Promise<string> {
    try {
      // Use OpenAI for translation (fast and reliable)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(import.meta as any).env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text to ${targetLanguage}. Preserve the meaning and tone. Output only the translation, nothing else. Keep it natural and conversational.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const translated = data.choices[0]?.message?.content?.trim() || text;

      // Store segment
      const segment: TranslationSegment = {
        original: text,
        translated,
        isFinal,
        timestamp: Date.now()
      };

      if (isFinal) {
        this.segments.push(segment);
        this.lastTranslatedLength += text.length;
      } else {
        // For interim, replace the last interim segment or add new
        const lastSegmentIndex = this.segments.length - 1;
        if (lastSegmentIndex >= 0 && !this.segments[lastSegmentIndex].isFinal) {
          this.segments[lastSegmentIndex] = segment;
        } else {
          this.segments.push(segment);
        }
      }

      return this.getFullTranslatedText();
    } catch (error) {
      console.error('[Translation] Error:', error);
      // Fallback: return original text
      return this.getFullTranslatedText() + text;
    }
  }

  private getFullTranslatedText(): string {
    return this.segments
      .filter(s => s.isFinal)
      .map(s => s.translated)
      .join(' ');
  }

  reset() {
    this.segments = [];
    this.pendingTranslation = '';
    this.lastTranslatedLength = 0;
    if (this.translationTimeout) {
      clearTimeout(this.translationTimeout);
      this.translationTimeout = null;
    }
  }

  // Get all translated text including interim
  getAllTranslatedText(): string {
    return this.segments.map(s => s.translated).join(' ');
  }

  // Get original text for reference
  getOriginalText(): string {
    return this.segments.map(s => s.original).join(' ');
  }
}

// Singleton instance
export const translationService = new TranslationService();
