// Copilot configuration and state management
import { writable } from 'svelte/store';

export const copilotEnabled = writable<boolean>(false);
export const copilotMode = writable<'assistant' | 'expert' | 'creative'>('assistant');
export const copilotResponse = writable<string>('');
export const copilotIsProcessing = writable<boolean>(false);
export const copilotHistory = writable<string[]>([]);

// Copilot functions
export function enableCopilot() {
  copilotEnabled.set(true);
}

export function disableCopilot() {
  copilotEnabled.set(false);
  copilotResponse.set('');
  copilotIsProcessing.set(false);
  copilotHistory.set([]);
}

export function setCopilotMode(mode: 'assistant' | 'expert' | 'creative') {
  copilotMode.set(mode);
}

export function updateCopilotResponse(response: string) {
  copilotResponse.set(response);
}

export function startProcessing() {
  copilotIsProcessing.set(true);
}

export function stopProcessing() {
  copilotIsProcessing.set(false);
}

export function addToHistory(message: string) {
  copilotHistory.update(history => [...history, message]);
}