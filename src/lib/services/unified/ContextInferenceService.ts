/**
 * Context Inference Service
 * 
 * Unified service for inferring project context from messages and resolving pronoun references.
 * Replaces the missing contextInference.ts functionality.
 */

import { db, type Project } from '$lib/db';

export interface ProjectInferenceResult {
  project: Project | null;
  confidence: number; // 0-100%
  reason: string;
}

/**
 * Infer which project a message is referring to based on content
 * Returns shape expected by UI: { shouldSwitch, projectId, projectName, reason, multipleMatches? }
 */
export async function inferProjectFromMessage(
  message: string,
  availableProjects?: Project[]
): Promise<{
  shouldSwitch: boolean;
  projectId?: string;
  projectName?: string;
  reason: string;
  confidence?: number;
  multipleMatches?: Array<{ id: string; name: string }>;
}> {
  // If availableProjects not provided, fetch from database
  let projects = availableProjects;
  if (!projects || projects.length === 0) {
    try {
      projects = await db.projects.toArray();
    } catch (error) {
      console.error('Failed to fetch projects for inference:', error);
      projects = [];
    }
  }

  if (!message || !projects.length) {
    return {
      shouldSwitch: false,
      reason: 'No message or projects available'
    };
  }

  const messageLower = typeof message === 'string' ? message.toLowerCase() : String(message || '').toLowerCase();
  
  // Check for direct project name mentions
  const matchingProjects: Array<{ project: Project; confidence: number; reason: string }> = [];
  
  for (const project of projects) {
    const projectNameLower = project.name.toLowerCase();
    let confidence = 0;
    let reason = '';
    
    // Exact match
    if (messageLower.includes(projectNameLower)) {
      confidence = 90;
      reason = `Message mentions project name "${project.name}"`;
    }
    
    // Partial match (words from project name)
    if (confidence === 0) {
      const projectWords = projectNameLower.split(/[\s\-_]+/);
      const matchingWords = projectWords.filter(word =>
        word.length > 3 && messageLower.includes(word)
      );
      
      if (matchingWords.length >= 2) {
        confidence = 75;
        reason = `Message contains ${matchingWords.length} words from project name "${project.name}"`;
      }
    }
    
    // Check for location references
    if (confidence === 0 && project.location && messageLower.includes(project.location.toLowerCase())) {
      confidence = 80;
      reason = `Message mentions location "${project.location}"`;
    }
    
    // Check for client references
    if (confidence === 0 && project.client && messageLower.includes(project.client.toLowerCase())) {
      confidence = 85;
      reason = `Message mentions client "${project.client}"`;
    }
    
    // Check for project ID references
    if (confidence === 0) {
    	const projectIdPattern = /project[_\s-]?id[_\s-]?[:=]?[_\s-]?([a-f0-9-]+)/i;
    	if (typeof message === 'string') {
    		const projectIdMatch = message.match(projectIdPattern);
    		if (projectIdMatch) {
    			const projectId = projectIdMatch[1];
    			if (project.id === projectId) {
    				confidence = 95;
    				reason = `Message contains project ID "${projectId}"`;
    			}
    		}
    	}
    }
    
    // Check for tree species references (arboricultural context)
    if (confidence === 0 && project.id) {
      try {
        const trees = await db.trees.where('projectId').equals(project.id).toArray();
        const projectSpecies = trees.map(t => t.species.toLowerCase());
        const commonSpecies = ['oak', 'ash', 'beech', 'birch', 'chestnut', 'elm', 'fir', 'hawthorn', 'hazel', 'holly', 'hornbeam', 'larch', 'lime', 'maple', 'pine', 'poplar', 'rowan', 'spruce', 'sycamore', 'willow', 'yew'];
        
        for (const species of commonSpecies) {
          if (messageLower.includes(species) && projectSpecies.some(ps => ps.includes(species))) {
            confidence = 70;
            reason = `Message mentions tree species "${species}" found in project "${project.name}"`;
            break;
          }
        }
      } catch (error) {
        // Ignore DB errors for inference
      }
    }
    
    if (confidence > 0) {
      matchingProjects.push({ project, confidence, reason });
    }
  }
  
  // Sort by confidence (highest first)
  matchingProjects.sort((a, b) => b.confidence - a.confidence);
  
  // Handle multiple matches
  if (matchingProjects.length > 1) {
    // If top confidence is significantly higher than others, use it
    if (matchingProjects[0].confidence - matchingProjects[1].confidence > 20) {
      const bestMatch = matchingProjects[0];
      return {
        shouldSwitch: true,
        projectId: bestMatch.project.id,
        projectName: bestMatch.project.name,
        reason: bestMatch.reason,
        confidence: bestMatch.confidence
      };
    } else {
      // Multiple good matches - let user choose
      return {
        shouldSwitch: true,
        reason: `Multiple projects match your message`,
        multipleMatches: matchingProjects.map(mp => ({
          id: mp.project.id!,
          name: mp.project.name
        }))
      };
    }
  }
  
  // Single match or no match
  if (matchingProjects.length === 1) {
    const match = matchingProjects[0];
    return {
      shouldSwitch: match.confidence > 60, // Only switch if confidence > 60%
      projectId: match.project.id,
      projectName: match.project.name,
      reason: match.reason,
      confidence: match.confidence
    };
  }
  
  // No project inferred
  return {
    shouldSwitch: false,
    reason: 'No project references found in message'
  };
}

/**
 * Resolve pronoun references in a message based on context
 */
export function resolvePronounReference(
  message: string,
  context: {
    lastReferencedItem?: any;
    lastCreatedItem?: any;
    currentProject?: Project | null;
  }
): {
  resolvedMessage: string;
  replacements: Array<{ from: string; to: string; type: string }>;
} {
  let resolvedMessage = message;
  const replacements: Array<{ from: string; to: string; type: string }> = [];
  
  // Common pronoun patterns
  const pronounPatterns = [
    { pattern: /\b(it|that|this)\b/gi, type: 'item' },
    { pattern: /\b(he|she|they)\b/gi, type: 'person' },
    { pattern: /\b(here|there)\b/gi, type: 'location' },
    { pattern: /\b(now|then)\b/gi, type: 'time' }
  ];
  
  // Resolve based on context
  for (const { pattern, type } of pronounPatterns) {
  	if (typeof message === 'string') {
  		const matches = message.match(pattern);
  		if (matches) {
  			matches.forEach(match => {
  				const matchLower = match.toLowerCase();
  				let replacement = match;
  				
  				if (type === 'item') {
  					if (context.lastReferencedItem) {
  						const item = context.lastReferencedItem;
  						if (item.title) {
  							replacement = `"${item.title}"`;
  						} else if (item.name) {
  							replacement = `"${item.name}"`;
  						} else if (item.id) {
  							replacement = `item ${item.id.slice(0, 8)}`;
  						}
  					} else if (context.lastCreatedItem) {
  						const item = context.lastCreatedItem;
  						if (item.title) {
  							replacement = `"${item.title}"`;
  						} else if (item.name) {
  							replacement = `"${item.name}"`;
  						}
  					}
  				} else if (type === 'person' && context.currentProject?.client) {
  					replacement = context.currentProject.client;
  				} else if (type === 'location' && context.currentProject?.location) {
  					replacement = context.currentProject.location;
  				}
  				
  				if (replacement !== match) {
  					// Preserve original case
  					if (match === match.toUpperCase()) {
  						replacement = replacement.toUpperCase();
  					} else if (match[0] === match[0].toUpperCase()) {
  						replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
  					}
  					
  					resolvedMessage = resolvedMessage.replace(match, replacement);
  					replacements.push({ from: match, to: replacement, type });
  				}
  			});
  		}
  	}
  }
  
  return { resolvedMessage, replacements };
}

/**
 * Extract entities from message for context awareness
 */
export function extractEntities(message: string): {
  projects: string[];
  locations: string[];
  dates: string[];
  actions: string[];
} {
  const entities = {
    projects: [] as string[],
    locations: [] as string[],
    dates: [] as string[],
    actions: [] as string[]
  };
  
  // Ensure message is a string
  const safeMessage = typeof message === 'string' ? message : String(message || '');
  
  // Simple entity extraction (in production would use more sophisticated NLP)
  const words = safeMessage.toLowerCase().split(/\s+/);
  
  // Action words
  const actionWords = ['create', 'add', 'update', 'delete', 'edit', 'save', 'generate', 'write', 'record', 'transcribe'];
  entities.actions = words.filter(word => actionWords.includes(word));
  
  // Date patterns (simple)
  const datePatterns = [
    /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/, // DD-MM-YYYY
    /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/, // YYYY-MM-DD
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i, // Month DD, YYYY
    /\b\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\b/i // DD Month YYYY
  ];
  
  datePatterns.forEach(pattern => {
  	if (typeof safeMessage === 'string') {
  		const matches = safeMessage.match(pattern);
  		if (matches) {
  			entities.dates.push(...matches);
  		}
  	}
  });
  
  return entities;
}

/**
 * Get context summary for AI prompts
 */
export function getContextSummary(context: {
  currentProject?: Project | null;
  lastItems?: any[];
  mode?: 'general' | 'project' | 'global';
}): string {
  let summary = '';
  
  if (context.mode) {
    summary += `Mode: ${context.mode.toUpperCase()}\n`;
  }
  
  if (context.currentProject) {
    summary += `Current Project: ${context.currentProject.name}\n`;
    if (context.currentProject.location) {
      summary += `Location: ${context.currentProject.location}\n`;
    }
    if (context.currentProject.client) {
      summary += `Client: ${context.currentProject.client}\n`;
    }
  }
  
  if (context.lastItems && context.lastItems.length > 0) {
    summary += `Recent Items: ${context.lastItems.length} item(s) referenced\n`;
  }
  
  return summary.trim();
}

/**
 * Generate a context switch proposal message based on inference result
 */
export function proposeContextSwitch(inferenceResult: {
  project?: Project | null;
  confidence?: number;
  reason?: string;
  projectName?: string;
}): string {
  if (!inferenceResult.project && !inferenceResult.projectName) {
    return 'No project context inferred from message.';
  }
  
  const projectName = inferenceResult.project?.name || inferenceResult.projectName || 'Unknown Project';
  const confidence = inferenceResult.confidence || 0;
  const reason = inferenceResult.reason || 'Project reference detected';
  
  if (confidence > 80) {
    return `Your message appears to be about "${projectName}". Would you like to switch to this project?`;
  } else if (confidence > 60) {
    return `Your message might be related to "${projectName}". Switch to this project?`;
  } else {
    return `Your message could be related to "${projectName}". Would you like to switch?`;
  }
}

/**
 * Get available context switch options for UI display
 */
export function getContextSwitchOptions(
  currentMode: 'general' | 'project' | 'global',
  availableProjects: Project[],
  currentProjectId?: string
): Array<{
  id: string;
  label: string;
  description: string;
  icon: string;
  action: 'switch' | 'stay' | 'create';
}> {
  const options: Array<{
    id: string;
    label: string;
    description: string;
    icon: string;
    action: 'switch' | 'stay' | 'create';
  }> = [];
  
  // Always include "Stay in current mode" option
  if (currentMode === 'general') {
    options.push({
      id: 'general',
      label: 'Stay in General Chat',
      description: 'Continue without project context',
      icon: '💬',
      action: 'stay'
    });
  } else if (currentMode === 'project' && currentProjectId) {
    const currentProject = availableProjects.find(p => p.id === currentProjectId);
    if (currentProject) {
      options.push({
        id: 'current',
        label: `Stay in ${currentProject.name}`,
        description: 'Continue with current project',
        icon: '📁',
        action: 'stay'
      });
    }
  }
  
  // Add available projects for switching
  availableProjects.forEach(project => {
    if (project.id && project.id !== currentProjectId) {
      options.push({
        id: project.id,
        label: `Switch to ${project.name}`,
        description: project.location ? `Location: ${project.location}` : 'No location specified',
        icon: '🔄',
        action: 'switch'
      });
    }
  });
  
  // Add "Create new project" option
  options.push({
    id: 'create',
    label: 'Create New Project',
    description: 'Start a new project for this conversation',
    icon: '➕',
    action: 'create'
  });
  
  return options;
}

// Singleton service instance
export const contextInferenceService = {
  inferProjectFromMessage,
  resolvePronounReference,
  extractEntities,
  getContextSummary,
  proposeContextSwitch,
  getContextSwitchOptions
};

export default contextInferenceService;