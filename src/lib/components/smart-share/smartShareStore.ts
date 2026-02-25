import { writable, derived, type Writable, type Readable } from 'svelte/store';
import {
	requestVerificationEmail,
	extractVerificationCode,
	extractAPIKey,
	extractProviderSettings
} from '../../email/utils/smartShareHooks';
import type { EmailMessage } from '../../email/smtp/smtpTypes';

// Types
export interface SmartShareTask {
	id: string;
	type: 'verification' | 'api-key' | 'settings' | 'provider-detection';
	status: 'pending' | 'in-progress' | 'completed' | 'failed';
	providerId?: string;
	emailAddress: string;
	createdAt: number;
	updatedAt: number;
	result?: any;
	error?: string;
}

export interface SmartShareState {
	isOpen: boolean;
	currentTaskId: string | null;
	tasks: SmartShareTask[];
	activeEmail: EmailMessage | null;
	verificationCode: string;
	extractedSettings: any;
	isProcessing: boolean;
	progress: number; // 0-100
}

// Initial state
const initialState: SmartShareState = {
	isOpen: false,
	currentTaskId: null,
	tasks: [],
	activeEmail: null,
	verificationCode: '',
	extractedSettings: {},
	isProcessing: false,
	progress: 0
};

// Create store
const smartShareStore: Writable<SmartShareState> = writable(initialState);

// Derived stores
export const activeTask: Readable<SmartShareTask | null> = derived(
	smartShareStore,
	$store => {
		if (!$store.currentTaskId) return null;
		return $store.tasks.find(task => task.id === $store.currentTaskId) || null;
	}
);

export const pendingTasks: Readable<SmartShareTask[]> = derived(
	smartShareStore,
	$store => $store.tasks.filter(task => task.status === 'pending')
);

export const completedTasks: Readable<SmartShareTask[]> = derived(
	smartShareStore,
	$store => $store.tasks.filter(task => task.status === 'completed')
);

// Actions
export const openSmartShare = (email?: EmailMessage) => {
	smartShareStore.update(state => ({
		...state,
		isOpen: true,
		activeEmail: email || state.activeEmail
	}));
};

export const closeSmartShare = () => {
	smartShareStore.update(state => ({
		...state,
		isOpen: false,
		currentTaskId: null,
		isProcessing: false,
		progress: 0
	}));
};

export const createVerificationTask = async (options: {
	emailAddress: string;
	providerId: string;
	purpose: 'account-verification' | 'api-key' | 'settings-extraction';
}) => {
	const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
	const task: SmartShareTask = {
		id: taskId,
		type: 'verification',
		status: 'pending',
		providerId: options.providerId,
		emailAddress: options.emailAddress,
		createdAt: Date.now(),
		updatedAt: Date.now()
	};
	
	smartShareStore.update(state => ({
		...state,
		tasks: [...state.tasks, task],
		currentTaskId: taskId
	}));
	
	// Start the verification process
	await startVerificationProcess(taskId, options);
	
	return taskId;
};

export const createAPIKeyExtractionTask = async (email: EmailMessage, providerId?: string) => {
	const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
	const task: SmartShareTask = {
		id: taskId,
		type: 'api-key',
		status: 'pending',
		providerId,
		emailAddress: typeof email.from === 'string' ? email.from : email.from?.address || '',
		createdAt: Date.now(),
		updatedAt: Date.now()
	};
	
	smartShareStore.update(state => ({
		...state,
		tasks: [...state.tasks, task],
		currentTaskId: taskId,
		activeEmail: email
	}));
	
	// Start extraction
	await startAPIKeyExtraction(taskId, email, providerId);
	
	return taskId;
};

export const createSettingsExtractionTask = async (email: EmailMessage) => {
	const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
	const task: SmartShareTask = {
		id: taskId,
		type: 'settings',
		status: 'pending',
		emailAddress: typeof email.from === 'string' ? email.from : email.from?.address || '',
		createdAt: Date.now(),
		updatedAt: Date.now()
	};
	
	smartShareStore.update(state => ({
		...state,
		tasks: [...state.tasks, task],
		currentTaskId: taskId,
		activeEmail: email
	}));
	
	// Start extraction
	await startSettingsExtraction(taskId, email);
	
	return taskId;
};

// Process functions
async function startVerificationProcess(taskId: string, options: any) {
	updateTaskStatus(taskId, 'in-progress');
	
	try {
		// Request verification email
		const result = await requestVerificationEmail({
			to: options.emailAddress,
			providerId: options.providerId,
			purpose: options.purpose,
			metadata: { taskId }
		});
		
		if (result.success) {
			updateTaskStatus(taskId, 'completed', {
				messageId: result.messageId,
				status: 'verification-requested',
				nextStep: 'check-email'
			});
		} else {
			updateTaskStatus(taskId, 'failed', {
				error: result.error
			});
		}
	} catch (error) {
		updateTaskStatus(taskId, 'failed', {
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

async function startAPIKeyExtraction(taskId: string, email: EmailMessage, providerId?: string) {
	updateTaskStatus(taskId, 'in-progress');
	
	try {
		const result = extractAPIKey(email, providerId);
		
		if (result.key) {
			smartShareStore.update(state => ({
				...state,
				extractedSettings: {
					...state.extractedSettings,
					apiKey: result.key,
					apiKeyType: result.type
				}
			}));
			
			updateTaskStatus(taskId, 'completed', {
				key: result.key,
				type: result.type,
				confidence: result.confidence,
				location: result.location
			});
		} else {
			updateTaskStatus(taskId, 'failed', {
				error: 'No API key found in email',
				confidence: result.confidence
			});
		}
	} catch (error) {
		updateTaskStatus(taskId, 'failed', {
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

async function startSettingsExtraction(taskId: string, email: EmailMessage) {
	updateTaskStatus(taskId, 'in-progress');
	
	try {
		const result = extractProviderSettings(email);
		
		smartShareStore.update(state => ({
			...state,
			extractedSettings: result.settings
		}));
		
		updateTaskStatus(taskId, 'completed', {
			providerId: result.providerId,
			settings: result.settings,
			confidence: result.confidence
		});
	} catch (error) {
		updateTaskStatus(taskId, 'failed', {
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}

// Helper functions
function updateTaskStatus(taskId: string, status: SmartShareTask['status'], result?: any) {
	smartShareStore.update(state => {
		const updatedTasks = state.tasks.map(task => {
			if (task.id === taskId) {
				return {
					...task,
					status,
					updatedAt: Date.now(),
					result: result || task.result,
					error: status === 'failed' ? (result?.error || 'Unknown error') : undefined
				};
			}
			return task;
		});
		
		return {
			...state,
			tasks: updatedTasks,
			isProcessing: status === 'in-progress',
			progress: status === 'completed' ? 100 : status === 'in-progress' ? 50 : 0
		};
	});
}

export const extractCodeFromEmail = (email: EmailMessage) => {
	const result = extractVerificationCode(email);
	
	smartShareStore.update(state => ({
		...state,
		verificationCode: result.code || '',
		activeEmail: email
	}));
	
	return result;
};

export const clearExtractedData = () => {
	smartShareStore.update(state => ({
		...state,
		verificationCode: '',
		extractedSettings: {},
		activeEmail: null
	}));
};

export const applyExtractedSettings = (providerId: string) => {
	// This would integrate with the provider settings store
	// For now, just log and close
	let extractedSettings: any;
	
	// Get current state
	smartShareStore.update(state => {
		extractedSettings = state.extractedSettings;
		return state;
	});
	
	console.log(`[Smart Share] Applying extracted settings for ${providerId}:`,
		extractedSettings);
	
	// Dispatch event for other parts of the app to handle
	window.dispatchEvent(new CustomEvent('smart-share-settings-applied', {
		detail: {
			providerId,
			settings: extractedSettings
		}
	}));
	
	closeSmartShare();
};

export const retryTask = (taskId: string) => {
	let task: SmartShareTask | undefined;
	let activeEmail: EmailMessage | null = null;
	
	// Get current state
	smartShareStore.update(state => {
		task = state.tasks.find(t => t.id === taskId);
		activeEmail = state.activeEmail;
		return state;
	});
	
	if (!task) return;
	
	// Reset task status
	updateTaskStatus(taskId, 'pending');
	
	// Re-run based on task type
	if (task.type === 'api-key' && activeEmail) {
		startAPIKeyExtraction(taskId, activeEmail, task.providerId);
	} else if (task.type === 'settings' && activeEmail) {
		startSettingsExtraction(taskId, activeEmail);
	}
};

export const deleteTask = (taskId: string) => {
	smartShareStore.update(state => ({
		...state,
		tasks: state.tasks.filter(task => task.id !== taskId),
		currentTaskId: state.currentTaskId === taskId ? null : state.currentTaskId
	}));
};

// Initialize with some sample tasks if needed
if (typeof window !== 'undefined') {
	// Listen for email selection events
	window.addEventListener('email-selected-for-smart-share', ((event: CustomEvent) => {
		const email = event.detail.email;
		if (email) {
			openSmartShare(email);
		}
	}) as EventListener);
	
	// Listen for provider setup requests
	window.addEventListener('smart-share-verification-request', ((event: CustomEvent) => {
		const { emailAddress, providerId } = event.detail;
		createVerificationTask({
			emailAddress,
			providerId,
			purpose: 'account-verification'
		});
	}) as EventListener);
}

export default smartShareStore;