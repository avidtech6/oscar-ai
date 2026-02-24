// Temporary runtime logging for `.match()` calls and input validation
// This helps identify remaining issues before removing

const LOG_PREFIX = '[MatchLogger]';
const ENABLED = true; // Set to false to disable all logging

interface MatchLogEntry {
  timestamp: number;
  location: string;
  input: any;
  inputType: string;
  regex: string;
  result: 'success' | 'error' | 'type-guard-prevented';
  error?: string;
}

const logEntries: MatchLogEntry[] = [];
const MAX_ENTRIES = 100;

/**
 * Log a `.match()` call for debugging
 */
export function logMatchCall(
  location: string,
  input: any,
  regex: RegExp | string,
  result: RegExpMatchArray | null,
  error?: Error
): void {
  if (!ENABLED) return;
  
  const entry: MatchLogEntry = {
    timestamp: Date.now(),
    location,
    input,
    inputType: typeof input,
    regex: regex instanceof RegExp ? regex.toString() : regex,
    result: error ? 'error' : (result ? 'success' : 'type-guard-prevented'),
    error: error?.message
  };
  
  logEntries.unshift(entry);
  if (logEntries.length > MAX_ENTRIES) {
    logEntries.pop();
  }
  
  if (error) {
    console.warn(`${LOG_PREFIX} ${location}: .match() error on type "${typeof input}":`, error.message, 'Input:', input);
  } else if (result === null && typeof input !== 'string') {
    console.warn(`${LOG_PREFIX} ${location}: Type guard prevented .match() on non-string type "${typeof input}"`);
  } else {
    console.debug(`${LOG_PREFIX} ${location}: .match() successful on string (length: ${typeof input === 'string' ? input.length : 'N/A'})`);
  }
}

/**
 * Log input validation
 */
export function logInputValidation(
  location: string,
  input: any,
  isValid: boolean,
  reason?: string
): void {
  if (!ENABLED) return;
  
  console.debug(`${LOG_PREFIX} ${location}: Input validation ${isValid ? 'PASSED' : 'FAILED'}`, {
    input,
    inputType: typeof input,
    reason
  });
}

/**
 * Log app readiness check
 */
export function logAppReadiness(
  location: string,
  isReady: boolean,
  details?: any
): void {
  if (!ENABLED) return;
  
  console.debug(`${LOG_PREFIX} ${location}: App readiness ${isReady ? 'READY' : 'NOT READY'}`, details);
}

/**
 * Log sanitization step
 */
export function logSanitization(
  location: string,
  input: any,
  output: any,
  transformation: string
): void {
  if (!ENABLED) return;
  
  console.debug(`${LOG_PREFIX} ${location}: Sanitization "${transformation}"`, {
    input,
    inputType: typeof input,
    output,
    outputType: typeof output
  });
}

/**
 * Get all logged entries (for debugging UI)
 */
export function getLogEntries(): MatchLogEntry[] {
  return [...logEntries];
}

/**
 * Clear all logs
 */
export function clearLogs(): void {
  logEntries.length = 0;
}

/**
 * Get summary statistics
 */
export function getLogSummary(): {
  totalCalls: number;
  errors: number;
  typeGuardPreventions: number;
  successes: number;
  recentErrors: MatchLogEntry[];
} {
  const errors = logEntries.filter(e => e.result === 'error');
  const prevented = logEntries.filter(e => e.result === 'type-guard-prevented');
  const successes = logEntries.filter(e => e.result === 'success');
  
  return {
    totalCalls: logEntries.length,
    errors: errors.length,
    typeGuardPreventions: prevented.length,
    successes: successes.length,
    recentErrors: errors.slice(0, 5)
  };
}

/**
 * Wrap a `.match()` call with logging
 */
export function safeMatchWithLogging(
  input: any,
  regex: RegExp,
  location: string
): RegExpMatchArray | null {
  try {
    if (typeof input !== 'string') {
      logMatchCall(location, input, regex, null);
      console.warn(`${LOG_PREFIX} ${location}: Attempted .match() on non-string type "${typeof input}"`);
      return null;
    }
    
    const result = input.match(regex);
    logMatchCall(location, input, regex, result);
    return result;
  } catch (error) {
    logMatchCall(location, input, regex, null, error as Error);
    return null;
  }
}

/**
 * Check if there are any recent errors that need attention
 */
export function hasRecentErrors(minutes = 5): boolean {
  const cutoff = Date.now() - (minutes * 60 * 1000);
  return logEntries.some(entry => 
    entry.result === 'error' && entry.timestamp > cutoff
  );
}

// Auto-log to console on errors
if (ENABLED && typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Check for .match() errors in error messages
    if (args.some(arg => 
      typeof arg === 'string' && 
      (arg.includes('.match') || arg.includes('is not a function'))
    )) {
      console.warn(`${LOG_PREFIX} Detected potential .match() error in console:`);
      console.warn(...args);
    }
    originalConsoleError.apply(console, args);
  };
  
  console.log(`${LOG_PREFIX} Runtime logging enabled`);
}