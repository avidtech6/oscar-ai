/**
 * LifecycleManager – manages state transitions and lifecycle hooks.
 *
 * Responsibilities:
 * - Enforce valid state transitions
 * - Invoke lifecycle hooks (onEnter, onExit)
 * - Provide state history and rollback
 * - No external dependencies, no side effects
 *
 * FreshVibe Rules:
 * - Single responsibility (lifecycle only)
 * - Deterministic, synchronous
 * - Max 80 lines per function
 */

export type LifecycleState =
	| 'idle'
	| 'initialising'
	| 'ready'
	| 'running'
	| 'paused'
	| 'stopped'
	| 'error';

export interface LifecycleHook {
	onEnter?: (from: LifecycleState, to: LifecycleState) => void;
	onExit?: (from: LifecycleState, to: LifecycleState) => void;
}

export interface TransitionRule {
	from: LifecycleState[];
	to: LifecycleState;
	guard?: () => boolean;
}

/**
 * LifecycleManager – state machine for lifecycle.
 */
export class LifecycleManager {
	private state: LifecycleState = 'idle';
	private history: LifecycleState[] = ['idle'];
	private hooks: Map<LifecycleState, LifecycleHook> = new Map();
	private transitionRules: TransitionRule[] = [];

	constructor() {
		this.setupDefaultRules();
	}

	/**
	 * Get current state.
	 */
	getState(): LifecycleState {
		return this.state;
	}

	/**
	 * Get state history.
	 */
	getHistory(): LifecycleState[] {
		return [...this.history];
	}

	/**
	 * Transition to a new state.
	 */
	transition(to: LifecycleState): void {
		const from = this.state;

		// Validate transition
		if (!this.canTransition(from, to)) {
			throw new Error(`Invalid transition ${from} → ${to}`);
		}

		// Execute exit hook
		const fromHook = this.hooks.get(from);
		if (fromHook?.onExit) {
			fromHook.onExit(from, to);
		}

		// Update state
		this.state = to;
		this.history.push(to);

		// Execute enter hook
		const toHook = this.hooks.get(to);
		if (toHook?.onEnter) {
			toHook.onEnter(from, to);
		}
	}

	/**
	 * Check if a transition is allowed.
	 */
	canTransition(from: LifecycleState, to: LifecycleState): boolean {
		// Find matching rule
		const rule = this.transitionRules.find(
			(r) => r.from.includes(from) && r.to === to
		);
		if (!rule) {
			return false;
		}

		// Check guard
		if (rule.guard && !rule.guard()) {
			return false;
		}

		return true;
	}

	/**
	 * Add a lifecycle hook for a state.
	 */
	addHook(state: LifecycleState, hook: LifecycleHook): void {
		this.hooks.set(state, hook);
	}

	/**
	 * Remove a lifecycle hook.
	 */
	removeHook(state: LifecycleState): void {
		this.hooks.delete(state);
	}

	/**
	 * Add a custom transition rule.
	 */
	addTransitionRule(rule: TransitionRule): void {
		this.transitionRules.push(rule);
	}

	/**
	 * Reset to idle and clear history.
	 */
	reset(): void {
		this.state = 'idle';
		this.history = ['idle'];
	}

	/**
	 * Setup default transition rules.
	 */
	private setupDefaultRules(): void {
		this.transitionRules = [
			{ from: ['idle'], to: 'initialising' },
			{ from: ['initialising'], to: 'ready' },
			{ from: ['ready'], to: 'running' },
			{ from: ['running'], to: 'paused' },
			{ from: ['paused'], to: 'running' },
			{ from: ['running', 'paused', 'ready'], to: 'stopped' },
			{ from: ['stopped'], to: 'idle' },
			{ from: ['initialising', 'ready', 'running', 'paused'], to: 'error' },
			{ from: ['error'], to: 'stopped' },
		];
	}
}