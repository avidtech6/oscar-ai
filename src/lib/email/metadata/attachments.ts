/**
 * Attachments
 * 
 * Extracts attachment metadata and stores file references for uploader integration.
 */

import type { ImapMessage } from '../imap/imapTypes';

export interface EmailAttachment {
	/** Unique identifier for the attachment */
	id: string;
	/** Original filename */
	filename: string;
	/** MIME content type */
	contentType: string;
	/** Size in bytes */
	size: number;
	/** Content ID for inline images (cid:...) */
	contentId?: string;
	/** Whether the attachment is inline (vs attachment) */
	inline: boolean;
	/** Message ID this attachment belongs to */
	messageId: string;
	/** Storage reference (e.g., file path, URL, storage key) */
	storageRef?: string;
	/** Whether the attachment has been downloaded/stored */
	stored: boolean;
	/** Checksum/hash for deduplication */
	checksum?: string;
	/** Download URL (if stored externally) */
	downloadUrl?: string;
	/** Thumbnail URL (for images) */
	thumbnailUrl?: string;
	/** Metadata extracted from the attachment */
	metadata: Record<string, any>;
}

/**
 * Extract attachments from IMAP message
 */
export function extractAttachmentsFromImapMessage(
	imapMessage: ImapMessage,
	messageId: string
): EmailAttachment[] {
	const attachments: EmailAttachment[] = [];
	
	if (!imapMessage.bodyStructure) {
		return attachments;
	}
	
	// Recursively traverse the body structure
	traverseBodyStructure(imapMessage.bodyStructure, (part, path) => {
		const attachment = extractAttachmentFromPart(part, path, messageId);
		if (attachment) {
			attachments.push(attachment);
		}
	});
	
	return attachments;
}

/**
 * Traverse MIME body structure recursively
 */
function traverseBodyStructure(
	part: any,
	callback: (part: any, path: string) => void,
	path: string = ''
): void {
	if (!part) return;
	
	// Call callback for this part
	callback(part, path);
	
	// Recursively traverse child nodes
	if (part.childNodes && Array.isArray(part.childNodes)) {
		part.childNodes.forEach((child: any, index: number) => {
			const childPath = path ? `${path}.${index}` : `${index}`;
			traverseBodyStructure(child, callback, childPath);
		});
	}
}

/**
 * Extract attachment from a MIME part
 */
function extractAttachmentFromPart(
	part: any,
	path: string,
	messageId: string
): EmailAttachment | null {
	if (!part) return null;
	
	// Check if this part is an attachment
	const disposition = part.disposition?.type?.toLowerCase();
	const contentType = part.type?.toLowerCase() || '';
	
	// Determine if this is an attachment
	let isAttachment = false;
	let isInline = false;
	
	if (disposition === 'attachment') {
		isAttachment = true;
		isInline = false;
	} else if (disposition === 'inline') {
		isAttachment = true;
		isInline = true;
	} else {
		// No disposition, check content type
		// Common attachment types that aren't typically displayed inline
		const attachmentTypes = [
			'application/',
			'audio/',
			'video/',
			'font/',
			'image/' // Images can be inline or attachment
		];
		
		const isAttachmentType = attachmentTypes.some(type => contentType.startsWith(type));
		
		if (isAttachmentType) {
			isAttachment = true;
			// Images with content-id are likely inline
			isInline = !!part.contentId || contentType.startsWith('image/');
		}
	}
	
	if (!isAttachment) {
		return null;
	}
	
	// Extract filename
	let filename = extractFilename(part);
	if (!filename) {
		// Generate a filename based on content type and part index
		const extension = getExtensionFromContentType(contentType);
		filename = `attachment-${path.replace(/\./g, '-')}${extension}`;
	}
	
	// Generate unique ID
	const id = generateAttachmentId(messageId, path, filename);
	
	// Extract size
	const size = part.size || part.encodedSize || 0;
	
	// Extract content ID
	const contentId = part.contentId || part.cid;
	
	return {
		id,
		filename,
		contentType: part.type || 'application/octet-stream',
		size,
		contentId,
		inline: isInline,
		messageId,
		stored: false,
		metadata: {
			partPath: path,
			disposition: part.disposition,
			encoding: part.encoding,
			parameters: part.parameters
		}
	};
}

/**
 * Extract filename from MIME part
 */
function extractFilename(part: any): string | null {
	// Try disposition filename first
	if (part.disposition?.params?.filename) {
		return part.disposition.params.filename;
	}
	
	// Try content-type filename
	if (part.params?.filename) {
		return part.params.filename;
	}
	
	// Try name parameter
	if (part.params?.name) {
		return part.params.name;
	}
	
	// Try content-id as fallback for inline images
	if (part.contentId) {
		return `cid-${part.contentId}`;
	}
	
	return null;
}

/**
 * Get file extension from content type
 */
function getExtensionFromContentType(contentType: string): string {
	const extensionMap: Record<string, string> = {
		'application/pdf': '.pdf',
		'application/msword': '.doc',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
		'application/vnd.ms-excel': '.xls',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
		'application/vnd.ms-powerpoint': '.ppt',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
		'application/zip': '.zip',
		'application/x-rar-compressed': '.rar',
		'application/x-tar': '.tar',
		'application/gzip': '.gz',
		'text/plain': '.txt',
		'text/html': '.html',
		'text/csv': '.csv',
		'image/jpeg': '.jpg',
		'image/jpg': '.jpg',
		'image/png': '.png',
		'image/gif': '.gif',
		'image/svg+xml': '.svg',
		'image/webp': '.webp',
		'audio/mpeg': '.mp3',
		'audio/wav': '.wav',
		'audio/ogg': '.ogg',
		'video/mp4': '.mp4',
		'video/avi': '.avi',
		'video/mov': '.mov',
		'video/webm': '.webm'
	};
	
	for (const [type, ext] of Object.entries(extensionMap)) {
		if (contentType.startsWith(type)) {
			return ext;
		}
	}
	
	// Default extension based on main type
	if (contentType.startsWith('image/')) {
		return '.img';
	} else if (contentType.startsWith('audio/')) {
		return '.audio';
	} else if (contentType.startsWith('video/')) {
		return '.video';
	} else if (contentType.startsWith('application/')) {
		return '.bin';
	} else if (contentType.startsWith('text/')) {
		return '.txt';
	}
	
	return '.bin';
}

/**
 * Generate unique attachment ID
 */
function generateAttachmentId(messageId: string, partPath: string, filename: string): string {
	// Create a deterministic ID
	const base = `${messageId}-${partPath}-${filename}`;
	
	// Simple hash function
	let hash = 0;
	for (let i = 0; i < base.length; i++) {
		const char = base.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	
	return `att-${Math.abs(hash).toString(16)}`;
}

/**
 * Group attachments by type
 */
export function groupAttachmentsByType(attachments: EmailAttachment[]): Record<string, EmailAttachment[]> {
	const groups: Record<string, EmailAttachment[]> = {
		images: [],
		documents: [],
		archives: [],
		audio: [],
		video: [],
		other: []
	};
	
	for (const attachment of attachments) {
		const contentType = attachment.contentType.toLowerCase();
		
		if (contentType.startsWith('image/')) {
			groups.images.push(attachment);
		} else if (contentType.startsWith('application/pdf') ||
				   contentType.includes('document') ||
				   contentType.includes('sheet') ||
				   contentType.includes('presentation') ||
				   contentType.startsWith('text/')) {
			groups.documents.push(attachment);
		} else if (contentType.includes('zip') ||
				   contentType.includes('rar') ||
				   contentType.includes('tar') ||
				   contentType.includes('gzip')) {
			groups.archives.push(attachment);
		} else if (contentType.startsWith('audio/')) {
			groups.audio.push(attachment);
		} else if (contentType.startsWith('video/')) {
			groups.video.push(attachment);
		} else {
			groups.other.push(attachment);
		}
	}
	
	return groups;
}

/**
 * Filter inline attachments (e.g., images embedded in HTML)
 */
export function filterInlineAttachments(attachments: EmailAttachment[]): EmailAttachment[] {
	return attachments.filter(att => att.inline);
}

/**
 * Filter regular (non-inline) attachments
 */
export function filterRegularAttachments(attachments: EmailAttachment[]): EmailAttachment[] {
	return attachments.filter(att => !att.inline);
}

/**
 * Calculate total size of attachments
 */
export function calculateTotalAttachmentSize(attachments: EmailAttachment[]): number {
	return attachments.reduce((total, att) => total + att.size, 0);
}

/**
 * Check if attachments exceed size limit
 */
export function exceedsSizeLimit(attachments: EmailAttachment[], limitBytes: number): boolean {
	const totalSize = calculateTotalAttachmentSize(attachments);
	return totalSize > limitBytes;
}

/**
 * Prepare attachments for upload/storage
 */
export function prepareForUpload(attachments: EmailAttachment[]): Array<{
	attachment: EmailAttachment;
	uploadData: {
		filename: string;
		contentType: string;
		size: number;
		metadata: Record<string, any>;
	};
}> {
	return attachments.map(attachment => ({
		attachment,
		uploadData: {
			filename: attachment.filename,
			contentType: attachment.contentType,
			size: attachment.size,
			metadata: {
				...attachment.metadata,
				messageId: attachment.messageId,
				inline: attachment.inline,
				contentId: attachment.contentId
			}
		}
	}));
}

/**
 * Update attachment with storage information
 */
export function updateAttachmentWithStorageInfo(
	attachment: EmailAttachment,
	storageInfo: {
		storageRef: string;
		downloadUrl?: string;
		thumbnailUrl?: string;
		checksum?: string;
	}
): EmailAttachment {
	return {
		...attachment,
		...storageInfo,
		stored: true
	};
}

/**
 * Find attachment by content ID (for inline images)
 */
export function findAttachmentByContentId(
	attachments: EmailAttachment[],
	contentId: string
): EmailAttachment | undefined {
	// Remove cid: prefix if present
	const cleanContentId = contentId.replace(/^cid:/, '');
	return attachments.find(att => att.contentId === cleanContentId);
}

/**
 * Generate thumbnail URL placeholder (would be implemented by storage service)
 */
export function generateThumbnailUrl(
	attachment: EmailAttachment,
	options: { width?: number; height?: number } = {}
): string | undefined {
	// Only generate thumbnails for images
	if (!attachment.contentType.startsWith('image/')) {
		return undefined;
	}
	
	// In a real implementation, this would call a thumbnail service
	// For now, return a placeholder URL pattern
	const { width = 200, height = 200 } = options;
	return `/api/thumbnails/${attachment.id}?width=${width}&height=${height}`;
}

/**
 * Validate attachment for sending
 */
export function validateAttachmentForSending(attachment: EmailAttachment): {
	valid: boolean;
	errors: string[];
	warnings: string[];
} {
	const errors: string[] = [];
	const warnings: string[] = [];
	
	// Check filename
	if (!attachment.filename || attachment.filename.trim() === '') {
		errors.push('Attachment must have a filename');
	}
	
	// Check size
	if (attachment.size <= 0) {
		warnings.push('Attachment has zero or negative size');
	}
	
	// Check content type
	if (!attachment.contentType || attachment.contentType === 'application/octet-stream') {
		warnings.push('Attachment has generic content type');
	}
	
	// Check for potentially dangerous file types
	const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.js', '.vbs', '.ps1'];
	const lowerFilename = attachment.filename.toLowerCase();
	
	for (const ext of dangerousExtensions) {
		if (lowerFilename.endsWith(ext)) {
			warnings.push(`Attachment has potentially dangerous file extension: ${ext}`);
		}
	}
	
	return {
		valid: errors.length === 0,
		errors,
		warnings
	};
}