/**
 * Voice dictation service using Web Speech API
 */

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionError {
  error: string;
  message: string;
}

/**
 * Get the SpeechRecognition object for the current browser
 * Returns null if SpeechRecognition is not supported
 */
export function getSpeechRecognition(): any {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check for browser support
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn('SpeechRecognition not supported in this browser');
    return null;
  }

  return new SpeechRecognition();
}

/**
 * Check if speech recognition is supported in the current browser
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
}

/**
 * Get the list of available languages for speech recognition
 * Returns an array of language codes (e.g., ['en-US', 'en-GB', 'fr-FR'])
 */
export function getAvailableLanguages(): string[] {
  // Default languages supported by most browsers
  const defaultLanguages = [
    'en-US', 'en-GB', 'en-AU', 'en-CA',
    'fr-FR', 'fr-CA',
    'de-DE',
    'es-ES', 'es-MX',
    'it-IT',
    'ja-JP',
    'ko-KR',
    'zh-CN', 'zh-TW'
  ];

  return defaultLanguages;
}

/**
 * Start speech recognition with the given options
 */
export function startRecognition(options: {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: SpeechRecognitionError) => void;
  onEnd?: () => void;
}): any | null {
  const recognition = getSpeechRecognition();
  
  if (!recognition) {
    return null;
  }

  // Set options
  recognition.lang = options.language || 'en-US';
  recognition.continuous = options.continuous !== false; // Default to true
  recognition.interimResults = options.interimResults !== false; // Default to true
  recognition.maxAlternatives = 1;

  // Set up event handlers
  if (options.onResult) {
    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      options.onResult!({
        transcript,
        confidence,
        isFinal
      });
    };
  }

  if (options.onError) {
    recognition.onerror = (event: any) => {
      options.onError!({
        error: event.error,
        message: getErrorMessage(event.error)
      });
    };
  }

  if (options.onEnd) {
    recognition.onend = options.onEnd;
  }

  // Start recognition
  try {
    recognition.start();
    return recognition;
  } catch (error) {
    console.error('Failed to start speech recognition:', error);
    return null;
  }
}

/**
 * Stop speech recognition
 */
export function stopRecognition(recognition: any): void {
  if (recognition) {
    try {
      recognition.stop();
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }
}

/**
 * Get a user-friendly error message for speech recognition errors
 */
function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'no-speech':
      return 'No speech was detected. Please try speaking again.';
    case 'aborted':
      return 'Speech recognition was aborted.';
    case 'audio-capture':
      return 'No microphone was found or microphone access was denied.';
    case 'network':
      return 'Network error occurred during speech recognition.';
    case 'not-allowed':
      return 'Microphone access was denied. Please allow microphone access in your browser settings.';
    case 'service-not-allowed':
      return 'Speech recognition service is not allowed.';
    case 'bad-grammar':
      return 'Speech recognition grammar error.';
    case 'language-not-supported':
      return 'The selected language is not supported.';
    default:
      return 'An unknown error occurred during speech recognition.';
  }
}

/**
 * Check microphone permissions
 * Returns true if microphone access is granted or can be requested
 */
export async function checkMicrophonePermission(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop all tracks to release the microphone
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.warn('Microphone permission denied or not available:', error);
    return false;
  }
}

/**
 * Request microphone permission from the user
 * Returns true if permission was granted
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop all tracks to release the microphone
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Failed to get microphone permission:', error);
    return false;
  }
}

/**
 * Simple utility to convert speech to text with a promise-based interface
 */
export function speechToText(options?: {
  language?: string;
  timeout?: number;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const recognition = getSpeechRecognition();
    
    if (!recognition) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    recognition.lang = options?.language || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let timeoutId: NodeJS.Timeout;

    if (options?.timeout) {
      timeoutId = setTimeout(() => {
        stopRecognition(recognition);
        reject(new Error('Speech recognition timeout'));
      }, options.timeout);
    }

    recognition.onresult = (event: any) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event: any) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      reject(new Error(getErrorMessage(event.error)));
    };

    recognition.onend = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      reject(error);
    }
  });
}