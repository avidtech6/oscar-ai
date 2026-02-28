// AppInit - Centralized application initialization
// Ensures CredentialManager is ready before other services start

import { credentialManager } from './CredentialManager';
import { initializeCrossDomainEventSystem } from '$lib/services/crossDomain/CrossDomainEventBus';
import { initializeSupabaseEventService } from '$lib/services/supabase/SupabaseEventService';

export class AppInit {
  private static instance: AppInit;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): AppInit {
    if (!AppInit.instance) {
      AppInit.instance = new AppInit();
    }
    return AppInit.instance;
  }

  // Initialize the entire application
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    await this.initializationPromise;
    this.isInitialized = true;
  }

  private async performInitialization(): Promise<void> {
    console.log('AppInit: Starting application initialization...');
    
    try {
      // Step 1: Initialize CredentialManager with timeout protection
      console.log('AppInit: Initializing CredentialManager...');
      try {
        // Add timeout for credential manager initialization
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('CredentialManager initialization timeout (3000ms)')), 3000);
        });
        
        await Promise.race([
          credentialManager.initialize(),
          timeoutPromise
        ]);
      } catch (error) {
        console.warn('AppInit: CredentialManager initialization had issues:', error);
        // Continue anyway - app can work with limited functionality
      }
      
      // Step 2: Validate we have at least some credentials
      if (!credentialManager.hasValidCredentials()) {
        console.warn('AppInit: No valid API keys found. Some features may be limited.');
      } else {
        console.log('AppInit: Credentials loaded successfully');
      }
      
      // Step 3: Initialize cross-domain event system (non-blocking)
      console.log('AppInit: Initializing cross-domain event system...');
      try {
        initializeCrossDomainEventSystem();
        console.log('AppInit: Cross-domain event system initialized');
      } catch (error) {
        console.warn('AppInit: Error initializing cross-domain event system:', error);
      }
      
      // Step 4: Initialize Supabase event service (non-blocking with timeout)
      console.log('AppInit: Initializing Supabase event service...');
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Supabase event service initialization timeout (2000ms)')), 2000);
        });
        
        await Promise.race([
          initializeSupabaseEventService(),
          timeoutPromise
        ]);
        console.log('AppInit: Supabase event service initialized');
      } catch (error) {
        console.warn('AppInit: Error initializing Supabase event service:', error);
        // Continue without Supabase event service
      }
      
      // Step 5: Initialize other critical services here (non-blocking)
      // (Add other service initializations as needed)
      
      console.log('AppInit: Application initialization complete (some services may be limited)');
    } catch (error) {
      console.error('AppInit: Critical error during initialization:', error);
      // Don't throw - let the app continue with limited functionality
      // The Safe Mode wrapper will catch this and decide whether to activate Safe Mode
    }
  }

  // Check if app is ready
  isReady(): boolean {
    return this.isInitialized && credentialManager.isReady();
  }

  // Wait for app to be ready (for services that need to wait)
  async waitForReady(): Promise<void> {
    if (this.isReady()) return;
    
    if (!this.initializationPromise) {
      await this.initialize();
    } else {
      await this.initializationPromise;
    }
  }

  // Get initialization status
  getStatus(): {
    isReady: boolean;
    hasCredentials: boolean;
    credentialManagerReady: boolean;
  } {
    return {
      isReady: this.isReady(),
      hasCredentials: credentialManager.hasValidCredentials(),
      credentialManagerReady: credentialManager.isReady()
    };
  }
}

// Export singleton instance
export const appInit = AppInit.getInstance();