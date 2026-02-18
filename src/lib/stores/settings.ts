import { writable, derived } from 'svelte/store';
import { getSetting, setSetting, deleteSetting, migrateLocalStorageToIndexedDB } from '$lib/db/index';

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

// Helper function to save setting to IndexedDB
async function saveSettingToIndexedDB(key: string, value: any): Promise<void> {
    try {
        await setSetting(key, value);
    } catch (error) {
        console.error(`Failed to save setting ${key} to IndexedDB:`, error);
        // Fallback to localStorage for backward compatibility
        if (typeof value === 'string') {
            localStorage.setItem(key, value);
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }
}

// Helper function to delete setting from IndexedDB
async function deleteSettingFromIndexedDB(key: string): Promise<void> {
    try {
        await deleteSetting(key);
    } catch (error) {
        console.error(`Failed to delete setting ${key} from IndexedDB:`, error);
        // Fallback to localStorage
        localStorage.removeItem(key);
    }
}

// Initialize from IndexedDB (with localStorage fallback)
export async function initSettings() {
    // First, migrate any existing localStorage settings to IndexedDB
    try {
        await migrateLocalStorageToIndexedDB();
    } catch (error) {
        console.warn('Failed to migrate localStorage to IndexedDB:', error);
    }

    // Load all settings from IndexedDB (with localStorage fallback)
    const [storedKey, storedTheme, storedSidebar, storedDummyData, storedProjectId] = await Promise.all([
        getSetting(GROQ_API_KEY_STORAGE),
        getSetting(THEME_STORAGE),
        getSetting(SIDEBAR_COLLAPSED_STORAGE),
        getSetting(DUMMY_DATA_ENABLED_KEY),
        getSetting(CURRENT_PROJECT_ID_KEY)
    ]);

    // Fallback to localStorage if IndexedDB returns undefined
    const finalKey = storedKey !== undefined ? storedKey : (localStorage.getItem(GROQ_API_KEY_STORAGE) || DEFAULT_GROQ_API_KEY || '');
    const finalTheme = storedTheme !== undefined ? storedTheme : (localStorage.getItem(THEME_STORAGE) as 'light' | 'dark' | null);
    const finalSidebar = storedSidebar !== undefined ? storedSidebar : localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE);
    const finalDummyData = storedDummyData !== undefined ? storedDummyData : localStorage.getItem(DUMMY_DATA_ENABLED_KEY);
    const finalProjectId = storedProjectId !== undefined ? storedProjectId : localStorage.getItem(CURRENT_PROJECT_ID_KEY);

    // Build initial settings object
    const initialSettings: Settings = {
        groqApiKey: typeof finalKey === 'string' ? finalKey : '',
        theme: finalTheme === 'light' || finalTheme === 'dark' ? finalTheme : 'dark',
        sidebarCollapsed: finalSidebar === 'true' || finalSidebar === true,
        dummyDataEnabled: finalDummyData === 'true' || finalDummyData === true,
        currentProjectId: typeof finalProjectId === 'string' ? finalProjectId : ''
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
    groqApiKey.subscribe(async value => {
        settings.update(s => ({ ...s, groqApiKey: value }));
        if (value) {
            await saveSettingToIndexedDB(GROQ_API_KEY_STORAGE, value);
        } else {
            await deleteSettingFromIndexedDB(GROQ_API_KEY_STORAGE);
        }
    });

    theme.subscribe(async value => {
        settings.update(s => ({ ...s, theme: value }));
        await saveSettingToIndexedDB(THEME_STORAGE, value);
        document.documentElement.classList.toggle('dark', value === 'dark');
    });

    sidebarCollapsed.subscribe(async value => {
        settings.update(s => ({ ...s, sidebarCollapsed: value }));
        await saveSettingToIndexedDB(SIDEBAR_COLLAPSED_STORAGE, value);
    });

    dummyDataEnabled.subscribe(async value => {
        settings.update(s => ({ ...s, dummyDataEnabled: value }));
        await saveSettingToIndexedDB(DUMMY_DATA_ENABLED_KEY, value);
    });

    currentProjectId.subscribe(async value => {
        settings.update(s => ({ ...s, currentProjectId: value }));
        if (value) {
            await saveSettingToIndexedDB(CURRENT_PROJECT_ID_KEY, value);
        } else {
            await deleteSettingFromIndexedDB(CURRENT_PROJECT_ID_KEY);
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

export async function clearAllData() {
    // Clear localStorage
    localStorage.clear();
    
    // Clear IndexedDB database
    try {
        indexedDB.deleteDatabase('OscarAI');
    } catch (error) {
        console.error('Failed to delete IndexedDB database:', error);
    }
    
    // Reset all stores to default values
    groqApiKey.set('');
    theme.set('dark');
    sidebarCollapsed.set(false);
    dummyDataEnabled.set(false);
    currentProjectId.set('');
    settings.set({
        groqApiKey: '',
        theme: 'dark',
        sidebarCollapsed: false,
        dummyDataEnabled: false,
        currentProjectId: ''
    });
    
    // Reload the page to ensure clean state
    window.location.reload();
}
