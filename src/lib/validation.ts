/**
 * Validation System - Core Implementation
 * 
 * This file provides a comprehensive validation system for forms, API requests,
 * and general data validation across the Oscar AI application.
 */

// Core validation types
export interface ValidationRule {
	/** Unique name for the rule */
	name: string;
	
	/** Validation function that returns validation result */
	validate: (value: any, context?: any) => { valid: boolean; error?: string };
	
	/** Priority of the rule (lower number = higher priority) */
	priority: number;
}

export interface ValidationError {
	/** Field name that failed validation */
	field: string;
	
	/** Error message */
	message: string;
	
	/** Validation rule that failed */
	rule: string;
	
	/** Error severity level */
	severity: 'error' | 'warning' | 'info';
	
	/** Additional error context */
	context?: any;
}

export interface ValidationResult {
	/** Whether validation passed */
	valid: boolean;
	
	/** List of validation errors */
	errors: ValidationError[];
	
	/** List of validation warnings */
	warnings: ValidationError[];
	
	/** List of validation info messages */
	info: ValidationError[];
	
	/** Total validation time in milliseconds */
	time: number;
}

export interface FormValidation {
	/** Form identifier */
	formId: string;
	
	/** Validation results for each field */
	fields: Record<string, ValidationResult>;
	
	/** Overall form validation result */
	valid: boolean;
	
	/** Total validation time */
	time: number;
}

export interface FormSubmission {
	/** Form identifier */
	formId: string;
	
	/** Form data */
	data: Record<string, any>;
	
	/** Validation result */
	validation: FormValidation;
	
	/** Submission timestamp */
	timestamp: number;
}

export interface ApiRequest {
	/** Request method */
	method: string;
	
	/** Request URL */
	url: string;
	
	/** Request headers */
	headers: Record<string, string>;
	
	/** Request body */
	body?: any;
	
	/** Request parameters */
	params?: Record<string, any>;
}

export interface ApiResponse {
	/** Response status code */
	status: number;
	
	/** Response headers */
	headers: Record<string, string>;
	
	/** Response body */
	body?: any;
	
	/** Response error message if any */
	error?: string;
}

export interface FormValidator {
	/** Validate a form field */
	validateField: (formId: string, field: string, value: any, rules: ValidationRule[], context?: any) => ValidationResult;
	
	/** Validate entire form */
	validateForm: (formId: string, data: Record<string, any>, fields: Record<string, ValidationRule[]>, context?: any) => FormValidation;
	
	/** Submit form with validation */
	submitForm: (formId: string, data: Record<string, any>, fields: Record<string, ValidationRule[]>, context?: any) => Promise<FormSubmission>;
}

export interface FormSubmissionHandler {
	/** Handle form submission */
	handle: (submission: FormSubmission) => Promise<void>;
	
	/** Validate before submission */
	validate: (submission: FormSubmission) => boolean;
}

export interface FieldValidationResult {
	/** Field name */
	field: string;
	
	/** Field value */
	value: any;
	
	/** Validation result */
	result: ValidationResult;
}

// Form Validation Utils
export class FormValidationUtils {
	static getFieldValue(formData: Record<string, any>, fieldName: string): any {
		return formData[fieldName];
	}

	static calculateAge(dateOfBirth: string): number {
		if (!dateOfBirth) return 0;
		const today = new Date();
		const birthDate = new Date(dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		
		return age;
	}

	static validateDependencies(formData: Record<string, any>, dependencies: string[]): boolean {
		for (const dep of dependencies) {
			if (!formData[dep] || formData[dep] === '') {
				return false;
			}
		}
		return true;
	}

	static getFieldContext(formData: Record<string, any>, fieldName: string): any {
		return {
			...formData,
			[fieldName]: formData[fieldName]
		};
	}
}

// Validation engine
export class CoreValidationEngine {
	private rules: ValidationRule[] = [];
	private stats: {
		totalValidations: number;
		totalErrors: number;
		totalWarnings: number;
		totalInfo: number;
		averageTime: number;
	} = {
		totalValidations: 0,
		totalErrors: 0,
		totalWarnings: 0,
		totalInfo: 0,
		averageTime: 0
	};

	constructor() {
		this.initializeDefaultRules();
	}

	private initializeDefaultRules(): void {
		// Add default validation rules
		this.addRule({
			name: 'required',
			validate: (value) => ({
				valid: value !== null && value !== undefined && value !== '',
				error: 'This field is required'
			}),
			priority: 1
		});

		this.addRule({
			name: 'email',
			validate: (value) => {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return {
					valid: !value || emailRegex.test(value),
					error: 'Please enter a valid email address'
				};
			},
			priority: 2
		});

		this.addRule({
			name: 'minLength',
			validate: (value) => ({
				valid: !value || value.length >= 3,
				error: 'Minimum length is 3 characters'
			}),
			priority: 3
		});

		this.addRule({
			name: 'maxLength',
			validate: (value) => ({
				valid: !value || value.length <= 100,
				error: 'Maximum length is 100 characters'
			}),
			priority: 4
		});
	}

	addRule(rule: ValidationRule): void {
		this.rules.push(rule);
		this.rules.sort((a, b) => a.priority - b.priority);
	}

	validate(value: any, rules: ValidationRule[], context?: any): ValidationResult {
		const startTime = performance.now();
		const errors: ValidationError[] = [];
		const warnings: ValidationError[] = [];
		const info: ValidationError[] = [];

		for (const rule of rules) {
			const result = rule.validate(value, context);
			const error: ValidationError = {
				field: 'unknown',
				message: result.error || '',
				rule: rule.name,
				severity: 'error'
			};

			if (!result.valid) {
				errors.push(error);
			}
		}

		const endTime = performance.now();
		const time = endTime - startTime;

		// Update stats
		this.stats.totalValidations++;
		this.stats.totalErrors += errors.length;
		this.stats.totalWarnings += warnings.length;
		this.stats.totalInfo += info.length;
		
		// Calculate average time
		const totalTime = this.stats.averageTime * (this.stats.totalValidations - 1) + time;
		this.stats.averageTime = totalTime / this.stats.totalValidations;

		return {
			valid: errors.length === 0,
			errors,
			warnings,
			info,
			time
		};
	}

	getStats() {
		return { ...this.stats };
	}

	resetStats(): void {
		this.stats = {
			totalValidations: 0,
			totalErrors: 0,
			totalWarnings: 0,
			totalInfo: 0,
			averageTime: 0
		};
	}
}

// Validation rule factory
export class ValidationRuleFactory {
	static required(message: string = 'This field is required'): ValidationRule {
		return {
			name: 'required',
			validate: (value) => ({
				valid: value !== null && value !== undefined && value !== '',
				error: message
			}),
			priority: 1
		};
	}

	static email(message: string = 'Please enter a valid email address'): ValidationRule {
		return {
			name: 'email',
			validate: (value) => {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return {
					valid: !value || emailRegex.test(value),
					error: message
				};
			},
			priority: 2
		};
	}

	static minLength(min: number, message?: string): ValidationRule {
		return {
			name: 'minLength',
			validate: (value) => ({
				valid: !value || value.length >= min,
				error: message || `Minimum length is ${min} characters`
			}),
			priority: 3
		};
	}

	static maxLength(max: number, message?: string): ValidationRule {
		return {
			name: 'maxLength',
			validate: (value) => ({
				valid: !value || value.length <= max,
				error: message || `Maximum length is ${max} characters`
			}),
			priority: 4
		};
	}

	static numeric(message: string = 'Please enter a valid number'): ValidationRule {
		return {
			name: 'numeric',
			validate: (value) => ({
				valid: value === '' || !isNaN(Number(value)),
				error: message
			}),
			priority: 5
		};
	}

	static min(min: number, message?: string): ValidationRule {
		return {
			name: 'min',
			validate: (value) => ({
				valid: value === '' || Number(value) >= min,
				error: message || `Minimum value is ${min}`
			}),
			priority: 6
		};
	}

	static max(max: number, message?: string): ValidationRule {
		return {
			name: 'max',
			validate: (value) => ({
				valid: value === '' || Number(value) <= max,
				error: message || `Maximum value is ${max}`
			}),
			priority: 7
		};
	}

	static pattern(regex: RegExp, message?: string): ValidationRule {
		return {
			name: 'pattern',
			validate: (value) => ({
				valid: !value || regex.test(value),
				error: message || 'Invalid format'
			}),
			priority: 8
		};
	}

	static custom(name: string, validator: (value: any) => { valid: boolean; error?: string }, message?: string): ValidationRule {
		return {
			name,
			validate: (value) => {
				try {
					return validator(value);
				} catch (error) {
					return {
						valid: false,
						error: message || `Invalid ${name}`
					};
				}
			},
			priority: 9
		};
	}

	static customWithContext(name: string, validator: (value: any, context?: any) => { valid: boolean; error?: string }, message?: string): ValidationRule {
		return {
			name,
			validate: (value, context?: any) => {
				try {
					return validator(value, context);
				} catch (error) {
					return {
						valid: false,
						error: message || `Invalid ${name}`
					};
				}
			},
			priority: 10
		};
	}

	static date(message: string = 'Please enter a valid date'): ValidationRule {
		return {
			name: 'date',
			validate: (value) => {
				if (!value) return { valid: true };
				const date = new Date(value);
				return {
					valid: !isNaN(date.getTime()),
					error: message
				};
			},
			priority: 2
		};
	}

	static url(message: string = 'Please enter a valid URL'): ValidationRule {
		return {
			name: 'url',
			validate: (value) => {
				if (!value) return { valid: true };
				try {
					new URL(value);
					return { valid: true };
				} catch {
					return { valid: false, error: message };
				}
			},
			priority: 3
		};
	}
}

// Form validator implementation
export class CoreFormValidator implements FormValidator {
	private engine: CoreValidationEngine;

	constructor() {
		this.engine = new CoreValidationEngine();
	}

	validateField(formId: string, field: string, value: any, rules: ValidationRule[], context?: any): ValidationResult {
		const result = this.engine.validate(value, rules, context);
		
		// Update field name in errors
		const updatedErrors = result.errors.map(error => ({
			...error,
			field
		}));

		return {
			...result,
			errors: updatedErrors
		};
	}

	validateForm(formId: string, data: Record<string, any>, fields: Record<string, ValidationRule[]>, context?: any): FormValidation {
		const startTime = performance.now();
		const fieldsResults: Record<string, ValidationResult> = {};
		let hasErrors = false;

		for (const [fieldName, fieldRules] of Object.entries(fields)) {
			const value = data[fieldName];
			const fieldResult = this.validateField(formId, fieldName, value, fieldRules, context);
			fieldsResults[fieldName] = fieldResult;
			if (!fieldResult.valid) {
				hasErrors = true;
			}
		}

		const endTime = performance.now();
		const time = endTime - startTime;

		return {
			formId,
			fields: fieldsResults,
			valid: !hasErrors,
			time
		};
	}

	async submitForm(formId: string, data: Record<string, any>, fields: Record<string, ValidationRule[]>, context?: any): Promise<FormSubmission> {
		const validation = this.validateForm(formId, data, fields, context);
		
		if (!validation.valid) {
			throw new Error('Form validation failed');
		}

		const submission: FormSubmission = {
			formId,
			data,
			validation,
			timestamp: Date.now()
		};

		return submission;
	}
}

// Export default instances
export const validationEngine = new CoreValidationEngine();
export const formValidator = new CoreFormValidator();