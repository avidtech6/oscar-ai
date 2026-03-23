/**
 * Update Operation – defines schema update operations for the Schema Updater Engine.
 */

export interface ValidationResult {
	/** Whether the validation passed */
	valid: boolean;
	/** Error messages */
	errors: string[];
	/** Warning messages */
	warnings: string[];
	/** Validation result ID */
	id: string;
	/** Validation result type */
	type: 'error' | 'warning' | 'info' | 'success';
	/** Validation message */
	message: string;
	/** Validation details */
	details?: Record<string, any>;
	/** Validation timestamp */
	timestamp: number;
	/** Validation source */
	source: string;
	/** Validation severity */
	severity?: 'low' | 'medium' | 'high' | 'critical';
	/** Validation category */
	category?: string;
	/** Validation code */
	code?: string;
	/** Validation suggestions */
	suggestions?: string[];
	/** Validation metadata */
	metadata?: Record<string, any>;
	/** Validation operation ID */
	operationId?: string;
	/** Validation target */
	target?: string;
	/** Validation value */
	value?: any;
	/** Validation data */
	data?: any;
	/** Success status (alternative to valid) */
	success?: boolean;
	/** Additional data payload */
	payload?: any;
}

export interface UpdateCondition {
	/** Field to check */
	field: string;
	/** Expected value (optional) */
	expectedValue?: any;
	/** Type of condition */
	type: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'matches' | 'exists' | 'notExists';
}

export interface UpdateAction {
	/** Field to update */
	field: string;
	/** New value */
	value: any;
	/** Type of action */
	type: 'set' | 'add' | 'remove' | 'append' | 'prepend' | 'increment' | 'decrement';
	/** Target element (for array/object operations) */
	target?: string;
	/** Optional transformation function */
	transform?: (value: any) => any;
}

export interface UpdateOperation {
	/** Operation ID */
	id: string;
	/** Name of the operation */
	name: string;
	/** Description of what the operation does */
	description: string;
	/** Priority of the operation (1-10, higher = more important) */
	priority: number;
	/** Conditions that must be met for the operation to execute */
	conditions: UpdateCondition[];
	/** Actions to perform when conditions are met */
	actions: UpdateAction[];
	/** Whether this operation is enabled */
	enabled: boolean;
	/** Tags for categorizing operations */
	tags: string[];
	/** Configuration for the operation */
	config: Record<string, any>;
	/** Target field path for the operation */
	targetFieldPath?: string;
	/** Dependencies on other operations */
	dependencies?: string[];
	/** Parameters for the operation */
	parameters?: Record<string, any>;
	/** Type of operation */
	type?: string;
	/** Metadata for the operation */
	metadata?: {
		author?: string;
		tags?: string[];
		confidence?: number;
		accuracy?: number;
	};
}

/**
 * Create a new update operation.
 */
export function createUpdateOperation(
	name: string,
	description: string,
	priority: number = 5,
	conditions: UpdateCondition[] = [],
	actions: UpdateAction[] = [],
	enabled: boolean = true,
	tags: string[] = [],
	config: Record<string, any> = {}
): UpdateOperation {
	return {
		id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
		name,
		description,
		priority,
		conditions,
		actions,
		enabled,
		tags,
		config,
	};
}

/**
 * Validate an update operation.
 */
export interface SchemaUpdateResult {
	/** Result ID */
	id: string;
	/** Result type */
	type: 'success' | 'error' | 'warning' | 'info';
	/** Operations performed */
	operations: UpdateOperation[];
	/** Result data */
	data: any;
	/** Result message */
	message: string;
	/** Result metadata */
	metadata: {
		/** Elements processed */
		elementsProcessed: number;
		/** Errors encountered */
		errors: string[];
		/** Warnings encountered */
		warnings: string[];
		/** Confidence score */
		confidence: number;
		/** Accuracy score */
		accuracy: number;
		/** Processing time */
		processingTime: number;
		/** Logs */
		logs: string[];
	};
	/** Validation results */
	validationResults: ValidationResult[];
	/** Result logs */
	logs: string[];
}

export interface SchemaUpdateProgress {
	/** Current progress percentage */
	percentage?: number;
	/** Current element being processed */
	currentElement?: string;
	/** Total elements to process */
	totalElements?: number;
	/** Processed elements count */
	processedElements: number;
	/** Remaining elements count */
	remainingElements: number;
	/** Estimated time remaining in seconds */
	estimatedTimeRemaining?: number;
	/** Progress identifier */
	id?: string;
	/** Progress message */
	message?: string;
	/** Current stage */
	stage?: string;
	/** Progress details */
	details?: {
		action?: string;
		target?: string;
		status?: 'processing' | 'completed' | 'failed' | 'skipped';
		error?: string;
		totalOperations?: number;
	};
	/** Current step */
	step: string;
	/** Current operation */
	currentOperation?: string;
	/** Total operations */
	totalOperations?: number;
}

export interface SchemaUpdateConfiguration {
	/** Whether to enable strict mode */
	strictMode: boolean;
	/** Maximum number of operations to process */
	maxOperations: number;
	/** Timeout for operations in milliseconds */
	operationTimeout: number;
	/** Whether to enable progress tracking */
	enableProgressTracking: boolean;
	/** Whether to enable validation */
	enableValidation: boolean;
	/** Whether to enable rollback on failure */
	enableRollback: boolean;
	/** Whether to enable logging */
	enableLogging: boolean;
	/** Log level */
	logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface SchemaUpdateStatistics {
	/** Total operations processed */
	totalOperations: number;
	/** Successful operations count */
	successfulOperations: number;
	/** Failed operations count */
	failedOperations: number;
	/** Skipped operations count */
	skippedOperations: number;
	/** Validation errors count */
	validationErrors: number;
	/** Warnings count */
	warnings: number;
	/** Processing time in milliseconds */
	processingTime: number;
	/** Average operation time in milliseconds */
	averageOperationTime?: number;
	/** Total processing time */
	totalProcessingTime?: number;
	/** Average processing time */
	averageProcessingTime?: number;
	/** Total validation results */
	totalValidationResults?: number;
	/** Error validation results */
	errorValidationResults?: number;
	/** Warning validation results */
	warningValidationResults?: number;
	/** Total confidence */
	totalConfidence?: number;
	/** Total accuracy */
	totalAccuracy?: number;
}

export interface SchemaUpdateHistory {
	/** History ID */
	id: string;
	/** Timestamp */
	timestamp: Date;
	/** Operation ID */
	operationId: string;
	/** Operation type */
	type: 'update' | 'validation' | 'rollback';
	/** Result details */
	result: {
		success: boolean;
		message: string;
		errors?: string[];
		warnings?: string[];
	};
	/** Statistics */
	statistics: SchemaUpdateStatistics;
	/** Operations executed */
	operations: UpdateOperation[];
}

export interface SchemaUpdateTemplate {
	/** Template ID */
	id: string;
	/** Template name */
	name: string;
	/** Template description */
	description: string;
	/** Operations in the template */
	operations: UpdateOperation[];
	/** Configuration for the template */
	configuration: SchemaUpdateConfiguration;
	/** Tags for categorizing templates */
	tags: string[];
	/** Author of the template */
	author: string;
	/** Creation date */
	createdAt: Date;
	/** Last updated date */
	updatedAt: Date;
	/** Type of template */
	type: 'schema' | 'validation' | 'rollback' | 'custom';
	/** Metadata for the template */
	metadata?: {
		/** Template version */
		version: string;
		/** Template category */
		category: string;
		/** Template priority */
		priority: number;
		/** Template dependencies */
		dependencies: string[];
		/** Template compatibility */
		compatibility: {
			/** Minimum schema version */
			minSchemaVersion: string;
			/** Maximum schema version */
			maxSchemaVersion: string;
		};
	};
}

export function validateUpdateOperation(operation: UpdateOperation): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Validate required fields
	if (!operation.name || operation.name.trim() === '') {
		errors.push('Operation name is required');
	}

	if (!operation.description || operation.description.trim() === '') {
		errors.push('Operation description is required');
	}

	if (operation.priority < 1 || operation.priority > 10) {
		errors.push('Priority must be between 1 and 10');
	}

	// Validate conditions
	if (operation.conditions.length === 0) {
		warnings.push('Operation has no conditions - will always execute');
	}

	for (let i = 0; i < operation.conditions.length; i++) {
		const condition = operation.conditions[i];
		
		if (!condition.field || condition.field.trim() === '') {
			errors.push(`Condition ${i + 1}: Field is required`);
		}

		if (!['equals', 'contains', 'startsWith', 'endsWith', 'matches', 'exists', 'notExists'].includes(condition.type)) {
			errors.push(`Condition ${i + 1}: Invalid condition type "${condition.type}"`);
		}

		if (condition.type !== 'exists' && condition.type !== 'notExists' && condition.expectedValue === undefined) {
			errors.push(`Condition ${i + 1}: Expected value is required for type "${condition.type}"`);
		}
	}

	// Validate actions
	if (operation.actions.length === 0) {
		errors.push('Operation must have at least one action');
	}

	for (let i = 0; i < operation.actions.length; i++) {
		const action = operation.actions[i];
		
		if (!action.field || action.field.trim() === '') {
			errors.push(`Action ${i + 1}: Field is required`);
		}

		if (!['set', 'add', 'remove', 'append', 'prepend', 'increment', 'decrement'].includes(action.type)) {
			errors.push(`Action ${i + 1}: Invalid action type "${action.type}"`);
		}

		if (action.type === 'set' && action.value === undefined) {
			errors.push(`Action ${i + 1}: Value is required for type "set"`);
		}

		if ((action.type === 'increment' || action.type === 'decrement') && typeof action.value !== 'number') {
			errors.push(`Action ${i + 1}: Value must be a number for type "${action.type}"`);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
		id: `validation-${Date.now()}`,
		type: errors.length === 0 ? 'success' : 'error',
		message: errors.length === 0 ? 'Validation passed' : 'Validation failed',
		timestamp: Date.now(),
		source: 'system'
	};
}

/**
 * Check if an object meets the conditions of an operation.
 */
export function meetsConditions(obj: any, conditions: UpdateCondition[]): boolean {
	for (const condition of conditions) {
		const fieldValue = getNestedValue(obj, condition.field);
		
		switch (condition.type) {
			case 'equals':
				if (fieldValue !== condition.expectedValue) return false;
				break;
			case 'contains':
				if (typeof fieldValue !== 'string' || !fieldValue.includes(condition.expectedValue)) return false;
				break;
			case 'startsWith':
				if (typeof fieldValue !== 'string' || !fieldValue.startsWith(condition.expectedValue)) return false;
				break;
			case 'endsWith':
				if (typeof fieldValue !== 'string' || !fieldValue.endsWith(condition.expectedValue)) return false;
				break;
			case 'matches':
				if (typeof fieldValue !== 'string' || !new RegExp(condition.expectedValue).test(fieldValue)) return false;
				break;
			case 'exists':
				if (fieldValue === undefined || fieldValue === null) return false;
				break;
			case 'notExists':
				if (fieldValue !== undefined && fieldValue !== null) return false;
				break;
		}
	}
	return true;
}

/**
 * Get a nested value from an object using dot notation.
 */
function getNestedValue(obj: any, path: string): any {
	return path.split('.').reduce((current, key) => {
		return current && current[key] !== undefined ? current[key] : undefined;
	}, obj);
}

/**
 * Apply actions to an object.
 */
export function applyActions(obj: any, actions: UpdateAction[]): any {
	const result = JSON.parse(JSON.stringify(obj)); // Deep clone

	for (const action of actions) {
		const currentValue = getNestedValue(result, action.field);
		
		switch (action.type) {
			case 'set':
				setNestedValue(result, action.field, action.transform ? action.transform(action.value) : action.value);
				break;
			case 'add':
				if (Array.isArray(currentValue)) {
					setNestedValue(result, action.field, [...currentValue, action.value]);
				} else {
					setNestedValue(result, action.field, currentValue + action.value);
				}
				break;
			case 'remove':
				setNestedValue(result, action.field, undefined);
				break;
			case 'append':
				if (Array.isArray(currentValue)) {
					setNestedValue(result, action.field, [...currentValue, action.value]);
				} else if (typeof currentValue === 'string') {
					setNestedValue(result, action.field, currentValue + action.value);
				}
				break;
			case 'prepend':
				if (Array.isArray(currentValue)) {
					setNestedValue(result, action.field, [action.value, ...currentValue]);
				} else if (typeof currentValue === 'string') {
					setNestedValue(result, action.field, action.value + currentValue);
				}
				break;
			case 'increment':
				if (typeof currentValue === 'number') {
					setNestedValue(result, action.field, currentValue + action.value);
				}
				break;
			case 'decrement':
				if (typeof currentValue === 'number') {
					setNestedValue(result, action.field, currentValue - action.value);
				}
				break;
		}
	}

	return result;
}

/**
 * Set a nested value in an object using dot notation.
 */
function setNestedValue(obj: any, path: string, value: any): void {
	const keys = path.split('.');
	const lastKey = keys.pop()!;
	const parent = keys.reduce((current, key) => {
		if (!current[key]) current[key] = {};
		return current[key];
	}, obj);
	parent[lastKey] = value;
}