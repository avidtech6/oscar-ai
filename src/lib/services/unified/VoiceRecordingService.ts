/**
 * Voice Recording Service
 * 
 * Unified voice recording service that replaces 3 different implementations.
 * Handles recording, transcription, and audio persistence.
 */

import { browser } from '$app/environment';
import { db } from '$lib/db';
import { unifiedIntentEngine } from './UnifiedIntentEngine';
import { actionExecutorService } from './ActionExecutorService';
import { transcribeAudio as whisperTranscribe } from '../whisper';

export interface RecordingOptions {
  maxDuration?: number; // in milliseconds
  sampleRate?: number;
  audioType?: 'audio/wav' | 'audio/mp3' | 'audio/webm';
  autoTranscribe?: boolean;
}

export interface RecordingResult {
  success: boolean;
  audioBlob: Blob | null;
  duration: number;
  transcript?: string;
  error?: string;
  metadata: {
    sampleRate: number;
    channels: number;
    bitDepth: number;
    mimeType: string;
    size: number;
  };
}

export interface VoiceNote {
  id: string;
  projectId: string | null;
  audioBlob: Blob;
  transcript: string;
  duration: number;
  intent: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export class VoiceRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording = false;
  private startTime: number = 0;
  
  // Audio context for analysis
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  
  // Transcription service (could be browser SpeechRecognition or external API)
  private speechRecognition: any = null;

  constructor() {
    if (browser) {
      this.initializeSpeechRecognition();
    }
  }

  /**
   * Initialize browser SpeechRecognition if available
   */
  private initializeSpeechRecognition(): void {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || 
                                (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.speechRecognition = new SpeechRecognition();
        this.speechRecognition.continuous = true;
        this.speechRecognition.interimResults = true;
        this.speechRecognition.lang = 'en-GB';
      }
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(options: RecordingOptions = {}): Promise<boolean> {
    if (!browser) {
      console.warn('Voice recording not available in server context');
      return false;
    }

    if (this.isRecording) {
      console.warn('Already recording');
      return false;
    }

    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: options.sampleRate || 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create audio context for analysis
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      source.connect(this.analyser);

      // Setup media recorder
      const mimeType = options.audioType || 'audio/webm';
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      
      this.audioChunks = [];
      this.startTime = Date.now();
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.handleRecordingStop();
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;

      // Start transcription if enabled
      if (options.autoTranscribe && this.speechRecognition) {
        this.startTranscription();
      }

      // Set max duration if specified
      if (options.maxDuration) {
        setTimeout(() => {
          if (this.isRecording) {
            this.stopRecording();
          }
        }, options.maxDuration);
      }

      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.cleanup();
      return false;
    }
  }

  /**
   * Start recording with intent detection
   * Enhanced version that provides real-time transcription and intent feedback
   */
  async startRecordingWithIntentDetection(
    options: RecordingOptions = {},
    callbacks?: {
      onTranscription?: (text: string, isFinal: boolean) => void;
      onIntentDetected?: (intent: any) => void;
      onError?: (error: string) => void;
    }
  ): Promise<boolean> {
    if (!browser) {
      console.warn('Voice recording not available in server context');
      return false;
    }

    if (this.isRecording) {
      console.warn('Already recording');
      return false;
    }

    try {
      // Store callbacks for real-time feedback
      const transcriptionCallback = callbacks?.onTranscription;
      const intentCallback = callbacks?.onIntentDetected;
      const errorCallback = callbacks?.onError;

      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: options.sampleRate || 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create audio context for analysis
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      source.connect(this.analyser);

      // Setup media recorder
      const mimeType = options.audioType || 'audio/webm';
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      
      this.audioChunks = [];
      this.startTime = Date.now();
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.handleRecordingStop();
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;

      // Enhanced real-time transcription with intent detection
      if (options.autoTranscribe && this.speechRecognition) {
        this.speechRecognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
              
              // Process final transcript for intent detection
              if (finalTranscript.trim()) {
                this.processTranscriptionForIntent(finalTranscript, intentCallback);
              }
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Send real-time transcription feedback
          if (transcriptionCallback) {
            if (interimTranscript) {
              transcriptionCallback(interimTranscript, false);
            }
            if (finalTranscript) {
              transcriptionCallback(finalTranscript, true);
            }
          }
        };
        
        this.speechRecognition.onerror = (event: any) => {
          const error = event.error || 'Speech recognition error';
          console.error('Speech recognition error:', error);
          if (errorCallback) {
            errorCallback(error);
          }
        };
        
        this.speechRecognition.start();
      }

      // Set max duration if specified
      if (options.maxDuration) {
        setTimeout(() => {
          if (this.isRecording) {
            this.stopRecording();
          }
        }, options.maxDuration);
      }

      return true;
    } catch (error) {
      console.error('Failed to start recording with intent detection:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (callbacks?.onError) {
        callbacks.onError(errorMsg);
      }
      this.cleanup();
      return false;
    }
  }

  /**
   * Process transcription text for intent detection
   */
  async processTranscriptionForIntent(
    transcript: string,
    callback?: (intent: any) => void
  ): Promise<any> {
    if (!transcript.trim()) {
      return null;
    }

    try {
      // Use unified intent engine to detect intent from voice transcription
      const intentResult = await unifiedIntentEngine.detectIntent(transcript, {
        isVoice: true,
        voiceData: {
          transcript,
          duration: this.getRecordingDuration() * 1000, // Convert to milliseconds
        },
      });

      // Send intent feedback if callback provided
      if (callback && intentResult) {
        callback(intentResult);
      }

      return intentResult;
    } catch (error) {
      console.error('Error processing transcription for intent:', error);
      return null;
    }
  }

  /**
   * Get transcription confidence score
   * This is a simplified confidence calculation based on transcript quality
   */
  getTranscriptionConfidence(transcript: string): number {
    if (!transcript.trim()) {
      return 0;
    }

    // Basic confidence calculation
    const wordCount = transcript.split(/\s+/).length;
    const hasPunctuation = /[.!?]$/.test(transcript.trim());
    const hasCompleteThought = wordCount >= 3;
    
    let confidence = 50; // Base confidence
    
    if (hasCompleteThought) confidence += 20;
    if (hasPunctuation) confidence += 15;
    if (wordCount > 5) confidence += Math.min(wordCount * 2, 15); // Cap at +15
    
    return Math.min(confidence, 100);
  }

  /**
   * Stop recording and get result
   */
  async stopRecording(): Promise<RecordingResult> {
    if (!this.isRecording || !this.mediaRecorder) {
      return {
        success: false,
        audioBlob: null,
        duration: 0,
        error: 'Not recording',
        metadata: {
          sampleRate: 0,
          channels: 0,
          bitDepth: 0,
          mimeType: '',
          size: 0,
        },
      };
    }

    try {
      // Stop media recorder
      this.mediaRecorder.stop();
      
      // Stop transcription if active
      if (this.speechRecognition) {
        this.speechRecognition.stop();
      }

      // Stop all tracks
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      // Wait for onstop to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const duration = Date.now() - this.startTime;
      const audioBlob = this.audioChunks.length > 0
        ? new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' })
        : null;

      // Get transcript if available
      let transcript = '';
      if (this.speechRecognition) {
        // In a real implementation, we would collect interim results
        // For now, we'll rely on external transcription
      }

      const result: RecordingResult = {
        success: true,
        audioBlob,
        duration,
        transcript,
        metadata: {
          sampleRate: 44100, // Default
          channels: 1,
          bitDepth: 16,
          mimeType: this.mediaRecorder?.mimeType || 'audio/webm',
          size: audioBlob?.size || 0,
        },
      };

      this.cleanup();
      return result;
    } catch (error) {
      console.error('Error stopping recording:', error);
      const result: RecordingResult = {
        success: false,
        audioBlob: null,
        duration: Date.now() - this.startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          sampleRate: 0,
          channels: 0,
          bitDepth: 0,
          mimeType: '',
          size: 0,
        },
      };
      this.cleanup();
      return result;
    }
  }

  /**
   * Handle recording stop
   */
  private handleRecordingStop(): void {
    this.isRecording = false;
    
    // Clean up audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.audioContext = null;
    this.analyser = null;
  }

  /**
   * Start real-time transcription
   */
  private startTranscription(): void {
    if (!this.speechRecognition) return;

    this.speechRecognition.onresult = (event: any) => {
      // Collect interim results
      // In a real implementation, we would update UI with live transcript
    };

    this.speechRecognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    this.speechRecognition.start();
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.audioContext = null;
    this.analyser = null;
  }

  /**
   * Save voice note to IndexedDB
   * Updated to match calling pattern from VoiceInput.svelte
   */
  async saveVoiceNote(data: {
    projectId: string | null;
    audioBlob: Blob;
    transcript: string;
    summary?: string;
    intent: string;
    metadata: Record<string, any>;
  }): Promise<string | null> {
    if (!browser) return null;

    try {
      const voiceNote: VoiceNote = {
        id: crypto.randomUUID(),
        projectId: data.projectId,
        audioBlob: data.audioBlob,
        transcript: data.transcript,
        duration: data.metadata?.duration || 0,
        intent: data.intent || 'voice_note',
        timestamp: new Date(),
        metadata: data.metadata || {},
      };

      // Voice notes table already exists in Dexie schema (version 5+)
      await db.voiceNotes.add(voiceNote as any);
      
      return voiceNote.id;
    } catch (error) {
      console.error('Failed to save voice note:', error);
      return null;
    }
  }

  /**
   * Get voice note by ID
   */
  async getVoiceNote(id: string): Promise<VoiceNote | null> {
    if (!browser) return null;

    try {
      const note = await db.voiceNotes.get(id);
      return note as VoiceNote || null;
    } catch (error) {
      console.error('Failed to get voice note:', error);
      return null;
    }
  }

  /**
   * Get voice notes for a project
   */
  async getVoiceNotesForProject(projectId: string): Promise<VoiceNote[]> {
    if (!browser) return [];

    try {
      const notes = await db.voiceNotes
        .where('projectId')
        .equals(projectId)
        .reverse()
        .sortBy('timestamp');
      return notes as VoiceNote[];
    } catch (error) {
      console.error('Failed to get voice notes:', error);
      return [];
    }
  }

  /**
   * Delete voice note
   */
  async deleteVoiceNote(id: string): Promise<boolean> {
    if (!browser) return false;

    try {
      await db.voiceNotes.delete(id);
      return true;
    } catch (error) {
      console.error('Failed to delete voice note:', error);
      return false;
    }
  }

  /**
   * Transcribe audio using external service (Groq Whisper API)
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Use the whisper.ts service for transcription
      const result = await whisperTranscribe(audioBlob);
      return result.text || '';
    } catch (error) {
      console.error('Transcription error:', error);
      
      // Fallback: Use browser SpeechRecognition if available
      if (this.speechRecognition) {
        return await this.transcribeWithBrowser(audioBlob);
      }
      
      return '';
    }
  }

  /**
   * Transcribe using browser SpeechRecognition (fallback)
   */
  private async transcribeWithBrowser(audioBlob: Blob): Promise<string> {
    return new Promise((resolve) => {
      if (!this.speechRecognition) {
        resolve('');
        return;
      }

      // Create audio element and play it for recognition
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      let transcript = '';
      
      this.speechRecognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
      };
      
      this.speechRecognition.onend = () => {
        URL.revokeObjectURL(audioUrl);
        resolve(transcript);
      };
      
      this.speechRecognition.start();
      audio.play();
    });
  }

  /**
   * Convert blob to base64
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get audio level for visualization (0-100)
   */
  getAudioLevel(): number {
    if (!this.analyser || !this.isRecording) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    return Math.min(Math.max(average / 2.55, 0), 100); // Convert to 0-100 scale
  }

  /**
   * Check if recording is in progress
   */
  isRecordingInProgress(): boolean {
    return this.isRecording;
  }

  /**
   * Get recording duration in seconds
   */
  getRecordingDuration(): number {
    if (!this.isRecording) return 0;
    return (Date.now() - this.startTime) / 1000;
  }

  /**
   * Generate AI summary of transcript using intent context
   */
  async generateSummary(
    transcript: string,
    context?: {
      intent?: string;
      confidence?: number;
      entities?: Record<string, any>;
    }
  ): Promise<string> {
    if (!transcript.trim()) {
      return '';
    }

    try {
      // For short transcripts, return a simple summary
      if (transcript.length < 100) {
        return transcript;
      }

      // Use Groq API for AI summarization
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: transcript,
          context: context || {},
          maxLength: 200,
        }),
      });

      if (!response.ok) {
        throw new Error(`Summary generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.summary || this.generateFallbackSummary(transcript);
    } catch (error) {
      console.error('Error generating summary:', error);
      return this.generateFallbackSummary(transcript);
    }
  }

  /**
   * Generate fallback summary when AI service is unavailable
   */
  private generateFallbackSummary(transcript: string): string {
    // Simple fallback: take first 3 sentences or 200 characters
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 3) {
      return transcript;
    }
    
    const summary = sentences.slice(0, 3).join('. ') + '.';
    
    // Add context if available
    if (transcript.length > 500) {
      return summary + ' [Full transcript available]';
    }
    
    return summary;
  }
}

// Singleton instance
export const voiceRecordingService = new VoiceRecordingService();