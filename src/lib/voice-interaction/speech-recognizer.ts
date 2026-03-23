/**
 * Speech Recognition Engine for Phase 34.5
 * Handles speech-to-text conversion and audio processing
 */

import type {
  SpeechRecognitionConfig,
  SpeechRecognitionResult,
  SpeechRecognitionStats,
  VoiceInteractionContext,
  SpeechRecognitionState
} from './voice-interaction-types';

export class SpeechRecognizer {
  private config: SpeechRecognitionConfig;
  private state: SpeechRecognitionState = 'idle';
  private recognitionQueue: SpeechRecognitionResult[] = [];
  private stats: SpeechRecognitionStats = {
    totalRecognitions: 0,
    successfulRecognitions: 0,
    failedRecognitions: 0,
    averageConfidence: 0,
    totalDuration: 0,
    averageDuration: 0,
    recognitionErrors: [],
    lastError: undefined,
    lastErrorTime: undefined
  };
  private currentContext: VoiceInteractionContext | null = null;
  private onResultCallback?: (result: SpeechRecognitionResult) => void;
  private onErrorCallback?: (error: Error) => void;
  private onStateChangeCallback?: (state: SpeechRecognitionState) => void;

  constructor(config: SpeechRecognitionConfig = {}) {
    this.config = this.normalizeConfig(config);
  }

  /**
   * Normalize and validate configuration
   */
  private normalizeConfig(config: SpeechRecognitionConfig): SpeechRecognitionConfig {
    return {
      language: config.language || 'en-US',
      continuous: config.continuous ?? true,
      interimResults: config.interimResults ?? true,
      maxAlternatives: config.maxAlternatives ?? 3,
      sampleRate: config.sampleRate || 16000,
      noiseThreshold: config.noiseThreshold || 0.01,
      silenceThreshold: config.silenceThreshold || 0.05
    };
  }

  /**
   * Start listening for speech
   */
  public async start(context?: VoiceInteractionContext): Promise<void> {
    if (this.state === 'listening') {
      console.warn('[SpeechRecognizer] Already listening');
      return;
    }

    this.state = 'listening';
    this.currentContext = context || null;
    
    console.log(`[SpeechRecognizer] Starting speech recognition (language: ${this.config.language})`);
    this.emitStateChange('listening');
  }

  /**
   * Stop listening
   */
  public async stop(): Promise<void> {
    if (this.state !== 'listening') {
      console.warn('[SpeechRecognizer] Not currently listening');
      return;
    }

    this.state = 'idle';
    console.log('[SpeechRecognizer] Stopped listening');
    this.emitStateChange('idle');
  }

  /**
   * Process speech input and return recognition result
   */
  public async recognize(audioData: ArrayBuffer, duration: number): Promise<SpeechRecognitionResult> {
    if (this.state !== 'listening') {
      throw new Error('SpeechRecognizer is not listening');
    }

    const startTime = Date.now();
    let result: SpeechRecognitionResult;

    try {
      // Simulate speech recognition (in production, integrate with Web Speech API or backend)
      result = await this.simulateRecognition(audioData, duration);
      
      // Update statistics
      this.stats.totalRecognitions++;
      this.stats.successfulRecognitions++;
      this.stats.totalDuration += duration;
      this.stats.averageDuration = this.stats.totalDuration / this.stats.successfulRecognitions;
      this.stats.averageConfidence = 
        (this.stats.averageConfidence * (this.stats.successfulRecognitions - 1) + result.confidence) / 
        this.stats.successfulRecognitions;

      // Add to queue
      this.recognitionQueue.push(result);

      // Notify callback
      if (this.onResultCallback) {
        this.onResultCallback(result);
      }

      console.log(`[SpeechRecognizer] Recognized: "${result.transcript}" (confidence: ${result.confidence.toFixed(2)})`);

      return result;
    } catch (error) {
      this.stats.failedRecognitions++;
      this.stats.recognitionErrors.push(error instanceof Error ? error.message : String(error));
      this.stats.lastError = error instanceof Error ? error.message : String(error);
      this.stats.lastErrorTime = Date.now();

      if (this.onErrorCallback) {
        this.onErrorCallback(error instanceof Error ? error : new Error(String(error)));
      }

      throw error;
    }
  }

  /**
   * Simulate speech recognition (for demonstration)
   * In production, this would integrate with actual speech recognition APIs
   */
  private async simulateRecognition(
    audioData: ArrayBuffer,
    duration: number
  ): Promise<SpeechRecognitionResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    // Simulate recognition with some randomness
    const confidence = 0.7 + Math.random() * 0.3;
    const isFinal = Math.random() > 0.3;

    // Generate sample transcript based on context
    let transcript = this.generateSampleTranscript();

    return {
      transcript,
      confidence,
      isFinal,
      alternatives: this.generateAlternatives(transcript, confidence),
      duration
    };
  }

  /**
   * Generate a sample transcript based on current context
   */
  private generateSampleTranscript(): string {
    const intents = [
      'Open the document',
      'Save the changes',
      'Search for "project requirements"',
      'Format as heading',
      'Copy the selected text',
      'Navigate to the next section',
      'Create a new document',
      'Highlight this section',
      'Find the next occurrence',
      'Undo the last action'
    ];

    return intents[Math.floor(Math.random() * intents.length)];
  }

  /**
   * Generate alternative transcriptions
   */
  private generateAlternatives(transcript: string, confidence: number): Array<{ transcript: string; confidence: number }> {
    const alternatives: Array<{ transcript: string; confidence: number }> = [];
    
    // Add a few variations
    const variations = [
      transcript,
      transcript.toLowerCase(),
      transcript.replace(/the /g, ''),
      transcript.replace(/\.$/, '')
    ];

    for (const variation of variations.slice(0, this.config.maxAlternatives! - 1)) {
      alternatives.push({
        transcript: variation,
        confidence: Math.max(0, confidence - 0.1 - Math.random() * 0.1)
      });
    }

    return alternatives;
  }

  /**
   * Get recognition result from queue
   */
  public getResult(): SpeechRecognitionResult | undefined {
    return this.recognitionQueue.shift();
  }

  /**
   * Get all pending results
   */
  public getResults(): SpeechRecognitionResult[] {
    return [...this.recognitionQueue];
  }

  /**
   * Clear recognition queue
   */
  public clearResults(): void {
    this.recognitionQueue = [];
  }

  /**
   * Get current state
   */
  public getState(): SpeechRecognitionState {
    return this.state;
  }

  /**
   * Get statistics
   */
  public getStats(): SpeechRecognitionStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      totalRecognitions: 0,
      successfulRecognitions: 0,
      failedRecognitions: 0,
      averageConfidence: 0,
      totalDuration: 0,
      averageDuration: 0,
      recognitionErrors: [],
      lastError: undefined,
      lastErrorTime: undefined
    };
  }

  /**
   * Set context
   */
  public setContext(context: VoiceInteractionContext): void {
    this.currentContext = context;
  }

  /**
   * Get context
   */
  public getContext(): VoiceInteractionContext | null {
    return this.currentContext;
  }

  /**
   * Set result callback
   */
  public onResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * Set error callback
   */
  public onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Set state change callback
   */
  public onStateChange(callback: (state: SpeechRecognitionState) => void): void {
    this.onStateChangeCallback = callback;
  }

  /**
   * Emit state change
   */
  private emitStateChange(state: SpeechRecognitionState): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(state);
    }
  }

  /**
   * Get audio sample rate
   */
  public getSampleRate(): number {
    return this.config.sampleRate || 16000;
  }

  /**
   * Check if continuous listening is enabled
   */
  public isContinuous(): boolean {
    return this.config.continuous ?? true;
  }

  /**
   * Check if interim results are enabled
   */
  public hasInterimResults(): boolean {
    return this.config.interimResults ?? true;
  }
}
