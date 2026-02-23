/**
 * Voice Dictation Helper Module
 * Provides Web Speech API integration for voice-to-text functionality
 */

export interface VoiceDictationOptions {
	lang?: string;
	continuous?: boolean;
	interimResults?: boolean;
	maxAlternatives?: number;
}

export interface VoiceDictationResult {
	transcript: string;
	isFinal: boolean;
	confidence: number;
}

export class VoiceDictation {
	private recognition: any = null;
	private isRecording = false;
	private supported = false;
	
	private onResultCallback: ((result: VoiceDictationResult) => void) | null = null;
	private onErrorCallback: ((error: string) => void) | null = null;
	private onStartCallback: (() => void) | null = null;
	private onEndCallback: (() => void) | null = null;
	
	constructor(options: VoiceDictationOptions = {}) {
		this.supported = this.checkSupport();
		
		if (this.supported) {
			this.initializeRecognition(options);
		}
	}
	
	private checkSupport(): boolean {
		return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
	}
	
	private initializeRecognition(options: VoiceDictationOptions): void {
		const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
		
		if (!SpeechRecognition) {
			this.supported = false;
			return;
		}
		
		this.recognition = new SpeechRecognition();
		this.recognition.continuous = options.continuous ?? true;
		this.recognition.interimResults = options.interimResults ?? true;
		this.recognition.lang = options.lang ?? 'en-GB';
		this.recognition.maxAlternatives = options.maxAlternatives ?? 1;
		
		this.recognition.onstart = () => {
			this.isRecording = true;
			if (this.onStartCallback) {
				this.onStartCallback();
			}
		};
		
		this.recognition.onresult = (event: any) => {
			if (!event.results || event.results.length === 0) return;
			
			const resultIndex = event.resultIndex;
			const result = event.results[resultIndex];
			
			if (!result || result.length === 0) return;
			
			const transcript = result[0].transcript;
			const isFinal = result.isFinal;
			const confidence = result[0].confidence;
			
			if (this.onResultCallback) {
				this.onResultCallback({
					transcript,
					isFinal,
					confidence
				});
			}
		};
		
		this.recognition.onerror = (event: any) => {
			this.isRecording = false;
			
			let errorMessage = 'Unknown speech recognition error';
			
			switch (event.error) {
				case 'no-speech':
					errorMessage = 'No speech was detected';
					break;
				case 'audio-capture':
					errorMessage = 'No microphone was found or access was denied';
					break;
				case 'not-allowed':
					errorMessage = 'Microphone access was denied by the user';
					break;
				case 'network':
					errorMessage = 'Network error occurred';
					break;
				case 'aborted':
					errorMessage = 'Speech recognition was aborted';
					break;
				default:
					errorMessage = `Speech recognition error: ${event.error}`;
			}
			
			if (this.onErrorCallback) {
				this.onErrorCallback(errorMessage);
			}
		};
		
		this.recognition.onend = () => {
			this.isRecording = false;
			if (this.onEndCallback) {
				this.onEndCallback();
			}
		};
	}
	
	/**
	 * Check if voice dictation is supported in the current browser
	 */
	isSupported(): boolean {
		return this.supported;
	}
	
	/**
	 * Start voice dictation
	 */
	start(): boolean {
		if (!this.supported || !this.recognition) {
			return false;
		}
		
		try {
			this.recognition.start();
			return true;
		} catch (error) {
			console.error('Failed to start voice dictation:', error);
			return false;
		}
	}
	
	/**
	 * Stop voice dictation
	 */
	stop(): void {
		if (this.recognition && this.isRecording) {
			this.recognition.stop();
		}
	}
	
	/**
	 * Toggle voice dictation (start if stopped, stop if recording)
	 */
	toggle(): boolean {
		if (this.isRecording) {
			this.stop();
			return false;
		} else {
			return this.start();
		}
	}
	
	/**
	 * Check if currently recording
	 */
	isRecordingNow(): boolean {
		return this.isRecording;
	}
	
	/**
	 * Set callback for when speech results are available
	 */
	onResult(callback: (result: VoiceDictationResult) => void): void {
		this.onResultCallback = callback;
	}
	
	/**
	 * Set callback for when an error occurs
	 */
	onError(callback: (error: string) => void): void {
		this.onErrorCallback = callback;
	}
	
	/**
	 * Set callback for when recording starts
	 */
	onStart(callback: () => void): void {
		this.onStartCallback = callback;
	}
	
	/**
	 * Set callback for when recording ends
	 */
	onEnd(callback: () => void): void {
		this.onEndCallback = callback;
	}
	
	/**
	 * Change the language for speech recognition
	 */
	setLanguage(lang: string): void {
		if (this.recognition) {
			this.recognition.lang = lang;
		}
	}
	
	/**
	 * Clean up resources
	 */
	destroy(): void {
		if (this.recognition) {
			this.stop();
			this.recognition = null;
		}
		
		this.onResultCallback = null;
		this.onErrorCallback = null;
		this.onStartCallback = null;
		this.onEndCallback = null;
	}
}

/**
 * Utility function to get browser support information
 */
export function getSpeechRecognitionSupport(): {
	supported: boolean;
	browser: string;
	apiName: string;
} {
	const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
	let browser = 'unknown';
	let apiName = '';
	
	if (typeof window !== 'undefined') {
		const userAgent = navigator.userAgent.toLowerCase();
		
		if (userAgent.includes('chrome')) {
			browser = 'chrome';
		} else if (userAgent.includes('firefox')) {
			browser = 'firefox';
		} else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
			browser = 'safari';
		} else if (userAgent.includes('edge')) {
			browser = 'edge';
		}
		
		if ('SpeechRecognition' in window) {
			apiName = 'SpeechRecognition';
		} else if ('webkitSpeechRecognition' in window) {
			apiName = 'webkitSpeechRecognition';
		}
	}
	
	return {
		supported,
		browser,
		apiName
	};
}

/**
 * Simple wrapper function for one-time speech recognition
 */
export function recognizeSpeech(options?: VoiceDictationOptions): Promise<string> {
	return new Promise((resolve, reject) => {
		const dictation = new VoiceDictation({
			...options,
			continuous: false,
			interimResults: false
		});
		
		if (!dictation.isSupported()) {
			dictation.destroy();
			reject(new Error('Speech recognition not supported in this browser'));
			return;
		}
		
		let finalTranscript = '';
		
		dictation.onResult((result) => {
			if (result.isFinal) {
				finalTranscript = result.transcript;
			}
		});
		
		dictation.onError((error) => {
			dictation.destroy();
			reject(new Error(error));
		});
		
		dictation.onEnd(() => {
			dictation.destroy();
			resolve(finalTranscript);
		});
		
		if (!dictation.start()) {
			dictation.destroy();
			reject(new Error('Failed to start speech recognition'));
		}
	});
}