/**
 * User-Friendly Error Messages
 * 
 * Provides comprehensive, human-readable error messages for all validation scenarios.
 * Maps error codes and types to friendly messages that users can understand.
 * 
 * FreshVibe Apps Way:
 * - Single responsibility: error message mapping
 * - Small modular file (< 2000 lines)
 * - Clear system boundaries
 * - Visual-first error reporting
 */

import type { ErrorContext } from '$lib/types';
import type { ValidationError as ValidationErrorType } from '$lib/validation';

export interface ErrorMessageConfig {
	/** The error code or type */
	code: string;
	/** User-friendly title */
	title: string;
	/** User-friendly message */
	message: string;
	/** Suggested action for the user */
	suggestedAction: string;
	/** Whether the error is recoverable */
	recoverable: boolean;
	/** Icon or emoji for the error */
	icon: string;
	/** Severity level */
	severity: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Error message configurations for common error types
 */
export const ERROR_MESSAGES: ErrorMessageConfig[] = [
	// Network errors
	{
		code: 'network_error',
		title: 'Network Connection Issue',
		message: 'Unable to connect to the server. Please check your internet connection.',
		suggestedAction: 'Check your network connection and try again.',
		recoverable: true,
		icon: '📡',
		severity: 'error'
	},
	{
		code: 'timeout_error',
		title: 'Request Timeout',
		message: 'The request took too long to complete.',
		suggestedAction: 'Please try again in a moment.',
		recoverable: true,
		icon: '⏱️',
		severity: 'warning'
	},

	// Authentication errors
	{
		code: 'auth_error',
		title: 'Authentication Required',
		message: 'You need to log in to access this feature.',
		suggestedAction: 'Please log in and try again.',
		recoverable: true,
		icon: '🔐',
		severity: 'warning'
	},
	{
		code: 'permission_denied',
		title: 'Permission Denied',
		message: 'You don\'t have permission to perform this action.',
		suggestedAction: 'Contact your administrator for access.',
		recoverable: false,
		icon: '🚫',
		severity: 'error'
	},

	// Validation errors
	{
		code: 'validation_error',
		title: 'Validation Error',
		message: 'Please check your input and try again.',
		suggestedAction: 'Review the highlighted fields and correct any errors.',
		recoverable: true,
		icon: '📝',
		severity: 'warning'
	},
	{
		code: 'required',
		title: 'Required Field',
		message: 'This field is required.',
		suggestedAction: 'Please fill in this field.',
		recoverable: true,
		icon: '⚠️',
		severity: 'warning'
	},
	{
		code: 'email',
		title: 'Invalid Email',
		message: 'Please enter a valid email address.',
		suggestedAction: 'Check the email format (e.g., user@example.com).',
		recoverable: true,
		icon: '📧',
		severity: 'warning'
	},
	{
		code: 'url',
		title: 'Invalid URL',
		message: 'Please enter a valid web address.',
		suggestedAction: 'Include http:// or https:// at the beginning.',
		recoverable: true,
		icon: '🔗',
		severity: 'warning'
	},
	{
		code: 'min',
		title: 'Value Too Small',
		message: 'The value is below the minimum allowed.',
		suggestedAction: 'Enter a larger value.',
		recoverable: true,
		icon: '📏',
		severity: 'warning'
	},
	{
		code: 'max',
		title: 'Value Too Large',
		message: 'The value exceeds the maximum allowed.',
		suggestedAction: 'Enter a smaller value.',
		recoverable: true,
		icon: '📏',
		severity: 'warning'
	},
	{
		code: 'minLength',
		title: 'Too Short',
		message: 'The text is shorter than required.',
		suggestedAction: 'Add more characters.',
		recoverable: true,
		icon: '📝',
		severity: 'warning'
	},
	{
		code: 'maxLength',
		title: 'Too Long',
		message: 'The text exceeds the maximum length.',
		suggestedAction: 'Shorten the text.',
		recoverable: true,
		icon: '📝',
		severity: 'warning'
	},
	{
		code: 'pattern',
		title: 'Invalid Format',
		message: 'The format is incorrect.',
		suggestedAction: 'Follow the required format.',
		recoverable: true,
		icon: '🔍',
		severity: 'warning'
	},
	{
		code: 'date',
		title: 'Invalid Date',
		message: 'Please enter a valid date.',
		suggestedAction: 'Use a valid date format (e.g., YYYY-MM-DD).',
		recoverable: true,
		icon: '📅',
		severity: 'warning'
	},

	// Server errors
	{
		code: 'server_error',
		title: 'Server Error',
		message: 'Something went wrong on our server.',
		suggestedAction: 'Please try again later.',
		recoverable: true,
		icon: '🖥️',
		severity: 'error'
	},
	{
		code: 'not_found',
		title: 'Not Found',
		message: 'The requested resource was not found.',
		suggestedAction: 'Check the URL or search for the resource.',
		recoverable: false,
		icon: '🔍',
		severity: 'error'
	},

	// Rate limiting
	{
		code: 'rate_limit',
		title: 'Too Many Requests',
		message: 'You\'ve made too many requests. Please wait a moment.',
		suggestedAction: 'Wait a few minutes and try again.',
		recoverable: true,
		icon: '⏳',
		severity: 'warning'
	},

	// File errors
	{
		code: 'file_too_large',
		title: 'File Too Large',
		message: 'The file exceeds the maximum size limit.',
		suggestedAction: 'Choose a smaller file or compress it.',
		recoverable: true,
		icon: '📁',
		severity: 'warning'
	},
	{
		code: 'invalid_file_type',
		title: 'Invalid File Type',
		message: 'This file type is not supported.',
		suggestedAction: 'Choose a supported file type.',
		recoverable: true,
		icon: '📄',
		severity: 'warning'
	},

	// Business logic errors
	{
		code: 'duplicate_entry',
		title: 'Duplicate Entry',
		message: 'This item already exists.',
		suggestedAction: 'Use a different value or edit the existing item.',
		recoverable: true,
		icon: '📋',
		severity: 'warning'
	},
	{
		code: 'insufficient_balance',
		title: 'Insufficient Balance',
		message: 'You don\'t have enough balance to complete this action.',
		suggestedAction: 'Add funds or choose a different option.',
		recoverable: true,
		icon: '💰',
		severity: 'warning'
	},

	// System errors
	{
		code: 'system_error',
		title: 'System Error',
		message: 'A system error occurred.',
		suggestedAction: 'Please contact support if the problem persists.',
		recoverable: false,
		icon: '⚙️',
		severity: 'critical'
	},
	{
		code: 'unknown_error',
		title: 'Unexpected Error',
		message: 'Something went wrong. We\'re looking into it.',
		suggestedAction: 'Try again or contact support.',
		recoverable: true,
		icon: '❓',
		severity: 'error'
	}
];

/**
 * Get error message configuration for an error code
 */
export function getErrorMessageConfig(code: string): ErrorMessageConfig {
	const config = ERROR_MESSAGES.find(msg => msg.code === code);
	if (config) {
		return config;
	}

	// Try partial match
	for (const msg of ERROR_MESSAGES) {
		if (code.includes(msg.code) || msg.code.includes(code)) {
			return msg;
		}
	}

	// Default to unknown error
	return ERROR_MESSAGES.find(msg => msg.code === 'unknown_error')!;
}

/**
 * Get user-friendly error message for an error context
 */
export function getUserFriendlyError(error: ErrorContext | ValidationErrorType | string): {
	title: string;
	message: string;
	suggestedAction: string;
	icon: string;
	severity: 'info' | 'warning' | 'error' | 'critical';
} {
	let code: string;
	let severity: 'info' | 'warning' | 'error' | 'critical' = 'error';

	if (typeof error === 'string') {
		code = error;
	} else if ('rule' in error) {
		// ValidationErrorType
		code = error.rule || 'validation_error';
		severity = error.severity === 'warning' ? 'warning' :
		           error.severity === 'info' ? 'info' : 'error';
	} else {
		// ErrorContext
		code = error.code || 'unknown_error';
		severity = error.severity || 'error';
	}

	const config = getErrorMessageConfig(code);
	
	return {
		title: config.title,
		message: config.message,
		suggestedAction: config.suggestedAction,
		icon: config.icon,
		severity: config.severity === 'critical' && severity !== 'critical' ? severity : config.severity
	};
}

/**
 * Format validation error for display
 */
export function formatValidationError(error: ValidationErrorType, fieldLabel?: string): string {
	const field = fieldLabel || error.field || 'This field';
	const config = getErrorMessageConfig(error.rule);

	// Use custom message if provided
	if (error.message) {
		return error.message;
	}

	// Format message with field name
	let message = config.message;
	
	// Replace field placeholder if present
	if (message.includes('{field}')) {
		message = message.replace('{field}', field);
	} else if (!message.startsWith(field)) {
		message = `${field} ${message.toLowerCase()}`;
	}

	// Add context if available
	if (error.context) {
		const contextStr = typeof error.context === 'object'
			? JSON.stringify(error.context)
			: String(error.context);
		if (contextStr && contextStr !== '{}') {
			message += ` (${contextStr})`;
		}
	}

	return message;
}

/**
 * Format multiple validation errors
 */
export function formatValidationErrors(errors: ValidationErrorType[], fieldLabels?: Record<string, string>): string[] {
	return errors.map(error => {
		const fieldLabel = fieldLabels?.[error.field || ''] || error.field;
		return formatValidationError(error, fieldLabel);
	});
}

/**
 * Create a summary of validation errors
 */
export function createValidationSummary(errors: ValidationErrorType[]): {
	count: number;
	fields: string[];
	message: string;
} {
	const fields = [...new Set(errors.map(e => e.field).filter(Boolean))] as string[];
	const count = errors.length;

	let message: string;
	if (count === 1) {
		message = 'There is 1 validation error.';
	} else if (fields.length === 1) {
		message = `There are ${count} errors in the ${fields[0]} field.`;
	} else {
		message = `There are ${count} errors in ${fields.length} fields.`;
	}

	return {
		count,
		fields,
		message
	};
}

/**
 * Get field-specific error messages
 */
export function getFieldErrorMessages(fieldName: string): Record<string, string> {
	const fieldMessages: Record<string, string> = {};

	// Common field-specific messages
	switch (fieldName.toLowerCase()) {
		case 'email':
		case 'emailaddress':
			fieldMessages.email = 'Please enter a valid email address (e.g., user@example.com).';
			fieldMessages.required = 'Email address is required.';
			break;

		case 'password':
			fieldMessages.required = 'Password is required.';
			fieldMessages.minLength = 'Password must be at least 8 characters.';
			fieldMessages.pattern = 'Password must include letters and numbers.';
			break;

		case 'name':
		case 'fullname':
		case 'username':
			fieldMessages.required = 'Name is required.';
			fieldMessages.minLength = 'Name must be at least 2 characters.';
			fieldMessages.maxLength = 'Name cannot exceed 100 characters.';
			break;

		case 'phone':
		case 'phonenumber':
			fieldMessages.pattern = 'Please enter a valid phone number.';
			break;

		case 'url':
		case 'website':
			fieldMessages.url = 'Please enter a valid URL (e.g., https://example.com).';
			break;

		case 'date':
		case 'birthdate':
			fieldMessages.date = 'Please enter a valid date (e.g., YYYY-MM-DD).';
			break;

		default:
			// Generic field messages
			fieldMessages.required = 'This field is required.';
			fieldMessages.email = 'Please enter a valid email address.';
			fieldMessages.url = 'Please enter a valid URL.';
			fieldMessages.date = 'Please enter a valid date.';
			fieldMessages.min = 'Value is too small.';
			fieldMessages.max = 'Value is too large.';
			fieldMessages.minLength = 'Text is too short.';
			fieldMessages.maxLength = 'Text is too long.';
			fieldMessages.pattern = 'Invalid format.';
	}

	return fieldMessages;
}

/**
 * Get icon for error type
 */
export function getErrorIcon(type: string): string {
	const config = ERROR_MESSAGES.find(msg => msg.code === type);
	return config?.icon || '❌';
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: 'info' | 'warning' | 'error' | 'critical'): string {
	switch (severity) {
		case 'info':
			return '#2196F3'; // Blue
		case 'warning':
			return '#FF9800'; // Orange
		case 'error':
			return '#F44336'; // Red
		case 'critical':
			return '#D32F2F'; // Dark red
		default:
			return '#757575'; // Gray
	}
}

/**
 * Get severity background color
 */
export function getSeverityBackground(severity: 'info' | 'warning' | 'error' | 'critical'): string {
	switch (severity) {
		case 'info':
			return '#E3F2FD'; // Light blue
		case 'warning':
			return '#FFF3E0'; // Light orange
		case 'error':
			return '#FFEBEE'; // Light red
		case 'critical':
			return '#FFCDD2'; // Light dark red
		default:
			return '#F5F5F5'; // Light gray
	}
}

/**
 * Get severity border color
 */
export function getSeverityBorder(severity: 'info' | 'warning' | 'error' | 'critical'): string {
	switch (severity) {
		case 'info':
			return '#BBDEFB'; // Blue
		case 'warning':
			return '#FFE0B2'; // Orange
		case 'error':
			return '#FFCDD2'; // Red
		case 'critical':
			return '#EF9A9A'; // Dark red
		default:
			return '#E0E0E0'; // Gray
	}
}