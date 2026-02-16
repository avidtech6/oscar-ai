import { writable, derived } from 'svelte/store';

const GROQ_API_KEY_STORAGE = 'oscar_groq_api_key';
const THEME_STORAGE = 'oscar_theme';
const SIDEBAR_COLLAPSED_STORAGE = 'oscar_sidebar_collapsed';
const DUMMY_DATA_ENABLED_KEY = 'oscar_dummy_data_enabled';
const CURRENT_PROJECT_ID_KEY = 'oscar_current_project_id';

// Load API key from environment (correct + safe)
const DEFAULT_GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

export const groqApiKey = writable<string>('');
export const theme = writable<'light' | 'dark'>('dark');
export const sidebarCollapsed = writable<boolean>(false);
export const dummyDataEnabled = writable<boolean>(false);
export const currentProjectId = writable<string>('');

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
    currentProjectId: string;
}

// Create a writable settings store that combines all individual stores
export const settings = writable<Settings>({
    groqApiKey: '',
    theme: 'dark',
    sidebarCollapsed: false,
    dummyDataEnabled: false,
    currentProjectId: ''
});

// Initialize from localStorage
export function initSettings() {
    // Load all settings from localStorage
    const storedKey = localStorage.getItem(GROQ_API_KEY_STORAGE);
    const storedTheme = localStorage.getItem(THEME_STORAGE) as 'light' | 'dark' | null;
    const storedSidebar = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE);
    const storedDummyData = localStorage.getItem(DUMMY_DATA_ENABLED_KEY);
    const storedProjectId = localStorage.getItem(CURRENT_PROJECT_ID_KEY);

    // Build initial settings object
    const initialSettings: Settings = {
        groqApiKey: storedKey || DEFAULT_GROQ_API_KEY || '',
        theme: storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark',
        sidebarCollapsed: storedSidebar === 'true',
        dummyDataEnabled: storedDummyData === 'true',
        currentProjectId: storedProjectId || ''
    };

    // Set the combined settings store
    settings.set(initialSettings);

    // Also set individual stores for backward compatibility
    groqApiKey.set(initialSettings.groqApiKey);
    theme.set(initialSettings.theme);
    sidebarCollapsed.set(initialSettings.sidebarCollapsed);
    dummyDataEnabled.set(initialSettings.dummyDataEnabled);
    currentProjectId.set(initialSettings.currentProjectId);

    // Subscribe to changes in individual stores to keep combined store in sync
    groqApiKey.subscribe(value => {
        settings.update(s => ({ ...s, groqApiKey: value }));
        if (value) {
            localStorage.setItem(GROQ_API_KEY_STORAGE, value);
        } else {
            localStorage.removeItem(GROQ_API_KEY_STORAGE);
        }
    });

    theme.subscribe(value => {
        settings.update(s => ({ ...s, theme: value }));
        localStorage.setItem(THEME_STORAGE, value);
        document.documentElement.classList.toggle('dark', value === 'dark');
    });

    sidebarCollapsed.subscribe(value => {
        settings.update(s => ({ ...s, sidebarCollapsed: value }));
        localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE, String(value));
    });

    dummyDataEnabled.subscribe(value => {
        settings.update(s => ({ ...s, dummyDataEnabled: value }));
        localStorage.setItem(DUMMY_DATA_ENABLED_KEY, String(value));
    });

    currentProjectId.subscribe(value => {
        settings.update(s => ({ ...s, currentProjectId: value }));
        if (value) {
            localStorage.setItem(CURRENT_PROJECT_ID_KEY, value);
        } else {
            localStorage.removeItem(CURRENT_PROJECT_ID_KEY);
        }
    });

    // Also subscribe to changes in combined store to keep individual stores in sync
    settings.subscribe(value => {
        groqApiKey.set(value.groqApiKey);
        theme.set(value.theme);
        sidebarCollapsed.set(value.sidebarCollapsed);
        dummyDataEnabled.set(value.dummyDataEnabled);
        currentProjectId.set(value.currentProjectId);
    });
}

export function clearAllData() {
    localStorage.clear();
    indexedDB.deleteDatabase('OscarAI');
    window.location.reload();
}
