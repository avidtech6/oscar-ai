import { writable, derived } from 'svelte/store';
import { getSetting, setSetting, deleteSetting, migrateLocalStorageToIndexedDB } from '$lib/db/index';
import { credentialManager } from '$lib/system/CredentialManager';

const GROQ_API_KEY_STORAGE = 'oscar_groq_api_key';
const THEME_STORAGE = 'oscar_theme';
const SIDEBAR_COLLAPSED_STORAGE = 'oscar_sidebar_collapsed';
const DUMMY_DATA_ENABLED_KEY = 'oscar_dummy_data_enabled';
const CURRENT_PROJECT_ID_KEY = 'oscar_current_project_id';

// Load API keys from CredentialManager
const DEFAULT_GROQ_API_KEY = '';

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
    const [storedGroqKey, storedTheme, storedSidebar, storedDummyData, storedProjectId] = await Promise.all([
        getSetting(GROQ_API_KEY_STORAGE),
        getSetting(THEME_STORAGE),
        getSetting(SIDEBAR_COLLAPSED_STORAGE),
        getSetting(DUMMY_DATA_ENABLED_KEY),
        getSetting(CURRENT_PROJECT_ID_KEY)
    ]);

    // Phase 5: No localStorage fallback - migration should be complete
    // Use IndexedDB values only, with defaults if undefined
    let defaultGroqKey = '';
    try {
        // Try to get default from CredentialManager if it's ready
        if (credentialManager.isReady()) {
            defaultGroqKey = credentialManager.getGroqKey() || '';
        }
    } catch (error) {
        console.warn('CredentialManager not ready for default Groq key:', error);
    }
    
    const finalGroqKey = storedGroqKey !== undefined ? storedGroqKey : defaultGroqKey;
    const finalTheme = storedTheme !== undefined ? storedTheme : 'dark';
    const finalSidebar = storedSidebar !== undefined ? storedSidebar : false;
    const finalDummyData = storedDummyData !== undefined ? storedDummyData : false;
    const finalProjectId = storedProjectId !== undefined ? storedProjectId : '';

    // Build initial settings object
    const initialSettings: Settings = {
        groqApiKey: typeof finalGroqKey === 'string' ? finalGroqKey : '',
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
