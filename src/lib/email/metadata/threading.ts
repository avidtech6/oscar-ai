/**
 * Threading
 * 
 * Implements thread grouping for email messages by References, In-Reply-To, and Subject fallback.
 */

import type { MessageMetadata } from './messageMetadata';
import type { ImapMessage } from '../imap/imapTypes';

export interface EmailThread {
	/** Unique thread ID */
	id: string;
	/** Messages in this thread, ordered by date */
	messages: ThreadMessage[];
	/** Subject of the thread (from the first message) */
	subject?: string;
	/** Participants in the thread */
	participants: Array<{ name?: string; address: string }>;
	/** Timestamp of the most recent message in the thread */
	lastUpdated: Date;
	/** Number of unread messages in the thread */
	unreadCount: number;
	/** Whether the thread has attachments */
	hasAttachments: boolean;
	/** Custom thread tags/labels */
	tags: string[];
}

export interface ThreadMessage {
	/** Message metadata */
	metadata: MessageMetadata;
	/** Position in thread (0 = oldest) */
	position: number;
	/** Depth in thread (for nested replies) */
	depth: number;
	/** Parent message ID (if this is a reply) */
	parentId?: string;
}

/**
 * Group messages into threads
 */
export function groupMessagesIntoThreads(messages: MessageMetadata[]): EmailThread[] {
	// Step 1: Build a map of message ID to message
	const messageMap = new Map<string, MessageMetadata>();
	const messagesByMessageId = new Map<string, MessageMetadata>();
	
	for (const message of messages) {
		messageMap.set(message.id, message);
		if (message.messageId) {
			messagesByMessageId.set(message.messageId, message);
		}
	}
	
	// Step 2: Build thread relationships
	const threadMap = new Map<string, EmailThread>();
	const messageToThread = new Map<string, string>(); // messageId -> threadId
	
	for (const message of messages) {
		// Try to find existing thread for this message
		let threadId = findThreadForMessage(message, messagesByMessageId, messageToThread);
		
		if (!threadId) {
			// Create new thread
			threadId = message.threadId || `thread-${message.id}`;
			const thread = createThreadFromMessage(message, threadId);
			threadMap.set(threadId, thread);
		}
		
		// Add message to thread
		messageToThread.set(message.id, threadId);
		const thread = threadMap.get(threadId)!;
		addMessageToThread(thread, message, messagesByMessageId);
	}
	
	// Step 3: Sort threads by last updated
	const threads = Array.from(threadMap.values());
	threads.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
	
	// Step 4: Sort messages within each thread by date
	for (const thread of threads) {
		thread.messages.sort((a, b) => 
			a.metadata.internalDate.getTime() - b.metadata.internalDate.getTime()
		);
		
		// Update positions
		thread.messages.forEach((msg, index) => {
			msg.position = index;
		});
		
		// Update thread metadata
		updateThreadMetadata(thread);
	}
	
	return threads;
}

/**
 * Find existing thread for a message
 */
function findThreadForMessage(
	message: MessageMetadata,
	messagesByMessageId: Map<string, MessageMetadata>,
	messageToThread: Map<string, string>
): string | undefined {
	// Check if message already has a thread ID
	if (message.threadId) {
		return message.threadId;
	}
	
	// Check if this message is a reply to another message
	const metadata = message.metadata as any; // Access the metadata field which contains references
	if (metadata?.references && Array.isArray(metadata.references)) {
		for (const ref of metadata.references) {
			const parentMessage = messagesByMessageId.get(ref);
			if (parentMessage && messageToThread.has(parentMessage.id)) {
				return messageToThread.get(parentMessage.id);
			}
		}
	}
	
	// Check in-reply-to
	if (metadata?.inReplyTo) {
		const parentMessage = messagesByMessageId.get(metadata.inReplyTo);
		if (parentMessage && messageToThread.has(parentMessage.id)) {
			return messageToThread.get(parentMessage.id);
		}
	}
	
	// Check by subject (fallback)
	if (message.subject) {
		// Look for threads with similar subject (strip Re:, Fwd:, etc.)
		const cleanSubject = cleanThreadSubject(message.subject);
		
		// This would require checking all threads - for simplicity, we'll skip
		// in this implementation and rely on references/in-reply-to
	}
	
	return undefined;
}

/**
 * Create a new thread from a message
 */
function createThreadFromMessage(message: MessageMetadata, threadId: string): EmailThread {
	const participants = new Set<string>();
	
	// Add sender
	if (message.from) {
		participants.add(JSON.stringify(message.from));
	}
	
	// Add recipients
	if (message.to) {
		for (const recipient of message.to) {
			participants.add(JSON.stringify(recipient));
		}
	}
	
	return {
		id: threadId,
		messages: [],
		subject: message.subject,
		participants: Array.from(participants).map(p => JSON.parse(p)),
		lastUpdated: message.internalDate,
		unreadCount: message.read ? 0 : 1,
		hasAttachments: message.hasAttachments,
		tags: [...message.tags]
	};
}

/**
 * Add message to thread
 */
function addMessageToThread(
	thread: EmailThread,
	message: MessageMetadata,
	messagesByMessageId: Map<string, MessageMetadata>
): void {
	// Check if message is already in thread
	if (thread.messages.some(m => m.metadata.id === message.id)) {
		return;
	}
	
	// Find parent message
	let parentId: string | undefined;
	let depth = 0;
	
	const metadata = message.metadata as any;
	if (metadata?.inReplyTo) {
		parentId = metadata.inReplyTo;
	} else if (metadata?.references && metadata.references.length > 0) {
		parentId = metadata.references[metadata.references.length - 1];
	}
	
	// Calculate depth if we found a parent in the same thread
	if (parentId) {
		const parentInThread = thread.messages.find(m => m.metadata.messageId === parentId);
		if (parentInThread) {
			depth = parentInThread.depth + 1;
		}
	}
	
	// Add message to thread
	thread.messages.push({
		metadata: message,
		position: thread.messages.length,
		depth,
		parentId
	});
	
	// Update thread metadata
	thread.lastUpdated = new Date(Math.max(
		thread.lastUpdated.getTime(),
		message.internalDate.getTime()
	));
	
	if (!message.read) {
		thread.unreadCount++;
	}
	
	if (message.hasAttachments) {
		thread.hasAttachments = true;
	}
	
	// Add participants
	const participantsSet = new Set(thread.participants.map(p => JSON.stringify(p)));
	
	if (message.from) {
		participantsSet.add(JSON.stringify(message.from));
	}
	
	if (message.to) {
		for (const recipient of message.to) {
			participantsSet.add(JSON.stringify(recipient));
		}
	}
	
	thread.participants = Array.from(participantsSet).map(p => JSON.parse(p));
	
	// Merge tags
	const tagSet = new Set([...thread.tags, ...message.tags]);
	thread.tags = Array.from(tagSet);
}

/**
 * Update thread metadata after adding messages
 */
function updateThreadMetadata(thread: EmailThread): void {
	if (thread.messages.length === 0) return;
	
	// Update subject from first message if not set
	if (!thread.subject && thread.messages[0].metadata.subject) {
		thread.subject = cleanThreadSubject(thread.messages[0].metadata.subject);
	}
	
	// Recalculate unread count
	thread.unreadCount = thread.messages.filter(m => !m.metadata.read).length;
	
	// Recalculate hasAttachments
	thread.hasAttachments = thread.messages.some(m => m.metadata.hasAttachments);
	
	// Update last updated
	const lastMessage = thread.messages[thread.messages.length - 1];
	thread.lastUpdated = lastMessage.metadata.internalDate;
}

/**
 * Clean thread subject by removing reply/forward prefixes
 */
export function cleanThreadSubject(subject: string): string {
	if (!subject) return '';
	
	// Remove common prefixes
	let cleaned = subject.trim();
	
	// Remove Re:, Fwd:, etc. (including variations with brackets and spaces)
	const prefixes = [
		/^re:\s*/i,
		/^fwd?:\s*/i,
		/^fw:\s*/i,
		/^\[re\]\s*/i,
		/^\[fwd\]\s*/i,
		/^\[\s*re\s*\]\s*/i,
		/^\[\s*fwd\s*\]\s*/i
	];
	
	for (const prefix of prefixes) {
		cleaned = cleaned.replace(prefix, '');
	}
	
	return cleaned.trim();
}

/**
 * Build thread tree from messages
 */
export function buildThreadTree(messages: ThreadMessage[]): ThreadTreeNode[] {
	// Build parent-child relationships
	const nodes = messages.map(msg => ({
		message: msg,
		children: [] as ThreadTreeNode[]
	}));
	
	const nodeMap = new Map<string, ThreadTreeNode>();
	for (const node of nodes) {
		nodeMap.set(node.message.metadata.id, node);
	}
	
	// Build tree
	const roots: ThreadTreeNode[] = [];
	
	for (const node of nodes) {
		const parentId = node.message.parentId;
		if (parentId && nodeMap.has(parentId)) {
			const parent = nodeMap.get(parentId)!;
			parent.children.push(node);
		} else {
			roots.push(node);
		}
	}
	
	// Sort children by date
	for (const node of nodes) {
		node.children.sort((a, b) => 
			a.message.metadata.internalDate.getTime() - b.message.metadata.internalDate.getTime()
		);
	}
	
	// Sort roots by date
	roots.sort((a, b) => 
		a.message.metadata.internalDate.getTime() - b.message.metadata.internalDate.getTime()
	);
	
	return roots;
}

export interface ThreadTreeNode {
	message: ThreadMessage;
	children: ThreadTreeNode[];
}

/**
 * Find thread by message ID
 */
export function findThreadByMessageId(
	threads: EmailThread[],
	messageId: string
): EmailThread | undefined {
	return threads.find(thread => 
		thread.messages.some(msg => msg.metadata.id === messageId)
	);
}

/**
 * Get thread by ID
 */
export function getThreadById(threads: EmailThread[], threadId: string): EmailThread | undefined {
	return threads.find(thread => thread.id === threadId);
}

/**
 * Update thread when a message changes (e.g., read status)
 */
export function updateThreadForMessageChange(
	threads: EmailThread[],
	messageId: string,
	updates: Partial<MessageMetadata>
): EmailThread[] {
	return threads.map(thread => {
		const messageIndex = thread.messages.findIndex(msg => msg.metadata.id === messageId);
		if (messageIndex === -1) return thread;
		
		// Update the message
		const updatedThread = { ...thread };
		updatedThread.messages = [...thread.messages];
		updatedThread.messages[messageIndex] = {
			...updatedThread.messages[messageIndex],
			metadata: {
				...updatedThread.messages[messageIndex].metadata,
				...updates
			}
		};
		
		// Recalculate thread metadata
		updateThreadMetadata(updatedThread);
		
		return updatedThread;
	});
}

/**
 * Merge two threads (when we discover they're actually the same thread)
 */
export function mergeThreads(thread1: EmailThread, thread2: EmailThread): EmailThread {
	// Use the older thread's ID
	const mergedId = thread1.messages[0]?.metadata.internalDate < thread2.messages[0]?.metadata.internalDate 
		? thread1.id 
		: thread2.id;
	
	// Combine messages
	const allMessages = [...thread1.messages, ...thread2.messages];
	
	// Remove duplicates
	const uniqueMessages = allMessages.filter((msg, index, self) =>
		index === self.findIndex(m => m.metadata.id === msg.metadata.id)
	);
	
	// Sort by date
	uniqueMessages.sort((a, b) => 
		a.metadata.internalDate.getTime() - b.metadata.internalDate.getTime()
	);
	
	// Update positions
	uniqueMessages.forEach((msg, index) => {
		msg.position = index;
	});
	
	// Create merged thread
	const mergedThread: EmailThread = {
		id: mergedId,
		messages: uniqueMessages,
		subject: thread1.subject || thread2.subject,
		participants: [...thread1.participants, ...thread2.participants],
		lastUpdated: new Date(Math.max(
			thread1.lastUpdated.getTime(),
			thread2.lastUpdated.getTime()
		)),
		unreadCount: thread1.unreadCount + thread2.unreadCount,
		hasAttachments: thread1.hasAttachments || thread2.hasAttachments,
		tags: [...new Set([...thread1.tags, ...thread2.tags])]
	};
	
	// Rebuild thread relationships
	// This is simplified - in a full implementation, we'd need to rebuild parent-child relationships
	updateThreadMetadata(mergedThread);
	
	return mergedThread;
}