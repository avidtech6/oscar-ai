/**
 * Action Executor Service
 * 
 * Centralized action execution with mode-aware rules and unified confirmation logic.
 * Follows "Don't Be Dumb" rules for safe execution.
 */

import { get } from 'svelte/store';
import { projectContextStore, chatContext } from './ProjectContextStore';
import { unifiedIntentEngine, type IntentResult } from './UnifiedIntentEngine';
import { db } from '$lib/db';

export interface ActionData {
  [key: string]: any;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  requiresConfirmation?: boolean;
  conversionOptions?: string[];
  redirectUrl?: string;
}

export interface ExecutionContext {
  mode: 'general' | 'project' | 'global';
  projectId: string | null;
  userId?: string;
  timestamp: Date;
}

export class ActionExecutorService {
  constructor() {
    // Unified execution is now fully enabled
  }

  /**
   * Execute an action with proper context and safety checks
   */
  async execute(
    intentResult: IntentResult,
    rawData?: ActionData
  ): Promise<ActionResult> {
    const context = this.getExecutionContext();
    const data = rawData || intentResult.data;

    // Check if action requires confirmation
    const needsConfirmation = this.needsConfirmation(intentResult, context);
    
    if (needsConfirmation) {
      return {
        success: false,
        message: 'Action requires confirmation',
        requiresConfirmation: true,
        conversionOptions: intentResult.conversionOptions,
        data,
      };
    }

    // Unified execution
    try {
      const result = await this.executeUnified(intentResult, data, context);
      return result;
    } catch (error) {
      console.error('Error executing action:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to execute action',
        data,
      };
    }
  }

  /**
   * Check if an action requires confirmation based on "Don't Be Dumb" rules
   */
  needsConfirmation(intentResult: IntentResult, context: ExecutionContext): boolean {
    const { intent, confidence, data } = intentResult;
    
    // Rule 1: Never hallucinate tasks - low confidence requires clarification
    if (confidence < 60) {
      return true;
    }

    // Rule 2: Data-modifying actions in General mode require confirmation
    const dataModifyingIntents = [
      'task', 'note', 'project', 'blog', 'report', 'diagram', 'tree',
      'voice_note', 'dictation', 'transcription',
    ];
    
    if (context.mode === 'general' && intent && dataModifyingIntents.includes(intent)) {
      return true;
    }

    // Rule 3: Voice notes without clear project context require confirmation
    if (intent && (intent === 'voice_note' || intent === 'dictation') && !context.projectId) {
      return true;
    }

    // Rule 4: Medium confidence (60-80%) requires confirmation
    if (confidence >= 60 && confidence < 80) {
      return true;
    }

    // Rule 5: Destructive actions always require explicit confirmation
    const destructiveIntents = ['delete', 'remove', 'archive', 'trash'];
    const isDestructive = destructiveIntents.some(destructive => {
      const text = data?.text;
      const hasTextMatch = text && typeof text === 'string' && text.toLowerCase().includes(destructive);
      const hasIntentMatch = intentResult.intent && intentResult.intent.includes(destructive);
      return hasTextMatch || hasIntentMatch;
    });
    
    if (isDestructive) {
      return true;
    }

    // Rule 6: Missing required fields for the intent type
    if (intent && this.hasMissingRequiredFields(intent, data)) {
      return true;
    }

    // Rule 7: Potential duplicate items (async check - we'll handle this in execute method)
    // Note: We can't do async checks here, so we'll handle duplicates in the execution phase

    return false;
  }

  /**
   * Check if data has missing required fields for the given intent
   */
  private hasMissingRequiredFields(intent: string, data: Record<string, any>): boolean {
    const requiredFields: Record<string, string[]> = {
      task: ['title'],
      note: ['content'],
      project: ['name'],
      blog: ['title', 'content'],
      report: ['title', 'type'],
      voice_note: ['audioBlob'],
      dictation: ['transcript'],
    };

    const fields = requiredFields[intent];
    if (!fields) return false;

    return fields.some(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });
  }

  /**
   * Check for duplicate items before creation
   */
  private async checkForDuplicates(intent: string, data: Record<string, any>, context: ExecutionContext): Promise<boolean> {
    try {
      switch (intent) {
        case 'task':
          // Check for tasks with same title in same project
          if (data.title && context.projectId) {
            const existingTasks = await db.tasks
              .where('title')
              .equals(data.title)
              .and(task => task.projectId === context.projectId)
              .toArray();
            return existingTasks.length > 0;
          }
          break;
          
        case 'note':
          // Check for notes with same content in same project
          if (data.content && context.projectId) {
            const existingNotes = await db.notes
              .where('content')
              .equals(data.content)
              .and(note => note.projectId === context.projectId)
              .toArray();
            return existingNotes.length > 0;
          }
          break;
          
        case 'project':
          // Check for projects with same name
          if (data.name) {
            const existingProjects = await db.projects
              .where('name')
              .equals(data.name)
              .toArray();
            return existingProjects.length > 0;
          }
          break;
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
    }
    
    return false;
  }

  /**
   * Get conversion options for an intent in General Chat mode
   */
  getConversionOptions(intent: string): string[] {
    const optionsMap: Record<string, string[]> = {
      task: ['Save as task', 'Convert to note', 'Add to project', 'Ignore'],
      note: ['Save as note', 'Convert to task', 'Add to project', 'Ignore'],
      project: ['Create project', 'Save as draft', 'Ignore'],
      blog: ['Save as blog', 'Publish now', 'Save as draft', 'Ignore'],
      report: ['Generate report', 'Save as template', 'Ignore'],
      diagram: ['Create diagram', 'Save as image', 'Ignore'],
      tree: ['Add tree record', 'Save as note', 'Ignore'],
      voice_note: ['Save as voice note', 'Transcribe to text', 'Add to project', 'Ignore'],
      dictation: ['Save as text', 'Convert to note', 'Add to project', 'Ignore'],
      transcription: ['Save transcript', 'Attach to project', 'Ignore'],
    };

    return optionsMap[intent] || [];
  }

  /**
   * Execute with confirmation (after user has confirmed)
   */
  async executeWithConfirmation(
    intentResult: IntentResult,
    data: ActionData,
    conversionOption?: string
  ): Promise<ActionResult> {
    const context = this.getExecutionContext();
    
    // Apply conversion option if provided
    const finalData = this.applyConversionOption(data, conversionOption);

    try {
      const result = await this.executeUnified(intentResult, finalData, context);
      return result;
    } catch (error) {
      console.error('Error executing confirmed action:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to execute confirmed action',
        data: finalData,
      };
    }
  }

  /**
   * Get current execution context
   */
  private getExecutionContext(): ExecutionContext {
    const ctx = get(projectContextStore);
    return {
      mode: ctx.currentProjectId ? 'project' : 'general',
      projectId: ctx.currentProjectId,
      timestamp: new Date(),
    };
  }

  /**
   * Execute using unified system only (legacy fallback removed)
   */
  private async executeUnifiedOnly(
    intentResult: IntentResult,
    data: ActionData,
    context: ExecutionContext
  ): Promise<ActionResult> {
    // For unsupported intents, return error instead of falling back to legacy
    return {
      success: false,
      message: `Intent "${intentResult.intent}" is not yet supported in unified execution`,
      data,
    };
  }

  /**
   * Execute using unified system
   */
  private async executeUnified(
    intentResult: IntentResult,
    data: ActionData,
    context: ExecutionContext
  ): Promise<ActionResult> {
    const { intent } = intentResult;
    
    switch (intent) {
      case 'task':
        return await this.executeCreateTask(data, context);
      case 'note':
        return await this.executeCreateNote(data, context);
      case 'project':
        return await this.executeCreateProject(data, context);
      case 'voice_note':
        return await this.executeCreateVoiceNote(data, context);
      case 'dictation':
        return await this.executeCreateDictation(data, context);
      case 'query':
        return await this.executeQuery(data, context);
      default:
        // For unsupported intents, return error
        return await this.executeUnifiedOnly(intentResult, data, context);
    }
  }

  /**
   * Apply conversion option to data
   */
  private applyConversionOption(data: ActionData, conversionOption?: string): ActionData {
    if (!conversionOption) return data;
    
    const modified = { ...data };
    
    switch (conversionOption) {
      case 'Convert to note':
        modified.type = 'note';
        break;
      case 'Convert to task':
        modified.type = 'task';
        break;
      case 'Add to project':
        // Will be handled by context
        break;
      case 'Save as draft':
        modified.status = 'draft';
        break;
      case 'Transcribe to text':
        modified.transcribe = true;
        break;
    }
    
    return modified;
  }


  // Specific execution methods
  private async executeCreateTask(data: ActionData, context: ExecutionContext): Promise<ActionResult> {
    try {
      const taskData = {
        title: data.title || 'New Task',
        content: data.content || '',
        status: 'todo',
        priority: data.priority || 'medium',
        projectId: context.projectId || data.projectId,
        tags: data.tags || [],
        dueDate: data.dueDate,
      };
      
      // Check for duplicates
      const isDuplicate = await this.checkForDuplicates('task', taskData, context);
      if (isDuplicate) {
        return {
          success: false,
          message: `A task with title "${taskData.title}" already exists in this project`,
          requiresConfirmation: false,
          data: taskData,
        };
      }
      
      const taskId = await db.tasks.add(taskData as any);
      
      return {
        success: true,
        message: `Task "${taskData.title}" created successfully`,
        data: { taskId },
        redirectUrl: `/tasks?task=${taskId}`,
      };
    } catch (error) {
      console.error('Error creating task:', error);
      return {
        success: false,
        message: 'Failed to create task',
        data,
      };
    }
  }

  private async executeCreateNote(data: ActionData, context: ExecutionContext): Promise<ActionResult> {
    try {
      const noteData = {
        title: data.title || 'Quick Note',
        content: data.content || '',
        projectId: context.projectId || data.projectId,
        tags: data.tags || [],
        type: data.type || 'general',
      };
      
      // Check for duplicates
      const isDuplicate = await this.checkForDuplicates('note', noteData, context);
      if (isDuplicate) {
        return {
          success: false,
          message: `A note with similar content already exists in this project`,
          requiresConfirmation: false,
          data: noteData,
        };
      }
      
      const noteId = await db.notes.add(noteData as any);
      
      return {
        success: true,
        message: `Note "${noteData.title}" created successfully`,
        data: { noteId },
        redirectUrl: `/notes?note=${noteId}`,
      };
    } catch (error) {
      console.error('Error creating note:', error);
      return {
        success: false,
        message: 'Failed to create note',
        data,
      };
    }
  }

  private async executeCreateProject(data: ActionData, context: ExecutionContext): Promise<ActionResult> {
    try {
      const projectData = {
        name: data.name || 'New Project',
        description: data.description || '',
        location: data.location || '',
        client: data.client || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Check for duplicates
      const isDuplicate = await this.checkForDuplicates('project', projectData, context);
      if (isDuplicate) {
        return {
          success: false,
          message: `A project named "${projectData.name}" already exists`,
          requiresConfirmation: false,
          data: projectData,
        };
      }
      
      const projectId = await db.projects.add(projectData as any);
      
      // Set as current project
      await projectContextStore.setCurrentProject(projectId as string);
      
      return {
        success: true,
        message: `Project "${projectData.name}" created successfully`,
        data: { projectId },
        redirectUrl: `/project/${projectId}`,
      };
    } catch (error) {
      console.error('Error creating project:', error);
      return {
        success: false,
        message: 'Failed to create project',
        data,
      };
    }
  }

  private async executeCreateVoiceNote(data: ActionData, context: ExecutionContext): Promise<ActionResult> {
    try {
      // Import VoiceRecordingService (dynamic import to avoid circular dependency)
      const { voiceRecordingService } = await import('./VoiceRecordingService');
      
      // Save audio to IndexedDB using VoiceRecordingService
      const voiceNoteId = await voiceRecordingService.saveVoiceNote({
        projectId: context.projectId || data.projectId,
        audioBlob: data.audioBlob,
        transcript: data.transcript || '',
        intent: data.intent || 'voice_note',
        metadata: {
          duration: data.duration || 0,
          ...(data.metadata || {})
        }
      });
      
      if (!voiceNoteId) {
        throw new Error('Failed to save voice note to database');
      }
      
      return {
        success: true,
        message: 'Voice note saved successfully',
        data: { voiceNoteId },
        redirectUrl: context.projectId ? `/project/${context.projectId}` : '/notes',
      };
    } catch (error) {
      console.error('Error creating voice note:', error);
      return {
        success: false,
        message: 'Failed to save voice note',
        data,
      };
    }
  }

  private async executeCreateDictation(data: ActionData, context: ExecutionContext): Promise<ActionResult> {
    try {
      // Convert dictation to note
      const noteData = {
        title: 'Dictated Note',
        content: data.transcript || data.text || '',
        projectId: context.projectId || data.projectId,
        tags: ['dictation', 'voice'],
        type: 'dictation',
      };
      
      const noteId = await db.notes.add(noteData as any);
      
      return {
        success: true,
        message: 'Dictation saved as note',
        data: { noteId },
        redirectUrl: `/notes?note=${noteId}`,
      };
    } catch (error) {
      console.error('Error saving dictation:', error);
      return {
        success: false,
        message: 'Failed to save dictation',
        data,
      };
    }
  }

  private async executeQuery(data: ActionData, context: ExecutionContext): Promise<ActionResult> {
    try {
      const { objectType, status, searchTerm } = data;
      
      let objects: any[] = [];
      let redirectUrl = '/';
      
      switch (objectType) {
        case 'tasks':
          if (status) {
            objects = await db.tasks.where('status').equals(status).toArray();
          } else if (context.projectId) {
            objects = await db.tasks.where('projectId').equals(context.projectId).toArray();
          } else {
            objects = await db.tasks.toArray();
          }
          redirectUrl = '/tasks';
          break;
          
        case 'notes':
          if (context.projectId) {
            objects = await db.notes.where('projectId').equals(context.projectId).toArray();
          } else {
            objects = await db.notes.toArray();
          }
          redirectUrl = '/notes';
          break;
          
        case 'projects':
          objects = await db.projects.orderBy('updatedAt').reverse().toArray();
          redirectUrl = '/workspace';
          break;
      }
      
      // Filter by search term
      if (searchTerm && objects.length > 0) {
        const term = searchTerm.toLowerCase();
        objects = objects.filter(obj => {
          const title = (obj.title || obj.name || '').toLowerCase();
          const content = (obj.content || obj.description || '').toLowerCase();
          return title.includes(term) || content.includes(term);
        });
      }
      
      return {
        success: true,
        message: `Found ${objects.length} ${objectType}`,
        data: { objects, objectType, status, searchTerm },
        redirectUrl,
      };
    } catch (error) {
      console.error('Error executing query:', error);
      return {
        success: false,
        message: 'Failed to execute query',
        data,
      };
    }
  }

}

// Singleton instance
export const actionExecutorService = new ActionExecutorService();