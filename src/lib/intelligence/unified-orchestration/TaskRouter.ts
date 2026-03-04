/**
 * TaskRouter – routes tasks to capabilities based on priority, affinity, and load.
 *
 * Responsibilities:
 * - Select the best capability for a given task
 * - Apply routing rules (priority, affinity, load balancing)
 * - Provide fallback routing
 * - No business logic, no external dependencies
 *
 * FreshVibe Rules:
 * - Single responsibility (routing only)
 * - No side effects
 * - Deterministic, synchronous
 * - Max 80 lines per function
 */

import type { TaskDescriptor, CapabilityDescriptor } from './OrchestrationKernel';

export interface RoutingRule {
	priority: number;
	affinity?: string[];
	loadThreshold?: number;
	fallback?: string;
}

export interface RoutingResult {
	capabilityId: string;
	reason: string;
	fallbackUsed: boolean;
}

/**
 * TaskRouter – stateless router.
 */
export class TaskRouter {
	private rules: Map<string, RoutingRule> = new Map();

	constructor() {
		// Default rule for all tasks
		this.rules.set('default', {
			priority: 1,
			loadThreshold: 0.8,
			fallback: 'none',
		});
	}

	/**
	 * Add a routing rule for a capability.
	 */
	addRule(capabilityId: string, rule: RoutingRule): void {
		this.rules.set(capabilityId, rule);
	}

	/**
	 * Remove a routing rule.
	 */
	removeRule(capabilityId: string): void {
		this.rules.delete(capabilityId);
	}

	/**
	 * Route a task to the best capability.
	 */
	route(
		task: TaskDescriptor,
		capabilities: CapabilityDescriptor[],
		loadMap: Map<string, number> // capabilityId -> load (0‑1)
	): RoutingResult {
		if (capabilities.length === 0) {
			throw new Error('No capabilities available');
		}

		// Filter capabilities that can handle the task
		const capable = capabilities.filter((cap) => cap.canHandle(task));
		if (capable.length === 0) {
			throw new Error(`No capable handler for task ${task.id}`);
		}

		// Apply routing rules
		const candidates = capable.map((cap) => {
			const rule = this.rules.get(cap.id) ?? this.rules.get('default')!;
			const load = loadMap.get(cap.id) ?? 0;
			const score = this.computeScore(task, cap, rule, load);
			return { capability: cap, score, rule, load };
		});

		// Sort by score descending
		candidates.sort((a, b) => b.score - a.score);
		const best = candidates[0];

		// Check load threshold
		const rule = best.rule;
		if (rule.loadThreshold !== undefined && best.load > rule.loadThreshold) {
			// Use fallback if defined
			if (rule.fallback && rule.fallback !== 'none') {
				const fallbackCap = capabilities.find((cap) => cap.id === rule.fallback);
				if (fallbackCap && fallbackCap.canHandle(task)) {
					return {
						capabilityId: fallbackCap.id,
						reason: `load exceeded (${best.load.toFixed(2)} > ${rule.loadThreshold}), fell back to ${rule.fallback}`,
						fallbackUsed: true,
					};
				}
			}
		}

		return {
			capabilityId: best.capability.id,
			reason: `highest score (${best.score.toFixed(2)})`,
			fallbackUsed: false,
		};
	}

	/**
	 * Compute a routing score for a capability.
	 */
	private computeScore(
		task: TaskDescriptor,
		capability: CapabilityDescriptor,
		rule: RoutingRule,
		load: number
	): number {
		let score = 0;

		// Priority multiplier
		score += rule.priority * 10;

		// Affinity bonus
		if (rule.affinity?.includes(task.capability)) {
			score += 5;
		}

		// Load penalty
		score -= load * 3;

		// Capability version bonus (simple heuristic)
		if (capability.version.startsWith('2.')) {
			score += 2;
		}

		return score;
	}
}