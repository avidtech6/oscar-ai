/**
 * Validation System Examples
 * 
 * This file provides practical examples of how to use the validation system
 * in various scenarios across the Oscar AI application.
 */

import { validationEngine, formValidator, ValidationRuleFactory } from '../validation';
import { formatValidationErrors, getUserFriendlyError, createValidationSummary } from '../error-handling/error-messages';
import type { ValidationResult, ValidationError, ValidationRule, FormValidation } from '../validation';

// ============================================================================
// EXAMPLE 1: Basic Form Validation
// ============================================================================

/**
 * Example: User Registration Form
 * Demonstrates comprehensive form validation with multiple field types
 */
export function validateRegistrationForm(formData: any): FormValidation {
	const rules = {
		username: [
			ValidationRuleFactory.required('Username is required'),
			ValidationRuleFactory.minLength(3, 'Username must be at least 3 characters'),
			ValidationRuleFactory.maxLength(30, 'Username cannot exceed 30 characters')
		],
		email: [
			ValidationRuleFactory.required('Email is required'),
			ValidationRuleFactory.email('Please enter a valid email address')
		],
		password: [
			ValidationRuleFactory.required('Password is required'),
			ValidationRuleFactory.minLength(8, 'Password must be at least 8 characters'),
			ValidationRuleFactory.pattern(/[A-Z]/, 'Password must contain at least one uppercase letter'),
			ValidationRuleFactory.pattern(/[0-9]/, 'Password must contain at least one number')
		],
		confirmPassword: [
			ValidationRuleFactory.required('Please confirm your password'),
			{
				name: 'matchesField',
				validate: (value: any, context?: any) => ({
					valid: value === context?.password,
					error: 'Passwords do not match'
				}),
				priority: 5
			}
		],
		age: [
			ValidationRuleFactory.numeric('Age must be a number'),
			ValidationRuleFactory.min(13, 'You must be at least 13 years old'),
			ValidationRuleFactory.max(120, 'Please enter a valid age')
		],
		termsAccepted: [
			ValidationRuleFactory.required('You must accept the terms and conditions')
		]
	};

	return formValidator.validateForm('registration', formData, rules);
}

/**
 * Example: Login Form Validation
 * Simple form with email and password validation
 */
export function validateLoginForm(formData: any): FormValidation {
	const rules = {
		email: [
			ValidationRuleFactory.required('Email is required'),
			ValidationRuleFactory.email('Please enter a valid email address')
		],
		password: [
			ValidationRuleFactory.required('Password is required'),
			ValidationRuleFactory.minLength(6, 'Password must be at least 6 characters')
		]
	};

	return formValidator.validateForm('login', formData, rules);
}

// ============================================================================
// EXAMPLE 2: Profile Update Form
// ============================================================================

/**
 * Example: User Profile Update
 * Demonstrates conditional validation and complex rules
 */
export function validateProfileForm(formData: any): FormValidation {
	const rules: Record<string, ValidationRule[]> = {
		fullName: [
			ValidationRuleFactory.required('Full name is required'),
			ValidationRuleFactory.minLength(2, 'Full name must be at least 2 characters'),
			ValidationRuleFactory.maxLength(100, 'Full name cannot exceed 100 characters')
		],
		email: [
			ValidationRuleFactory.required('Email is required'),
			ValidationRuleFactory.email('Please enter a valid email address')
		],
		phone: [
			ValidationRuleFactory.pattern(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number')
		],
		bio: [
			ValidationRuleFactory.maxLength(500, 'Bio cannot exceed 500 characters')
		],
		website: [
			ValidationRuleFactory.pattern(
				/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
				'Please enter a valid URL'
			)
		],
		birthDate: [
			{
				name: 'date',
				validate: (value: any) => {
					if (!value) return { valid: true };
					const date = new Date(value);
					return {
						valid: !isNaN(date.getTime()),
						error: 'Please enter a valid date'
					};
				},
				priority: 5
			},
			{
				name: 'minAge',
				validate: (value: any) => {
					if (!value) return { valid: true };
					const birthDate = new Date(value);
					const today = new Date();
					const age = today.getFullYear() - birthDate.getFullYear();
					return {
						valid: age >= 13,
						error: 'You must be at least 13 years old'
					};
				},
				priority: 6
			}
		]
	};

	// Conditionally require phone if SMS notifications are enabled
	if (formData.receiveSMS) {
		rules.phone.unshift(ValidationRuleFactory.required('Phone number is required for SMS notifications'));
	}

	return formValidator.validateForm('profile', formData, rules);
}

// ============================================================================
// EXAMPLE 3: Real-time Field Validation
// ============================================================================

/**
 * Example: Real-time Email Validation
 * Demonstrates how to validate a field as user types (with debouncing)
 */
export class RealTimeValidator {
	private validationCache = new Map<string, ValidationResult>();

	/**
	 * Validate email field in real-time
	 */
	validateEmail(email: string): ValidationResult {
		// Check cache first
		const cacheKey = `email:${email}`;
		if (this.validationCache.has(cacheKey)) {
			return this.validationCache.get(cacheKey)!;
		}

		const rules = [
			ValidationRuleFactory.required('Email is required'),
			ValidationRuleFactory.email('Please enter a valid email address')
		];

		const result = formValidator.validateField('emailField', 'email', email, rules);
		this.validationCache.set(cacheKey, result);
		return result;
	}

	/**
	 * Validate password field in real-time
	 */
	validatePassword(password: string): ValidationResult {
		const cacheKey = `password:${password}`;
		if (this.validationCache.has(cacheKey)) {
			return this.validationCache.get(cacheKey)!;
		}

		const rules = [
			ValidationRuleFactory.required('Password is required'),
			ValidationRuleFactory.minLength(8, 'Password must be at least 8 characters'),
			ValidationRuleFactory.pattern(/[A-Z]/, 'Must contain at least one uppercase letter'),
			ValidationRuleFactory.pattern(/[0-9]/, 'Must contain at least one number')
		];

		const result = formValidator.validateField('passwordField', 'password', password, rules);
		this.validationCache.set(cacheKey, result);
		return result;
	}

	/**
	 * Clear validation cache
	 */
	clearCache(): void {
		this.validationCache.clear();
	}
}

// ============================================================================
// EXAMPLE 4: Custom Validation Rule Creation
// ============================================================================

/**
 * Example: Creating and using custom validation rules
 */
export function createCustomValidationRules() {
	// Custom rule for UK postcode
	const ukPostcodeRule: ValidationRule = {
		name: 'ukPostcode',
		validate: (value: any) => {
			if (!value) return { valid: true };
			const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
			return {
				valid: postcodeRegex.test(value),
				error: 'Please enter a valid UK postcode'
			};
		},
		priority: 5
	};

	// Custom rule for password strength
	const passwordStrengthRule: ValidationRule = {
		name: 'strongPassword',
		validate: (value: any) => {
			if (!value) return { valid: true };
			const hasUpper = /[A-Z]/.test(value);
			const hasLower = /[a-z]/.test(value);
			const hasNumber = /[0-9]/.test(value);
			const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
			const isStrong = hasUpper && hasLower && hasNumber && hasSpecial && value.length >= 10;
			
			return {
				valid: isStrong,
				error: isStrong ? undefined : 'Password must be at least 10 characters and contain uppercase, lowercase, number, and special character'
			};
		},
		priority: 5
	};

	return { ukPostcodeRule, passwordStrengthRule };
}

// ============================================================================
// EXAMPLE 5: Complex Form with Dependencies
// ============================================================================

/**
 * Example: Order Form with dependent fields
 */
export function validateOrderForm(formData: any): FormValidation {
	const rules: Record<string, ValidationRule[]> = {
		shippingMethod: [
			ValidationRuleFactory.required('Please select a shipping method')
		],
		address: [
			ValidationRuleFactory.required('Address is required'),
			ValidationRuleFactory.minLength(10, 'Please enter a complete address')
		],
		city: [
			ValidationRuleFactory.required('City is required')
		],
		postcode: [
			ValidationRuleFactory.required('Postcode is required')
		],
		paymentMethod: [
			ValidationRuleFactory.required('Please select a payment method')
		],
		cardNumber: [
			ValidationRuleFactory.required('Card number is required'),
			ValidationRuleFactory.pattern(/^\d{16}$/, 'Please enter a valid 16-digit card number')
		],
		expiryDate: [
			ValidationRuleFactory.required('Expiry date is required'),
			ValidationRuleFactory.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Please enter a valid expiry date (MM/YY)')
		],
		cvv: [
			ValidationRuleFactory.required('CVV is required'),
			ValidationRuleFactory.pattern(/^\d{3,4}$/, 'Please enter a valid CVV')
		]
	};

	// Only require gift message if gift wrapping is selected
	if (formData.giftWrapping) {
		rules.giftMessage = [
			ValidationRuleFactory.required('Gift message is required for gift wrapping'),
			ValidationRuleFactory.maxLength(200, 'Gift message cannot exceed 200 characters')
		];
	}

	// Only require delivery instructions if express shipping is selected
	if (formData.shippingMethod === 'express') {
		rules.deliveryInstructions = [
			ValidationRuleFactory.maxLength(500, 'Delivery instructions cannot exceed 500 characters')
		];
	}

	return formValidator.validateForm('order', formData, rules);
}

// ============================================================================
// EXAMPLE 6: API Request Validation
// ============================================================================

/**
 * Example: Validating API request data
 */
export function validateApiRequest(requestData: any): ValidationResult {
	// Validate required fields for API request
	const rules = [
		ValidationRuleFactory.required('Request data is required'),
		{
			name: 'hasRequiredFields',
			validate: (value: any) => {
				const requiredFields = ['endpoint', 'method', 'timestamp'];
				const missingFields = requiredFields.filter(field => !value[field]);
				return {
					valid: missingFields.length === 0,
					error: missingFields.length > 0 ? `Missing required fields: ${missingFields.join(', ')}` : undefined
				};
			},
			priority: 1
		}
	];

	return validationEngine.validate(requestData, rules);
}

// ============================================================================
// EXAMPLE 7: Error Handling and User Feedback
// ============================================================================

/**
 * Example: Formatting validation errors for user display
 */
export function displayValidationErrors(validation: FormValidation): string[] {
	const allErrors: ValidationError[] = [];
	
	// Collect all errors from all fields
	Object.values(validation.fields).forEach((fieldResult: ValidationResult) => {
		allErrors.push(...fieldResult.errors);
	});

	// Format errors for user display
	return formatValidationErrors(allErrors);
}

/**
 * Example: Creating a user-friendly error summary
 */
export function createErrorSummary(validation: FormValidation): {
	count: number;
	summary: string;
	errorsByField: Record<string, string[]>;
} {
	const allErrors: ValidationError[] = [];
	const errorsByField: Record<string, string[]> = {};

	// Collect errors by field
	Object.entries(validation.fields).forEach(([fieldName, fieldResult]: [string, ValidationResult]) => {
		if (fieldResult.errors.length > 0) {
			errorsByField[fieldName] = fieldResult.errors.map(error => error.message);
			allErrors.push(...fieldResult.errors);
		}
	});

	// Create summary
	const summary = createValidationSummary(allErrors);
	
	return {
		count: summary.count,
		summary: summary.message,
		errorsByField
	};
}

/**
 * Example: Getting user-friendly error messages
 */
export function getUserFriendlyValidationError(error: ValidationError): {
	title: string;
	message: string;
	suggestedAction: string;
	icon: string;
	severity: 'info' | 'warning' | 'error' | 'critical';
} {
	const result = getUserFriendlyError(error);
	return {
		title: result.title,
		message: result.message,
		suggestedAction: result.suggestedAction,
		icon: result.icon,
		severity: result.severity
	};
}

// ============================================================================
// EXAMPLE 8: Svelte Store Integration
// ============================================================================

/**
 * Example: Integration with Svelte stores for reactive validation
 */
import { writable, derived } from 'svelte/store';

export function createValidatedFormStore(initialData: any = {}) {
	const formData = writable(initialData);
	const validationResult = writable<FormValidation | null>(null);
	const isValid = derived(validationResult, $result => $result?.valid ?? false);
	const errors = derived(validationResult, $result => {
		if (!$result) return [];
		const allErrors: ValidationError[] = [];
		Object.values($result.fields).forEach((fieldResult: ValidationResult) => {
			allErrors.push(...fieldResult.errors);
		});
		return allErrors;
	});

	/**
	 * Validate the current form data
	 */
	async function validate(rules: Record<string, ValidationRule[]>): Promise<FormValidation> {
		let currentData: any;
		formData.subscribe(data => { currentData = data; })();
		
		const result = formValidator.validateForm('storeForm', currentData, rules);
		validationResult.set(result);
		return result;
	}

	/**
	 * Validate a specific field
	 */
	async function validateField(fieldName: string, value: any, rules: ValidationRule[]): Promise<ValidationResult> {
		const result = formValidator.validateField('storeForm', fieldName, value, rules);
		
		// Update validation result
		validationResult.update(current => {
			if (!current) {
				return {
					formId: 'storeForm',
					fields: { [fieldName]: result },
					valid: result.valid,
					time: result.time
				};
			}
			
			const newFields = { ...current.fields, [fieldName]: result };
			const allValid = Object.values(newFields).every((field: ValidationResult) => field.valid);
			
			return {
				...current,
				fields: newFields,
				valid: allValid
			};
		});
		
		return result;
	}

	return {
		formData,
		validationResult,
		isValid,
		errors,
		validate,
		validateField
	};
}

// ============================================================================
// EXAMPLE 9: Performance Optimization
// ============================================================================

/**
 * Example: Optimizing validation performance with caching and debouncing
 */
export class OptimizedValidator {
	private cache = new Map<string, ValidationResult>();
	private pendingValidations = new Map<string, NodeJS.Timeout>();

	/**
	 * Validate with debouncing to prevent excessive validation
	 */
	validateWithDebounce(
		fieldName: string,
		value: any,
		rules: ValidationRule[],
		debounceMs: number = 300
	): Promise<ValidationResult> {
		return new Promise((resolve) => {
			const cacheKey = `${fieldName}:${JSON.stringify(value)}:${rules.map(r => r.name).join(',')}`;
			
			// Check cache first
			if (this.cache.has(cacheKey)) {
				resolve(this.cache.get(cacheKey)!);
				return;
			}

			// Clear any pending validation for this field
			if (this.pendingValidations.has(fieldName)) {
				clearTimeout(this.pendingValidations.get(fieldName));
			}

			// Schedule validation
			const timeoutId = setTimeout(() => {
				const result = formValidator.validateField('optimized', fieldName, value, rules);
				this.cache.set(cacheKey, result);
				this.pendingValidations.delete(fieldName);
				resolve(result);
			}, debounceMs);

			this.pendingValidations.set(fieldName, timeoutId);
		});
	}

	/**
	 * Batch validate multiple fields at once
	 */
	batchValidate(
		fields: Array<{ fieldName: string; value: any; rules: ValidationRule[] }>
	): Record<string, ValidationResult> {
		const results: Record<string, ValidationResult> = {};
		const startTime = performance.now();

		// Validate each field
		fields.forEach(({ fieldName, value, rules }) => {
			const cacheKey = `${fieldName}:${JSON.stringify(value)}:${rules.map(r => r.name).join(',')}`;
			
			// Check cache first
			if (this.cache.has(cacheKey)) {
				results[fieldName] = this.cache.get(cacheKey)!;
				return;
			}

			// Perform validation
			const result = formValidator.validateField('batch', fieldName, value, rules);
			this.cache.set(cacheKey, result);
			results[fieldName] = result;
		});

		const endTime = performance.now();
		console.log(`Batch validation completed in ${endTime - startTime}ms for ${fields.length} fields`);
		
		return results;
	}

	/**
	 * Clear all caches
	 */
	clearAllCaches(): void {
		this.cache.clear();
		this.pendingValidations.clear();
	}
}