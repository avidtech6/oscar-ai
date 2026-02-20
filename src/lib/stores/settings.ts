import { writable, derived } from 'svelte/store';
import { getSetting, setSetting, deleteSetting, migrateLocalStorageToIndexedDB } from '$lib/db/index';
import { DROP_API_KEY } from '$lib/config/keys';

const GROQ_API_KEY_STORAGE = 'oscar_groq_api_key';
const GROK_API_KEY_STORAGE = 'oscar_grok_api_key';
const THEME_STORAGE = 'oscar_theme';
const SIDEBAR_COLLAPSED_STORAGE = 'oscar_sidebar_collapsed';
const DUMMY_DATA_ENABLED_KEY = 'oscar_dummy_data_enabled';
const CURRENT_PROJECT_ID_KEY = 'oscar_current_project_id';

// Load API keys from hardcoded constants
const DEFAULT_GROQ_API_KEY = DROP_API_KEY || '';
const DEFAULT_GROK_API_KEY = '';

export const groqApiKey = writable<string>('');
export const grokApiKey = writable<string>('');
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
    grokApiKey: string;
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
    dummyDataEnabled: boolean;
    currentProjectId: string;
}

// Create a writable settings store that combines all individual stores
export const settings = writable<Settings>({
    groqApiKey: '',
    grokApiKey: '',
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
        // Phase 5: No localStorage fallback - migration should be complete
        throw error; // Re-throw to handle at higher level
    }
}

// Helper function to delete setting from IndexedDB
async function deleteSettingFromIndexedDB(key: string): Promise<void> {
    try {
        await deleteSetting(key);
    } catch (error) {
        console.error(`Failed to delete setting ${key} from IndexedDB:`, error);
        // Phase 5: No localStorage fallback - migration should be complete
        throw error; // Re-throw to handle at higher level
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
    const [storedGroqKey, storedGrokKey, storedTheme, storedSidebar, storedDummyData, storedProjectId] = await Promise.all([
        getSetting(GROQ_API_KEY_STORAGE),
        getSetting(GROK_API_KEY_STORAGE),
        getSetting(THEME_STORAGE),
        getSetting(SIDEBAR_COLLAPSED_STORAGE),
        getSetting(DUMMY_DATA_ENABLED_KEY),
        getSetting(CURRENT_PROJECT_ID_KEY)
    ]);

    // Phase 5: No localStorage fallback - migration should be complete
    // Use IndexedDB values only, with defaults if undefined
    const finalGroqKey = storedGroqKey !== undefined ? storedGroqKey : DEFAULT_GROQ_API_KEY || '';
    const finalGrokKey = storedGrokKey !== undefined ? storedGrokKey : DEFAULT_GROK_API_KEY || '';
    const finalTheme = storedTheme !== undefined ? storedTheme : 'dark';
    const finalSidebar = storedSidebar !== undefined ? storedSidebar : false;
    const finalDummyData = storedDummyData !== undefined ? storedDummyData : false;
    const finalProjectId = storedProjectId !== undefined ? storedProjectId : '';

    // Build initial settings object
    const initialSettings: Settings = {
        groqApiKey: typeof finalGroqKey === 'string' ? finalGroqKey : '',
        grokApiKey: typeof finalGrokKey === 'string' ? finalGrokKey : '',
        theme: finalTheme === 'light' || finalTheme === 'dark' ? finalTheme : 'dark',
        sidebarCollapsed: finalSidebar === 'true' || finalSidebar === true,
        dummyDataEnabled: finalDummyData === 'true' || finalDummyData === true,
        currentProjectId: typeof finalProjectId === 'string' ? finalProjectId : ''
    };

    // Set the combined settings store
    settings.set(initialSettings);

    // Also set individual stores for backward compatibility
    groqApiKey.set(initialSettings.groqApiKey);
    grokApiKey.set(initialSettings.grokApiKey);
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

    grokApiKey.subscribe(async value => {
        settings.update(s => ({ ...s, grokApiKey: value }));
        if (value) {
            await saveSettingToIndexedDB(GROK_API_KEY_STORAGE, value);
        } else {
            await deleteSettingFromIndexedDB(GROK_API_KEY_STORAGE);
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
        grokApiKey.set(value.grokApiKey);
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
    grokApiKey.set('');
    theme.set('dark');
    sidebarCollapsed.set(false);
    dummyDataEnabled.set(false);
    currentProjectId.set('');
    settings.set({
        groqApiKey: '',
        grokApiKey: '',
        theme: 'dark',
        sidebarCollapsed: false,
        dummyDataEnabled: false,
        currentProjectId: ''
    });
    
    // Reload the page to ensure clean state
    window.location.reload();
}
