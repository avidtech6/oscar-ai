/**
 * MIME Tools
 * 
 * Utilities for working with MIME types, encoding, and email formatting.
 */

/**
 * MIME type to file extension mapping
 */
export const MIME_TO_EXTENSION: Record<string, string> = {
	// Text
	'text/plain': '.txt',
	'text/html': '.html',
	'text/css': '.css',
	'text/csv': '.csv',
	'text/javascript': '.js',
	'text/typescript': '.ts',
	'text/markdown': '.md',
	'text/xml': '.xml',
	
	// Images
	'image/jpeg': '.jpg',
	'image/jpg': '.jpg',
	'image/png': '.png',
	'image/gif': '.gif',
	'image/svg+xml': '.svg',
	'image/webp': '.webp',
	'image/bmp': '.bmp',
	'image/tiff': '.tiff',
	'image/x-icon': '.ico',
	
	// Audio
	'audio/mpeg': '.mp3',
	'audio/wav': '.wav',
	'audio/ogg': '.ogg',
	'audio/aac': '.aac',
	'audio/flac': '.flac',
	'audio/webm': '.weba',
	
	// Video
	'video/mp4': '.mp4',
	'video/avi': '.avi',
	'video/mov': '.mov',
	'video/webm': '.webm',
	'video/ogg': '.ogv',
	'video/x-msvideo': '.avi',
	'video/x-matroska': '.mkv',
	
	// Documents
	'application/pdf': '.pdf',
	'application/msword': '.doc',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
	'application/vnd.ms-excel': '.xls',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
	'application/vnd.ms-powerpoint': '.ppt',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
	'application/vnd.oasis.opendocument.text': '.odt',
	'application/vnd.oasis.opendocument.spreadsheet': '.ods',
	'application/vnd.oasis.opendocument.presentation': '.odp',
	'application/rtf': '.rtf',
	
	// Archives
	'application/zip': '.zip',
	'application/x-rar-compressed': '.rar',
	'application/x-tar': '.tar',
	'application/gzip': '.gz',
	'application/x-7z-compressed': '.7z',
	'application/x-bzip2': '.bz2',
	
	// Other
	'application/json': '.json',
	'application/xml': '.xml',
	'application/octet-stream': '.bin',
	'application/x-binary': '.bin',
	'application/x-msdownload': '.exe',
	'application/x-sh': '.sh',
	'application/x-python-code': '.py',
	'application/x-java-archive': '.jar',
};

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
	const lowerMime = mimeType.toLowerCase();
	
	// Exact match
	if (MIME_TO_EXTENSION[lowerMime]) {
		return MIME_TO_EXTENSION[lowerMime];
	}
	
	// Partial match (e.g., image/jpeg -> .jpg)
	for (const [mime, ext] of Object.entries(MIME_TO_EXTENSION)) {
		if (lowerMime.startsWith(mime.split('/')[0] + '/')) {
			// Same main type
			return ext;
		}
	}
	
	// Default based on main type
	if (lowerMime.startsWith('image/')) {
		return '.img';
	} else if (lowerMime.startsWith('audio/')) {
		return '.audio';
	} else if (lowerMime.startsWith('video/')) {
		return '.video';
	} else if (lowerMime.startsWith('text/')) {
		return '.txt';
	} else if (lowerMime.startsWith('application/')) {
		return '.bin';
	}
	
	return '.bin';
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(filename: string): string {
	const extension = filename.toLowerCase().split('.').pop() || '';
	
	const extensionToMime: Record<string, string> = {
		// Text
		'txt': 'text/plain',
		'html': 'text/html',
		'htm': 'text/html',
		'css': 'text/css',
		'csv': 'text/csv',
		'js': 'text/javascript',
		'ts': 'text/typescript',
		'md': 'text/markdown',
		'xml': 'text/xml',
		
		// Images
		'jpg': 'image/jpeg',
		'jpeg': 'image/jpeg',
		'png': 'image/png',
		'gif': 'image/gif',
		'svg': 'image/svg+xml',
		'webp': 'image/webp',
		'bmp': 'image/bmp',
		'tiff': 'image/tiff',
		'ico': 'image/x-icon',
		
		// Audio
		'mp3': 'audio/mpeg',
		'wav': 'audio/wav',
		'ogg': 'audio/ogg',
		'aac': 'audio/aac',
		'flac': 'audio/flac',
		'weba': 'audio/webm',
		
		// Video
		'mp4': 'video/mp4',
		'avi': 'video/x-msvideo',
		'mov': 'video/quicktime',
		'webm': 'video/webm',
		'ogv': 'video/ogg',
		'mkv': 'video/x-matroska',
		
		// Documents
		'pdf': 'application/pdf',
		'doc': 'application/msword',
		'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'xls': 'application/vnd.ms-excel',
		'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'ppt': 'application/vnd.ms-powerpoint',
		'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'odt': 'application/vnd.oasis.opendocument.text',
		'ods': 'application/vnd.oasis.opendocument.spreadsheet',
		'odp': 'application/vnd.oasis.opendocument.presentation',
		'rtf': 'application/rtf',
		
		// Archives
		'zip': 'application/zip',
		'rar': 'application/x-rar-compressed',
		'tar': 'application/x-tar',
		'gz': 'application/gzip',
		'7z': 'application/x-7z-compressed',
		'bz2': 'application/x-bzip2',
		
		// Other
		'json': 'application/json',
		'bin': 'application/octet-stream',
		'exe': 'application/x-msdownload',
		'sh': 'application/x-sh',
		'py': 'text/x-python',
		'jar': 'application/x-java-archive',
	};
	
	return extensionToMime[extension] || 'application/octet-stream';
}

/**
 * Check if MIME type is an image
 */
export function isImageMimeType(mimeType: string): boolean {
	return mimeType.toLowerCase().startsWith('image/');
}

/**
 * Check if MIME type is audio
 */
export function isAudioMimeType(mimeType: string): boolean {
	return mimeType.toLowerCase().startsWith('audio/');
}

/**
 * Check if MIME type is video
 */
export function isVideoMimeType(mimeType: string): boolean {
	return mimeType.toLowerCase().startsWith('video/');
}

/**
 * Check if MIME type is a document (PDF, Office, etc.)
 */
export function isDocumentMimeType(mimeType: string): boolean {
	const lowerMime = mimeType.toLowerCase();
	return (
		lowerMime === 'application/pdf' ||
		lowerMime.includes('document') ||
		lowerMime.includes('sheet') ||
		lowerMime.includes('presentation') ||
		lowerMime === 'application/rtf' ||
		lowerMime.includes('opendocument')
	);
}

/**
 * Check if MIME type is an archive
 */
export function isArchiveMimeType(mimeType: string): boolean {
	const lowerMime = mimeType.toLowerCase();
	return (
		lowerMime === 'application/zip' ||
		lowerMime === 'application/x-rar-compressed' ||
		lowerMime === 'application/x-tar' ||
		lowerMime === 'application/gzip' ||
		lowerMime === 'application/x-7z-compressed' ||
		lowerMime === 'application/x-bzip2'
	);
}

/**
 * Check if MIME type is safe to display inline
 */
export function isSafeInlineMimeType(mimeType: string): boolean {
	const lowerMime = mimeType.toLowerCase();
	
	// Safe types for inline display
	return (
		isImageMimeType(lowerMime) ||
		lowerMime.startsWith('text/') ||
		lowerMime === 'application/pdf' ||
		lowerMime === 'application/json' ||
		lowerMime === 'application/xml'
	);
}

/**
 * Generate Content-ID for inline images
 */
export function generateContentId(filename: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 10);
	const cleanFilename = filename.replace(/[^a-z0-9]/gi, '-').toLowerCase();
	
	return `${cleanFilename}-${timestamp}-${random}@oscarai`;
}

/**
 * Format email address with name
 */
export function formatEmailAddress(name: string | undefined, email: string): string {
	if (name && name.trim()) {
		return `${name} <${email}>`;
	}
	return email;
}

/**
 * Parse email address string into name and email
 */
export function parseEmailAddress(address: string): { name?: string; email: string } {
	// Pattern: "Name <email>" or just "email"
	const match = address.match(/^([^<]+)\s*<([^>]+)>$/);
	if (match) {
		return {
			name: match[1].trim(),
			email: match[2].trim()
		};
	}
	
	return {
		email: address.trim()
	};
}

/**
 * Encode subject for email headers (handles UTF-8)
 */
export function encodeSubject(subject: string): string {
	// Check if subject contains non-ASCII characters
	const hasNonAscii = /[^\x00-\x7F]/.test(subject);
	
	if (!hasNonAscii) {
		return subject;
	}
	
	// Encode using RFC 2047
	return `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
}

/**
 * Decode encoded subject from email headers
 */
export function decodeSubject(encodedSubject: string): string {
	// Check if it's RFC 2047 encoded
	const match = encodedSubject.match(/^=\?([^?]+)\?([BQ])\?([^?]+)\?=$/i);
	if (!match) {
		return encodedSubject;
	}
	
	const [, charset, encoding, text] = match;
	
	if (encoding.toUpperCase() === 'B') {
		// Base64 encoding
		try {
			return decodeURIComponent(escape(atob(text)));
		} catch {
			return encodedSubject;
		}
	} else if (encoding.toUpperCase() === 'Q') {
		// Quoted-printable encoding
		return decodeQuotedPrintable(text.replace(/_/g, ' '));
	}
	
	return encodedSubject;
}

/**
 * Decode quoted-printable text
 */
function decodeQuotedPrintable(text: string): string {
	return text.replace(/=([0-9A-F]{2})/gi, (match, hex) => {
		return String.fromCharCode(parseInt(hex, 16));
	});
}

/**
 * Generate Message-ID header
 */
export function generateMessageId(domain: string = 'oscarai.com'): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 15);
	return `<${timestamp}.${random}@${domain}>`;
}

/**
 * Generate boundary for multipart messages
 */
export function generateBoundary(): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 15);
	return `----=_NextPart_${timestamp}_${random}`;
}

/**
 * Format date for email headers
 */
export function formatDateForHeader(date: Date = new Date()): string {
	// RFC 5322 format: "Day, DD Mon YYYY HH:MM:SS +ZZZZ"
	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	
	const day = days[date.getUTCDay()];
	const dayNum = date.getUTCDate().toString().padStart(2, '0');
	const month = months[date.getUTCMonth()];
	const year = date.getUTCFullYear();
	const hours = date.getUTCHours().toString().padStart(2, '0');
	const minutes = date.getUTCMinutes().toString().padStart(2, '0');
	const seconds = date.getUTCSeconds().toString().padStart(2, '0');
	
	// Get timezone offset
	const offset = -date.getTimezoneOffset();
	const sign = offset >= 0 ? '+' : '-';
	const offsetHours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
	const offsetMinutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
	
	return `${day}, ${dayNum} ${month} ${year} ${hours}:${minutes}:${seconds} ${sign}${offsetHours}${offsetMinutes}`;
}

/**
 * Calculate approximate size of email message
 */
export function estimateEmailSize(options: {
	text?: string;
	html?: string;
	attachments?: Array<{ size: number }>;
}): number {
	let size = 0;
	
	// Headers (approximate)
	size += 1024; // 1KB for basic headers
	
	// Text body
	if (options.text) {
		size += options.text.length;
	}
	
	// HTML body
	if (options.html) {
		size += options.html.length;
	}
	
	// Attachments
	if (options.attachments) {
		for (const attachment of options.attachments) {
			size += attachment.size;
		}
	}
	
	// MIME overhead (boundaries, headers, encoding)
	size += Math.ceil(size * 0.1); // Add 10% for MIME overhead
	
	return size;
}

/**
 * Validate MIME type string
 */
export function validateMimeType(mimeType: string): boolean {
	const mimePattern = /^[a-z]+\/[a-z0-9\-\.\+]+$/i;
	return mimePattern.test(mimeType);
}

/**
 * Get charset from content-type header
 */
export function getCharsetFromContentType(contentType: string): string {
	const match = contentType.match(/charset=([^;]+)/i);
	return match ? match[1].toLowerCase() : 'utf-8';
}

/**
 * Normalize MIME type (lowercase, remove parameters)
 */
export function normalizeMimeType(mimeType: string): string {
	// Extract just the type/subtype part
	const parts = mimeType.toLowerCase().split(';');
	return parts[0].trim();
}