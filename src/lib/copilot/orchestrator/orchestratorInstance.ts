/**
 * Orchestrator Instance
 * 
 * Singleton instance of the CopilotOrchestrator for use throughout the application.
 */

import { CopilotOrchestrator } from './orchestrator';

// Create singleton instance
export const orchestrator = new CopilotOrchestrator();

// Start the orchestrator automatically
orchestrator.start();

console.log('Orchestrator instance created and started');