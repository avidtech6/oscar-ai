// Navigation store for managing application state
import { writable } from 'svelte/store';

export const currentPage = writable<string>('home');
export const activeTab = writable<string>('overview');
export const showNavigation = writable<boolean>(true);
export const showSidebar = writable<boolean>(true);

// Navigation functions
export function navigate(page: string) {
  currentPage.set(page);
}

export function setActiveTab(tab: string) {
  activeTab.set(tab);
}

export function toggleSidebar() {
  showSidebar.update(v => !v);
}

export function toggleNavigation() {
  showNavigation.update(v => !v);
}