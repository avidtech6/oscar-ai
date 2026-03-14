/**
 * Task Generation Rules (extracted from AutomaticTaskGenerationEngine)
 * 
 * Contains default rule definitions and rule types.
 */

import type { WorkflowNode, GeneratedTask } from './WorkflowTypes';
import type { CrossDocumentIntelligenceEngine } from './CrossDocumentIntelligenceEngine';

export interface TaskGenerationRule {
	/** Rule ID */
	id: string;
	/** Description */
	description: string;
	/** Condition function (returns true if rule applies) */
	condition: (node: WorkflowNode) => boolean;
	/** Generate task from node */
	generate: (node: WorkflowNode) => Omit<GeneratedTask, 'id' | 'createdAt' | 'updatedAt'>;
	/** Priority (1‑5) */
	priority: number;
	/** Confidence threshold (0‑1) */
	confidenceThreshold: number;
}

/**
 * Build the default rule set.
 */
export function buildDefaultRules(crossDoc?: CrossDocumentIntelligenceEngine): TaskGenerationRule[] {
	return [
		{
			id: 'note_contains_action',
			description: 'Note contains action words (need to, must, should, todo)',
			condition: (node) => {
				if (node.type !== 'note') return false;
				const content = (node.metadata.content || '').toLowerCase();
				const actionWords = ['need to', 'must', 'should', 'todo', 'task', 'do', 'finish', 'complete'];
				return actionWords.some(word => content.includes(word));
			},
			generate: (node) => ({
				title: `Task from note: ${node.label.substring(0, 50)}`,
				description: `Generated from note "${node.label}".\n\nContent: ${node.metadata.content?.substring(0, 200) || ''}`,
				sourceNodeIds: [node.id],
				priority: 3,
				estimatedDuration: 60,
				deadline: undefined,
				assignedTo: undefined,
				status: 'pending',
			}),
			priority: 3,
			confidenceThreshold: 0.7,
		},
		{
			id: 'report_incomplete_section',
			description: 'Report has incomplete sections',
			condition: (node) => {
				if (node.type !== 'report') return false;
				return node.metadata.status !== 'completed' && node.metadata.sections?.some((s: any) => !s.completed);
			},
			generate: (node) => ({
				title: `Complete section in report: ${node.label}`,
				description: `Report "${node.label}" has incomplete sections that need attention.`,
				sourceNodeIds: [node.id],
				priority: 4,
				estimatedDuration: 120,
				deadline: node.metadata.deadline ? new Date(node.metadata.deadline) : undefined,
				assignedTo: undefined,
				status: 'pending',
			}),
			priority: 4,
			confidenceThreshold: 0.8,
		},
		{
			id: 'voice_note_transcribed',
			description: 'Voice note recently transcribed',
			condition: (node) => {
				if (node.type !== 'voiceNote') return false;
				// If transcribed within last 24 hours
				const transcribedAt = node.metadata.transcribedAt;
				if (!transcribedAt) return false;
				const age = Date.now() - new Date(transcribedAt).getTime();
				return age < 24 * 60 * 60 * 1000;
			},
			generate: (node) => ({
				title: `Review transcribed voice note: ${node.label}`,
				description: `Voice note "${node.label}" was recently transcribed. Review and create follow‑up actions.`,
				sourceNodeIds: [node.id],
				priority: 2,
				estimatedDuration: 15,
				deadline: undefined,
				assignedTo: undefined,
				status: 'pending',
			}),
			priority: 2,
			confidenceThreshold: 0.6,
		},
		{
			id: 'user_behavior_frequent_note',
			description: 'User frequently creates notes on a topic',
			condition: (node) => {
				if (node.type !== 'note') return false;
				// Simplified: if note has tags that appear often
				const tags = node.tags;
				if (tags.length === 0) return false;
				// For now, just a placeholder
				return tags.includes('urgent') || tags.includes('followup');
			},
			generate: (node) => ({
				title: `Follow up on topic: ${node.tags.join(', ')}`,
				description: `Multiple notes tagged with ${node.tags.join(', ')} suggest a need for a dedicated task.`,
				sourceNodeIds: [node.id],
				priority: 3,
				estimatedDuration: 90,
				deadline: undefined,
				assignedTo: undefined,
				status: 'pending',
			}),
			priority: 3,
			confidenceThreshold: 0.5,
		},
		{
			id: 'cross_doc_suggestion',
			description: 'Cross‑document intelligence suggests a task',
			condition: (node) => {
				if (node.type !== 'note') return false;
				if (!crossDoc) return false;
				const detection = crossDoc.detectNoteShouldBecomeTask(node.entityId);
				return detection.should && detection.confidence >= 0.7;
			},
			generate: (node) => ({
				title: `Task suggested by AI: ${node.label}`,
				description: `Cross‑document analysis indicates this note should become a task.`,
				sourceNodeIds: [node.id],
				priority: 3,
				estimatedDuration: 45,
				deadline: undefined,
				assignedTo: undefined,
				status: 'pending',
			}),
			priority: 3,
			confidenceThreshold: 0.7,
		},
	];
}