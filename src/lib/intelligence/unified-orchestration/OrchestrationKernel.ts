/**
 * OrchestrationKernel – central coordination engine for unified intelligence.
 *
 * Responsibilities:
 * - Register and manage capabilities
 * - Route tasks to appropriate handlers
 * - Enforce runtime guards
 * - Maintain lifecycle state
 * - Propagate errors to ErrorBoundary
 *
 * FreshVibe Rules:
 * - Single responsibility (orchestration only)
 * - No business logic
 * - No UI dependencies
 * - No external API calls
 * - Deterministic, synchronous core
 */

export type CapabilityId = string;
export type TaskId = string;
export type LifecycleState = 'idle' | 'initialising' | 'ready' | 'running' | 'paused' | 'stopped' | 'error';

export interface TaskDescriptor {
	id: TaskId;
	capability: CapabilityId;
	payload: unknown;
	priority: number;
	createdAt: number;
}

export interface CapabilityDescriptor {
	id: CapabilityId;
	name: string;
	version: string;
	canHandle: (task: TaskDescriptor) => boolean;
	execute: (task: TaskDescriptor) => Promise<unknown>;
}

/**
 * OrchestrationKernel – the core orchestrator.
 */
export class OrchestrationKernel {
	private capabilities: Map<CapabilityId, CapabilityDescriptor> = new Map();
	private tasks: Map<TaskId, TaskDescriptor> = new Map();
	private lifecycle: LifecycleState = 'idle';
	private errorHandler?: (error: Error) => void;

	constructor() {
		// Kernel starts idle
	}

	/**
	 * Register a capability.
	 */
	registerCapability(capability: CapabilityDescriptor): void {
		if (this.capabilities.has(capability.id)) {
			throw new Error(`Capability ${capability.id} already registered`);
		}
		this.capabilities.set(capability.id, capability);
	}

	/**
	 * Unregister a capability.
	 */
	unregisterCapability(id: CapabilityId): void {
		this.capabilities.delete(id);
	}

	/**
	 * Submit a task for execution.
	 */
	submitTask(task: Omit<TaskDescriptor, 'id' | 'createdAt'> & { id?: TaskId }): TaskId {
		if (this.lifecycle !== 'ready' && this.lifecycle !== 'running') {
			throw new Error(`Kernel not ready (state: ${this.lifecycle})`);
		}

		const taskId = task.id ?? `task_${Date.now()}_${Math.random().toString(36).substring(2)}`;
		const fullTask: TaskDescriptor = {
			...task,
			id: taskId,
			createdAt: Date.now(),
		};

		this.tasks.set(taskId, fullTask);
		this.routeTask(fullTask).catch((err) => {
			this.handleError(err);
		});

		return taskId;
	}

	/**
	 * Route a task to the appropriate capability.
	 */
	private async routeTask(task: TaskDescriptor): Promise<void> {
		const candidates = Array.from(this.capabilities.values()).filter((cap) => cap.canHandle(task));
		if (candidates.length === 0) {
			throw new Error(`No capability can handle task ${task.id}`);
		}

		// Simple priority: pick first capable (could be enhanced)
		const chosen = candidates[0];
		try {
			await chosen.execute(task);
		} catch (err) {
			this.handleError(err instanceof Error ? err : new Error(String(err)));
		}
	}

	/**
	 * Start the kernel.
	 */
	async start(): Promise<void> {
		if (this.lifecycle !== 'idle') {
			throw new Error(`Cannot start from state ${this.lifecycle}`);
		}
		this.lifecycle = 'initialising';
		// Initialisation logic (none for now)
		this.lifecycle = 'ready';
	}

	/**
	 * Stop the kernel.
	 */
	async stop(): Promise<void> {
		this.lifecycle = 'stopped';
		this.tasks.clear();
	}

	/**
	 * Pause task processing.
	 */
	pause(): void {
		if (this.lifecycle === 'ready' || this.lifecycle === 'running') {
			this.lifecycle = 'paused';
		}
	}

	/**
	 * Resume task processing.
	 */
	resume(): void {
		if (this.lifecycle === 'paused') {
			this.lifecycle = 'ready';
		}
	}

	/**
	 * Get current lifecycle state.
	 */
	getState(): LifecycleState {
		return this.lifecycle;
	}

	/**
	 * Set error handler.
	 */
	setErrorHandler(handler: (error: Error) => void): void {
		this.errorHandler = handler;
	}

	/**
	 * Handle an error (internal).
	 */
	private handleError(error: Error): void {
		if (this.errorHandler) {
			this.errorHandler(error);
		} else {
			console.error('OrchestrationKernel unhandled error:', error);
		}
	}
}