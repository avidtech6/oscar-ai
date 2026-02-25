/**
 * Memory Types
 * 
 * Defines the unified memory and knowledge layer for Oscar AI's Communication Hub.
 * Supports long-term memory, knowledge extraction, client profiles, thread-level memory,
 * document embeddings, provider history, deliverability history, workflow memory,
 * "Learn my style" memory, and context-aware recall.
 */

/**
 * Memory categories for organizing memory items
 */
export type MemoryCategory =
	| 'client'
	| 'provider'
	| 'deliverability'
	| 'document'
	| 'workflow'
	| 'style'
	| 'preferences'
	| 'thread'
	| 'summary'
	| 'email'
	| 'campaign'
	| 'report'
	| 'survey'
	| 'pdf'
	| 'note';

/**
 * Memory source - where the memory came from
 */
export type MemorySource =
	| 'email'
	| 'document'
	| 'workflow'
	| 'smart-share'
	| 'provider-setup'
	| 'deliverability-fix'
	| 'user-action'
	| 'ai-action'
	| 'system'
	| 'manual';

/**
 * Memory item - the core unit of memory
 */
export interface MemoryItem {
	/** Unique identifier for the memory item */
	id: string;
	
	/** Category of the memory */
	category: MemoryCategory;
	
	/** Source of the memory */
	source: MemorySource;
	
	/** Content of the memory (structured data) */
	content: any;
	
	/** Embedding vector for semantic search (optional) */
	embedding?: number[];
	
	/** Metadata for the memory */
	metadata: {
		/** When the memory was created */
		createdAt: Date;
		
		/** When the memory was last accessed */
		lastAccessedAt: Date;
		
		/** When the memory expires (optional) */
		expiresAt?: Date;
		
		/** Importance score (0-100) */
		importance: number;
		
		/** Confidence score (0-100) */
		confidence: number;
		
		/** Tags for categorization */
		tags: string[];
		
		/** Related entities (client IDs, thread IDs, etc.) */
		relatedEntities: {
			clientId?: string;
			threadId?: string;
			documentId?: string;
			providerId?: string;
			workflowId?: string;
			emailId?: string;
		};
		
		/** Version of the memory schema */
		version: number;
	};
	
	/** Summary of the memory (for quick reference) */
	summary: string;
	
	/** Raw data reference (optional - for debugging) */
	rawDataRef?: string;
}

/**
 * Memory write options
 */
export interface MemoryWriteOptions {
	/** Whether to overwrite existing memory with same ID */
	overwrite?: boolean;
	
	/** Whether to generate embedding for the memory */
	generateEmbedding?: boolean;
	
	/** Whether to persist the memory to storage */
	persist?: boolean;
	
	/** Expiration time in milliseconds */
	expiresInMs?: number;
	
	/** Importance score (0-100) */
	importance?: number;
	
	/** Confidence score (0-100) */
	confidence?: number;
	
	/** Tags for categorization */
	tags?: string[];
}

/**
 * Memory query for retrieving memories
 */
export interface MemoryQuery {
	/** Category to filter by */
	category?: MemoryCategory | MemoryCategory[];
	
	/** Source to filter by */
	source?: MemorySource | MemorySource[];
	
	/** Tags to filter by */
	tags?: string[];
	
	/** Related entity filters */
	relatedTo?: {
		clientId?: string;
		threadId?: string;
		documentId?: string;
		providerId?: string;
		workflowId?: string;
		emailId?: string;
	};
	
	/** Date range filters */
	dateRange?: {
		from?: Date;
		to?: Date;
	};
	
	/** Importance threshold */
	minImportance?: number;
	
	/** Confidence threshold */
	minConfidence?: number;
	
	/** Text search query */
	textSearch?: string;
	
	/** Embedding similarity search */
	embeddingSimilarity?: {
		embedding: number[];
		threshold: number;
	};
	
	/** Maximum number of results */
	limit?: number;
	
	/** Sort order */
	sortBy?: 'createdAt' | 'lastAccessedAt' | 'importance' | 'confidence';
	sortOrder?: 'asc' | 'desc';
}

/**
 * Memory result from a query
 */
export interface MemoryResult {
	/** The memory items */
	items: MemoryItem[];
	
	/** Total number of items matching the query */
	total: number;
	
	/** Query execution time in milliseconds */
	executionTimeMs: number;
	
	/** Whether more results are available */
	hasMore: boolean;
}

/**
 * Memory embedding for semantic search
 */
export interface MemoryEmbedding {
	/** The embedding vector */
	vector: number[];
	
	/** Dimension of the embedding */
	dimension: number;
	
	/** Model used to generate the embedding */
	model: string;
	
	/** When the embedding was generated */
	generatedAt: Date;
}

/**
 * Client profile - aggregated memory about a client
 */
export interface ClientProfile {
	/** Client identifier */
	clientId: string;
	
	/** Client name */
	name?: string;
	
	/** Client email */
	email?: string;
	
	/** Communication preferences */
	preferences: {
		/** Preferred communication style */
		communicationStyle?: 'formal' | 'casual' | 'technical' | 'brief' | 'detailed';
		
		/** Preferred response time */
		responseTime?: 'immediate' | 'same-day' | 'next-day' | 'flexible';
		
		/** Preferred communication channel */
		preferredChannel?: 'email' | 'chat' | 'call' | 'meeting';
		
		/** Topics of interest */
		topicsOfInterest: string[];
		
		/** Topics to avoid */
		topicsToAvoid: string[];
	};
	
	/** Communication patterns */
	patterns: {
		/** Average response time in hours */
		averageResponseTimeHours: number;
		
		/** Typical message length */
		typicalMessageLength: 'short' | 'medium' | 'long';
		
		/** Common greeting patterns */
		greetingPatterns: string[];
		
		/** Common closing patterns */
		closingPatterns: string[];
		
		/** Common questions asked */
		commonQuestions: string[];
		
		/** Common concerns raised */
		commonConcerns: string[];
	};
	
	/** History with the client */
	history: {
		/** First contact date */
		firstContact: Date;
		
		/** Last contact date */
		lastContact: Date;
		
		/** Total number of interactions */
		totalInteractions: number;
		
		/** Recent interactions (last 10) */
		recentInteractions: Array<{
			date: Date;
			type: 'email' | 'document' | 'workflow' | 'meeting';
			summary: string;
			outcome?: 'positive' | 'neutral' | 'negative';
		}>;
		
		/** Deliverability issues encountered */
		deliverabilityIssues: Array<{
			date: Date;
			issue: string;
			resolved: boolean;
		}>;
		
		/** Provider issues encountered */
		providerIssues: Array<{
			date: Date;
			providerId: string;
			issue: string;
			resolved: boolean;
		}>;
	};
	
	/** Documents shared with the client */
	documents: Array<{
		documentId: string;
		type: 'report' | 'survey' | 'proposal' | 'contract' | 'other';
		title: string;
		sharedDate: Date;
		clientFeedback?: string;
	}>;
	
	/** Last updated timestamp */
	lastUpdated: Date;
	
	/** Confidence score for the profile (0-100) */
	confidence: number;
}

/**
 * Thread summary - aggregated memory about a conversation thread
 */
export interface ThreadSummary {
	/** Thread identifier */
	threadId: string;
	
	/** Thread title/subject */
	title: string;
	
	/** Participants in the thread */
	participants: Array<{
		clientId?: string;
		email: string;
		name?: string;
		role: 'sender' | 'recipient' | 'cc' | 'bcc';
	}>;
	
	/** Topics discussed in the thread */
	topics: string[];
	
	/** Key tasks identified in the thread */
	tasks: Array<{
		description: string;
		assignedTo?: string;
		dueDate?: Date;
		status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
		completedDate?: Date;
	}>;
	
	/** Actions taken in the thread */
	actionsTaken: Array<{
		action: string;
		performedBy: 'user' | 'ai' | 'system';
		timestamp: Date;
		outcome?: 'success' | 'partial' | 'failure';
	}>;
	
	/** Pending items from the thread */
	pendingItems: Array<{
		item: string;
		priority: 'low' | 'medium' | 'high' | 'critical';
		deadline?: Date;
		assignedTo?: string;
	}>;
	
	/** Sentiment analysis of the thread */
	sentiment: {
		overall: 'positive' | 'neutral' | 'negative';
		confidence: number;
		keyPhrases: string[];
	};
	
	/** Timeline of the thread */
	timeline: Array<{
		timestamp: Date;
		event: string;
		summary: string;
	}>;
	
	/** Last activity timestamp */
	lastActivity: Date;
	
	/** Whether the thread is archived */
	archived: boolean;
}

/**
 * Document summary - aggregated memory about a document
 */
export interface DocumentSummary {
	/** Document identifier */
	documentId: string;
	
	/** Document type */
	type: 'report' | 'survey' | 'proposal' | 'contract' | 'pdf' | 'note' | 'other';
	
	/** Document title */
	title: string;
	
	/** Document description */
	description?: string;
	
	/** Key topics in the document */
	topics: string[];
	
	/** Key findings or conclusions */
	keyFindings: string[];
	
	/** Recommendations from the document */
	recommendations: string[];
	
	/** Actions required from the document */
	actionsRequired: Array<{
		action: string;
		assignedTo?: string;
		dueDate?: Date;
		status: 'pending' | 'in-progress' | 'completed';
	}>;
	
	/** Revisions history */
	revisions: Array<{
		version: number;
		timestamp: Date;
		author: string;
		summary: string;
		changes: string[];
	}>;
	
	/** Related documents */
	relatedDocuments: string[];
	
	/** Client feedback on the document */
	clientFeedback?: {
		feedback: string;
		sentiment: 'positive' | 'neutral' | 'negative';
		confidence: number;
		timestamp: Date;
	};
	
	/** Last accessed timestamp */
	lastAccessed: Date;
	
	/** Whether the document is archived */
	archived: boolean;
}

/**
 * Style profile - user's writing style preferences
 */
export interface StyleProfile {
	/** User identifier */
	userId: string;
	
	/** Writing tone preferences */
	tone: {
		overall: 'formal' | 'casual' | 'professional' | 'friendly' | 'technical';
		variations: Array<{
			context: 'client-communication' | 'internal' | 'reports' | 'proposals';
			tone: 'formal' | 'casual' | 'professional' | 'friendly' | 'technical';
			confidence: number;
		}>;
	};
	
	/** Writing structure preferences */
	structure: {
		greetingPatterns: string[];
		closingPatterns: string[];
		signaturePatterns: string[];
		paragraphLength: 'short' | 'medium' | 'long';
		sentenceLength: 'short' | 'medium' | 'long';
		bulletUsage: 'frequent' | 'moderate' | 'rare';
		headingUsage: 'frequent' | 'moderate' | 'rare';
	};
	
	/** Vocabulary preferences */
	vocabulary: {
		favoriteWords: string[];
		avoidedWords: string[];
		technicalTerms: string[];
		formalityLevel: 'high' | 'medium' | 'low';
	};
	
	/** Email-specific preferences */
	emailPreferences: {
		subjectLineStyle: 'descriptive' | 'brief' | 'action-oriented';
		salutation: 'formal' | 'casual' | 'none';
		valediction: 'formal' | 'casual' | 'none';
		includeSignature: boolean;
		signatureContent?: string;
	};
	
	/** Learning data */
	learning: {
		samplesAnalyzed: number;
		lastAnalysis: Date;
		confidence: number;
		patterns: Array<{
			pattern: string;
			frequency: number;
			context: string;
		}>;
	};
	
	/** Last updated timestamp */
	lastUpdated: Date;
}

/**
 * Provider history - memory about provider interactions
 */
export interface ProviderHistory {
	/** Provider identifier */
	providerId: string;
	
	/** Provider type */
	providerType: 'email' | 'smtp' | 'api' | 'combined';
	
	/** Configuration history */
	configurations: Array<{
		timestamp: Date;
		config: any;
		success: boolean;
		errors?: string[];
		warnings?: string[];
	}>;
	
	/** Verification attempts */
	verificationAttempts: Array<{
		timestamp: Date;
		method: 'manual' | 'smart-share' | 'api';
		success: boolean;
		error?: string;
		verificationCode?: string;
	}>;
	
	/** Smart Share events */
	smartShareEvents: Array<{
		timestamp: Date;
		event: 'requested' | 'completed' | 'failed';
		data?: any;
		error?: string;
	}>;
	
	/** Errors encountered */
	errors: Array<{
		timestamp: Date;
		error: string;
		severity: 'low' | 'medium' | 'high' | 'critical';
		resolved: boolean;
		resolution?: string;
	}>;
	
	/** Performance metrics */
	performance: {
		averageResponseTimeMs: number;
		successRate: number;
		lastTested: Date;
	};
	
	/** Last updated timestamp */
	lastUpdated: Date;
}

/**
 * Deliverability history - memory about deliverability issues and fixes
 */
export interface DeliverabilityHistory {
	/** Domain or identifier */
	domain: string;
	
	/** Spam score history */
	spamScores: Array<{
		timestamp: Date;
		score: number;
		issues: string[];
	}>;
	
	/** Authentication failures */
	authenticationFailures: Array<{
		timestamp: Date;
		type: 'dkim' | 'spf' | 'dmarc' | 'other';
		error: string;
		resolved: boolean;
		resolution?: string;
	}>;
	
	/** DNS issues */
	dnsIssues: Array<{
		timestamp: Date;
		type: 'mx' | 'txt' | 'a' | 'cname' | 'other';
		error: string;
		resolved: boolean;
		resolution?: string;
	}>;
	
	/** Fixes applied */
	fixesApplied: Array<{
		timestamp: Date;
		fix: string;
		appliedBy: 'user' | 'ai' | 'system';
		success: boolean;
		improvement?: number; // Improvement in spam score
	}>;
	
	/** Patterns detected */
	patterns: {
		unsafeSendingPatterns: string[];
		highRiskTimes: string[];
		highRiskContent: string[];
	};
	
	/** Last updated timestamp */
	lastUpdated: Date;
}

/**
 * Workflow history - memory about workflow executions
 */
export interface WorkflowHistory {
	/** Workflow identifier */
	workflowId: string;
	
	/** Workflow executions */
	executions: Array<{
		executionId: string;
		startedAt: Date;
		completedAt?: Date;
		status: 'completed' | 'failed' | 'cancelled' | 'paused';
		result?: any;
		error?: string;
		steps: Array<{
			stepId: string;
			startedAt: Date;
			completedAt?: Date;
			status: 'completed' | 'failed' | 'skipped';
			result?: any;
			error?: string;
		}>;
		context: any;
	}>;
	
	/** User preferences for this workflow */
	userPreferences: {
		autoStart: boolean;
		notifications: boolean;
		preferredTime?: string;
		preferredDay?: string;
	};
	
	/** Automation patterns */
	automationPatterns: {
		commonTriggers: string[];
		commonContexts: string[];
		successRate: number;
		averageDurationMs: number;
	};
	
	/** Last executed timestamp */
	lastExecuted: Date;
	
	/** Total executions */
	totalExecutions: number;
	
	/** Success rate (0-100) */
	successRate: number;
}

/**
 * Memory update event
 */
export interface MemoryUpdateEvent {
	type: 'memory-written' | 'memory-read' | 'memory-deleted' | 'memory-expired';
	memoryId: string;
	category: MemoryCategory;
	timestamp: Date;
	data?: any;
}

/**
 * Memory statistics
 */
export interface MemoryStatistics {
	totalMemories: number;
	byCategory: Record<MemoryCategory, number>;
	bySource: Record<MemorySource, number>;
	averageImportance: number;
	averageConfidence: number;
	oldestMemory: Date;
	newestMemory: Date;
	storageSizeBytes: number;
}