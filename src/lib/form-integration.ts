/**
 * Form Integration - Validation System Integration
 * 
 * This file provides integration utilities for the validation system with existing
 * forms and components across the Oscar AI application.
 */

import {
	CoreFormValidator,
	type ValidationRule,
	type FormValidation,
	type FormSubmission,
	type FieldValidationResult,
	type ValidationResult,
	type ValidationError,
	ValidationRuleFactory,
	FormValidationUtils
} from './validation';

// Form field configuration
export interface FormFieldConfig {
	/** Field name */
	name: string;
	
	/** Field label for display */
	label: string;
	
	/** Field type (text, email, password, number, etc.) */
	type: string;
	
	/** Validation rules for this field */
	rules: ValidationRule[];
	
	/** Whether field is required */
	required?: boolean;
	
	/** Field placeholder */
	placeholder?: string;
	
	/** Field description/help text */
	description?: string;
	
	/** Default value */
	defaultValue?: any;
	
	/** Validation error message override */
	errorMessage?: string;
	
	/** Whether field should be disabled */
	disabled?: boolean;
	
	/** Whether field should be read-only */
	readOnly?: boolean;
	
	/** Field validation dependencies */
	dependencies?: string[];
}

// Form configuration
export interface FormConfig {
	/** Form identifier */
	formId: string;
	
	/** Form title */
	title: string;
	
	/** Form description */
	description?: string;
	
	/** Form fields configuration */
	fields: FormFieldConfig[];
	
	/** Form submission handler */
	onSubmit?: (submission: FormSubmission) => Promise<void>;
	
	/** Form validation handler */
	onValidate?: (validation: FormValidation) => void;
	
	/** Field change handler */
	onFieldChange?: (field: string, value: any) => void;
	
	/** Form reset handler */
	onReset?: () => void;
}

// Form utilities
export class FormIntegration {
	private validator: CoreFormValidator;
	private forms: Map<string, FormConfig> = new Map();
	private formValues: Map<string, Record<string, any>> = new Map();
	private formErrors: Map<string, Record<string, string[]>> = new Map();

	constructor() {
		this.validator = new CoreFormValidator();
	}

	/**
	 * Register a new form
	 */
	registerForm(config: FormConfig): void {
		this.forms.set(config.formId, config);
		this.formValues.set(config.formId, {});
		this.formErrors.set(config.formId, {});
	}

	/**
	 * Unregister a form
	 */
	unregisterForm(formId: string): void {
		this.forms.delete(formId);
		this.formValues.delete(formId);
		this.formErrors.delete(formId);
	}

	/**
	 * Get form configuration
	 */
	getForm(formId: string): FormConfig | undefined {
		return this.forms.get(formId);
	}

	/**
	 * Get form values
	 */
	getFormValues(formId: string): Record<string, any> {
		return this.formValues.get(formId) || {};
	}

	/**
	 * Get form errors
	 */
	getFormErrors(formId: string): Record<string, string[]> {
		return this.formErrors.get(formId) || {};
	}

	/**
	 * Update form field value
	 */
	updateFieldValue(formId: string, field: string, value: any): void {
		const values = this.formValues.get(formId) || {};
		values[field] = value;
		this.formValues.set(formId, values);

		// Trigger field change handler if exists
		const config = this.forms.get(formId);
		if (config?.onFieldChange) {
			config.onFieldChange(field, value);
		}

		// Validate field immediately
		this.validateField(formId, field, value);
	}

	/**
	 * Validate a single field
	 */
	validateField(formId: string, field: string, value: any): FieldValidationResult {
		const config = this.forms.get(formId);
		if (!config) {
			throw new Error(`Form ${formId} not found`);
		}

		const fieldConfig = config.fields.find(f => f.name === field);
		if (!fieldConfig) {
			throw new Error(`Field ${field} not found in form ${formId}`);
		}

		const result = this.validator.validateField(formId, field, value, fieldConfig.rules);
		
		// Update errors
		const errors = this.formErrors.get(formId) || {};
		if (result.errors.length > 0) {
			errors[field] = result.errors.map(e => e.message);
		} else {
			delete errors[field];
		}
		this.formErrors.set(formId, errors);

		return {
			field,
			value,
			result
		};
	}

	/**
	 * Validate entire form
	 */
	validateForm(formId: string): FormValidation {
		const config = this.forms.get(formId);
		if (!config) {
			throw new Error(`Form ${formId} not found`);
		}

		const values = this.formValues.get(formId) || {};
		const fields: Record<string, ValidationRule[]> = {};

		// Build field rules map
		config.fields.forEach(fieldConfig => {
			fields[fieldConfig.name] = fieldConfig.rules;
		});

		const validation = this.validator.validateForm(formId, values, fields);
		
		// Update errors
		const errors: Record<string, string[]> = {};
		Object.entries(validation.fields).forEach(([fieldName, fieldResult]) => {
			if (fieldResult.errors.length > 0) {
				errors[fieldName] = fieldResult.errors.map(e => e.message);
			}
		});
		this.formErrors.set(formId, errors);

		// Trigger validation handler if exists
		if (config.onValidate) {
			config.onValidate(validation);
		}

		return validation;
	}

	/**
	 * Submit form
	 */
	async submitForm(formId: string): Promise<FormSubmission> {
		const config = this.forms.get(formId);
		if (!config) {
			throw new Error(`Form ${formId} not found`);
		}

		const validation = this.validateForm(formId);
		if (!validation.valid) {
			throw new Error('Form validation failed');
		}

		const values = this.formValues.get(formId) || {};
		const fields: Record<string, ValidationRule[]> = {};

		// Build field rules map
		config.fields.forEach(fieldConfig => {
			fields[fieldConfig.name] = fieldConfig.rules;
		});

		const submission = await this.validator.submitForm(formId, values, fields);

		// Trigger submission handler if exists
		if (config.onSubmit) {
			await config.onSubmit(submission);
		}

		return submission;
	}

	/**
	 * Reset form
	 */
	resetForm(formId: string): void {
		const config = this.forms.get(formId);
		if (!config) {
			throw new Error(`Form ${formId} not found`);
		}

		// Reset values to defaults
		const values: Record<string, any> = {};
		config.fields.forEach(field => {
			values[field.name] = field.defaultValue || '';
		});
		this.formValues.set(formId, values);

		// Clear errors
		this.formErrors.set(formId, {});

		// Trigger reset handler if exists
		if (config.onReset) {
			config.onReset();
		}
	}

	/**
	 * Create common form field configurations
	 */
	static createCommonFields(): Record<string, FormFieldConfig> {
		return {
			email: {
				name: 'email',
				label: 'Email Address',
				type: 'email',
				required: true,
				rules: [
					ValidationRuleFactory.required('Email address is required'),
					ValidationRuleFactory.email('Please enter a valid email address')
				],
				placeholder: 'Enter your email address',
				description: 'We\'ll use this to send you important updates'
			},
			password: {
				name: 'password',
				label: 'Password',
				type: 'password',
				required: true,
				rules: [
					ValidationRuleFactory.required('Password is required'),
					ValidationRuleFactory.minLength(8, 'Password must be at least 8 characters long')
				],
				placeholder: 'Enter your password',
				description: 'Must be at least 8 characters long'
			},
			name: {
				name: 'name',
				label: 'Full Name',
				type: 'text',
				required: true,
				rules: [
					ValidationRuleFactory.required('Full name is required'),
					ValidationRuleFactory.minLength(2, 'Name must be at least 2 characters long'),
					ValidationRuleFactory.maxLength(100, 'Name must be less than 100 characters long')
				],
				placeholder: 'Enter your full name',
				description: 'Enter your first and last name'
			},
			title: {
				name: 'title',
				label: 'Title',
				type: 'text',
				required: false,
				rules: [
					ValidationRuleFactory.maxLength(100, 'Title must be less than 100 characters long')
				],
				placeholder: 'Enter your title (optional)',
				description: 'Your professional title or role'
			},
			description: {
				name: 'description',
				label: 'Description',
				type: 'textarea',
				required: false,
				rules: [
					ValidationRuleFactory.maxLength(500, 'Description must be less than 500 characters long')
				],
				placeholder: 'Enter a description',
				description: 'Provide additional details about this item'
			},
			number: {
				name: 'number',
				label: 'Number',
				type: 'number',
				required: false,
				rules: [
					ValidationRuleFactory.numeric('Please enter a valid number')
				],
				placeholder: 'Enter a number',
				description: 'Enter a numeric value'
			},
			url: {
				name: 'url',
				label: 'URL',
				type: 'url',
				required: false,
				rules: [
					ValidationRuleFactory.pattern(/^https?:\/\/.+\..+/, 'Please enter a valid URL')
				],
				placeholder: 'https://example.com',
				description: 'Enter a valid URL'
			},
			phone: {
				name: 'phone',
				label: 'Phone Number',
				type: 'tel',
				required: false,
				rules: [
					ValidationRuleFactory.pattern(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
				],
				placeholder: '+1 (555) 123-4567',
				description: 'Enter your phone number'
			},
			checkbox: {
				name: 'checkbox',
				label: 'Checkbox',
				type: 'checkbox',
				required: false,
				rules: [],
				description: 'Check this box to confirm'
			},
			select: {
				name: 'select',
				label: 'Select Option',
				type: 'select',
				required: false,
				rules: [],
				description: 'Choose an option from the dropdown'
			}
		};
	}

	/**
	 * Create a form configuration with common fields
	 */
	static createFormWithCommonFields(formId: string, title: string, fields: string[], customFields?: FormFieldConfig[]): FormConfig {
		const commonFields = FormIntegration.createCommonFields();
		const selectedFields: FormFieldConfig[] = [];

		// Add selected common fields
		fields.forEach(fieldName => {
			if (commonFields[fieldName]) {
				selectedFields.push(commonFields[fieldName]);
			}
		});

		// Add custom fields
		if (customFields) {
			selectedFields.push(...customFields);
		}

		return {
			formId,
			title,
			fields: selectedFields
		};
	}
}

// Export default instance
export const formIntegration = new FormIntegration();

// Export utilities
export default {
	FormIntegration,
	formIntegration,
	FormIntegrationUtils: FormValidationUtils,
	ValidationRuleFactory
};