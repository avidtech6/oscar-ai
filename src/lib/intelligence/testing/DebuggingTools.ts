/**
 * DebuggingTools – utilities for diagnosing and fixing issues during testing.
 *
 * Responsibilities:
 * - Capture runtime state snapshots
 * - Log execution traces
 * - Isolate reproducible bug scenarios
 * - Provide actionable debugging insights
 * - No side effects, deterministic
 *
 * FreshVibe Rules:
 * - Single responsibility (debugging only)
 * - Max 300 lines per file
 * - No external dependencies
 */

export interface StateSnapshot {
	id: string;
	timestamp: number;
	component: string;
	state: Record<string, unknown>;
	context?: Record<string, unknown>;
}

export interface ExecutionTrace {
	id: string;
	startTime: number;
	endTime?: number;
	component: string;
	operation: string;
	input?: unknown;
	output?: unknown;
	error?: string;
	children: ExecutionTrace[];
}

export interface BugScenario {
	id: string;
	description: string;
	steps: string[];
	expected: string;
	actual: string;
	stateSnapshots: StateSnapshot[];
	traces: ExecutionTrace[];
}

/**
 * DebuggingTools – collection of diagnostic utilities.
 */
export class DebuggingTools {
	private snapshots: Map<string, StateSnapshot> = new Map();
	private traces: Map<string, ExecutionTrace> = new Map();
	private scenarios: Map<string, BugScenario> = new Map();

	/**
	 * Capture a state snapshot.
	 */
	captureSnapshot(component: string, state: Record<string, unknown>, context?: Record<string, unknown>): string {
		const id = `snap_${Date.now()}_${Math.random().toString(36).substring(2)}`;
		const snapshot: StateSnapshot = {
			id,
			timestamp: Date.now(),
			component,
			state,
			context,
		};
		this.snapshots.set(id, snapshot);
		return id;
	}

	/**
	 * Retrieve a snapshot by ID.
	 */
	getSnapshot(id: string): StateSnapshot | undefined {
		return this.snapshots.get(id);
	}

	/**
	 * List all snapshots for a component.
	 */
	listSnapshots(component: string): StateSnapshot[] {
		return Array.from(this.snapshots.values()).filter((s) => s.component === component);
	}

	/**
	 * Start an execution trace.
	 */
	startTrace(component: string, operation: string, input?: unknown): string {
		const id = `trace_${Date.now()}_${Math.random().toString(36).substring(2)}`;
		const trace: ExecutionTrace = {
			id,
			startTime: Date.now(),
			component,
			operation,
			input,
			children: [],
		};
		this.traces.set(id, trace);
		return id;
	}

	/**
	 * End an execution trace.
	 */
	endTrace(id: string, output?: unknown, error?: string): void {
		const trace = this.traces.get(id);
		if (!trace) {
			throw new Error(`Trace ${id} not found`);
		}
		trace.endTime = Date.now();
		trace.output = output;
		trace.error = error;
	}

	/**
	 * Add a child trace.
	 */
	addChildTrace(parentId: string, childTrace: ExecutionTrace): void {
		const parent = this.traces.get(parentId);
		if (!parent) {
			throw new Error(`Parent trace ${parentId} not found`);
		}
		parent.children.push(childTrace);
	}

	/**
	 * Get a trace by ID.
	 */
	getTrace(id: string): ExecutionTrace | undefined {
		return this.traces.get(id);
	}

	/**
	 * Create a bug scenario from current snapshots and traces.
	 */
	createBugScenario(
		description: string,
		steps: string[],
		expected: string,
		actual: string,
		component: string
	): string {
		const id = `bug_${Date.now()}_${Math.random().toString(36).substring(2)}`;
		const scenario: BugScenario = {
			id,
			description,
			steps,
			expected,
			actual,
			stateSnapshots: this.listSnapshots(component),
			traces: Array.from(this.traces.values()).filter((t) => t.component === component),
		};
		this.scenarios.set(id, scenario);
		return id;
	}

	/**
	 * Get a bug scenario by ID.
	 */
	getBugScenario(id: string): BugScenario | undefined {
		return this.scenarios.get(id);
	}

	/**
	 * Generate a debugging report for a component.
	 */
	generateDebugReport(component: string): string {
		const snapshots = this.listSnapshots(component);
		const traces = Array.from(this.traces.values()).filter((t) => t.component === component);
		const scenarios = Array.from(this.scenarios.values()).filter((s) =>
			s.stateSnapshots.some((snap) => snap.component === component)
		);

		const lines: string[] = [];
		lines.push(`Debug Report – ${component}`);
		lines.push(`Generated: ${new Date().toISOString()}`);
		lines.push('');

		lines.push('## State Snapshots');
		if (snapshots.length === 0) {
			lines.push('No snapshots captured.');
		} else {
			for (const snap of snapshots) {
				lines.push(`- ${new Date(snap.timestamp).toISOString()}: ${JSON.stringify(snap.state)}`);
			}
		}

		lines.push('');
		lines.push('## Execution Traces');
		if (traces.length === 0) {
			lines.push('No traces captured.');
		} else {
			for (const trace of traces) {
				const duration = trace.endTime ? trace.endTime - trace.startTime : 'running';
				lines.push(`- ${trace.operation} (${duration}ms)`);
				if (trace.error) {
					lines.push(`  Error: ${trace.error}`);
				}
			}
		}

		lines.push('');
		lines.push('## Bug Scenarios');
		if (scenarios.length === 0) {
			lines.push('No bug scenarios recorded.');
		} else {
			for (const scenario of scenarios) {
				lines.push(`- ${scenario.description}`);
				lines.push(`  Expected: ${scenario.expected}`);
				lines.push(`  Actual: ${scenario.actual}`);
			}
		}

		return lines.join('\n');
	}

	/**
	 * Clear all captured data.
	 */
	clear(): void {
		this.snapshots.clear();
		this.traces.clear();
		this.scenarios.clear();
	}
}