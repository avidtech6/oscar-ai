// CredentialManager - Unified source of truth for API keys and credentials
// Layered loading with priority: Local overrides > Supabase settings > Environment defaults

import { getSupabase } from '$lib/supabase/client';

export type CredentialKey = 
  | 'oscar_api_key'
  | 'openai_api_key' 
  | 'groq_api_key'
  | 'anthropic_api_key'
  | 'supabase_url'
  | 'supabase_anon_key';

export interface Credentials {
  oscar_api_key: string;
  openai_api_key: string;
  groq_api_key: string;
  anthropic_api_key: string;
  supabase_url: string;
  supabase_anon_key: string;
}

class CredentialManager {
  private credentials: Credentials;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Initialize with empty credentials
    this.credentials = this.getEmptyCredentials();
  }

  private getEmptyCredentials(): Credentials {
    return {
      oscar_api_key: '',
      openai_api_key: '',
      groq_api_key: '',
      anthropic_api_key: '',
      supabase_url: '',
      supabase_anon_key: ''
    };
  }

  // Initialize the credential manager (should be called early in app startup)
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.loadCredentials();
    await this.initializationPromise;
    this.isInitialized = true;
  }

  private async loadCredentials(): Promise<void> {
    try {
      // Layer 1: Environment defaults (dev fallback)
      const envDefaults = this.loadEnvironmentDefaults();
      
      // Layer 2: Local overrides from localStorage
      const localOverrides = this.loadLocalOverrides();
      
      // Layer 3: Supabase settings (production)
      const supabaseSettings = await this.loadSupabaseSettings();
      
      // Merge with priority: Local > Supabase > Environment
      this.credentials = {
        ...envDefaults,
        ...supabaseSettings,
        ...localOverrides
      };

      console.log('CredentialManager: Loaded credentials successfully');
    } catch (error) {
      console.error('CredentialManager: Error loading credentials:', error);
      // Fall back to environment defaults
      this.credentials = this.loadEnvironmentDefaults();
    }
  }

  private loadEnvironmentDefaults(): Credentials {
    return {
      oscar_api_key: import.meta.env.VITE_OSCAR_API_KEY || '',
      openai_api_key: import.meta.env.VITE_OPENAI_API_KEY || '',
      groq_api_key: import.meta.env.VITE_GROQ_API_KEY || '',
      anthropic_api_key: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      supabase_url: import.meta.env.VITE_SUPABASE_URL || '',
      supabase_anon_key: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    };
  }

  private loadLocalOverrides(): Partial<Credentials> {
    try {
      const stored = localStorage.getItem('oscar.credentials');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('CredentialManager: Error loading local overrides:', error);
    }
    return {};
  }

  private async loadSupabaseSettings(): Promise<Partial<Credentials>> {
  	try {
  		// Use type assertion to bypass TypeScript errors for now
  		// The settings table might not exist in the generated types
  		const { data, error } = await (getSupabase() as any)
  			.from('settings')
  			.select('key, value')
  			.in('key', [
  				'oscar_api_key',
  				'openai_api_key',
  				'groq_api_key',
  				'anthropic_api_key',
  				'supabase_url',
  				'supabase_anon_key'
  			]);
  
  		if (error) {
  			console.warn('CredentialManager: Error loading Supabase settings:', error);
  			return {};
  		}
  
  		const settings: Partial<Credentials> = {};
  		(data as any[])?.forEach((setting: any) => {
  			const key = setting.key as CredentialKey;
  			settings[key] = setting.value;
  		});
  
  		return settings;
  	} catch (error) {
  		console.warn('CredentialManager: Error accessing Supabase:', error);
  		return {};
  	}
  }

  // Synchronous getters (safe to call after initialization)
  getOscarApiKey(): string {
    return this.credentials.oscar_api_key;
  }

  getOpenAIKey(): string {
    return this.credentials.openai_api_key;
  }

  getGroqKey(): string {
    return this.credentials.groq_api_key;
  }

  getAnthropicKey(): string {
    return this.credentials.anthropic_api_key;
  }

  getSupabaseUrl(): string {
    return this.credentials.supabase_url;
  }

  getSupabaseAnonKey(): string {
    return this.credentials.supabase_anon_key;
  }

  // Get all credentials (for settings UI)
  getAllCredentials(): Credentials {
    return { ...this.credentials };
  }

  // Update a credential
  async updateKey(key: CredentialKey, value: string): Promise<boolean> {
    try {
      // Update local credentials
      this.credentials[key] = value;
      
      // Save to localStorage
      this.saveToLocalStorage();
      
      // Save to Supabase if authenticated
      await this.saveToSupabase(key, value);
      
      console.log(`CredentialManager: Updated ${key}`);
      return true;
    } catch (error) {
      console.error(`CredentialManager: Error updating ${key}:`, error);
      return false;
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('oscar.credentials', JSON.stringify(this.credentials));
    } catch (error) {
      console.warn('CredentialManager: Error saving to localStorage:', error);
    }
  }

  private async saveToSupabase(key: CredentialKey, value: string): Promise<void> {
    try {
      const { error } = await (getSupabase() as any)
        .from('settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.warn('CredentialManager: Error saving to Supabase:', error);
      }
    } catch (error) {
      console.warn('CredentialManager: Error accessing Supabase:', error);
    }
  }

  // Check if credentials are valid
  hasValidCredentials(): boolean {
    return (
      !!this.credentials.oscar_api_key ||
      !!this.credentials.openai_api_key ||
      !!this.credentials.groq_api_key ||
      !!this.credentials.anthropic_api_key
    );
  }

  // Reset to environment defaults
  async resetToDefaults(): Promise<void> {
    this.credentials = this.loadEnvironmentDefaults();
    this.saveToLocalStorage();
    
    // Clear Supabase settings
    try {
      await (getSupabase() as any)
        .from('settings')
        .delete()
        .in('key', [
          'oscar_api_key',
          'openai_api_key',
          'groq_api_key',
          'anthropic_api_key'
        ]);
    } catch (error) {
      console.warn('CredentialManager: Error clearing Supabase settings:', error);
    }
  }

  // Check if initialized
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const credentialManager = new CredentialManager();