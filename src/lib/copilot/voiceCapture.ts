/**
 * Voice transcription capture and integration with Copilot input pipeline.
 */

import { writable } from 'svelte/store';

export interface VoiceTranscription {
	text: string;
	timestamp: Date;
	duration?: number; // seconds
	intent?: string;
	confidence?: number;
}

export const voiceTranscriptions = writable<VoiceTranscription[]>([]);

/**
 * Add a voice transcription to the store.
 */
export function addVoiceTranscription(
	text: string,
	duration?: number,
	intent?: string,
	confidence?: number
): void {
	const transcription: VoiceTranscription = {
		text,
		timestamp: new Date(),
		duration,
		intent,
		confidence
	};
	
	voiceTranscriptions.update(transcripts => [...transcripts, transcription]);
	
	// Dispatch event for other components
	window.dispatchEvent(new CustomEvent('copilot:voice-transcription', {
		detail: transcription
	}));
}

/**
 * Clear all voice transcriptions.
 */
export function clearVoiceTranscriptions(): void {
	voiceTranscriptions.set([]);
}

/**
 * Get the latest voice transcription.
 */
export function getLatestTranscription(): VoiceTranscription | null {
	let value: VoiceTranscription[] = [];
	voiceTranscriptions.subscribe(v => value = v)();
	return value.length > 0 ? value[value.length - 1] : null;
}