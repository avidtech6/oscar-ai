/**
 * Validation Rules - Application-Specific Validation Rules
 * 
 * This file provides comprehensive validation rules for all form fields
 * and data structures across the Oscar AI application.
 */

import {
	type ValidationRule,
	ValidationRuleFactory,
	FormValidationUtils
} from './validation';

// Application-specific validation rules
export class AppValidationRules {
	// User-related validation rules
	static userRules = {
		username: ValidationRuleFactory.pattern(/^[a-zA-Z0-9_]{3,20}$/, 'Username must be 3-20 characters and contain only letters, numbers, and underscores'),
		email: ValidationRuleFactory.email('Please enter a valid email address'),
		password: ValidationRuleFactory.minLength(8, 'Password must be at least 8 characters long'),
		passwordConfirm: (passwordField: string) => ValidationRuleFactory.customWithContext(
			'passwordConfirm',
			(value: any, context: any) => ({
				valid: value === context?.[passwordField],
				error: 'Passwords do not match'
			}),
			'Passwords do not match'
		),
		firstName: ValidationRuleFactory.minLength(2, 'First name must be at least 2 characters long'),
		lastName: ValidationRuleFactory.minLength(2, 'Last name must be at least 2 characters long'),
		phone: ValidationRuleFactory.pattern(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
		dateOfBirth: ValidationRuleFactory.customWithContext(
			'dateOfBirth',
			(value: any, context: any) => {
				const age = FormValidationUtils.calculateAge(value);
				return {
					valid: age >= 13 && age <= 120,
					error: 'You must be between 13 and 120 years old'
				};
			},
			'You must be between 13 and 120 years old'
		)
	};

	// Project-related validation rules
	static projectRules = {
		name: ValidationRuleFactory.minLength(2, 'Project name must be at least 2 characters long'),
		description: ValidationRuleFactory.maxLength(1000, 'Description must be less than 1000 characters'),
		startDate: ValidationRuleFactory.customWithContext(
			'startDate',
			(value: any, context: any) => {
				const today = new Date();
				const selectedDate = new Date(value);
				return {
					valid: selectedDate >= today,
					error: 'Start date must be today or in the future'
				};
			},
			'Start date must be today or in the future'
		),
		endDate: (startDateField: string) => ValidationRuleFactory.customWithContext(
			'endDate',
			(value: any, context: any) => {
				const startDate = context?.[startDateField];
				if (!startDate) return { valid: true };
				
				const start = new Date(startDate);
				const end = new Date(value);
				return {
					valid: end > start,
					error: 'End date must be after start date'
				};
			},
			'End date must be after start date'
		),
		priority: ValidationRuleFactory.required('Priority is required'),
		status: ValidationRuleFactory.required('Status is required'),
		budget: ValidationRuleFactory.numeric('Budget must be a valid number'),
		tags: ValidationRuleFactory.customWithContext(
			'tags',
			(value: any, context: any) => {
				if (!Array.isArray(value)) return { valid: false, error: 'Tags must be an array' };
				return {
					valid: value.length <= 10,
					error: 'Maximum 10 tags allowed'
				};
			},
			'Maximum 10 tags allowed'
		)
	};

	// Document-related validation rules
	static documentRules = {
		title: ValidationRuleFactory.minLength(1, 'Title is required'),
		content: ValidationRuleFactory.minLength(10, 'Content must be at least 10 characters long'),
		fileName: ValidationRuleFactory.pattern(/^[a-zA-Z0-9_\-\s\.]+$/, 'File name contains invalid characters'),
		fileSize: ValidationRuleFactory.customWithContext(
			'fileSize',
			(value: any, context: any) => {
				const maxSize = 10 * 1024 * 1024; // 10MB
				return {
					valid: value <= maxSize,
					error: 'File size must be less than 10MB'
				};
			},
			'File size must be less than 10MB'
		),
		fileType: ValidationRuleFactory.pattern(/^(pdf|doc|docx|txt|md)$/, 'Unsupported file type'),
		category: ValidationRuleFactory.required('Category is required'),
		author: ValidationRuleFactory.minLength(2, 'Author name must be at least 2 characters long'),
		keywords: ValidationRuleFactory.maxLength(100, 'Keywords must be less than 100 characters'),
		publishDate: ValidationRuleFactory.date('Please enter a valid date'),
		expiryDate: ValidationRuleFactory.date('Please enter a valid date')
	};

	// Task-related validation rules
	static taskRules = {
		title: ValidationRuleFactory.minLength(1, 'Task title is required'),
		description: ValidationRuleFactory.maxLength(500, 'Description must be less than 500 characters'),
		assignee: ValidationRuleFactory.required('Assignee is required'),
		dueDate: ValidationRuleFactory.date('Please enter a valid due date'),
		priority: ValidationRuleFactory.required('Priority is required'),
		status: ValidationRuleFactory.required('Status is required'),
		estimatedHours: ValidationRuleFactory.numeric('Estimated hours must be a valid number'),
		actualHours: ValidationRuleFactory.numeric('Actual hours must be a valid number'),
		dependencies: ValidationRuleFactory.customWithContext(
			'dependencies',
			(value: any, context: any) => {
				if (!Array.isArray(value)) return { valid: false, error: 'Dependencies must be an array' };
				return {
					valid: value.length <= 5,
					error: 'Maximum 5 dependencies allowed'
				};
			},
			'Maximum 5 dependencies allowed'
		),
		tags: ValidationRuleFactory.customWithContext(
			'tags',
			(value: any, context: any) => {
				if (!Array.isArray(value)) return { valid: false, error: 'Tags must be an array' };
				return {
					valid: value.length <= 5,
					error: 'Maximum 5 tags allowed'
				};
			},
			'Maximum 5 tags allowed'
		)
	};

	// Meeting-related validation rules
	static meetingRules = {
		title: ValidationRuleFactory.minLength(1, 'Meeting title is required'),
		description: ValidationRuleFactory.maxLength(1000, 'Description must be less than 1000 characters'),
		startTime: ValidationRuleFactory.required('Start time is required'),
		endTime: ValidationRuleFactory.required('End time is required'),
		date: ValidationRuleFactory.date('Please enter a valid date'),
		location: ValidationRuleFactory.minLength(2, 'Location must be at least 2 characters long'),
		organizer: ValidationRuleFactory.required('Organizer is required'),
		participants: ValidationRuleFactory.customWithContext(
			'participants',
			(value: any, context: any) => {
				if (!Array.isArray(value)) return { valid: false, error: 'Participants must be an array' };
				return {
					valid: value.length <= 50,
					error: 'Maximum 50 participants allowed'
				};
			},
			'Maximum 50 participants allowed'
		),
		agenda: ValidationRuleFactory.maxLength(2000, 'Agenda must be less than 2000 characters'),
		notes: ValidationRuleFactory.maxLength(3000, 'Notes must be less than 3000 characters'),
		recurrence: ValidationRuleFactory.pattern(/^(none|daily|weekly|monthly|yearly)$/, 'Invalid recurrence pattern'),
		reminder: ValidationRuleFactory.numeric('Reminder must be a valid number'),
		status: ValidationRuleFactory.required('Status is required')
	};

	// Report-related validation rules
	static reportRules = {
		title: ValidationRuleFactory.minLength(1, 'Report title is required'),
		type: ValidationRuleFactory.required('Report type is required'),
		dateRange: ValidationRuleFactory.required('Date range is required'),
		template: ValidationRuleFactory.required('Template is required'),
		author: ValidationRuleFactory.minLength(2, 'Author name must be at least 2 characters long'),
		distribution: ValidationRuleFactory.required('Distribution is required'),
		priority: ValidationRuleFactory.required('Priority is required'),
		format: ValidationRuleFactory.pattern(/^(pdf|doc|html|csv)$/, 'Invalid report format'),
		sections: ValidationRuleFactory.customWithContext(
			'sections',
			(value: any, context: any) => {
				if (!Array.isArray(value)) return { valid: false, error: 'Sections must be an array' };
				return {
					valid: value.length <= 10,
					error: 'Maximum 10 sections allowed'
				};
			},
			'Maximum 10 sections allowed'
		),
		keywords: ValidationRuleFactory.maxLength(200, 'Keywords must be less than 200 characters'),
		tags: ValidationRuleFactory.customWithContext(
			'tags',
			(value: any, context: any) => {
				if (!Array.isArray(value)) return { valid: false, error: 'Tags must be an array' };
				return {
					valid: value.length <= 10,
					error: 'Maximum 10 tags allowed'
				};
			},
			'Maximum 10 tags allowed'
		)
	};

	// Settings-related validation rules
	static settingsRules = {
		companyName: ValidationRuleFactory.minLength(2, 'Company name must be at least 2 characters long'),
		timezone: ValidationRuleFactory.required('Timezone is required'),
		language: ValidationRuleFactory.required('Language is required'),
		currency: ValidationRuleFactory.required('Currency is required'),
		dateFormat: ValidationRuleFactory.pattern(/^(YYYY-MM-DD|DD\/MM\/YYYY|MM\/DD\/YYYY)$/, 'Invalid date format'),
		timeFormat: ValidationRuleFactory.pattern(/^(12h|24h)$/, 'Invalid time format'),
		notifications: ValidationRuleFactory.required('Notifications setting is required'),
		emailNotifications: ValidationRuleFactory.required('Email notifications setting is required'),
		smsNotifications: ValidationRuleFactory.required('SMS notifications setting is required'),
		theme: ValidationRuleFactory.pattern(/^(light|dark|auto)$/, 'Invalid theme selection'),
		dataRetention: ValidationRuleFactory.numeric('Data retention period must be a valid number'),
		backupFrequency: ValidationRuleFactory.pattern(/^(daily|weekly|monthly|yearly)$/, 'Invalid backup frequency'),
		securityLevel: ValidationRuleFactory.pattern(/^(basic|enhanced|maximum)$/, 'Invalid security level')
	};

	// Security-related validation rules
	static securityRules = {
		currentPassword: ValidationRuleFactory.required('Current password is required'),
		newPassword: ValidationRuleFactory.minLength(8, 'New password must be at least 8 characters long'),
		confirmPassword: ValidationRuleFactory.customWithContext(
			'confirmPassword',
			(value: any, context: any) => ({
				valid: value === context?.newPassword,
				error: 'Passwords do not match'
			}),
			'Passwords do not match'
		),
		twoFactorAuth: ValidationRuleFactory.required('Two-factor authentication setting is required'),
		sessionTimeout: ValidationRuleFactory.numeric('Session timeout must be a valid number'),
		maxLoginAttempts: ValidationRuleFactory.numeric('Maximum login attempts must be a valid number'),
		accountLockoutDuration: ValidationRuleFactory.numeric('Account lockout duration must be a valid number'),
		passwordExpiry: ValidationRuleFactory.numeric('Password expiry must be a valid number'),
		allowedIpAddresses: ValidationRuleFactory.customWithContext(
			'allowedIpAddresses',
			(value: any, context: any) => {
				if (!Array.isArray(value)) return { valid: false, error: 'IP addresses must be an array' };
				const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
				for (const ip of value) {
					if (!ipPattern.test(ip)) {
						return { valid: false, error: 'Invalid IP address format' };
					}
				}
				return { valid: true };
			},
			'Invalid IP address format'
		),
		apiKeyPermissions: ValidationRuleFactory.required('API key permissions are required'),
		accessLogsRetention: ValidationRuleFactory.numeric('Access logs retention must be a valid number'),
		auditLogsRetention: ValidationRuleFactory.numeric('Audit logs retention must be a valid number')
	};

	// Field configurations for all form types
	static getFieldConfig(formType: string): Record<string, ValidationRule[]> {
		const configs: Record<string, Record<string, ValidationRule[]>> = {
			user: {
				username: [this.userRules.username],
				email: [this.userRules.email],
				password: [this.userRules.password],
				passwordConfirm: [this.userRules.passwordConfirm('password')],
				firstName: [this.userRules.firstName],
				lastName: [this.userRules.lastName],
				phone: [this.userRules.phone],
				dateOfBirth: [this.userRules.dateOfBirth]
			},
			project: {
				name: [this.projectRules.name],
				description: [this.projectRules.description],
				startDate: [this.projectRules.startDate],
				endDate: [this.projectRules.endDate('startDate')],
				priority: [this.projectRules.priority],
				status: [this.projectRules.status],
				budget: [this.projectRules.budget],
				tags: [this.projectRules.tags]
			},
			document: {
				title: [this.documentRules.title],
				content: [this.documentRules.content],
				fileName: [this.documentRules.fileName],
				fileSize: [this.documentRules.fileSize],
				fileType: [this.documentRules.fileType],
				category: [this.documentRules.category],
				author: [this.documentRules.author],
				keywords: [this.documentRules.keywords],
				publishDate: [this.documentRules.publishDate],
				expiryDate: [this.documentRules.expiryDate]
			},
			task: {
				title: [this.taskRules.title],
				description: [this.taskRules.description],
				assignee: [this.taskRules.assignee],
				dueDate: [this.taskRules.dueDate],
				priority: [this.taskRules.priority],
				status: [this.taskRules.status],
				estimatedHours: [this.taskRules.estimatedHours],
				actualHours: [this.taskRules.actualHours],
				dependencies: [this.taskRules.dependencies],
				tags: [this.taskRules.tags]
			},
			meeting: {
				title: [this.meetingRules.title],
				description: [this.meetingRules.description],
				startTime: [this.meetingRules.startTime],
				endTime: [this.meetingRules.endTime],
				date: [this.meetingRules.date],
				location: [this.meetingRules.location],
				organizer: [this.meetingRules.organizer],
				participants: [this.meetingRules.participants],
				agenda: [this.meetingRules.agenda],
				notes: [this.meetingRules.notes],
				recurrence: [this.meetingRules.recurrence],
				reminder: [this.meetingRules.reminder],
				status: [this.meetingRules.status]
			},
			report: {
				title: [this.reportRules.title],
				type: [this.reportRules.type],
				dateRange: [this.reportRules.dateRange],
				template: [this.reportRules.template],
				author: [this.reportRules.author],
				distribution: [this.reportRules.distribution],
				priority: [this.reportRules.priority],
				format: [this.reportRules.format],
				sections: [this.reportRules.sections],
				keywords: [this.reportRules.keywords],
				tags: [this.reportRules.tags]
			},
			settings: {
				companyName: [this.settingsRules.companyName],
				timezone: [this.settingsRules.timezone],
				language: [this.settingsRules.language],
				currency: [this.settingsRules.currency],
				dateFormat: [this.settingsRules.dateFormat],
				timeFormat: [this.settingsRules.timeFormat],
				notifications: [this.settingsRules.notifications],
				emailNotifications: [this.settingsRules.emailNotifications],
				smsNotifications: [this.settingsRules.smsNotifications],
				theme: [this.settingsRules.theme],
				dataRetention: [this.settingsRules.dataRetention],
				backupFrequency: [this.settingsRules.backupFrequency],
				securityLevel: [this.settingsRules.securityLevel]
			},
			security: {
				currentPassword: [this.securityRules.currentPassword],
				newPassword: [this.securityRules.newPassword],
				confirmPassword: [this.securityRules.confirmPassword],
				twoFactorAuth: [this.securityRules.twoFactorAuth],
				sessionTimeout: [this.securityRules.sessionTimeout],
				maxLoginAttempts: [this.securityRules.maxLoginAttempts],
				accountLockoutDuration: [this.securityRules.accountLockoutDuration],
				passwordExpiry: [this.securityRules.passwordExpiry],
				allowedIpAddresses: [this.securityRules.allowedIpAddresses],
				apiKeyPermissions: [this.securityRules.apiKeyPermissions],
				accessLogsRetention: [this.securityRules.accessLogsRetention],
				auditLogsRetention: [this.securityRules.auditLogsRetention]
			}
		};

		return configs[formType] || {};
	}

	// Validation rules for specific field combinations
	static getConditionalRules(formType: string, fieldName: string): ValidationRule[] {
		const conditionalRules: Record<string, Record<string, ValidationRule[]>> = {
			project: {
				endDate: [
					this.projectRules.endDate('startDate')
				]
			},
			user: {
				passwordConfirm: [
					this.userRules.passwordConfirm('password')
				]
			},
			security: {
				confirmPassword: [
					this.securityRules.confirmPassword
				]
			}
		};

		return conditionalRules[formType]?.[fieldName] || [];
	}

	// Get all validation rules for a specific form type
	static getAllRules(formType: string): Record<string, ValidationRule[]> {
		const baseRules = this.getFieldConfig(formType);
		const conditionalRules: Record<string, ValidationRule[]> = {};

		// Add conditional rules
		for (const [fieldName, rules] of Object.entries(this.getConditionalRules(formType, ''))) {
			conditionalRules[fieldName] = rules;
		}

		return { ...baseRules, ...conditionalRules };
	}

	// Validate form data with all rules
	static validateFormData(formType: string, formData: Record<string, any>): { valid: boolean; errors: Record<string, string[]> } {
		const rules = this.getAllRules(formType);
		const errors: Record<string, string[]> = {};

		for (const [fieldName, fieldRules] of Object.entries(rules)) {
			const value = formData[fieldName];
			const fieldErrors: string[] = [];

			for (const rule of fieldRules) {
				const result = rule.validate(value, formData);
				if (!result.valid && result.error) {
					fieldErrors.push(result.error);
				}
			}

			if (fieldErrors.length > 0) {
				errors[fieldName] = fieldErrors;
			}
		}

		return {
			valid: Object.keys(errors).length === 0,
			errors
		};
	}

	// Get validation summary for a form
	static getValidationSummary(formType: string): { totalFields: number; requiredFields: string[]; optionalFields: string[] } {
		const rules = this.getAllRules(formType);
		const requiredFields: string[] = [];
		const optionalFields: string[] = [];

		for (const [fieldName, fieldRules] of Object.entries(rules)) {
			const hasRequiredRule = fieldRules.some(rule => rule.name === 'required');
			if (hasRequiredRule) {
				requiredFields.push(fieldName);
			} else {
				optionalFields.push(fieldName);
			}
		}

		return {
			totalFields: Object.keys(rules).length,
			requiredFields,
			optionalFields
		};
	}
}

// Export default validation rules
export default AppValidationRules;