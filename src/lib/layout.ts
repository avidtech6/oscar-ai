// Layout configuration store
import { writable } from 'svelte/store';

export const isDarkMode = writable<boolean>(false);
export const layoutMode = writable<'compact' | 'standard' | 'expanded'>('standard');
export const showHeader = writable<boolean>(true);
export const showFooter = writable<boolean>(true);
export const showToolbar = writable<boolean>(true);
export const showNotifications = writable<boolean>(true);

// Layout functions
export function toggleDarkMode() {
  isDarkMode.update(v => !v);
}

export function setLayoutMode(mode: 'compact' | 'standard' | 'expanded') {
  layoutMode.set(mode);
}

export function toggleHeader() {
  showHeader.update(v => !v);
}

export function toggleFooter() {
  showFooter.update(v => !v);
}

export function toggleToolbar() {
  showToolbar.update(v => !v);
}

export function toggleNotifications() {
  showNotifications.update(v => !v);
}