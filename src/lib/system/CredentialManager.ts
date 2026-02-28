// CredentialManager - Unified source of truth for API keys and credentials
// Layered loading with priority: Local overrides > Supabase settings > Environment defaults

import { createClient } from '@supabase/supabase-js';

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
      console.log('CredentialManager: Starting credential loading...');
      
      // Layer 1: Environment defaults (dev fallback) - MUST load first for Supabase connection
      const envDefaults = this.loadEnvironmentDefaults();
      console.log('CredentialManager: Environment defaults loaded:', {
        hasGroqKey: !!envDefaults.groq_api_key,
        hasSupabaseUrl: !!envDefaults.supabase_url,
        hasSupabaseKey: !!envDefaults.supabase_anon_key
      });
      
      // Layer 2: Supabase settings (production) - load before local overrides
      // This needs to happen early because Supabase may contain the Groq API key
      const supabaseSettings = await this.loadSupabaseSettings();
      console.log('CredentialManager: Supabase settings loaded:', {
        hasGroqKey: !!supabaseSettings.groq_api_key,
        keys: Object.keys(supabaseSettings)
      });
      
      // Layer 3: Local overrides from localStorage (user preferences)
      const localOverrides = this.loadLocalOverrides();
      console.log('CredentialManager: Local overrides loaded:', {
        hasGroqKey: !!localOverrides.groq_api_key,
        keys: Object.keys(localOverrides)
      });
      
      // Merge with priority: Local > Supabase > Environment
      // This ensures user preferences override everything, then Supabase, then environment
      this.credentials = {
        ...envDefaults,
        ...supabaseSettings,
        ...localOverrides
      };

      console.log('CredentialManager: Merged credentials:', JSON.stringify({
        envDefaults: { groq: envDefaults.groq_api_key ? '***' + envDefaults.groq_api_key.slice(-4) : 'empty' },
        supabaseSettings: { groq: supabaseSettings.groq_api_key ? '***' + supabaseSettings.groq_api_key.slice(-4) : 'empty' },
        localOverrides: { groq: localOverrides.groq_api_key ? '***' + localOverrides.groq_api_key.slice(-4) : 'empty' },
        final: { groq: this.credentials.groq_api_key ? '***' + this.credentials.groq_api_key.slice(-4) : 'empty' }
      }, null, 2));

      // Cache the merged credentials to IndexedDB for faster startup next time
      await this.cacheToIndexedDB(this.credentials);
      
      console.log('CredentialManager: Loaded credentials successfully', {
        finalGroqKey: this.credentials.groq_api_key ? '***' + this.credentials.groq_api_key.slice(-4) : 'empty',
        source: this.credentials.groq_api_key === envDefaults.groq_api_key ? 'environment' :
                this.credentials.groq_api_key === supabaseSettings.groq_api_key ? 'supabase' :
                this.credentials.groq_api_key === localOverrides.groq_api_key ? 'local' : 'unknown'
      });
    } catch (error) {
      console.error('CredentialManager: Error loading credentials:', error);
      // Try to load from IndexedDB cache as fallback
      try {
        const cached = await this.loadFromIndexedDBCache();
        if (cached && Object.keys(cached).length > 0) {
          console.log('CredentialManager: Using cached credentials from IndexedDB');
          this.credentials = { ...this.loadEnvironmentDefaults(), ...cached };
        } else {
          // Fall back to environment defaults
          this.credentials = this.loadEnvironmentDefaults();
        }
      } catch (cacheError) {
        console.warn('CredentialManager: Error loading from cache:', cacheError);
        // Final fallback to environment defaults
        this.credentials = this.loadEnvironmentDefaults();
      }
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
      console.log('CredentialManager: Attempting to load settings from Supabase...');
      
      // Get environment defaults for Supabase credentials
      const envDefaults = this.loadEnvironmentDefaults();
      const supabaseUrl = envDefaults.supabase_url;
      const supabaseAnonKey = envDefaults.supabase_anon_key;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log('CredentialManager: Supabase credentials not configured in environment, skipping Supabase settings load');
        return {};
      }
      
      // Validate URL format to prevent malformed URL errors
      if (!supabaseUrl.startsWith('http') || !supabaseUrl.includes('supabase.co')) {
        console.warn('CredentialManager: Invalid Supabase URL format, skipping Supabase settings load');
        return {};
      }
      
      // Create a direct Supabase client with timeout protection
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        },
        global: {
          fetch: (url, options) => {
            // Add timeout to fetch requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
            
            return fetch(url, {
              ...options,
              signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));
          }
        }
      });
      
      // Use type assertion to bypass TypeScript errors for now
      // The settings table might not exist in the generated types
      const { data, error } = await (supabase as any)
        .from('settings')
        .select('key, value')
        .in('key', [
          'oscar_api_key',
          'openai_api_key',
          'groq_api_key',
          'anthropic_api_key',
          'supabase_url',
          'supabase_anon_key'
        ])
        .limit(10); // Limit results for faster response
  
      if (error) {
        console.warn('CredentialManager: Error loading Supabase settings:', error);
        console.warn('CredentialManager: Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return {};
      }
  
      console.log('CredentialManager: Supabase query successful, found', data?.length || 0, 'settings');
      
      const settings: Partial<Credentials> = {};
      (data as any[])?.forEach((setting: any) => {
        const key = setting.key as CredentialKey;
        const value = setting.value;
        settings[key] = value;
        console.log(`CredentialManager: Loaded ${key} from Supabase (length: ${value?.length || 0})`);
      });
      
      console.log('CredentialManager: Compiled settings object keys:', Object.keys(settings));
      console.log('CredentialManager: Compiled settings groq_api_key present?', !!settings.groq_api_key);
      
      // Check if we got a Groq API key
      if (settings.groq_api_key) {
        console.log('CredentialManager: Found Groq API key in Supabase');
      } else {
        console.log('CredentialManager: No Groq API key found in Supabase');
      }
  
      return settings;
    } catch (error) {
      console.warn('CredentialManager: Error accessing Supabase:', error);
      if (error instanceof Error) {
        console.warn('CredentialManager: Error details:', error.message, error.name);
      }
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
      // Get current credentials to create Supabase client
      const supabaseUrl = this.credentials.supabase_url;
      const supabaseAnonKey = this.credentials.supabase_anon_key;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('CredentialManager: No Supabase credentials available for saving');
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { error } = await (supabase as any)
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

  // IndexedDB caching for faster startup
  private async cacheToIndexedDB(credentials: Credentials): Promise<void> {
    try {
      // Use localStorage directly - simpler and more reliable
      localStorage.setItem('oscar.cached_credentials', JSON.stringify(credentials));
      console.log('CredentialManager: Cached credentials to localStorage');
    } catch (error) {
      console.warn('CredentialManager: Error caching credentials to localStorage:', error);
    }
  }

  private async loadFromIndexedDBCache(): Promise<Partial<Credentials>> {
    try {
      // Load from localStorage
      const cached = localStorage.getItem('oscar.cached_credentials');
      if (cached) {
        console.log('CredentialManager: Loaded cached credentials from localStorage');
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('CredentialManager: Error loading from localStorage cache:', error);
    }
    
    return {};
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

  // Validate specific credential types
  isValidGroqKey(key?: string): boolean {
    const apiKey = key || this.credentials.groq_api_key;
    if (!apiKey) return false;
    
    // Groq API keys typically start with 'gsk_' and are at least 32 characters
    return apiKey.startsWith('gsk_') && apiKey.length >= 32;
  }

  isValidOpenAIKey(key?: string): boolean {
    const apiKey = key || this.credentials.openai_api_key;
    if (!apiKey) return false;
    
    // OpenAI API keys typically start with 'sk-' and are at least 32 characters
    return apiKey.startsWith('sk-') && apiKey.length >= 32;
  }

  isValidAnthropicKey(key?: string): boolean {
    const apiKey = key || this.credentials.anthropic_api_key;
    if (!apiKey) return false;
    
    // Anthropic API keys typically start with 'sk-ant-' and are at least 32 characters
    return apiKey.startsWith('sk-ant-') && apiKey.length >= 32;
  }

  // Get validation status for all credentials
  getValidationStatus(): Record<string, { valid: boolean; length: number; format: string }> {
    return {
      groq_api_key: {
        valid: this.isValidGroqKey(),
        length: this.credentials.groq_api_key.length,
        format: this.credentials.groq_api_key.startsWith('gsk_') ? 'correct' : 'incorrect'
      },
      openai_api_key: {
        valid: this.isValidOpenAIKey(),
        length: this.credentials.openai_api_key.length,
        format: this.credentials.openai_api_key.startsWith('sk-') ? 'correct' : 'incorrect'
      },
      anthropic_api_key: {
        valid: this.isValidAnthropicKey(),
        length: this.credentials.anthropic_api_key.length,
        format: this.credentials.anthropic_api_key.startsWith('sk-ant-') ? 'correct' : 'incorrect'
      },
      supabase_url: {
        valid: !!this.credentials.supabase_url && this.credentials.supabase_url.includes('supabase.co'),
        length: this.credentials.supabase_url.length,
        format: this.credentials.supabase_url.includes('supabase.co') ? 'correct' : 'incorrect'
      }
    };
  }

  // Reset to environment defaults
  async resetToDefaults(): Promise<void> {
    this.credentials = this.loadEnvironmentDefaults();
    this.saveToLocalStorage();
    
    // Clear Supabase settings
    try {
      // Get current credentials to create Supabase client
      const supabaseUrl = this.credentials.supabase_url;
      const supabaseAnonKey = this.credentials.supabase_anon_key;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('CredentialManager: No Supabase credentials available for clearing settings');
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      await (supabase as any)
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