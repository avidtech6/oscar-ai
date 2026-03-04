/**
 * CapabilityRegistry – central registry for intelligence capabilities.
 *
 * Responsibilities:
 * - Register and unregister capabilities
 * - Query capabilities by ID, name, or tags
 * - Validate capability definitions
 * - Provide capability metadata
 * - No side effects, no external dependencies
 *
 * FreshVibe Rules:
 * - Single responsibility (registry only)
 * - Immutable after registration (no runtime modification of capability internals)
 * - Deterministic queries
 */

import type { CapabilityDescriptor } from './OrchestrationKernel';

export interface CapabilityMetadata {
	id: string;
	name: string;
	version: string;
	description: string;
	tags: string[];
	author: string;
	createdAt: number;
	updatedAt: number;
}

export interface CapabilityQuery {
	id?: string;
	name?: string;
	tag?: string;
	minVersion?: string;
}

/**
 * CapabilityRegistry – central capability store.
 */
export class CapabilityRegistry {
	private capabilities: Map<string, CapabilityDescriptor> = new Map();
	private metadata: Map<string, CapabilityMetadata> = new Map();

	/**
	 * Register a capability with metadata.
	 */
	register(
		descriptor: CapabilityDescriptor,
		metadata: Omit<CapabilityMetadata, 'id' | 'createdAt' | 'updatedAt'>
	): void {
		const id = descriptor.id;

		// Validate uniqueness
		if (this.capabilities.has(id)) {
			throw new Error(`Capability ${id} already registered`);
		}

		// Validate descriptor
		this.validateDescriptor(descriptor);

		// Store capability
		this.capabilities.set(id, descriptor);

		// Store metadata
		const now = Date.now();
		this.metadata.set(id, {
			...metadata,
			id,
			createdAt: now,
			updatedAt: now,
		});
	}

	/**
	 * Unregister a capability.
	 */
	unregister(id: string): void {
		this.capabilities.delete(id);
		this.metadata.delete(id);
	}

	/**
	 * Get a capability descriptor by ID.
	 */
	getDescriptor(id: string): CapabilityDescriptor | undefined {
		return this.capabilities.get(id);
	}

	/**
	 * Get capability metadata by ID.
	 */
	getMetadata(id: string): CapabilityMetadata | undefined {
		return this.metadata.get(id);
	}

	/**
	 * Query capabilities.
	 */
	query(query: CapabilityQuery): CapabilityDescriptor[] {
		const results: CapabilityDescriptor[] = [];

		for (const [id, descriptor] of this.capabilities) {
			const meta = this.metadata.get(id)!;

			// Apply filters
			if (query.id && descriptor.id !== query.id) continue;
			if (query.name && meta.name !== query.name) continue;
			if (query.tag && !meta.tags.includes(query.tag)) continue;
			if (query.minVersion && this.compareVersions(meta.version, query.minVersion) < 0) continue;

			results.push(descriptor);
		}

		return results;
	}

	/**
	 * List all capability IDs.
	 */
	listIds(): string[] {
		return Array.from(this.capabilities.keys());
	}

	/**
	 * Check if a capability exists.
	 */
	has(id: string): boolean {
		return this.capabilities.has(id);
	}

	/**
	 * Update capability metadata (partial update).
	 */
	updateMetadata(id: string, updates: Partial<Omit<CapabilityMetadata, 'id' | 'createdAt'>>): void {
		const existing = this.metadata.get(id);
		if (!existing) {
			throw new Error(`Capability ${id} not found`);
		}

		this.metadata.set(id, {
			...existing,
			...updates,
			updatedAt: Date.now(),
		});
	}

	/**
	 * Validate a capability descriptor.
	 */
	private validateDescriptor(descriptor: CapabilityDescriptor): void {
		if (!descriptor.id || typeof descriptor.id !== 'string') {
			throw new Error('Capability must have a string id');
		}
		if (!descriptor.name || typeof descriptor.name !== 'string') {
			throw new Error('Capability must have a string name');
		}
		if (!descriptor.version || typeof descriptor.version !== 'string') {
			throw new Error('Capability must have a string version');
		}
		if (typeof descriptor.canHandle !== 'function') {
			throw new Error('Capability must have a canHandle function');
		}
		if (typeof descriptor.execute !== 'function') {
			throw new Error('Capability must have an execute function');
		}
	}

	/**
	 * Compare semantic versions (simplified).
	 */
	private compareVersions(a: string, b: string): number {
		const aParts = a.split('.').map(Number);
		const bParts = b.split('.').map(Number);

		for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
			const aVal = aParts[i] || 0;
			const bVal = bParts[i] || 0;
			if (aVal !== bVal) {
				return aVal - bVal;
			}
		}
		return 0;
	}
}