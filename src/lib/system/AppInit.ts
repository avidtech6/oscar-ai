// AppInit - Centralized application initialization
// Ensures CredentialManager is ready before other services start

import { credentialManager } from './CredentialManager';

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
      // Step 1: Initialize CredentialManager (must happen first)
      console.log('AppInit: Initializing CredentialManager...');
      await credentialManager.initialize();
      
      // Step 2: Validate we have at least some credentials
      if (!credentialManager.hasValidCredentials()) {
        console.warn('AppInit: No valid API keys found. Some features may be limited.');
      } else {
        console.log('AppInit: Credentials loaded successfully');
      }
      
      // Step 3: Initialize other critical services here
      // (Add other service initializations as needed)
      
      console.log('AppInit: Application initialization complete');
    } catch (error) {
      console.error('AppInit: Error during initialization:', error);
      throw error;
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