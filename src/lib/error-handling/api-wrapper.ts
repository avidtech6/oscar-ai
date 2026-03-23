/**
 * API Wrapper with Error Handling
 * 
 * Provides safe wrappers for API calls with automatic error handling,
 * retry logic, and user-friendly error messages.
 * 
 * FreshVibe Apps Way:
 * - Single responsibility: API error handling
 * - Small modular file (< 2000 lines)
 * - Clear system boundaries
 * - Visual-first error reporting
 */

import { errorHandler } from './error-handler';

export interface ApiOptions {
	/** Maximum number of retry attempts (default: 3) */
	maxRetries?: number;
	/** Base delay between retries in ms (default: 1000) */
	retryDelay?: number;
	/** Whether to use exponential backoff (default: true) */
	exponentialBackoff?: boolean;
	/** Component name for error context */
	component?: string;
	/** Operation name for error context */
	operation?: string;
	/** Custom error message */
	errorMessage?: string;
	/** Whether to show error to user (default: true) */
	showError?: boolean;
	/** Custom retry condition function */
	retryCondition?: (error: any) => boolean;
	/** Callback before each retry */
	onRetry?: (attempt: number) => void;
}

export interface ApiResponse<T = any> {
	data: T;
	status: number;
	statusText: string;
	headers: Record<string, string>;
}

/**
 * Safe fetch wrapper with error handling
 */
export async function safeFetch<T = any>(
	url: string | URL,
	options?: RequestInit,
	apiOptions?: ApiOptions
): Promise<ApiResponse<T>> {
	const config: ApiOptions = {
		maxRetries: 3,
		retryDelay: 1000,
		exponentialBackoff: true,
		showError: true,
		...apiOptions
	};

	const operation = config.operation || `fetch:${url}`;
	const component = config.component || 'api-wrapper';

	return errorHandler.withErrorHandling(
		async () => {
			const response = await fetch(url, options);
			
			if (!response.ok) {
				let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
				let errorData: any;
				
				try {
					errorData = await response.json();
					if (errorData?.message) {
						errorMessage = errorData.message;
					}
				} catch {
					// Ignore JSON parsing errors
				}
				
				throw new Error(errorMessage);
			}
			
			const data = await response.json();
			
			return {
				data,
				status: response.status,
				statusText: response.statusText,
				headers: Object.fromEntries(response.headers.entries())
			};
		},
		{
			operation,
			component,
			retryCount: config.maxRetries,
			onRetry: config.onRetry
		}
	);
}

/**
 * Safe API call wrapper for any async function
 */
export async function safeApiCall<T>(
	apiCall: () => Promise<T>,
	apiOptions?: ApiOptions
): Promise<T> {
	const config: ApiOptions = {
		maxRetries: 3,
		retryDelay: 1000,
		exponentialBackoff: true,
		showError: true,
		...apiOptions
	};

	const operation = config.operation || 'api-call';
	const component = config.component || 'api-wrapper';

	return errorHandler.withErrorHandling(
		apiCall,
		{
			operation,
			component,
			retryCount: config.maxRetries,
			onRetry: config.onRetry
		}
	);
}

/**
 * Create a safe API client with predefined configuration
 */
export function createApiClient(baseConfig: ApiOptions = {}) {
	return {
		/**
		 * GET request
		 */
		async get<T = any>(url: string, options?: RequestInit, apiOptions?: ApiOptions): Promise<ApiResponse<T>> {
			return safeFetch<T>(url, {
				method: 'GET',
				...options
			}, {
				...baseConfig,
				...apiOptions,
				operation: apiOptions?.operation || `GET ${url}`
			});
		},

		/**
		 * POST request
		 */
		async post<T = any>(url: string, data?: any, options?: RequestInit, apiOptions?: ApiOptions): Promise<ApiResponse<T>> {
			return safeFetch<T>(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...options?.headers
				},
				body: data ? JSON.stringify(data) : undefined,
				...options
			}, {
				...baseConfig,
				...apiOptions,
				operation: apiOptions?.operation || `POST ${url}`
			});
		},

		/**
		 * PUT request
		 */
		async put<T = any>(url: string, data?: any, options?: RequestInit, apiOptions?: ApiOptions): Promise<ApiResponse<T>> {
			return safeFetch<T>(url, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					...options?.headers
				},
				body: data ? JSON.stringify(data) : undefined,
				...options
			}, {
				...baseConfig,
				...apiOptions,
				operation: apiOptions?.operation || `PUT ${url}`
			});
		},

		/**
		 * PATCH request
		 */
		async patch<T = any>(url: string, data?: any, options?: RequestInit, apiOptions?: ApiOptions): Promise<ApiResponse<T>> {
			return safeFetch<T>(url, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					...options?.headers
				},
				body: data ? JSON.stringify(data) : undefined,
				...options
			}, {
				...baseConfig,
				...apiOptions,
				operation: apiOptions?.operation || `PATCH ${url}`
			});
		},

		/**
		 * DELETE request
		 */
		async delete<T = any>(url: string, options?: RequestInit, apiOptions?: ApiOptions): Promise<ApiResponse<T>> {
			return safeFetch<T>(url, {
				method: 'DELETE',
				...options
			}, {
				...baseConfig,
				...apiOptions,
				operation: apiOptions?.operation || `DELETE ${url}`
			});
		},

		/**
		 * Safe API call wrapper
		 */
		async call<T>(apiCall: () => Promise<T>, apiOptions?: ApiOptions): Promise<T> {
			return safeApiCall(apiCall, {
				...baseConfig,
				...apiOptions
			});
		}
	};
}

/**
 * Default API client instance
 */
export const api = createApiClient();

/**
 * Intelligence API client with specific configuration
 */
export const intelligenceApi = createApiClient({
	component: 'intelligence-api',
	maxRetries: 5,
	retryDelay: 2000
});

/**
 * Report API client with specific configuration
 */
export const reportApi = createApiClient({
	component: 'report-api',
	maxRetries: 3,
	retryDelay: 1500
});

/**
 * User API client with specific configuration
 */
export const userApi = createApiClient({
	component: 'user-api',
	maxRetries: 2,
	retryDelay: 1000
});

/**
 * Document API client with specific configuration
 */
export const documentApi = createApiClient({
	component: 'document-api',
	maxRetries: 3,
	retryDelay: 1000
});

/**
 * Utility to wrap existing API functions with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
	fn: T,
	config: ApiOptions = {}
): T {
	return (async (...args: any[]) => {
		return safeApiCall(() => fn(...args), config);
	}) as T;
}

/**
 * Create a batch API call with error handling
 */
export async function batchApiCalls<T>(
	calls: Array<() => Promise<T>>,
	config: ApiOptions = {}
): Promise<Array<T | Error>> {
	const results: Array<T | Error> = [];
	
	for (let i = 0; i < calls.length; i++) {
		try {
			const result = await safeApiCall(calls[i], {
				...config,
				operation: `${config.operation || 'batch'}[${i}]`
			});
			results.push(result);
		} catch (error) {
			results.push(error as Error);
		}
	}
	
	return results;
}

/**
 * Create a parallel API call with error handling
 */
export async function parallelApiCalls<T>(
	calls: Array<() => Promise<T>>,
	config: ApiOptions = {}
): Promise<Array<T | Error>> {
	const promises = calls.map((call, i) =>
		safeApiCall(call, {
			...config,
			operation: `${config.operation || 'parallel'}[${i}]`
		}).catch(error => error as Error)
	);
	
	return Promise.all(promises);
}

/**
 * Create a retryable API call with custom retry logic
 */
export function createRetryableApiCall<T>(
	apiCall: () => Promise<T>,
	retryConfig: {
		maxRetries: number;
		retryDelay: number;
		shouldRetry: (error: any, attempt: number) => boolean;
		onRetry?: (error: any, attempt: number) => void;
	}
): () => Promise<T> {
	return async () => {
		let lastError: any;
		
		for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
			try {
				return await apiCall();
			} catch (error) {
				lastError = error;
				
				if (retryConfig.onRetry) {
					retryConfig.onRetry(error, attempt);
				}
				
				if (attempt < retryConfig.maxRetries && retryConfig.shouldRetry(error, attempt)) {
					const delay = retryConfig.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
					await new Promise(resolve => setTimeout(resolve, delay));
					continue;
				}
				
				break;
			}
		}
		
		throw lastError;
	};
}

/**
 * Error types for API calls
 */
export class ApiError extends Error {
	constructor(
		message: string,
		public code: string = 'api_error',
		public status?: number,
		public data?: any
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export class NetworkError extends ApiError {
	constructor(message: string = 'Network error') {
		super(message, 'network_error');
		this.name = 'NetworkError';
	}
}

export class TimeoutError extends ApiError {
	constructor(message: string = 'Request timeout') {
		super(message, 'timeout_error');
		this.name = 'TimeoutError';
	}
}

export class AuthError extends ApiError {
	constructor(message: string = 'Authentication required') {
		super(message, 'auth_error', 401);
		this.name = 'AuthError';
	}
}

export class ValidationError extends ApiError {
	constructor(message: string = 'Validation error', public fields?: Record<string, string>) {
		super(message, 'validation_error', 400);
		this.name = 'ValidationError';
	}
}

export class NotFoundError extends ApiError {
	constructor(message: string = 'Resource not found') {
		super(message, 'not_found', 404);
		this.name = 'NotFoundError';
	}
}

export class ServerError extends ApiError {
	constructor(message: string = 'Server error') {
		super(message, 'server_error', 500);
		this.name = 'ServerError';
	}
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
	if (!error) return false;
	
	// Network errors are retryable
	if (error instanceof NetworkError) return true;
	
	// Timeout errors are retryable
	if (error instanceof TimeoutError) return true;
	
	// Server errors (5xx) are retryable
	if (error instanceof ServerError) return true;
	
	// Check error code
	const code = error.code || '';
	if (code.includes('network') || code.includes('timeout') || code.includes('server')) {
		return true;
	}
	
	// Check status code
	const status = error.status || error.statusCode;
	if (status >= 500 && status < 600) {
		return true;
	}
	
	// Rate limiting (429) is retryable
	if (status === 429) {
		return true;
	}
	
	return false;
}

/**
 * Create error from HTTP response
 */
export function createErrorFromResponse(response: Response, data?: any): ApiError {
	const status = response.status;
	const message = data?.message || response.statusText || `HTTP ${status}`;
	
	switch (status) {
		case 400:
			return new ValidationError(message, data?.errors);
		case 401:
		case 403:
			return new AuthError(message);
		case 404:
			return new NotFoundError(message);
		case 408:
		case 504:
			return new TimeoutError(message);
		case 429:
			return new ApiError(message, 'rate_limit', status);
		case 500:
		case 502:
		case 503:
			return new ServerError(message);
		default:
			return new ApiError(message, 'api_error', status);
	}
}