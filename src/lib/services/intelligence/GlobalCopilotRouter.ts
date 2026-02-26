/**
 * Global Copilot Router
 * 
 * Routes queries to the appropriate context:
 * - Global Copilot: General queries, smalltalk, ambiguous queries
 * - Subsystem-specific: Task, note, project, media actions
 * - Mixed intent: Uses decision sheet for clarification
 */

import { acknowledgementStore } from '$lib/stores/acknowledgementStore';
import { debugStore } from '$lib/stores/debugStore';
import type { IntelligenceIntentResult } from './IntentClassifier';

export type RoutingDestination =
  | 'global-copilot'
  | 'tasks-subsystem'
  | 'notes-subsystem'
  | 'projects-subsystem'
  | 'gallery-subsystem'
  | 'voice-subsystem'
  | 'files-subsystem'
  | 'calendar-subsystem'
  | 'reports-subsystem'
  | 'camera-subsystem'
  | 'email-subsystem'
  | 'decision-sheet'
  | 'ambiguous';

export interface RoutingDecision {
  destination: RoutingDestination;
  confidence: number;
  reason: string;
  requiresConfirmation: boolean;
  alternativeDestinations?: RoutingDestination[];
}

export class GlobalCopilotRouter {
  /**
   * Determine routing destination for a prompt
   */
  determineRouting(
    prompt: string,
    intelligenceIntent?: IntelligenceIntentResult
  ): RoutingDecision {
    console.log('[GlobalCopilotRouter] Determining routing for prompt:', prompt.substring(0, 100));
    
    // If we have intelligence intent, use its routing decision
    if (intelligenceIntent) {
      return this.routeBasedOnIntelligenceIntent(intelligenceIntent, prompt);
    }
    
    // Fallback: simple keyword-based routing
    return this.routeBasedOnKeywords(prompt);
  }
  
  /**
   * Route based on intelligence intent classification
   */
  private routeBasedOnIntelligenceIntent(
    intelligenceIntent: IntelligenceIntentResult,
    prompt: string
  ): RoutingDecision {
    const { intelligenceIntent: intent, contextDetection, shouldRouteToGlobalCopilot } = intelligenceIntent;
    
    // Check if should route to global Copilot
    if (shouldRouteToGlobalCopilot) {
      return {
        destination: 'global-copilot',
        confidence: intelligenceIntent.confidence,
        reason: `Intent: ${intent} - Should route to global Copilot`,
        requiresConfirmation: false,
      };
    }
    
    // Route based on intent type
    switch (intent) {
      case 'smalltalk':
        return {
          destination: 'global-copilot',
          confidence: 95,
          reason: 'Smalltalk should be handled by global Copilot',
          requiresConfirmation: false,
        };
        
      case 'ambiguous':
        return {
          destination: 'decision-sheet',
          confidence: 70,
          reason: 'Ambiguous intent requires clarification',
          requiresConfirmation: true,
          alternativeDestinations: ['global-copilot', 'notes-subsystem', 'tasks-subsystem'],
        };
        
      case 'task_action':
        return {
          destination: 'tasks-subsystem',
          confidence: intelligenceIntent.confidence,
          reason: 'Task action should be handled by tasks subsystem',
          requiresConfirmation: intelligenceIntent.unifiedIntent.requiresConfirmation,
        };
        
      case 'note_action':
        return {
          destination: 'notes-subsystem',
          confidence: intelligenceIntent.confidence,
          reason: 'Note action should be handled by notes subsystem',
          requiresConfirmation: intelligenceIntent.unifiedIntent.requiresConfirmation,
        };
        
      case 'media_action':
        // Media actions need more specific routing
        return this.routeMediaAction(intelligenceIntent, prompt);
        
      case 'navigation_action':
        // Navigation to specific subsystem
        if (contextDetection.subsystem) {
          const subsystem = contextDetection.subsystem;
          const destination = this.mapSubsystemToDestination(subsystem);
          return {
            destination,
            confidence: contextDetection.confidence * 100,
            reason: `Navigation to ${subsystem} subsystem`,
            requiresConfirmation: true,
          };
        }
        return {
          destination: 'decision-sheet',
          confidence: 60,
          reason: 'Navigation action requires destination selection',
          requiresConfirmation: true,
        };
        
      case 'query_action':
        // Queries could be global or subsystem-specific
        if (contextDetection.subsystem) {
          const destination = this.mapSubsystemToDestination(contextDetection.subsystem);
          return {
            destination,
            confidence: 75,
            reason: `Query about ${contextDetection.subsystem}`,
            requiresConfirmation: false,
          };
        }
        return {
          destination: 'global-copilot',
          confidence: 80,
          reason: 'General query should be handled by global Copilot',
          requiresConfirmation: false,
        };
        
      case 'command_action':
        // Commands are usually subsystem-specific
        if (contextDetection.subsystem) {
          const destination = this.mapSubsystemToDestination(contextDetection.subsystem);
          return {
            destination,
            confidence: 85,
            reason: `Command for ${contextDetection.subsystem} subsystem`,
            requiresConfirmation: intelligenceIntent.unifiedIntent.requiresConfirmation,
          };
        }
        return {
          destination: 'global-copilot',
          confidence: 70,
          reason: 'General command',
          requiresConfirmation: intelligenceIntent.unifiedIntent.requiresConfirmation,
        };
        
      case 'requires_decision_sheet':
        return {
          destination: 'decision-sheet',
          confidence: 90,
          reason: 'Requires decision sheet for clarification',
          requiresConfirmation: true,
        };
        
      default:
        return {
          destination: 'global-copilot',
          confidence: 60,
          reason: `Unknown intent: ${intent}`,
          requiresConfirmation: false,
        };
    }
  }
  
  /**
   * Route media actions to appropriate subsystem
   */
  private routeMediaAction(
    intelligenceIntent: IntelligenceIntentResult,
    prompt: string
  ): RoutingDecision {
    const { mediaAction, contextDetection } = intelligenceIntent;
    
    // Default media routing
    const mediaRouting: Record<string, RoutingDestination> = {
      'photo_capture': 'camera-subsystem',
      'photo_upload': 'gallery-subsystem',
      'voice_recording': 'voice-subsystem',
      'voice_transcription': 'voice-subsystem',
      'file_upload': 'files-subsystem',
      'file_download': 'files-subsystem',
      'camera_scan': 'camera-subsystem',
    };
    
    let destination: RoutingDestination = 'gallery-subsystem'; // Default
    
    if (mediaAction && mediaRouting[mediaAction]) {
      destination = mediaRouting[mediaAction];
    }
    
    // Check if context suggests different destination
    if (contextDetection.subsystem) {
      const contextDestination = this.mapSubsystemToDestination(contextDetection.subsystem);
      if (contextDestination !== destination) {
        // Conflict: media type vs context
        return {
          destination: 'decision-sheet',
          confidence: 70,
          reason: `Media action (${mediaAction}) conflicts with context (${contextDetection.subsystem})`,
          requiresConfirmation: true,
          alternativeDestinations: [destination, contextDestination],
        };
      }
    }
    
    return {
      destination,
      confidence: intelligenceIntent.confidence,
      reason: `Media action: ${mediaAction || 'unknown'}`,
      requiresConfirmation: intelligenceIntent.requiresDecisionSheet,
    };
  }
  
  /**
   * Fallback: route based on keywords
   */
  private routeBasedOnKeywords(prompt: string): RoutingDecision {
    const normalizedPrompt = prompt.toLowerCase().trim();
    
    // Keyword patterns for different subsystems
    const keywordPatterns: Array<{
      pattern: RegExp;
      destination: RoutingDestination;
      confidence: number;
      reason: string;
    }> = [
      {
        pattern: /\b(hello|hi|hey|how are you|what's up|good morning|good afternoon|good evening)\b/i,
        destination: 'global-copilot',
        confidence: 95,
        reason: 'Smalltalk',
      },
      {
        pattern: /\b(what can you do|help|capabilities|features)\b/i,
        destination: 'global-copilot',
        confidence: 90,
        reason: 'General query about capabilities',
      },
      {
        pattern: /\b(task|todo|reminder|deadline|do|complete)\b/i,
        destination: 'tasks-subsystem',
        confidence: 85,
        reason: 'Task-related keywords',
      },
      {
        pattern: /\b(note|write|journal|memo|document)\b/i,
        destination: 'notes-subsystem',
        confidence: 85,
        reason: 'Note-related keywords',
      },
      {
        pattern: /\b(project|workspace|team|collaborate|plan)\b/i,
        destination: 'projects-subsystem',
        confidence: 85,
        reason: 'Project-related keywords',
      },
      {
        pattern: /\b(photo|image|picture|gallery|camera)\b/i,
        destination: 'gallery-subsystem',
        confidence: 90,
        reason: 'Photo/media keywords',
      },
      {
        pattern: /\b(voice|audio|record|speak|dictate|transcribe)\b/i,
        destination: 'voice-subsystem',
        confidence: 90,
        reason: 'Voice/audio keywords',
      },
      {
        pattern: /\b(file|document|pdf|upload|download)\b/i,
        destination: 'files-subsystem',
        confidence: 85,
        reason: 'File-related keywords',
      },
      {
        pattern: /\b(calendar|schedule|meeting|appointment|date|time)\b/i,
        destination: 'calendar-subsystem',
        confidence: 90,
        reason: 'Calendar-related keywords',
      },
      {
        pattern: /\b(report|summary|analysis|data|statistics)\b/i,
        destination: 'reports-subsystem',
        confidence: 85,
        reason: 'Report-related keywords',
      },
      {
        pattern: /\b(email|inbox|send|reply|message)\b/i,
        destination: 'email-subsystem',
        confidence: 90,
        reason: 'Email-related keywords',
      },
    ];
    
    // Find the best match
    let bestMatch = {
      destination: 'global-copilot' as RoutingDestination,
      confidence: 60,
      reason: 'No specific keywords detected',
      requiresConfirmation: false,
    };
    
    for (const { pattern, destination, confidence, reason } of keywordPatterns) {
      if (pattern.test(normalizedPrompt)) {
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            destination,
            confidence,
            reason,
            requiresConfirmation: confidence < 80,
          };
        }
      }
    }
    
    // Check for ambiguous references
    const ambiguousPatterns = [/\b(this|that|it|they|them|those)\b/i];
    const hasAmbiguousReference = ambiguousPatterns.some(pattern => pattern.test(normalizedPrompt));
    
    if (hasAmbiguousReference && bestMatch.confidence < 70) {
      return {
        destination: 'decision-sheet',
        confidence: 65,
        reason: 'Ambiguous reference detected',
        requiresConfirmation: true,
        alternativeDestinations: ['global-copilot', 'notes-subsystem', 'tasks-subsystem'],
      };
    }
    
    return bestMatch;
  }
  
  /**
   * Map subsystem name to routing destination
   */
  private mapSubsystemToDestination(subsystem: string): RoutingDestination {
    const mapping: Record<string, RoutingDestination> = {
      'email': 'email-subsystem',
      'gallery': 'gallery-subsystem',
      'tasks': 'tasks-subsystem',
      'calendar': 'calendar-subsystem',
      'files': 'files-subsystem',
      'notes': 'notes-subsystem',
      'projects': 'projects-subsystem',
      'reports': 'reports-subsystem',
      'voice': 'voice-subsystem',
      'camera': 'camera-subsystem',
    };
    
    return mapping[subsystem] || 'global-copilot';
  }
  
  /**
   * Execute routing decision
   */
  async executeRouting(
    decision: RoutingDecision,
    originalPrompt: string,
    intelligenceIntent?: IntelligenceIntentResult
  ): Promise<void> {
    console.log('[GlobalCopilotRouter] Executing routing decision:', decision);
    debugStore.log('GlobalCopilotRouter', 'executeRouting', { decision, originalPrompt });
    
    // Show acknowledgement
    if (decision.destination === 'global-copilot') {
      acknowledgementStore.showInfo('Processing in global context...', 1500);
    } else if (decision.destination === 'decision-sheet') {
      acknowledgementStore.showInfo('Opening decision sheet...', 1500);
    } else {
      acknowledgementStore.showInfo(`Routing to ${decision.destination.replace('-subsystem', '')}...`, 1500);
    }
    
    // In a real implementation, this would:
    // 1. Navigate to the appropriate subsystem/page
    // 2. Set context for that subsystem
    // 3. Process the prompt in the new context
    // 4. Return result
    
    // For now, just log the routing
    console.log(`[GlobalCopilotRouter] Would route to: ${decision.destination}`);
    console.log(`[GlobalCopilotRouter] Reason: ${decision.reason}`);
    console.log(`[GlobalCopilotRouter] Confidence: ${decision.confidence}%`);
    
    if (decision.requiresConfirmation && decision.destination !== 'decision-sheet') {
      console.log('[GlobalCopilotRouter] Routing requires confirmation');
      // In real implementation, would show confirmation dialog
    }
  }
  
  /**
   * Get human-readable description of a destination
   */
  getDestinationDescription(destination: RoutingDestination): string {
    const descriptions: Record<RoutingDestination, string> = {
      'global-copilot': 'Global Copilot (general queries)',
      'tasks-subsystem': 'Tasks subsystem',
      'notes-subsystem': 'Notes subsystem',
      'projects-subsystem': 'Projects subsystem',
      'gallery-subsystem': 'Gallery subsystem',
      'voice-subsystem': 'Voice subsystem',
      'files-subsystem': 'Files subsystem',
      'calendar-subsystem': 'Calendar subsystem',
      'reports-subsystem': 'Reports subsystem',
      'camera-subsystem': 'Camera subsystem',
      'email-subsystem': 'Email subsystem',
      'decision-sheet': 'Decision sheet (requires clarification)',
      'ambiguous': 'Ambiguous (needs clarification)',
    };
    
    return descriptions[destination] || destination;
  }
  
  /**
   * Check if a destination is a subsystem (not global)
   */
  isSubsystemDestination(destination: RoutingDestination): boolean {
    return destination.endsWith('-subsystem') && destination !== 'global-copilot';
  }
  
  /**
   * Get the subsystem name from a destination
   */
  getSubsystemName(destination: RoutingDestination): string | null {
    if (this.isSubsystemDestination(destination)) {
      return destination.replace('-subsystem', '');
    }
    return null;
  }
}

// Singleton instance
export const globalCopilotRouter = new GlobalCopilotRouter();