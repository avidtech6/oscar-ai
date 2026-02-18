/**
 * Chat Context Store (Compatibility Layer)
 * 
 * This file provides backward compatibility for the old chatContext API
 * while using the new unified ProjectContextStore under the hood.
 * 
 * IMPORTANT: This is a BREAKING CHANGE migration step.
 * All new code should import from '$lib/services/unified/ProjectContextStore' directly.
 */

// Re-export everything from the unified ProjectContextStore
export {
  chatContext,
  projectContextStore,
  currentProjectId,
  currentProject,
  projectHistory,
  autoInferenceEnabled,
  needsConfirmation,
  type ChatMode,
  type Project,
  type ProjectContext,
  type ChatContextState
} from '$lib/services/unified/ProjectContextStore';

// Note: The following functions from the old chatContext.ts are not used anywhere
// and have been removed as part of the consolidation:
// - getTopProjects
// - shouldAutoExecute
// 
// If any code was using these functions, it should be updated to use
// the unified store directly.