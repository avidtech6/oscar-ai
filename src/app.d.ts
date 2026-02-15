// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}
		// No server-side locals needed for static build
		interface Locals {}
		interface PageData {}
		interface Platform {}
	}
	
	// Web Speech API types
	interface SpeechRecognitionErrorEvent extends Event {
		error: string;
		message: string;
	}
	
	interface SpeechRecognitionAlternative {
		transcript: string;
		confidence: number;
	}
	
	interface SpeechRecognitionResult {
		isFinal: boolean;
		[index: number]: SpeechRecognitionAlternative;
		length: number;
	}
	
	interface SpeechRecognitionResultList {
		[index: number]: SpeechRecognitionResult;
		length: number;
	}
	
	interface SpeechRecognitionEvent extends Event {
		resultIndex: number;
		results: SpeechRecognitionResultList;
	}
	
	interface SpeechRecognition extends EventTarget {
		continuous: boolean;
		interimResults: boolean;
		lang: string;
		maxAlternatives: number;
		onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
		onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
		onend: ((this: SpeechRecognition, ev: Event) => any) | null;
		onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
		onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
		onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
		onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
		onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
		onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
		onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
		onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
		abort(): void;
		start(): void;
		stop(): void;
	}
	
	interface SpeechRecognitionConstructor {
		new (): SpeechRecognition;
		prototype: SpeechRecognition;
	}
	
	interface Window {
		SpeechRecognition: SpeechRecognitionConstructor;
		webkitSpeechRecognition: SpeechRecognitionConstructor;
	}
}

export {};
