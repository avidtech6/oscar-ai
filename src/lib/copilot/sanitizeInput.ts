// Input sanitization layer for Copilot pipeline
// Ensures all inputs to `.match()` and other string methods are safe

import { logSanitization, logInputValidation, logAppReadiness } from './matchLogger';

/**
 * Sanitize input for `.match()` calls
 * Returns a safe string for regex matching, or empty string if invalid
 */
export function sanitizeForMatch(input: any): string {
  if (typeof input === 'string') {
    logSanitization('sanitizeForMatch', input, input, 'string (no change)');
    return input;
  }
  
  if (input === null || input === undefined) {
    logSanitization('sanitizeForMatch', input, '', 'null/undefined -> empty string');
    console.warn('sanitizeForMatch: Received null/undefined input, returning empty string');
    return '';
  }
  
  if (typeof input === 'number' || typeof input === 'boolean') {
    const result = String(input);
    logSanitization('sanitizeForMatch', input, result, `${typeof input} -> string`);
    return result;
  }
  
  if (typeof input === 'object') {
    console.warn('sanitizeForMatch: Received object input, attempting JSON.stringify');
    try {
      const result = JSON.stringify(input);
      logSanitization('sanitizeForMatch', input, result, 'object -> JSON string');
      return result;
    } catch {
      logSanitization('sanitizeForMatch', input, '[Object]', 'object -> fallback string');
      return '[Object]';
    }
  }
  
  console.warn('sanitizeForMatch: Received unexpected input type:', typeof input, 'value:', input);
  const result = String(input || '');
  logSanitization('sanitizeForMatch', input, result, `unexpected ${typeof input} -> string`);
  return result;
}

/**
 * Safe string matching with type checking
 * Returns match result or null if input is invalid
 */
export function safeMatch(input: any, regex: RegExp): RegExpMatchArray | null {
  const safeInput = sanitizeForMatch(input);
  return safeInput.match(regex);
}

/**
 * Safe regex test with type checking
 */
export function safeTest(input: any, regex: RegExp): boolean {
  const safeInput = sanitizeForMatch(input);
  return regex.test(safeInput);
}

/**
 * Validate that input is a non-empty string before processing
 * Returns the trimmed string or throws an error
 */
export function validateNonEmptyString(input: any, context = 'input'): string {
  if (typeof input !== 'string') {
    logInputValidation(`validateNonEmptyString:${context}`, input, false, `Not a string (type: ${typeof input})`);
    throw new Error(`${context} must be a string, got ${typeof input}`);
  }
  
  const trimmed = input.trim();
  if (!trimmed) {
    logInputValidation(`validateNonEmptyString:${context}`, input, false, 'Empty after trimming');
    throw new Error(`${context} cannot be empty`);
  }
  
  logInputValidation(`validateNonEmptyString:${context}`, input, true, `Valid string (length: ${trimmed.length})`);
  return trimmed;
}

/**
 * Sanitize user prompt input
 * - Trims whitespace
 * - Validates non-empty
 * - Logs for debugging
 */
export function sanitizePrompt(prompt: any): string {
  if (typeof prompt !== 'string') {
    console.warn('sanitizePrompt: Received non-string prompt:', typeof prompt, prompt);
    return '';
  }
  
  const trimmed = prompt.trim();
  if (!trimmed) {
    console.warn('sanitizePrompt: Received empty prompt after trimming');
    return '';
  }
  
  console.log('sanitizePrompt: Valid prompt received:', trimmed.substring(0, 50) + (trimmed.length > 50 ? '...' : ''));
  return trimmed;
}

/**
 * Check if app is ready before processing input
 * Returns true if app is initialized and credentials are ready
 */
export async function ensureAppReady(): Promise<boolean> {
  console.log('ensureAppReady: called');
  try {
    // Import dynamically to avoid circular dependencies
    const { appInit } = await import('$lib/system/AppInit');
    const { credentialManager } = await import('$lib/system/CredentialManager');
    
    console.log('ensureAppReady: imports loaded');
    await appInit.waitForReady();
    console.log('ensureAppReady: appInit ready');
    
    if (!credentialManager.isReady()) {
      logAppReadiness('ensureAppReady', false, { credentialManagerReady: false });
      console.warn('ensureAppReady: CredentialManager not ready');
      return false;
    }
    
    logAppReadiness('ensureAppReady', true, {
      appInitialized: true,
      credentialManagerReady: true
    });
    console.log('ensureAppReady: returning true');
    return true;
  } catch (error) {
    logAppReadiness('ensureAppReady', false, { error: error instanceof Error ? error.message : 'Unknown error' });
    console.error('ensureAppReady: Error checking app readiness:', error);
    return false;
  }
}

/**
 * Process input with full sanitization pipeline
 * 1. Check app readiness
 * 2. Sanitize input
 * 3. Validate non-empty
 */
export async function processInputWithSanitization(
  input: any,
  context = 'user input'
): Promise<{ success: boolean; sanitized: string; error?: string }> {
  try {
    // Check app readiness
    const isReady = await ensureAppReady();
    if (!isReady) {
      return {
        success: false,
        sanitized: '',
        error: 'Application not ready. Please wait for initialization.'
      };
    }
    
    // Sanitize input
    const sanitized = sanitizePrompt(input);
    if (!sanitized) {
      return {
        success: false,
        sanitized: '',
        error: 'Input cannot be empty'
      };
    }
    
    return {
      success: true,
      sanitized
    };
  } catch (error) {
    console.error(`processInputWithSanitization: Error processing ${context}:`, error);
    return {
      success: false,
      sanitized: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}