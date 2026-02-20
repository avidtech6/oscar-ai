/**
 * Text processing utilities for natural language input
 * Includes spelling correction, grammar normalization, and text cleaning
 */

// Common spelling corrections
const SPELLING_CORRECTIONS: Record<string, string> = {
  // Common typos
  'ckae': 'cake',
  'seaside': 'seaside',
  'clothes': 'clothes',
  'pack': 'pack',
  'todo': 'todo',
  'rember': 'remember',
  'recieve': 'receive',
  'seperate': 'separate',
  'definately': 'definitely',
  'occured': 'occurred',
  'occurence': 'occurrence',
  'wierd': 'weird',
  'acheive': 'achieve',
  'arguement': 'argument',
  'comming': 'coming',
  'existance': 'existence',
  'fourty': 'forty',
  'goverment': 'government',
  'happend': 'happened',
  'independant': 'independent',
  'judgement': 'judgment',
  'knowlege': 'knowledge',
  'liasion': 'liaison',
  'maintainance': 'maintenance',
  'neccessary': 'necessary',
  'occassion': 'occasion',
  'publically': 'publicly',
  'reciept': 'receipt',
  'seige': 'siege',
  'succesful': 'successful',
  'thier': 'their',
  'tommorow': 'tomorrow',
  'tounge': 'tongue',
  'truely': 'truly',
  'untill': 'until',
  'writting': 'writing',
  'yatch': 'yacht'
};

// Grammar normalization patterns
const GRAMMAR_PATTERNS: Array<[RegExp, string | ((substring: string, ...args: any[]) => string)]> = [
  // Fix double spaces
  [/\s+/g, ' '],
  // Fix missing spaces after commas
  [/,(?=\S)/g, ', '],
  // Fix missing spaces before commas
  [/(\S),/g, '$1, '],
  // Fix multiple commas
  [/,,+/g, ','],
  // Fix spaces before punctuation
  [/\s+([.,!?])/g, '$1'],
  // Add space after punctuation if missing
  [/([.,!?])(?=\S)/g, '$1 '],
  // Fix capitalization after punctuation
  [/([.!?]\s+)([a-z])/g, (match: string, p1: string, p2: string) => p1 + p2.toUpperCase()],
  // Fix "i" to "I"
  [/\bi\b/g, 'I'],
  // Fix common grammar issues
  [/\bcould of\b/g, 'could have'],
  [/\bshould of\b/g, 'should have'],
  [/\bwould of\b/g, 'would have'],
  [/\bmust of\b/g, 'must have'],
  [/\bmight of\b/g, 'might have'],
  [/\bmay of\b/g, 'may have'],
  [/\balot\b/g, 'a lot'],
  [/\ballot\b/g, 'a lot'],
  [/\beveryday\b/g, 'every day'],
  [/\beverytime\b/g, 'every time'],
  [/\banyways\b/g, 'anyway'],
  [/\banytime\b/g, 'any time'],
  [/\bsometime\b/g, 'some time'],
  [/\bsomeday\b/g, 'some day']
];

// Task-related spelling corrections
const TASK_CORRECTIONS: Record<string, string> = {
  'remind': 'remind',
  'remember': 'remember',
  'check': 'check',
  'buy': 'buy',
  'fix': 'fix',
  'schedule': 'schedule',
  'research': 'research',
  'complete': 'complete',
  'finish': 'finish',
  'create': 'create',
  'make': 'make',
  'do': 'do',
  'write': 'write',
  'add': 'add',
  'update': 'update',
  'delete': 'delete',
  'move': 'move',
  'find': 'find',
  'search': 'search',
  'look': 'look',
  'show': 'show',
  'list': 'list',
  'summarize': 'summarize',
  'expand': 'expand',
  'translate': 'translate'
};

/**
 * Correct spelling in a text string
 */
export function correctSpelling(text: string): string {
  // Ensure text is a string
  const safeText = typeof text === 'string' ? text : String(text || '');
  let corrected = safeText;
  
  // Apply common spelling corrections
  Object.entries(SPELLING_CORRECTIONS).forEach(([wrong, correct]) => {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    corrected = corrected.replace(regex, correct);
  });
  
  // Apply task-related corrections
  Object.entries(TASK_CORRECTIONS).forEach(([wrong, correct]) => {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    corrected = corrected.replace(regex, correct);
  });
  
  return corrected;
}

/**
 * Normalize grammar and punctuation
 */
export function normalizeGrammar(text: string): string {
  // Ensure text is a string
  const safeText = typeof text === 'string' ? text : String(text || '');
  let normalized = safeText.trim();
  
  // Apply grammar patterns
  GRAMMAR_PATTERNS.forEach(([pattern, replacement]) => {
    if (typeof replacement === 'string') {
      normalized = normalized.replace(pattern, replacement);
    } else {
      normalized = normalized.replace(pattern, replacement);
    }
  });
  
  // Capitalize first letter
  if (normalized.length > 0) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  
  return normalized;
}

/**
 * Extract and normalize multiple actions from text
 */
export function extractMultipleActions(text: string): string[] {
  // Ensure text is a string
  const safeText = typeof text === 'string' ? text : String(text || '');
  const normalized = normalizeGrammar(correctSpelling(safeText));
  
  // Split by common separators
  const separators = [',', ';', 'and', 'then', 'also', '&', '/', '|'];
  
  let actions: string[] = [normalized];
  
  // Try to split by separators
  separators.forEach(separator => {
    const newActions: string[] = [];
    actions.forEach(action => {
      if (separator === ',' || separator === ';' || separator === '&' || separator === '/' || separator === '|') {
        // Split by punctuation
        const parts = action.split(new RegExp(`\\s*${separator}\\s*`));
        newActions.push(...parts.filter(part => part.trim().length > 0));
      } else {
        // Split by word
        const regex = new RegExp(`\\s+${separator}\\s+`, 'i');
        const parts = action.split(regex);
        newActions.push(...parts.filter(part => part.trim().length > 0));
      }
    });
    actions = newActions;
  });
  
  // Clean up each action
  actions = actions.map(action => {
    let cleaned = action.trim();
    
    // Remove leading "to" if present
    cleaned = cleaned.replace(/^\s*to\s+/i, '');
    
    // Remove trailing punctuation
    cleaned = cleaned.replace(/[.,;!?]+$/, '');
    
    // Capitalize first letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    return cleaned;
  });
  
  // Filter out empty actions and deduplicate
  const uniqueActions = Array.from(new Set(actions.filter(action => action.length > 0)));
  
  return uniqueActions;
}

/**
 * Detect if text contains multiple actions
 */
export function hasMultipleActions(text: string): boolean {
  // Ensure text is a string
  const safeText = typeof text === 'string' ? text : String(text || '');
  const normalized = safeText.toLowerCase();
  
  // Check for multiple action indicators
  const indicators = [
    /,\s*(and|then|also)?\s*[a-z]/i,  // Comma followed by another action
    /\band\b/i,                       // "and" connecting actions
    /\bthen\b/i,                      // "then" connecting actions
    /\balso\b/i,                      // "also" connecting actions
    /\s+&\s+/i,                       // Ampersand
    /;\s*/i,                          // Semicolon
    /\s+or\s+/i                       // "or" connecting alternatives
  ];
  
  return indicators.some(indicator => indicator.test(normalized));
}

/**
 * Get action type from text
 */
export function getActionType(text: string): 'task' | 'note' | 'query' | 'update' | 'unknown' {
  // Ensure text is a string
  const safeText = typeof text === 'string' ? text : String(text || '');
  const normalized = safeText.toLowerCase();
  
  if (normalized.includes('todo') ||
      normalized.includes('task') ||
      normalized.includes('remind') ||
      normalized.includes('remember') ||
      normalized.includes('check') ||
      normalized.includes('buy') ||
      normalized.includes('fix') ||
      normalized.includes('schedule') ||
      normalized.includes('research') ||
      normalized.includes('complete') ||
      normalized.includes('finish') ||
      normalized.includes('do') ||
      normalized.includes('make')) {
    return 'task';
  }
  
  if (normalized.includes('note') ||
      normalized.includes('write') ||
      normalized.includes('jot') ||
      normalized.includes('record') ||
      normalized.includes('save')) {
    return 'note';
  }
  
  if (normalized.includes('show') ||
      normalized.includes('list') ||
      normalized.includes('find') ||
      normalized.includes('search') ||
      normalized.includes('what') ||
      normalized.includes('where') ||
      normalized.includes('how') ||
      normalized.includes('when')) {
    return 'query';
  }
  
  if (normalized.includes('update') ||
      normalized.includes('change') ||
      normalized.includes('edit') ||
      normalized.includes('modify') ||
      normalized.includes('rename') ||
      normalized.includes('move') ||
      normalized.includes('delete')) {
    return 'update';
  }
  
  return 'unknown';
}

/**
 * Process natural language input with full correction pipeline
 */
export function processNaturalLanguageInput(input: string): {
  original: string;
  corrected: string;
  normalized: string;
  hasMultiple: boolean;
  actions: string[];
  actionTypes: ('task' | 'note' | 'query' | 'update' | 'unknown')[];
} {
  // Ensure input is a string
  const safeInput = typeof input === 'string' ? input : String(input || '');
  const corrected = correctSpelling(safeInput);
  const normalized = normalizeGrammar(corrected);
  const hasMultiple = hasMultipleActions(normalized);
  const actions = hasMultiple ? extractMultipleActions(normalized) : [normalized];
  const actionTypes = actions.map(action => getActionType(action));
  
  return {
    original: safeInput,
    corrected,
    normalized,
    hasMultiple,
    actions,
    actionTypes
  };
}

/**
 * Format actions for display
 */
export function formatActionsForDisplay(actions: string[]): string {
  if (actions.length === 0) return '';
  if (actions.length === 1) return actions[0];
  
  return actions.map((action, index) => {
    if (index === actions.length - 1) {
      return `and ${action}`;
    }
    return `${action}, `;
  }).join('');
}

/**
 * Generate user-friendly summary of processed input
 */
export function generateProcessingSummary(processed: ReturnType<typeof processNaturalLanguageInput>): string {
  const { original, corrected, normalized, hasMultiple, actions, actionTypes } = processed;
  
  let summary = '';
  
  if (original !== corrected) {
    summary += `Corrected spelling: "${original}" → "${corrected}"\n`;
  }
  
  if (corrected !== normalized) {
    summary += `Normalized grammar: "${corrected}" → "${normalized}"\n`;
  }
  
  if (hasMultiple) {
    summary += `Detected ${actions.length} actions:\n`;
    actions.forEach((action, index) => {
      summary += `  ${index + 1}. ${action} (${actionTypes[index]})\n`;
    });
  } else {
    summary += `Single action detected: ${actions[0]} (${actionTypes[0]})`;
  }
  
  return summary;
}