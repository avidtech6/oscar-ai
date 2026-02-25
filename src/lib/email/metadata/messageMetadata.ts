/**
 * Message Metadata
 * 
 * Stores and manages metadata for email messages including messageId, threadId,
 * folder, flags, timestamps, and other message properties.
 */

import type { ImapMessage } from '../imap/imapTypes';

export interface MessageMetadata {
	/** Unique identifier for the message in our system */
	id: string;
	/** IMAP UID (if available) */
	uid?: number;
	/** IMAP sequence number (if available) */
	seq?: number;
	/** Message ID from email headers */
	messageId?: string;
	/** Thread ID for grouping related messages */
	threadId?: string;
	/** Folder path where the message is stored */
	folder: string;
	/** Message flags (Seen, Answered, Flagged, etc.) */
	flags: string[];
	/** Timestamp when message was received/internal date */
	internalDate: Date;
	/** Timestamp when message was stored in our system */
	storedAt: Date;
	/** Timestamp when message was last synced */
	lastSynced: Date;
	/** Message size in bytes */
	size: number;
	/** Sender information */
	from?: { name?: string; address: string };
	/** Recipients (to) */
	to?: Array<{ name?: string; address: string }>;
	/** Subject */
	subject?: string;
	/** Whether the message has attachments */
	hasAttachments: boolean;
	/** Whether the message has been read */
	read: boolean;
	/** Whether the message has been replied to */
	replied: boolean;
	/** Whether the message has been forwarded */
	forwarded: boolean;
	/** Whether the message is flagged/starred */
	flagged: boolean;
	/** Whether the message is in draft state */
	draft: boolean;
	/** Whether the message is in trash */
	trash: boolean;
	/** Whether the message is spam/junk */
	spam: boolean;
	/** Custom tags/labels */
	tags: string[];
	/** Additional metadata */
	metadata: Record<string, any>;
}

/**
 * Create message metadata from IMAP message
 */
export function createMetadataFromImapMessage(
	imapMessage: ImapMessage,
	folder: string
): MessageMetadata {
	const now = new Date();
	
	// Generate a thread ID if we have references or in-reply-to
	const threadId = generateThreadId(imapMessage);
	
	// Parse flags
	const flags = imapMessage.flags || [];
	const read = flags.includes('\\Seen');
	const replied = flags.includes('\\Answered');
	const flagged = flags.includes('\\Flagged');
	const draft = flags.includes('\\Draft');
	
	// Check for attachments
	const hasAttachments = checkForAttachments(imapMessage);
	
	// Extract sender
	const from = imapMessage.envelope?.from?.[0];
	
	// Extract subject
	const subject = imapMessage.envelope?.subject;
	
	return {
		id: generateMessageId(imapMessage),
		uid: imapMessage.uid,
		seq: imapMessage.seq,
		messageId: imapMessage.envelope?.messageId,
		threadId,
		folder,
		flags,
		internalDate: imapMessage.internalDate || now,
		storedAt: now,
		lastSynced: now,
		size: imapMessage.size || 0,
		from,
		to: imapMessage.envelope?.to,
		subject,
		hasAttachments,
		read,
		replied,
		forwarded: false, // Can't determine from IMAP flags alone
		flagged,
		draft,
		trash: folder.toLowerCase().includes('trash') || flags.includes('\\Trash'),
		spam: folder.toLowerCase().includes('spam') || folder.toLowerCase().includes('junk') || flags.includes('\\Junk'),
		tags: [],
		metadata: {
			envelope: imapMessage.envelope,
			headers: imapMessage.headers
		}
	};
}

/**
 * Generate a unique message ID
 */
function generateMessageId(imapMessage: ImapMessage): string {
	// Use messageId from envelope if available
	if (imapMessage.envelope?.messageId) {
		return `msg-${imapMessage.envelope.messageId}`;
	}
	
	// Fallback: combine UID and folder (but UID is folder-specific)
	if (imapMessage.uid) {
		return `uid-${imapMessage.uid}`;
	}
	
	// Ultimate fallback: timestamp + random
	return `gen-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate thread ID from message references
 */
function generateThreadId(imapMessage: ImapMessage): string | undefined {
	const envelope = imapMessage.envelope;
	if (!envelope) return undefined;
	
	// Prefer in-reply-to if available
	if (envelope.inReplyTo) {
		return `thread-${envelope.inReplyTo}`;
	}
	
	// Use first reference if available
	if (envelope.references && envelope.references.length > 0) {
		return `thread-${envelope.references[0]}`;
	}
	
	// Use message ID as thread starter
	if (envelope.messageId) {
		return `thread-${envelope.messageId}`;
	}
	
	return undefined;
}

/**
 * Check if message has attachments
 */
function checkForAttachments(imapMessage: ImapMessage): boolean {
	if (!imapMessage.bodyStructure) return false;
	
	// Simple check: look for multipart/mixed or parts with disposition
	const body = imapMessage.bodyStructure;
	
	if (body.type?.toLowerCase() === 'multipart/mixed') {
		return true;
	}
	
	// Check for attachment disposition
	if (body.disposition?.type?.toLowerCase() === 'attachment') {
		return true;
	}
	
	// Recursively check parts
	if (body.childNodes && Array.isArray(body.childNodes)) {
		for (const child of body.childNodes) {
			if (checkAttachmentInPart(child)) {
				return true;
			}
		}
	}
	
	return false;
}

function checkAttachmentInPart(part: any): boolean {
	if (!part) return false;
	
	// Check disposition
	if (part.disposition?.type?.toLowerCase() === 'attachment') {
		return true;
	}
	
	// Check content type for common attachment types
	const contentType = part.type?.toLowerCase() || '';
	if (contentType.includes('application/') || 
		contentType.includes('image/') && !contentType.includes('inline') ||
		contentType.includes('audio/') ||
		contentType.includes('video/')) {
		// Check if it's inline or attachment
		if (part.disposition?.type?.toLowerCase() !== 'inline') {
			return true;
		}
	}
	
	// Check child nodes
	if (part.childNodes && Array.isArray(part.childNodes)) {
		for (const child of part.childNodes) {
			if (checkAttachmentInPart(child)) {
				return true;
			}
		}
	}
	
	return false;
}

/**
 * Update message metadata with new IMAP data
 */
export function updateMetadataFromImap(
	metadata: MessageMetadata,
	imapMessage: ImapMessage,
	folder: string
): MessageMetadata {
	const updated: MessageMetadata = {
		...metadata,
		lastSynced: new Date(),
		folder,
		flags: imapMessage.flags || metadata.flags,
		size: imapMessage.size || metadata.size
	};
	
	// Update read status
	updated.read = updated.flags.includes('\\Seen');
	
	// Update replied status
	updated.replied = updated.flags.includes('\\Answered');
	
	// Update flagged status
	updated.flagged = updated.flags.includes('\\Flagged');
	
	// Update draft status
	updated.draft = updated.flags.includes('\\Draft');
	
	// Update trash/spam status based on folder
	updated.trash = folder.toLowerCase().includes('trash') || updated.flags.includes('\\Trash');
	updated.spam = folder.toLowerCase().includes('spam') || 
				   folder.toLowerCase().includes('junk') || 
				   updated.flags.includes('\\Junk');
	
	// Update attachment status
	updated.hasAttachments = checkForAttachments(imapMessage);
	
	return updated;
}

/**
 * Create a new thread ID for a message that starts a thread
 */
export function createNewThreadId(): string {
	return `thread-new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract thread ID from message references
 */
export function extractThreadIdFromReferences(references: string[] | undefined): string | undefined {
	if (!references || references.length === 0) {
		return undefined;
	}
	
	// Use the first reference as the thread root
	return `thread-${references[0]}`;
}

/**
 * Check if two messages are in the same thread
 */
export function areMessagesInSameThread(
	message1: { threadId?: string; messageId?: string; references?: string[] },
	message2: { threadId?: string; messageId?: string; references?: string[] }
): boolean {
	// If they have the same thread ID
	if (message1.threadId && message2.threadId && message1.threadId === message2.threadId) {
		return true;
	}
	
	// If message1 is in message2's references
	if (message1.messageId && message2.references?.includes(message1.messageId)) {
		return true;
	}
	
	// If message2 is in message1's references
	if (message2.messageId && message1.references?.includes(message2.messageId)) {
		return true;
	}
	
	// If they share a common reference
	if (message1.references && message2.references) {
		const commonRefs = message1.references.filter(ref => message2.references!.includes(ref));
		if (commonRefs.length > 0) {
			return true;
		}
	}
	
	return false;
}

/**
 * Merge metadata from two sources (e.g., after sync)
 */
export function mergeMetadata(
	existing: MessageMetadata,
	incoming: Partial<MessageMetadata>
): MessageMetadata {
	return {
		...existing,
		...incoming,
		// Don't overwrite storedAt
		storedAt: existing.storedAt,
		// Update lastSynced
		lastSynced: new Date(),
		// Merge flags (union)
		flags: [...new Set([...existing.flags, ...(incoming.flags || [])])],
		// Merge tags (union)
		tags: [...new Set([...existing.tags, ...(incoming.tags || [])])],
		// Merge metadata objects
		metadata: {
			...existing.metadata,
			...incoming.metadata
		}
	};
}