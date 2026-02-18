/**
 * Project Context Store
 *
 * Single source of truth for project context across the application.
 * Eliminates the selectedProjectId vs currentProjectId conflict.
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { db } from '$lib/db';

export interface Project {
  id: string;
  name: string;
  description?: string;
  location?: string;
  client?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectContext {
  currentProjectId: string | null;
  currentProject: Project | null;
  projectHistory: string[]; // Array of project IDs in chronological order
  autoInferenceEnabled: boolean;
  lastInferenceTime: Date | null;
}

export type ChatMode = 'general' | 'global' | 'project';

const STORAGE_KEY = 'oscar_project_context';

// Default context
const defaultContext: ProjectContext = {
  currentProjectId: null,
  currentProject: null,
  projectHistory: [],
  autoInferenceEnabled: true,
  lastInferenceTime: null,
};

// Load from localStorage on browser
function loadFromStorage(): ProjectContext {
  if (!browser) return defaultContext;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return {
        ...parsed,
        lastInferenceTime: parsed.lastInferenceTime ? new Date(parsed.lastInferenceTime) : null,
      };
    }
  } catch (error) {
    console.error('Failed to load project context from storage:', error);
  }
  
  return defaultContext;
}

// Save to localStorage
function saveToStorage(context: ProjectContext) {
  if (!browser) return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  } catch (error) {
    console.error('Failed to save project context to storage:', error);
  }
}

// Create the store
function createProjectContextStore() {
  const initialContext = loadFromStorage();
  const { subscribe, set, update } = writable<ProjectContext>(initialContext);

  // Auto-save to localStorage on changes
  subscribe((context) => {
    saveToStorage(context);
  });

  return {
    subscribe,
    
    /**
     * Set the current project by ID
     */
    async setCurrentProject(projectId: string | null): Promise<void> {
      if (!projectId) {
        update(ctx => ({
          ...ctx,
          currentProjectId: null,
          currentProject: null,
        }));
        return;
      }

      try {
        // Load project from database
        const project = await db.projects.get(projectId);
        if (!project) {
          console.warn(`Project ${projectId} not found in database`);
          update(ctx => ({
            ...ctx,
            currentProjectId: null,
            currentProject: null,
          }));
          return;
        }

        update(ctx => {
          // Add to history if not already present
          const history = ctx.projectHistory.includes(projectId)
            ? ctx.projectHistory
            : [projectId, ...ctx.projectHistory].slice(0, 10); // Keep last 10 projects
          
          return {
            ...ctx,
            currentProjectId: projectId,
            currentProject: project as Project,
            projectHistory: history,
          };
        });
      } catch (error) {
        console.error('Failed to set current project:', error);
      }
    },

    /**
     * Clear current project context
     */
    clearCurrentProject(): void {
      update(ctx => ({
        ...ctx,
        currentProjectId: null,
        currentProject: null,
      }));
    },

    /**
     * Add project to history without setting as current
     */
    addToHistory(projectId: string): void {
      update(ctx => {
        const history = ctx.projectHistory.includes(projectId)
          ? ctx.projectHistory.filter(id => id !== projectId)
          : ctx.projectHistory;
        return {
          ...ctx,
          projectHistory: [projectId, ...history].slice(0, 10),
        };
      });
    },

    /**
     * Remove project from history
     */
    removeFromHistory(projectId: string): void {
      update(ctx => ({
        ...ctx,
        projectHistory: ctx.projectHistory.filter(id => id !== projectId),
      }));
    },

    /**
     * Toggle auto-inference
     */
    setAutoInferenceEnabled(enabled: boolean): void {
      update(ctx => ({
        ...ctx,
        autoInferenceEnabled: enabled,
        lastInferenceTime: enabled ? new Date() : null,
      }));
    },

    /**
     * Update last inference time
     */
    updateLastInferenceTime(): void {
      update(ctx => ({
        ...ctx,
        lastInferenceTime: new Date(),
      }));
    },

    /**
     * Get project from history by index
     */
    getProjectFromHistory(index: number): string | null {
      const ctx = get({ subscribe });
      return ctx.projectHistory[index] || null;
    },

    /**
     * Check if a project is in history
     */
    isInHistory(projectId: string): boolean {
      const ctx = get({ subscribe });
      return ctx.projectHistory.includes(projectId);
    },

    /**
     * Reset to default (for testing/debugging)
     */
    reset(): void {
      set(defaultContext);
      if (browser) {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
  };
}

export const projectContextStore = createProjectContextStore();

// Derived stores for convenience
export const currentProjectId = derived(
  projectContextStore,
  ($store) => $store.currentProjectId
);

export const currentProject = derived(
  projectContextStore,
  ($store) => $store.currentProject
);

export const projectHistory = derived(
  projectContextStore,
  ($store) => $store.projectHistory
);

export const autoInferenceEnabled = derived(
  projectContextStore,
  ($store) => $store.autoInferenceEnabled
);

/**
 * Check if we need confirmation for action
 */
export function needsConfirmation(mode: ChatMode, actionType: string): boolean {
  if (mode === 'general') {
    // General chat requires confirmation for all DB writes
    const writeActions = ['createTask', 'createNote', 'createProject', 'createBlogPost', 'createReport', 'createDiagram', 'createTree', 'updateObject'];
    return writeActions.includes(actionType);
  }
  return false;
}

// Interface for chat context state
export interface ChatContextState {
  mode: ChatMode;
  selectedProjectId: string;
  lastAIMessage: string;
  lastReferencedItem: any;
  lastCreatedItem: any;
  requiresConfirmation: boolean;
  pendingAction: {
    type: string;
    data: any;
    projectId?: string;
  } | null;
}

// Create chat context store
function createChatContextStore() {
  const { subscribe, set, update } = writable<ChatContextState>({
    mode: 'general',
    selectedProjectId: '',
    lastAIMessage: '',
    lastReferencedItem: null,
    lastCreatedItem: null,
    requiresConfirmation: false,
    pendingAction: null
  });

  // Sync with project context store
  projectContextStore.subscribe((ctx) => {
    const mode = ctx.currentProjectId ? 'project' : 'general';
    update(chatCtx => ({
      ...chatCtx,
      mode,
      selectedProjectId: ctx.currentProjectId || ''
    }));
  });

  return {
    subscribe,
    set,
    update,
    
    setMode(mode: ChatMode, projectId?: string) {
      if (mode === 'project' && projectId) {
        projectContextStore.setCurrentProject(projectId);
      } else if (mode === 'project' && !projectId) {
        // Try to get project from history
        const ctx = get(projectContextStore);
        if (ctx.projectHistory.length > 0) {
          projectContextStore.setCurrentProject(ctx.projectHistory[0]);
        }
      } else {
        projectContextStore.clearCurrentProject();
      }
      
      update(ctx => ({
        ...ctx,
        mode,
        selectedProjectId: projectId || (mode === 'project' ? ctx.selectedProjectId : ''),
        requiresConfirmation: false
      }));
    },
    
    setSelectedProjectId(projectId: string) {
      projectContextStore.setCurrentProject(projectId);
      update(ctx => ({
        ...ctx,
        mode: 'project',
        selectedProjectId: projectId,
        requiresConfirmation: false
      }));
    },
    
    setGeneralChat() {
      projectContextStore.clearCurrentProject();
      update(ctx => ({
        ...ctx,
        mode: 'general',
        selectedProjectId: '',
        requiresConfirmation: false
      }));
    },
    
    setGlobalWorkspace() {
      projectContextStore.clearCurrentProject();
      update(ctx => ({
        ...ctx,
        mode: 'global',
        selectedProjectId: '',
        requiresConfirmation: false
      }));
    },
    
    setLastAIMessage(message: string) {
      update(ctx => ({
        ...ctx,
        lastAIMessage: message
      }));
    },
    
    setLastReferencedItem(item: any) {
      update(ctx => ({
        ...ctx,
        lastReferencedItem: item
      }));
    },
    
    setLastCreatedItem(item: any) {
      update(ctx => ({
        ...ctx,
        lastCreatedItem: item
      }));
    },
    
    setPendingAction(action: ChatContextState['pendingAction']) {
      update(ctx => ({
        ...ctx,
        pendingAction: action,
        requiresConfirmation: !!action
      }));
    },
    
    clearPendingAction() {
      update(ctx => ({
        ...ctx,
        pendingAction: null,
        requiresConfirmation: false
      }));
    },
    
    confirmPendingAction() {
      update(ctx => ({
        ...ctx,
        pendingAction: null,
        requiresConfirmation: false
      }));
    },
    
    needsConfirmation() {
      const ctx = get({ subscribe });
      return !ctx.selectedProjectId; // Needs confirmation in general mode
    }
  };
}

export const chatContext = createChatContextStore();