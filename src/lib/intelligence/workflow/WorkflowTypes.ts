/**
 * Workflow Intelligence Layer – Type Definitions (Phase 25)
 *
 * Defines nodes, edges, and structures for the workflow graph,
 * project‑level reasoning, cross‑document intelligence, and task generation.
 *
 * This file re‑exports all types from the split modules for backward compatibility.
 */

import type { Note } from '../../components/index';
import type { Report } from '../../components/index';
import type { MediaItem } from '../media/MediaTypes';
import type { TaskDescriptor } from '../unified-orchestration/OrchestrationKernel';

export * from './WorkflowGraphTypes';
export * from './WorkflowProjectTypes';
export * from './WorkflowMultiDocumentTypes';
export * from './WorkflowEventTypes';
export * from './WorkflowConfigTypes';

// Re‑export the imported types for compatibility (they may be used elsewhere)
export type { Note, Report, MediaItem, TaskDescriptor };