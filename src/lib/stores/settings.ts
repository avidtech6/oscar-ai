import { writable, derived, get } from 'svelte/store';

const GROQ_API_KEY_STORAGE = 'oscar_groq_api_key';
const THEME_STORAGE = 'oscar_theme';
const SIDEBAR_COLLAPSED_STORAGE = 'oscar_sidebar_collapsed';
const DUMMY_DATA_ENABLED_KEY = 'oscar_dummy_data_enabled';

// Default dev API key (replace with your own for production)
const DEFAULT_GROQ_API_KEY = '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';

export const groqApiKey = writable<string>('');
export const theme = writable<'light' | 'dark'>('dark');
export const sidebarCollapsed = writable<boolean>(false);
export const dummyDataEnabled = writable<boolean>(false);

export const groqModels = writable({
	chat: 'llama-3.1-70b-versatile',
	transcription: 'whisper-large-v3'
});

// Combined settings store
export interface Settings {
	groqApiKey: string;
	theme: 'light' | 'dark';
	sidebarCollapsed: boolean;
	dummyDataEnabled: boolean;
}

export const settings = derived(
	[groqApiKey, theme, sidebarCollapsed, dummyDataEnabled],
	([$groqApiKey, $theme, $sidebarCollapsed, $dummyDataEnabled]) => ({
		groqApiKey: $groqApiKey,
		theme: $theme,
		sidebarCollapsed: $sidebarCollapsed,
		dummyDataEnabled: $dummyDataEnabled
	})
);

// Initialize from localStorage
export function initSettings() {
	// Load API key - use default or from localStorage
	const storedKey = localStorage.getItem(GROQ_API_KEY_STORAGE);
	if (storedKey) {
		groqApiKey.set(storedKey);
	} else if (DEFAULT_GROQ_API_KEY) {
		// Use default dev key if no stored key
		groqApiKey.set(DEFAULT_GROQ_API_KEY);
		localStorage.setItem(GROQ_API_KEY_STORAGE, DEFAULT_GROQ_API_KEY);
	}

	// Load theme
	const storedTheme = localStorage.getItem(THEME_STORAGE) as 'light' | 'dark' | null;
	if (storedTheme) {
		theme.set(storedTheme);
	} else {
		theme.set('dark');
	}

	// Load sidebar state
	const storedSidebar = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE);
	if (storedSidebar) {
		sidebarCollapsed.set(storedSidebar === 'true');
	}

	// Load dummy data setting
	const storedDummyData = localStorage.getItem(DUMMY_DATA_ENABLED_KEY);
	dummyDataEnabled.set(storedDummyData === 'true');

	// Subscribe to changes
	groqApiKey.subscribe(value => {
		if (value) {
			localStorage.setItem(GROQ_API_KEY_STORAGE, value);
		} else {
			localStorage.removeItem(GROQ_API_KEY_STORAGE);
		}
	});

	theme.subscribe(value => {
		localStorage.setItem(THEME_STORAGE, value);
		document.documentElement.classList.toggle('dark', value === 'dark');
	});

	sidebarCollapsed.subscribe(value => {
		localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE, String(value));
	});

	dummyDataEnabled.subscribe(value => {
		localStorage.setItem(DUMMY_DATA_ENABLED_KEY, String(value));
	});
}

export function clearAllData() {
	localStorage.clear();
	indexedDB.deleteDatabase('OscarAI');
	window.location.reload();
}
