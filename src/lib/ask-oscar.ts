// Ask Oscar configuration and state management
import { writable } from 'svelte/store';

export const askOscarEnabled = writable<boolean>(false);
export const askOscarQuery = writable<string>('');
export const askOscarResponse = writable<string>('');
export const askOscarIsProcessing = writable<boolean>(false);
export const askOscarHistory = writable<string[]>([]);

// Ask Oscar functions
export function enableAskOscar() {
  askOscarEnabled.set(true);
}

export function disableAskOscar() {
  askOscarEnabled.set(false);
  askOscarQuery.set('');
  askOscarResponse.set('');
  askOscarIsProcessing.set(false);
  askOscarHistory.set([]);
}

export function setAskOscarQuery(query: string) {
  askOscarQuery.set(query);
}

export function updateAskOscarResponse(response: string) {
  askOscarResponse.set(response);
}

export function startAskOscarProcessing() {
  askOscarIsProcessing.set(true);
}

export function stopAskOscarProcessing() {
  askOscarIsProcessing.set(false);
}

export function addToAskOscarHistory(message: string) {
  askOscarHistory.update(history => [...history, message]);
}