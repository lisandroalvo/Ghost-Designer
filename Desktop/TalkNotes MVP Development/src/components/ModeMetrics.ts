// Mode-specific metrics extraction logic

type ConversationMode = 'meeting' | 'interview' | 'sales' | 'therapy' | 'lecture' | 'casual';

interface Submetric {
  label: string;
  value: string;
  confidence?: 'Low' | 'Med' | 'High';
}

interface Metric {
  id: string;
  title: string;
  value: string | number;
  interpretation: string;
  submetrics: Submetric[];
  isPrimary: boolean;
}

// Extract topic from transcript/summary for smart title
export function generateSmartTitle(transcript: string, summary: string, mode: ConversationMode): string {
  const text = (summary + ' ' + transcript).toLowerCase();
  
  // Try to find key topic indicators
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
  
  // Look for topic indicators
  const topicPatterns = [
    /(?:about|regarding|discussing|topic of|focused on|talking about)\s+([^,\.]{10,50})/i,
    /(?:meeting about|interview for|discussing)\s+([^,\.]{10,50})/i,
  ];
  
  for (const pattern of topicPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const topic = match[1].trim();
      return formatTitle(topic, mode);
    }
  }
  
  // Fallback: use first significant sentence
  if (sentences.length > 0) {
    const firstSentence = sentences[0].trim();
    const words = firstSentence.split(/\s+/).slice(0, 6).join(' ');
    return formatTitle(words, mode);
  }
  
  // Default fallback
  return `${getModeLabel(mode)} Notes`;
}

function formatTitle(topic: string, mode: ConversationMode): string {
  // Capitalize first letter of each major word
  const formatted = topic.split(' ')
    .map(word => word.length > 3 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    .join(' ');
  
  return `${formatted} — ${getModeLabel(mode)}`;
}

export function getModeLabel(mode: ConversationMode): string {
  const labels: Record<ConversationMode, string> = {
    meeting: 'Meeting',
    interview: 'Interview',
    sales: 'Sales',
    therapy: 'Coaching',
    lecture: 'Lecture',
    casual: 'Casual'
  };
  return labels[mode];
}

export function getModeColor(mode: ConversationMode): string {
  const colors: Record<ConversationMode, string> = {
    meeting: '#3B82F6',
    interview: '#8B5CF6',
    sales: '#10B981',
    therapy: '#F59E0B',
    lecture: '#EF4444',
    casual: '#6B7280'
  };
  return colors[mode];
}

// Extract mode-specific metrics
export function extractModeMetrics(
  transcript: string,
  summary: string,
  mode: ConversationMode
): Metric[] {
  switch (mode) {
    case 'meeting':
      return extractMeetingMetrics(transcript, summary);
    case 'interview':
      return extractInterviewMetrics(transcript, summary);
    case 'sales':
      return extractSalesMetrics(transcript, summary);
    case 'therapy':
      return extractCoachingMetrics(transcript, summary);
    case 'lecture':
      return extractLectureMetrics(transcript, summary);
    case 'casual':
      return extractCasualMetrics(transcript, summary);
    default:
      return [];
  }
}

function extractMeetingMetrics(transcript: string, summary: string): Metric[] {
  const text = transcript + ' ' + summary;
  
  // Decisions made
  const decisionKeywords = ['decide', 'agreed', 'decision', 'will do', 'commit', 'approve'];
  const decisions = extractMatches(text, decisionKeywords);
  
  // Action items
  const actionKeywords = ['action', 'todo', 'task', 'need to', 'will', 'should', 'must'];
  const actions = extractMatches(text, actionKeywords);
  
  // Open questions
  const questionMarks = (text.match(/\?/g) || []).length;
  const blockerKeywords = ['block', 'issue', 'problem', 'concern', 'risk'];
  const blockers = extractMatches(text, blockerKeywords);
  
  return [
    {
      id: 'decisions',
      title: 'Decisions Made',
      value: decisions.length,
      interpretation: decisions.length > 0 ? 'Key decisions reached' : 'No explicit decisions detected',
      submetrics: decisions.slice(0, 3).map(d => ({
        label: 'Decision',
        value: d,
        confidence: 'Med'
      })),
      isPrimary: true
    },
    {
      id: 'actions',
      title: 'Action Items',
      value: actions.length,
      interpretation: `${actions.length} action${actions.length !== 1 ? 's' : ''} identified`,
      submetrics: actions.slice(0, 4).map(a => ({
        label: 'Action',
        value: a,
        confidence: 'High'
      })),
      isPrimary: true
    },
    {
      id: 'blockers',
      title: 'Open Questions / Blockers',
      value: blockers.length + questionMarks,
      interpretation: blockers.length > 2 ? 'Several unresolved items' : 'Few blockers identified',
      submetrics: blockers.slice(0, 3).map(b => ({
        label: 'Blocker',
        value: b,
        confidence: 'Med'
      })),
      isPrimary: true
    }
  ];
}

function extractInterviewMetrics(transcript: string, summary: string): Metric[] {
  const text = transcript + ' ' + summary;
  
  // Strength signals
  const strengthKeywords = ['experience', 'skilled', 'proficient', 'expert', 'successful', 'achieved', 'led'];
  const strengths = extractMatches(text, strengthKeywords);
  
  // Red flags
  const redFlagKeywords = ['concern', 'unclear', 'lack', 'unable', 'struggled', 'failed', 'issue'];
  const redFlags = extractMatches(text, redFlagKeywords);
  
  // Notable quotes
  const quotes = extractQuotes(text);
  
  return [
    {
      id: 'strengths',
      title: 'Strength Signals',
      value: strengths.length,
      interpretation: strengths.length > 3 ? 'Strong candidate indicators' : 'Some positive signals',
      submetrics: strengths.slice(0, 4).map(s => ({
        label: 'Strength',
        value: s,
        confidence: 'High'
      })),
      isPrimary: true
    },
    {
      id: 'redflags',
      title: 'Red Flags',
      value: redFlags.length,
      interpretation: redFlags.length > 2 ? 'Multiple concerns noted' : 'Minimal concerns',
      submetrics: redFlags.slice(0, 3).map(r => ({
        label: 'Concern',
        value: r,
        confidence: 'Med'
      })),
      isPrimary: true
    },
    {
      id: 'quotes',
      title: 'Notable Quotes',
      value: quotes.length,
      interpretation: 'Key candidate responses',
      submetrics: quotes.slice(0, 3).map(q => ({
        label: 'Quote',
        value: q,
        confidence: 'High'
      })),
      isPrimary: true
    }
  ];
}

function extractSalesMetrics(transcript: string, summary: string): Metric[] {
  const text = transcript + ' ' + summary;
  
  // Pain points
  const painKeywords = ['problem', 'challenge', 'issue', 'difficult', 'struggle', 'need', 'pain'];
  const painPoints = extractMatches(text, painKeywords);
  
  // Objections
  const objectionKeywords = ['but', 'however', 'concern', 'expensive', 'cost', 'worried', 'unsure'];
  const objections = extractMatches(text, objectionKeywords);
  
  // Buying signals
  const buyingKeywords = ['interested', 'like', 'need', 'when', 'how soon', 'next step', 'proceed'];
  const signals = extractMatches(text, buyingKeywords);
  
  // Next steps
  const nextStepKeywords = ['follow up', 'meeting', 'call', 'demo', 'proposal', 'contract'];
  const nextSteps = extractMatches(text, nextStepKeywords);
  
  return [
    {
      id: 'pain',
      title: 'Pain Points',
      value: painPoints.length,
      interpretation: 'Customer challenges identified',
      submetrics: painPoints.slice(0, 3).map(p => ({
        label: 'Pain',
        value: p,
        confidence: 'High'
      })),
      isPrimary: true
    },
    {
      id: 'objections',
      title: 'Objections',
      value: objections.length,
      interpretation: objections.length > 2 ? 'Several concerns raised' : 'Limited objections',
      submetrics: objections.slice(0, 3).map(o => ({
        label: 'Objection',
        value: o,
        confidence: 'Med'
      })),
      isPrimary: true
    },
    {
      id: 'buying',
      title: 'Buying Signals',
      value: signals.length,
      interpretation: signals.length > 2 ? 'Strong interest detected' : 'Some interest shown',
      submetrics: signals.slice(0, 3).map(s => ({
        label: 'Signal',
        value: s,
        confidence: 'Med'
      })),
      isPrimary: true
    },
    {
      id: 'nextsteps',
      title: 'Next Step Commitment',
      value: nextSteps.length,
      interpretation: nextSteps.length > 0 ? 'Follow-up actions defined' : 'No clear next steps',
      submetrics: nextSteps.slice(0, 2).map(n => ({
        label: 'Next Step',
        value: n,
        confidence: 'High'
      })),
      isPrimary: true
    }
  ];
}

function extractCoachingMetrics(transcript: string, summary: string): Metric[] {
  const text = transcript + ' ' + summary;
  
  // Patterns
  const patternKeywords = ['always', 'never', 'usually', 'tend to', 'pattern', 'habit', 'repeat'];
  const patterns = extractMatches(text, patternKeywords);
  
  // Breakthrough moments
  const breakthroughKeywords = ['realize', 'understand', 'see now', 'makes sense', 'aha', 'insight', 'clarity'];
  const breakthroughs = extractMatches(text, breakthroughKeywords);
  
  // Emotional shifts
  const emotionKeywords = ['feel', 'felt', 'emotion', 'anxious', 'happy', 'sad', 'angry', 'calm'];
  const emotions = extractMatches(text, emotionKeywords);
  
  return [
    {
      id: 'patterns',
      title: 'Patterns Detected',
      value: patterns.length,
      interpretation: 'Recurring themes identified',
      submetrics: patterns.slice(0, 3).map(p => ({
        label: 'Pattern',
        value: p,
        confidence: 'Med'
      })),
      isPrimary: true
    },
    {
      id: 'breakthroughs',
      title: 'Breakthrough Moments',
      value: breakthroughs.length,
      interpretation: breakthroughs.length > 0 ? 'Key insights reached' : 'Building awareness',
      submetrics: breakthroughs.slice(0, 3).map(b => ({
        label: 'Insight',
        value: b,
        confidence: 'High'
      })),
      isPrimary: true
    },
    {
      id: 'emotions',
      title: 'Emotional Shifts',
      value: emotions.length,
      interpretation: 'Emotional awareness moments',
      submetrics: emotions.slice(0, 3).map(e => ({
        label: 'Emotion',
        value: e,
        confidence: 'Med'
      })),
      isPrimary: true
    }
  ];
}

function extractLectureMetrics(transcript: string, summary: string): Metric[] {
  const text = transcript + ' ' + summary;
  
  // Core concepts
  const conceptKeywords = ['concept', 'theory', 'principle', 'idea', 'framework', 'model', 'definition'];
  const concepts = extractMatches(text, conceptKeywords);
  
  // Definitions
  const definitionKeywords = ['define', 'means', 'is defined', 'refers to', 'term', 'called'];
  const definitions = extractMatches(text, definitionKeywords);
  
  // Examples
  const exampleKeywords = ['example', 'for instance', 'such as', 'like', 'case', 'illustration'];
  const examples = extractMatches(text, exampleKeywords);
  
  return [
    {
      id: 'concepts',
      title: 'Core Concepts',
      value: concepts.length,
      interpretation: 'Key ideas covered',
      submetrics: concepts.slice(0, 4).map(c => ({
        label: 'Concept',
        value: c,
        confidence: 'High'
      })),
      isPrimary: true
    },
    {
      id: 'definitions',
      title: 'Definitions',
      value: definitions.length,
      interpretation: 'Terms explained',
      submetrics: definitions.slice(0, 3).map(d => ({
        label: 'Definition',
        value: d,
        confidence: 'High'
      })),
      isPrimary: true
    },
    {
      id: 'examples',
      title: 'Examples / Analogies',
      value: examples.length,
      interpretation: 'Practical illustrations provided',
      submetrics: examples.slice(0, 3).map(e => ({
        label: 'Example',
        value: e,
        confidence: 'Med'
      })),
      isPrimary: true
    }
  ];
}

function extractCasualMetrics(transcript: string, summary: string): Metric[] {
  const text = transcript + ' ' + summary;
  
  // Important moments
  const importantKeywords = ['important', 'key', 'significant', 'remember', 'note', 'highlight'];
  const important = extractMatches(text, importantKeywords);
  
  // Plans/commitments
  const planKeywords = ['plan', 'going to', 'will', 'commit', 'promise', 'arrange', 'schedule'];
  const plans = extractMatches(text, planKeywords);
  
  // References (people, places, things)
  const names = extractProperNouns(text);
  
  return [
    {
      id: 'important',
      title: 'Important Moments',
      value: important.length,
      interpretation: 'Key discussion points',
      submetrics: important.slice(0, 4).map(i => ({
        label: 'Moment',
        value: i,
        confidence: 'Med'
      })),
      isPrimary: true
    },
    {
      id: 'plans',
      title: 'Plans / Commitments',
      value: plans.length,
      interpretation: plans.length > 0 ? 'Future actions mentioned' : 'No specific plans discussed',
      submetrics: plans.slice(0, 3).map(p => ({
        label: 'Plan',
        value: p,
        confidence: 'Med'
      })),
      isPrimary: true
    },
    {
      id: 'references',
      title: 'People/Places/Things',
      value: names.length,
      interpretation: 'Key references mentioned',
      submetrics: names.slice(0, 4).map(n => ({
        label: 'Reference',
        value: n,
        confidence: 'Low'
      })),
      isPrimary: false
    }
  ];
}

// Helper functions
function extractMatches(text: string, keywords: string[]): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
  const matches: string[] = [];
  
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (keywords.some(kw => lower.includes(kw))) {
      matches.push(sentence.trim().slice(0, 120));
    }
  }
  
  return [...new Set(matches)]; // Remove duplicates
}

function extractQuotes(text: string): string[] {
  const quotes: string[] = [];
  const quotePattern = /"([^"]{20,100})"/g;
  let match;
  
  while ((match = quotePattern.exec(text)) !== null) {
    quotes.push(match[1]);
  }
  
  return quotes.slice(0, 5);
}

function extractProperNouns(text: string): string[] {
  // Simple heuristic: words that start with capital letters (excluding sentence starts)
  const words = text.split(/\s+/);
  const properNouns: string[] = [];
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i].replace(/[^a-zA-Z]/g, '');
    if (word.length > 2 && word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase()) {
      properNouns.push(word);
    }
  }
  
  return [...new Set(properNouns)].slice(0, 10);
}
