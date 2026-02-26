/**
 * Safe Mode Integration for Oscar AI
 * 
 * Integrates Safe Mode Bootstrap with the SvelteKit application.
 */

import { SafeModeBootstrap } from './SafeModeBootstrap';

// Global Safe Mode instance
let safeModeInstance: SafeModeBootstrap | null = null;

/**
 * Initialize Safe Mode for the application
 */
export function initializeSafeMode(): SafeModeBootstrap {
  if (safeModeInstance) {
    return safeModeInstance;
  }

  // Check if Safe Mode is already activated via window flag
  const isSafeModeActive = (window as any).__OSCAR_SAFE_MODE === true;
  
  safeModeInstance = new SafeModeBootstrap({
    timeoutMs: 2000,
    maxRetries: 2,
    fallbackElementId: 'safe-mode-fallback',
    recoveryCallback: () => {
      console.log('[SafeMode] Attempting recovery...');
      // Try to reload the app after recovery
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  });

  // If Safe Mode is already active, activate it immediately
  if (isSafeModeActive) {
    console.log('[SafeMode] Safe Mode already active, showing fallback UI');
    setTimeout(() => {
      (safeModeInstance as any).activateSafeMode();
    }, 100);
  }

  return safeModeInstance;
}

/**
 * Wrap Svelte initialization with Safe Mode protection
 */
export async function withSafeMode<T>(
  appInitializer: () => Promise<T>
): Promise<{ success: boolean; result?: T; safeModeActive: boolean }> {
  console.log('[SafeMode] withSafeMode: Starting Safe Mode wrapper');
  const safeMode = initializeSafeMode();
  
  try {
    // Store the result of the initialization
    let initializationResult: T | undefined;
    
    console.log('[SafeMode] withSafeMode: Calling safeMode.initialize()');
    const success = await safeMode.initialize(async () => {
      console.log('[SafeMode] withSafeMode: App initializer starting');
      try {
        initializationResult = await appInitializer();
        console.log('[SafeMode] withSafeMode: App initializer completed successfully');
      } catch (error) {
        console.error('[SafeMode] withSafeMode: App initializer threw error:', error);
        throw error;
      }
    });
    
    console.log(`[SafeMode] withSafeMode: safeMode.initialize() returned success=${success}`);
    return {
      success,
      result: initializationResult,
      safeModeActive: !success
    };
  } catch (error) {
    console.error('[SafeMode] withSafeMode: Error during initialization:', error);
    return {
      success: false,
      safeModeActive: true
    };
  }
}

/**
 * Check if Safe Mode is currently active
 */
export function isSafeModeActive(): boolean {
  return safeModeInstance?.isSafeModeActive() || false;
}

/**
 * Manually activate Safe Mode (for testing or emergency)
 */
export function activateSafeMode(): void {
  const safeMode = initializeSafeMode();
  (safeMode as any).activateSafeMode();
}

/**
 * Deactivate Safe Mode and attempt normal operation
 */
export function deactivateSafeMode(): void {
  if (safeModeInstance && safeModeInstance.isSafeModeActive()) {
    console.log('[SafeMode] Deactivating Safe Mode, reloading application');
    localStorage.removeItem('oscar_safe_mode');
    window.location.reload();
  }
}

// Export for global access
(window as any).OscarSafeMode = {
  initializeSafeMode,
  withSafeMode,
  isSafeModeActive,
  activateSafeMode,
  deactivateSafeMode
};