/**
 * Email Parser
 * 
 * Parses email messages from raw source, extracts headers, body, and structure.
 */

export interface ParsedEmail {
	/** Raw email source */
	raw: string;
	/** Parsed headers */
	headers: Record<string, string | string[]>;
	/** Email body (plain text) */
	text?: string;
	/** Email body (HTML) */
	html?: string;
	/** Attachments */
	attachments: ParsedAttachment[];
	/** Inline images */
	inlineImages: ParsedAttachment[];
	/** Message metadata */
	metadata: {
		messageId?: string;
		subject?: string;
		from?: string;
		to?: string[];
		cc?: string[];
		bcc?: string[];
		date?: Date;
		references?: string[];
		inReplyTo?: string;
	};
}

export interface ParsedAttachment {
	/** Attachment filename */
	filename: string;
	/** Content type */
	contentType: string;
	/** Content (as string or buffer) */
	content: string | Uint8Array;
	/** Content ID for inline images */
	contentId?: string;
	/** Whether this is an inline attachment */
	inline: boolean;
	/** Size in bytes */
	size: number;
}

/**
 * Parse raw email source
 */
export function parseEmail(raw: string): ParsedEmail {
	// Split headers and body
	const headerEnd = raw.indexOf('\r\n\r\n');
	if (headerEnd === -1) {
		throw new Error('Invalid email format: no header/body separator');
	}
	
	const headersRaw = raw.substring(0, headerEnd);
	const bodyRaw = raw.substring(headerEnd + 4);
	
	// Parse headers
	const headers = parseHeaders(headersRaw);
	
	// Extract metadata from headers
	const metadata = extractMetadata(headers);
	
	// Parse body based on content type
	const contentType = getContentType(headers);
	
	let text: string | undefined;
	let html: string | undefined;
	let attachments: ParsedAttachment[] = [];
	let inlineImages: ParsedAttachment[] = [];
	
	if (contentType.startsWith('multipart/')) {
		// Parse multipart message
		const boundary = getBoundary(contentType);
		if (boundary) {
			const parts = parseMultipart(bodyRaw, boundary);
			({ text, html, attachments, inlineImages } = processMultipartParts(parts));
		} else {
			// Fallback: treat as plain text
			text = bodyRaw;
		}
	} else if (contentType.startsWith('text/plain')) {
		text = bodyRaw;
	} else if (contentType.startsWith('text/html')) {
		html = bodyRaw;
	} else {
		// Unknown content type, treat as attachment
		attachments = [{
			filename: 'message.eml',
			contentType,
			content: bodyRaw,
			inline: false,
			size: bodyRaw.length
		}];
	}
	
	return {
		raw,
		headers,
		text,
		html,
		attachments,
		inlineImages,
		metadata
	};
}

/**
 * Parse email headers
 */
function parseHeaders(headersRaw: string): Record<string, string | string[]> {
	const headers: Record<string, string | string[]> = {};
	const lines = headersRaw.split('\r\n');
	
	let currentHeader = '';
	let currentValue = '';
	
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		
		if (line.startsWith(' ') || line.startsWith('\t')) {
			// Continuation line
			currentValue += ' ' + line.trim();
		} else {
			// New header
			if (currentHeader) {
				// Save previous header
				headers[currentHeader] = currentValue;
			}
			
			const colonIndex = line.indexOf(':');
			if (colonIndex !== -1) {
				currentHeader = line.substring(0, colonIndex).trim();
				currentValue = line.substring(colonIndex + 1).trim();
			} else {
				// Invalid header line, skip
				currentHeader = '';
				currentValue = '';
			}
		}
	}
	
	// Save last header
	if (currentHeader) {
		headers[currentHeader] = currentValue;
	}
	
	return headers;
}

/**
 * Extract metadata from headers
 */
function extractMetadata(headers: Record<string, string | string[]>): ParsedEmail['metadata'] {
	const metadata: ParsedEmail['metadata'] = {
		messageId: getHeaderValue(headers, 'message-id'),
		subject: getHeaderValue(headers, 'subject'),
		from: getHeaderValue(headers, 'from'),
		to: splitEmailList(getHeaderValue(headers, 'to')),
		cc: splitEmailList(getHeaderValue(headers, 'cc')),
		bcc: splitEmailList(getHeaderValue(headers, 'bcc')),
		date: parseDate(getHeaderValue(headers, 'date')),
		references: splitReferences(getHeaderValue(headers, 'references')),
		inReplyTo: getHeaderValue(headers, 'in-reply-to')
	};
	
	// Clean message ID
	if (metadata.messageId) {
		metadata.messageId = metadata.messageId.replace(/[<>]/g, '');
	}
	
	// Clean in-reply-to
	if (metadata.inReplyTo) {
		metadata.inReplyTo = metadata.inReplyTo.replace(/[<>]/g, '');
	}
	
	return metadata;
}

/**
 * Get header value (case-insensitive)
 */
function getHeaderValue(headers: Record<string, string | string[]>, name: string): string | undefined {
	const lowerName = name.toLowerCase();
	
	for (const [key, value] of Object.entries(headers)) {
		if (key.toLowerCase() === lowerName) {
			return Array.isArray(value) ? value[0] : value;
		}
	}
	
	return undefined;
}

/**
 * Split email list (e.g., "a@b.com, c@d.com")
 */
function splitEmailList(list: string | undefined): string[] | undefined {
	if (!list) return undefined;
	
	// Simple splitting - in production, use a proper email address parser
	return list.split(',').map(email => email.trim()).filter(email => email);
}

/**
 * Split references header
 */
function splitReferences(references: string | undefined): string[] | undefined {
	if (!references) return undefined;
	
	return references.split(/\s+/)
		.map(ref => ref.replace(/[<>]/g, ''))
		.filter(ref => ref);
}

/**
 * Parse date string
 */
function parseDate(dateStr: string | undefined): Date | undefined {
	if (!dateStr) return undefined;
	
	try {
		return new Date(dateStr);
	} catch {
		return undefined;
	}
}

/**
 * Get content type from headers
 */
function getContentType(headers: Record<string, string | string[]>): string {
	const contentType = getHeaderValue(headers, 'content-type');
	return contentType?.toLowerCase() || 'text/plain';
}

/**
 * Get boundary from content-type header
 */
function getBoundary(contentType: string): string | undefined {
	const boundaryMatch = contentType.match(/boundary="([^"]+)"/i) || contentType.match(/boundary=([^;\s]+)/i);
	return boundaryMatch ? boundaryMatch[1] : undefined;
}

/**
 * Parse multipart message
 */
function parseMultipart(body: string, boundary: string): Array<{
	headers: Record<string, string | string[]>;
	body: string;
}> {
	const parts: Array<{ headers: Record<string, string | string[]>; body: string }> = [];
	const boundaryLine = `--${boundary}`;
	const endBoundary = `--${boundary}--`;
	
	let start = body.indexOf(boundaryLine);
	if (start === -1) return parts;
	
	start += boundaryLine.length;
	
	while (true) {
		// Skip CRLF after boundary
		if (body.substring(start, start + 2) === '\r\n') {
			start += 2;
		}
		
		// Find next boundary
		const nextBoundary = body.indexOf(boundaryLine, start);
		const endBoundaryPos = body.indexOf(endBoundary, start);
		
		let end: number;
		if (nextBoundary !== -1 && (endBoundaryPos === -1 || nextBoundary < endBoundaryPos)) {
			end = nextBoundary;
		} else if (endBoundaryPos !== -1) {
			end = endBoundaryPos;
			// This is the last part
		} else {
			// No more boundaries
			end = body.length;
		}
		
		if (end <= start) break;
		
		const partContent = body.substring(start, end);
		
		// Split part headers and body
		const partHeaderEnd = partContent.indexOf('\r\n\r\n');
		if (partHeaderEnd !== -1) {
			const partHeadersRaw = partContent.substring(0, partHeaderEnd);
			const partBody = partContent.substring(partHeaderEnd + 4);
			
			const partHeaders = parseHeaders(partHeadersRaw);
			
			parts.push({
				headers: partHeaders,
				body: partBody
			});
		}
		
		if (end === body.length || body.substring(end, end + boundaryLine.length + 2) === endBoundary) {
			break;
		}
		
		start = end + boundaryLine.length;
	}
	
	return parts;
}

/**
 * Process multipart parts
 */
function processMultipartParts(parts: Array<{ headers: Record<string, string | string[]>; body: string }>): {
	text?: string;
	html?: string;
	attachments: ParsedAttachment[];
	inlineImages: ParsedAttachment[];
} {
	let text: string | undefined;
	let html: string | undefined;
	const attachments: ParsedAttachment[] = [];
	const inlineImages: ParsedAttachment[] = [];
	
	for (const part of parts) {
		const contentType = getContentType(part.headers);
		const disposition = getHeaderValue(part.headers, 'content-disposition') || '';
		const contentId = getHeaderValue(part.headers, 'content-id');
		const filename = extractFilenameFromHeaders(part.headers);
		
		const isInline = disposition.toLowerCase().includes('inline') || !!contentId;
		
		if (contentType.startsWith('text/plain') && !text && !isInline) {
			text = part.body;
		} else if (contentType.startsWith('text/html') && !html && !isInline) {
			html = part.body;
		} else if (contentType.startsWith('multipart/alternative')) {
			// Recursively parse alternative parts
			const boundary = getBoundary(contentType);
			if (boundary) {
				const alternativeParts = parseMultipart(part.body, boundary);
				const alternativeResult = processMultipartParts(alternativeParts);
				
				if (alternativeResult.text && !text) text = alternativeResult.text;
				if (alternativeResult.html && !html) html = alternativeResult.html;
				attachments.push(...alternativeResult.attachments);
				inlineImages.push(...alternativeResult.inlineImages);
			}
		} else {
			// Attachment or inline image
			const attachment: ParsedAttachment = {
				filename: filename || `attachment-${Date.now()}`,
				contentType,
				content: part.body,
				contentId: contentId ? contentId.replace(/[<>]/g, '') : undefined,
				inline: isInline,
				size: part.body.length
			};
			
			if (isInline && contentType.startsWith('image/')) {
				inlineImages.push(attachment);
			} else {
				attachments.push(attachment);
			}
		}
	}
	
	return { text, html, attachments, inlineImages };
}

/**
 * Extract filename from headers
 */
function extractFilenameFromHeaders(headers: Record<string, string | string[]>): string | undefined {
	// Try content-disposition filename
	const disposition = getHeaderValue(headers, 'content-disposition');
	if (disposition) {
		const filenameMatch = disposition.match(/filename="([^"]+)"/i) || disposition.match(/filename=([^;\s]+)/i);
		if (filenameMatch) {
			return filenameMatch[1];
		}
	}
	
	// Try content-type name parameter
	const contentType = getHeaderValue(headers, 'content-type');
	if (contentType) {
		const nameMatch = contentType.match(/name="([^"]+)"/i) || contentType.match(/name=([^;\s]+)/i);
		if (nameMatch) {
			return nameMatch[1];
		}
	}
	
	return undefined;
}

/**
 * Decode quoted-printable encoding
 */
export function decodeQuotedPrintable(text: string): string {
	return text.replace(/=([0-9A-F]{2})/g, (match, hex) => {
		return String.fromCharCode(parseInt(hex, 16));
	}).replace(/=\r?\n/g, ''); // Remove soft line breaks
}

/**
 * Decode base64 encoding
 */
export function decodeBase64(text: string): string {
	try {
		// In browser environment, use atob
		if (typeof atob === 'function') {
			return atob(text);
		}
		// In Node.js environment, use Buffer
		if (typeof Buffer !== 'undefined') {
			return Buffer.from(text, 'base64').toString('utf-8');
		}
		// Fallback: return as-is
		return text;
	} catch {
		return text;
	}
}

/**
 * Extract plain text from HTML (simple version)
 */
export function extractTextFromHtml(html: string): string {
	// Very basic HTML stripping
	return html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
		.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/</g, '<')
		.replace(/>/g, '>')
		.replace(/&/g, '&')
		.replace(/"/g, '"')
		.replace(/'/g, "'")
		.trim();
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Extract email address from "Name <email>" format
 */
export function extractEmailAddress(fullAddress: string): string {
	const match = fullAddress.match(/<([^>]+)>/);
	if (match) {
		return match[1];
	}
	return fullAddress.trim();
}

/**
 * Extract name from "Name <email>" format
 */
export function extractEmailName(fullAddress: string): string | undefined {
	const match = fullAddress.match(/^([^<]+)\s*<[^>]+>$/);
	if (match) {
		return match[1].trim();
	}
	return undefined;
}