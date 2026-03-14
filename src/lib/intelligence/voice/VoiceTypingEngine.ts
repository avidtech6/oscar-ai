/**
 * Voice Typing Engine - Handles speech-to-text input and voice commands
 * Fixes voice typing trigger bug by ensuring proper initialization and cleanup
 */

export interface VoiceTypingConfig {
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface VoiceTypingEvent {
  type: 'start' | 'end' | 'error' | 'result' | 'interim';
  text?: string;
  confidence?: number;
  error?: string;
}

export class VoiceTypingEngine {
  private recognition: any = null;
  private isRecognitionActive = false;
  private config: VoiceTypingConfig;
  private listeners: Map<string, ((event: VoiceTypingEvent) => void)[]> = new Map();

  constructor(config: VoiceTypingConfig = {}) {
    this.config = {
      continuous: false,
      interimResults: true,
      maxAlternatives: 1,
      ...config
    };
    
    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined') return;

    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = this.config.continuous || false;
    this.recognition.interimResults = this.config.interimResults || true;
    this.recognition.maxAlternatives = this.config.maxAlternatives || 1;

    // Fix voice typing trigger bug by ensuring proper event handlers
    this.recognition.onstart = () => {
      this.isRecognitionActive = true;
      this.emit({ type: 'start' });
    };

    this.recognition.onend = () => {
      this.isRecognitionActive = false;
      this.emit({ type: 'end' });
    };

    this.recognition.onerror = (event: any) => {
      this.emit({ 
        type: 'error', 
        error: event.error || 'Speech recognition error' 
      });
    };

    this.recognition.onresult = (event: any) => {
      const results = event.results;
      
      for (let i = event.resultIndex; i < results.length; i++) {
        const result = results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        
        if (result.isFinal) {
          this.emit({ 
            type: 'result', 
            text: transcript, 
            confidence 
          });
        } else {
          this.emit({ 
            type: 'interim', 
            text: transcript, 
            confidence 
          });
        }
      }
    };
  }

  // Fix voice typing trigger bug by adding explicit start/stop methods
  start(): void {
    if (this.isRecognitionActive || !this.recognition) return;
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start voice typing:', error);
      this.emit({ 
        type: 'error', 
        error: 'Failed to start voice typing' 
      });
    }
  }

  stop(): void {
    if (!this.isActive || !this.recognition) return;
    
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Failed to stop voice typing:', error);
    }
  }

  toggle(): void {
    if (this.isRecognitionActive) {
      this.stop();
    } else {
      this.start();
    }
  }

  // Event system
  on(event: string, callback: (event: VoiceTypingEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (event: VoiceTypingEvent) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: VoiceTypingEvent): void {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }

  // Utility methods
  isActive(): boolean {
    return this.isRecognitionActive;
  }

  getSupportedLanguages(): string[] {
    if (!this.recognition) return [];
    
    try {
      return this.recognition.langs || [];
    } catch (error) {
      console.error('Failed to get supported languages:', error);
      return [];
    }
  }

  setLanguage(lang: string): void {
    if (!this.recognition) return;
    
    try {
      this.recognition.lang = lang;
    } catch (error) {
      console.error('Failed to set language:', error);
    }
  }

  destroy(): void {
    if (this.isRecognitionActive) {
      this.stop();
    }
    
    if (this.recognition) {
      this.recognition.onstart = null;
      this.recognition.onend = null;
      this.recognition.onerror = null;
      this.recognition.onresult = null;
      this.recognition = null;
    }
    
    this.listeners.clear();
    this.isRecognitionActive = false;
  }
}

// Global instance for convenience
export const voiceTypingEngine = new VoiceTypingEngine();