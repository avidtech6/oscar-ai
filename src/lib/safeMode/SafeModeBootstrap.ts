/**
 * Safe Mode Bootstrap Wrapper
 * 
 * Detects JavaScript execution failures and falls back to a minimal UI
 * to prevent total UI failures.
 */

export interface SafeModeConfig {
  timeoutMs: number;
  maxRetries: number;
  fallbackElementId: string;
  recoveryCallback?: () => void;
}

const DEFAULT_CONFIG: SafeModeConfig = {
  timeoutMs: 2000, // 2-second timeout
  maxRetries: 2,
  fallbackElementId: 'safe-mode-fallback'
};

export class SafeModeBootstrap {
  private config: SafeModeConfig;
  private isSafeMode = false;
  private retryCount = 0;
  private initializationPromise: Promise<boolean> | null = null;

  constructor(config: Partial<SafeModeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the application with Safe Mode protection
   */
  async initialize(appInitializer: () => Promise<void>): Promise<boolean> {
    console.log('[SafeMode] SafeModeBootstrap.initialize: Starting');
    if (this.initializationPromise) {
      console.log('[SafeMode] SafeModeBootstrap.initialize: Reusing existing promise');
      return this.initializationPromise;
    }

    this.initializationPromise = this.initializeWithTimeout(appInitializer);
    console.log('[SafeMode] SafeModeBootstrap.initialize: Created new promise');
    return this.initializationPromise;
  }

  /**
   * Initialize with timeout protection
   */
  private async initializeWithTimeout(appInitializer: () => Promise<void>): Promise<boolean> {
    try {
      // Set up timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Application initialization timed out after ${this.config.timeoutMs}ms`));
        }, this.config.timeoutMs);
      });

      // Race between initialization and timeout
      await Promise.race([
        appInitializer(),
        timeoutPromise
      ]);

      console.log('[SafeMode] Application initialized successfully');
      return true;
    } catch (error) {
      console.error('[SafeMode] Initialization failed:', error);
      
      // Check if we should retry
      if (this.retryCount < this.config.maxRetries) {
        this.retryCount++;
        console.log(`[SafeMode] Retrying initialization (attempt ${this.retryCount}/${this.config.maxRetries})`);
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.initializeWithTimeout(appInitializer);
      }
      
      // All retries failed, activate Safe Mode
      console.error('[SafeMode] All retries failed, activating Safe Mode');
      this.activateSafeMode();
      return false;
    }
  }

  /**
   * Activate Safe Mode - show fallback UI
   */
  private activateSafeMode(): void {
    if (this.isSafeMode) {
      return;
    }

    this.isSafeMode = true;
    console.log('[SafeMode] Activating Safe Mode');
    
    // Hide the main app
    this.hideMainApp();
    
    // Show fallback UI
    this.showFallbackUI();
    
    // Attempt recovery in background
    this.attemptRecovery();
  }

  /**
   * Hide the main application UI
   */
  private hideMainApp(): void {
    try {
      const appContainer = document.getElementById('app');
      if (appContainer) {
        appContainer.style.display = 'none';
      }
      
      // Also hide any Svelte mount points
      const svelteTargets = document.querySelectorAll('[data-svelte-hydrate]');
      svelteTargets.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    } catch (error) {
      console.error('[SafeMode] Error hiding main app:', error);
    }
  }

  /**
   * Show fallback UI with basic functionality
   */
  private showFallbackUI(): void {
    try {
      // Create or get fallback element
      let fallbackEl = document.getElementById(this.config.fallbackElementId);
      
      if (!fallbackEl) {
        fallbackEl = document.createElement('div');
        fallbackEl.id = this.config.fallbackElementId;
        document.body.appendChild(fallbackEl);
      }
      
      // Set fallback UI content
      fallbackEl.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 9999;
          padding: 2rem;
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        ">
          <div style="max-width: 600px;">
            <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #dc2626;">
              ⚠️ Safe Mode Activated
            </h1>
            <p style="font-size: 1.125rem; margin-bottom: 1.5rem; color: #4b5563;">
              The application encountered an error and has entered Safe Mode to prevent further issues.
            </p>
            
            <div style="
              background: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 0.5rem;
              padding: 1rem;
              margin-bottom: 2rem;
              text-align: left;
            ">
              <p style="font-weight: 600; margin-bottom: 0.5rem; color: #7c2d12;">
                What happened?
              </p>
              <p style="color: #57534e; font-size: 0.875rem;">
                JavaScript execution failed during initialization. This can happen due to:
                • Module import errors
                • Runtime JavaScript errors
                • Network issues loading resources
                • Browser compatibility problems
              </p>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem;">
              <button id="safe-mode-reload" style="
                background: #2563eb;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.375rem;
                font-weight: 600;
                cursor: pointer;
                font-size: 1rem;
              ">
                Reload Application
              </button>
              
              <button id="safe-mode-continue" style="
                background: #059669;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.375rem;
                font-weight: 600;
                cursor: pointer;
                font-size: 1rem;
              ">
                Continue in Safe Mode
              </button>
            </div>
            
            <div style="font-size: 0.875rem; color: #6b7280;">
              <p>Safe Mode provides limited functionality but prevents complete UI failure.</p>
              <p style="margin-top: 0.5rem;">
                <button id="safe-mode-details" style="
                  background: none;
                  border: none;
                  color: #3b82f6;
                  text-decoration: underline;
                  cursor: pointer;
                  font-size: 0.875rem;
                ">
                  Show technical details
                </button>
              </p>
              <div id="safe-mode-details-content" style="
                display: none;
                margin-top: 1rem;
                text-align: left;
                font-family: monospace;
                font-size: 0.75rem;
                background: #f3f4f6;
                padding: 1rem;
                border-radius: 0.375rem;
                max-height: 200px;
                overflow: auto;
              "></div>
            </div>
          </div>
        </div>
      `;
      
      // Add event listeners
      document.getElementById('safe-mode-reload')?.addEventListener('click', () => {
        window.location.reload();
      });
      
      document.getElementById('safe-mode-continue')?.addEventListener('click', () => {
        this.showLimitedFunctionality();
      });
      
      document.getElementById('safe-mode-details')?.addEventListener('click', (e) => {
        const detailsEl = document.getElementById('safe-mode-details-content');
        if (detailsEl) {
          const isVisible = detailsEl.style.display !== 'none';
          detailsEl.style.display = isVisible ? 'none' : 'block';
          if (!isVisible) {
            detailsEl.textContent = this.getErrorDetails();
          }
          (e.target as HTMLElement).textContent = isVisible ? 'Show technical details' : 'Hide technical details';
        }
      });
      
      fallbackEl.style.display = 'block';
    } catch (error) {
      console.error('[SafeMode] Error showing fallback UI:', error);
      // Last resort: show simple message
      document.body.innerHTML = `
        <div style="padding: 2rem; font-family: sans-serif;">
          <h1>Application Error</h1>
          <p>The application failed to load. Please refresh the page.</p>
          <button onclick="window.location.reload()">Refresh</button>
        </div>
      `;
    }
  }

  /**
   * Show limited functionality in Safe Mode
   */
  private showLimitedFunctionality(): void {
    const fallbackEl = document.getElementById(this.config.fallbackElementId);
    if (!fallbackEl) return;
    
    fallbackEl.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        z-index: 9999;
        padding: 2rem;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="max-width: 800px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1 style="font-size: 1.5rem; color: #dc2626;">⚠️ Safe Mode</h1>
            <button id="safe-mode-exit" style="
              background: #2563eb;
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 0.375rem;
              font-weight: 600;
              cursor: pointer;
            ">
              Exit Safe Mode
            </button>
          </div>
          
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
          ">
            <div style="
              background: #f0f9ff;
              border: 1px solid #bae6fd;
              border-radius: 0.5rem;
              padding: 1.5rem;
            ">
              <h2 style="font-size: 1.25rem; margin-bottom: 1rem; color: #0369a1;">Basic Chat</h2>
              <div id="safe-mode-chat" style="
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 0.375rem;
                padding: 1rem;
                min-height: 300px;
                display: flex;
                flex-direction: column;
              ">
                <div id="safe-mode-chat-messages" style="flex: 1; overflow-y: auto; margin-bottom: 1rem;"></div>
                <div style="display: flex; gap: 0.5rem;">
                  <input id="safe-mode-chat-input" type="text" placeholder="Type a message..." style="
                    flex: 1;
                    padding: 0.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                  ">
                  <button id="safe-mode-chat-send" style="
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    font-weight: 600;
                    cursor: pointer;
                  ">
                    Send
                  </button>
                </div>
              </div>
            </div>
            
            <div style="
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 0.5rem;
              padding: 1.5rem;
            ">
              <h2 style="font-size: 1.25rem; margin-bottom: 1rem; color: #166534;">System Status</h2>
              <div style="margin-bottom: 1rem;">
                <p><strong>Mode:</strong> Safe Mode (Limited Functionality)</p>
                <p><strong>JavaScript:</strong> <span style="color: #dc2626;">Partially Functional</span></p>
                <p><strong>Storage:</strong> <span id="safe-mode-storage-status">Checking...</span></p>
                <p><strong>Network:</strong> <span id="safe-mode-network-status">Checking...</span></p>
              </div>
              
              <div style="margin-top: 2rem;">
                <h3 style="font-size: 1rem; margin-bottom: 0.5rem; color: #475569;">Recovery Tools</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  <button id="safe-mode-clear-cache" style="
                    background: #fef3c7;
                    border: 1px solid #fbbf24;
                    color: #92400e;
                    padding: 0.5rem;
                    border-radius: 0.375rem;
                    cursor: pointer;
                    text-align: left;
                  ">
                    Clear Browser Cache
                  </button>
                  <button id="safe-mode-check-errors" style="
                    background: #f3f4f6;
                    border: 1px solid #d1d5db;
                    color: #374151;
                    padding: 0.5rem;
                    border-radius: 0.375rem;
                    cursor: pointer;
                    text-align: left;
                  ">
                    Check for Errors
                  </button>
                  <button id="safe-mode-export-data" style="
                    background: #dbeafe;
                    border: 1px solid #93c5fd;
                    color: #1e40af;
                    padding: 0.5rem;
                    border-radius: 0.375rem;
                    cursor: pointer;
                    text-align: left;
                  ">
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div style="
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 0.5rem;
            padding: 1rem;
            font-size: 0.875rem;
            color: #7c2d12;
          ">
            <p><strong>Note:</strong> Safe Mode provides limited functionality. Some features may not work correctly.</p>
          </div>
        </div>
      </div>
    `;
    
    // Set up Safe Mode chat
    this.setupSafeModeChat();
    
    // Check system status
    this.checkSystemStatus();
    
    // Add event listeners for recovery tools
    document.getElementById('safe-mode-exit')?.addEventListener('click', () => {
      window.location.reload();
    });
    
    document.getElementById('safe-mode-clear-cache')?.addEventListener('click', () => {
      this.clearBrowserCache();
    });
    
    document.getElementById('safe-mode-check-errors')?.addEventListener('click', () => {
      this.checkForErrors();
    });
    
    document.getElementById('safe-mode-export-data')?.addEventListener('click', () => {
      this.exportData();
    });
  }

  /**
   * Set up basic chat functionality in Safe Mode
   */
  private setupSafeModeChat(): void {
    const chatInput = document.getElementById('safe-mode-chat-input') as HTMLInputElement;
    const chatSend = document.getElementById('safe-mode-chat-send');
    const chatMessages = document.getElementById('safe-mode-chat-messages');
    
    if (!chatInput || !chatSend || !chatMessages) return;
    
    const addMessage = (text: string, isUser: boolean) => {
      const messageEl = document.createElement('div');
      messageEl.style.cssText = `
        margin-bottom: 0.5rem;
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        max-width: 80%;
        word-wrap: break-word;
        ${isUser ? 
          'background: #2563eb; color: white; align-self: flex-end;' : 
          'background: #f3f4f6; color: #374151; align-self: flex-start;'
        }
      `;
      messageEl.textContent = text;
      chatMessages.appendChild(messageEl);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };
    
    chatSend.addEventListener('click', () => {
      const text = chatInput.value.trim();
      if (!text) return;
      
      addMessage(text, true);
      chatInput.value = '';
      
      // Simulate AI response
      setTimeout(() => {
        addMessage(`I'm in Safe Mode with limited functionality. Your message was: "${text}". Please reload the application for full features.`, false);
      }, 500);
    });
    
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        chatSend.click();
      }
    });
    
    addMessage('Welcome to Safe Mode. Basic chat is available here.', false);
  }

  /**
   * Attempt recovery in background
   */
  private attemptRecovery(): void {
    if (this.config.recoveryCallback) {
      setTimeout(() => {
        try {
          this.config.recoveryCallback!();
        } catch (error) {
          console.error('[SafeMode] Recovery callback failed:', error);
        }
      }, 5000);
    }
  }

  /**
   * Get error details for display
   */
  private getErrorDetails(): string {
    const details: string[] = [];
    
    // Browser info
    details.push(`User Agent: ${navigator.userAgent}`);
    details.push(`Platform: ${navigator.platform}`);
    details.push(`Online: ${navigator.onLine}`);
    
    // URL info
    details.push(`URL: ${window.location.href}`);
    
    // Time info
    details.push(`Time: ${new Date().toISOString()}`);
    
    // Safe Mode info
    details.push(`Safe Mode Activated: ${new Date().toISOString()}`);
    details.push(`Retry Count: ${this.retryCount}`);
    
    return details.join('\n');
  }

  /**
   * Clear browser cache
   */
  private clearBrowserCache(): void {
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      const statusEl = document.getElementById('safe-mode-storage-status');
      if (statusEl) {
        statusEl.textContent = 'Cache cleared';
        statusEl.style.color = '#059669';
      }
      
      // Show confirmation
      alert('Browser cache cleared. The page will now reload.');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('[SafeMode] Error clearing cache:', error);
      alert('Failed to clear cache. Please clear browser data manually.');
    }
  }

  /**
   * Check for errors
   */
  private checkForErrors(): void {
    const errors: string[] = [];
    
    // Check various APIs
    try {
      if (!window.localStorage) errors.push('localStorage not available');
    } catch (e) {
      errors.push(`localStorage error: ${e}`);
    }
    
    try {
      if (!window.sessionStorage) errors.push('sessionStorage not available');
    } catch (e) {
      errors.push(`sessionStorage error: ${e}`);
    }
    
    try {
      if (!navigator.onLine) errors.push('Network offline');
    } catch (e) {
      errors.push(`Network check error: ${e}`);
    }
    
    // Display errors
    if (errors.length > 0) {
      alert(`Found ${errors.length} issues:\n\n${errors.join('\n')}`);
    } else {
      alert('No obvious issues detected. The problem may be with JavaScript execution.');
    }
  }

  /**
   * Export data
   */
  private exportData(): void {
    try {
      const data: Record<string, any> = {};
      
      // Export localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          data[key] = localStorage.getItem(key);
        }
      }
      
      // Create download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oscar-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Data exported successfully.');
    } catch (error) {
      console.error('[SafeMode] Error exporting data:', error);
      alert('Failed to export data.');
    }
  }

  /**
   * Check system status
   */
  private checkSystemStatus(): void {
    // Check storage
    try {
      localStorage.setItem('safe-mode-test', 'test');
      localStorage.removeItem('safe-mode-test');
      const storageStatusEl = document.getElementById('safe-mode-storage-status');
      if (storageStatusEl) {
        storageStatusEl.textContent = 'Working';
        storageStatusEl.style.color = '#166534';
      }
    } catch (error) {
      const storageStatusEl = document.getElementById('safe-mode-storage-status');
      if (storageStatusEl) {
        storageStatusEl.textContent = 'Error';
        storageStatusEl.style.color = '#dc2626';
      }
    }

    // Check network
    try {
      const networkStatusEl = document.getElementById('safe-mode-network-status');
      if (networkStatusEl) {
        networkStatusEl.textContent = navigator.onLine ? 'Online' : 'Offline';
        networkStatusEl.style.color = navigator.onLine ? '#166534' : '#dc2626';
      }
    } catch (error) {
      const networkStatusEl = document.getElementById('safe-mode-network-status');
      if (networkStatusEl) {
        networkStatusEl.textContent = 'Unknown';
        networkStatusEl.style.color = '#6b7280';
      }
    }
  }

  /**
   * Check if Safe Mode is active
   */
  isSafeModeActive(): boolean {
    return this.isSafeMode;
  }

  /**
   * Get current configuration
   */
  getConfig(): SafeModeConfig {
    return { ...this.config };
  }
}
