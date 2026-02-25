/**
 * Smart Share Hooks
 * 
 * Integration hooks for the Smart Share system defined in the Mega‑Prompt.
 * These functions help extract verification codes, API keys, and provider settings
 * from emails, and request verification emails.
 */

import type { EmailMessage } from '../smtp/smtpTypes';
import { parseEmail } from './emailParser';

/**
 * Request a verification email to be sent
 * This would trigger the Smart Share system to send a verification email
 */
export async function requestVerificationEmail(options: {
	to: string;
	providerId: string;
	purpose: 'account-verification' | 'api-key' | 'settings-extraction';
	metadata?: Record<string, any>;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
	console.log(`[Smart Share] Requesting verification email to ${options.to}`);
	console.log(`  Provider: ${options.providerId}, Purpose: ${options.purpose}`);
	console.log(`  Metadata:`, options.metadata);
	
	// In a real implementation, this would:
	// 1. Generate a unique verification token
	// 2. Store it in the Smart Share system
	// 3. Trigger an email send through the provider
	// 4. Return the message ID for tracking
	
	// For now, simulate success
	const messageId = `verify-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
	
	return {
		success: true,
		messageId
	};
}

/**
 * Extract verification code from an email
 * Looks for verification codes in email subject and body
 */
export function extractVerificationCode(email: EmailMessage | string): {
	code?: string;
	source: 'subject' | 'body' | 'link' | 'none';
	confidence: 'high' | 'medium' | 'low';
	patterns: string[];
} {
	let parsedEmail: ReturnType<typeof parseEmail>;
	
	if (typeof email === 'string') {
		// Parse raw email
		try {
			parsedEmail = parseEmail(email);
		} catch {
			return {
				source: 'none',
				confidence: 'low',
				patterns: []
			};
		}
	} else {
		// Use already parsed email
		parsedEmail = {
			headers: {},
			metadata: {
				subject: email.subject,
				from: typeof email.from === 'string' ? email.from : email.from?.address
			},
			text: email.text,
			html: email.html,
			raw: '',
			attachments: [],
			inlineImages: []
		};
	}
	
	const subject = parsedEmail.metadata.subject || '';
	const text = parsedEmail.text || '';
	const html = parsedEmail.html || '';
	
	// Combine text sources for searching
	const searchText = (text + ' ' + html.replace(/<[^>]+>/g, ' ')).toLowerCase();
	
	// Common verification code patterns
	const patterns = [
		// 6-digit codes (most common)
		/\b(\d{6})\b/g,
		// 8-digit codes
		/\b(\d{8})\b/g,
		// 4-digit codes
		/\b(\d{4})\b/g,
		// Alphanumeric codes (8-10 chars)
		/\b([A-Z0-9]{8,10})\b/g,
		// Codes with dashes
		/\b([A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3})\b/gi,
		// Codes in verification links
		/verification[_-]?code[=:]\s*([A-Z0-9]+)/gi,
		/code[=:]\s*([A-Z0-9]+)/gi,
		/token[=:]\s*([A-Z0-9]+)/gi
	];
	
	const foundCodes: Array<{ code: string; source: string; pattern: string }> = [];
	
	// Search in subject
	for (const pattern of patterns) {
		const matches = subject.match(pattern);
		if (matches) {
			for (const match of matches) {
				// Extract just the code part
				const codeMatch = match.match(/([A-Z0-9]{4,})/i);
				if (codeMatch) {
					foundCodes.push({
						code: codeMatch[1],
						source: 'subject',
						pattern: pattern.toString()
					});
				}
			}
		}
	}
	
	// Search in body
	for (const pattern of patterns) {
		const matches = searchText.match(pattern);
		if (matches) {
			for (const match of matches) {
				// Extract just the code part
				const codeMatch = match.match(/([A-Z0-9]{4,})/i);
				if (codeMatch) {
					foundCodes.push({
						code: codeMatch[1],
						source: 'body',
						pattern: pattern.toString()
					});
				}
			}
		}
	}
	
	// Extract from links in HTML
	if (html) {
		const linkMatches = html.match(/href=["'][^"']*(code|token|verify|confirm)=([A-Z0-9]+)[^"']*["']/gi);
		if (linkMatches) {
			for (const link of linkMatches) {
				const codeMatch = link.match(/(code|token|verify|confirm)=([A-Z0-9]+)/i);
				if (codeMatch) {
					foundCodes.push({
						code: codeMatch[2],
						source: 'link',
						pattern: 'link-parameter'
					});
				}
			}
		}
	}
	
	// Remove duplicates
	const uniqueCodes = Array.from(
		new Map(foundCodes.map(item => [item.code, item])).values()
	);
	
	// Determine confidence
	let confidence: 'high' | 'medium' | 'low' = 'low';
	let bestCode: string | undefined;
	
	if (uniqueCodes.length === 0) {
		return {
			source: 'none',
			confidence: 'low',
			patterns: []
		};
	}
	
	// Prefer 6-digit codes (most common for verification)
	const sixDigitCode = uniqueCodes.find(c => /^\d{6}$/.test(c.code));
	if (sixDigitCode) {
		bestCode = sixDigitCode.code;
		confidence = 'high';
		return {
			code: bestCode,
			source: sixDigitCode.source as any,
			confidence,
			patterns: [sixDigitCode.pattern]
		};
	}
	
	// Otherwise, use the first code found
	bestCode = uniqueCodes[0].code;
	confidence = uniqueCodes[0].source === 'subject' ? 'medium' : 'low';
	
	return {
		code: bestCode,
		source: uniqueCodes[0].source as any,
		confidence,
		patterns: uniqueCodes.map(c => c.pattern)
	};
}

/**
 * Extract API key from an email
 * Looks for API keys in email body (common patterns for email providers)
 */
export function extractAPIKey(email: EmailMessage | string, providerId?: string): {
	key?: string;
	type?: 'smtp' | 'api' | 'access-key' | 'secret';
	confidence: 'high' | 'medium' | 'low';
	location: 'body' | 'attachment' | 'link';
} {
	let text = '';
	let html = '';
	
	if (typeof email === 'string') {
		// Parse raw email
		try {
			const parsed = parseEmail(email);
			text = parsed.text || '';
			html = parsed.html || '';
		} catch {
			// If parsing fails, use raw string
			text = email;
		}
	} else {
		text = email.text || '';
		html = email.html || '';
	}
	
	// Combine text sources
	const searchText = (text + ' ' + html.replace(/<[^>]+>/g, ' ')).toLowerCase();
	
	// Provider-specific patterns
	const providerPatterns: Record<string, Array<{ pattern: RegExp; type: string }>> = {
		'brevo': [
			{ pattern: /xkeysib-([a-f0-9]{64})/i, type: 'api' },
			{ pattern: /api[_-]?key[=:]\s*([a-f0-9]{64})/i, type: 'api' },
			{ pattern: /smtp[_-]?password[=:]\s*([a-f0-9]{16,})/i, type: 'smtp' }
		],
		'sendgrid': [
			{ pattern: /SG\.([A-Za-z0-9-_]{22})\.([A-Za-z0-9-_]{43})/i, type: 'api' },
			{ pattern: /api[_-]?key[=:]\s*(SG\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/i, type: 'api' }
		],
		'mailgun': [
			{ pattern: /key-([a-f0-9]{32})/i, type: 'api' },
			{ pattern: /api[_-]?key[=:]\s*(key-[a-f0-9]{32})/i, type: 'api' }
		],
		'postmark': [
			{ pattern: /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i, type: 'api' },
			{ pattern: /server[_-]?token[=:]\s*([a-f0-9-]{36})/i, type: 'api' }
		],
		'ses': [
			{ pattern: /AKIA[0-9A-Z]{16}/i, type: 'access-key' },
			{ pattern: /aws[_-]?access[_-]?key[=:]\s*(AKIA[0-9A-Z]{16})/i, type: 'access-key' },
			{ pattern: /aws[_-]?secret[_-]?key[=:]\s*([a-zA-Z0-9+/]{40})/i, type: 'secret' }
		],
		'generic': [
			{ pattern: /api[_-]?key[=:]\s*([a-zA-Z0-9-_]{20,})/i, type: 'api' },
			{ pattern: /api[_-]?secret[=:]\s*([a-zA-Z0-9-_]{20,})/i, type: 'secret' },
			{ pattern: /access[_-]?key[=:]\s*([a-zA-Z0-9-_]{20,})/i, type: 'access-key' },
			{ pattern: /smtp[_-]?password[=:]\s*([a-zA-Z0-9-_]{10,})/i, type: 'smtp' }
		]
	};
	
	// Try provider-specific patterns first
	if (providerId && providerPatterns[providerId]) {
		for (const { pattern, type } of providerPatterns[providerId]) {
			const match = searchText.match(pattern);
			if (match) {
				return {
					key: match[1] || match[0],
					type: type as any,
					confidence: 'high',
					location: 'body'
				};
			}
		}
	}
	
	// Try all provider patterns
	for (const provider of Object.keys(providerPatterns)) {
		for (const { pattern, type } of providerPatterns[provider]) {
			const match = searchText.match(pattern);
			if (match) {
				return {
					key: match[1] || match[0],
					type: type as any,
					confidence: provider === 'generic' ? 'medium' : 'high',
					location: 'body'
				};
			}
		}
	}
	
	// Look for common API key patterns in general
	const genericPatterns = [
		/\b([a-f0-9]{32})\b/i, // 32 hex chars
		/\b([a-f0-9]{40})\b/i, // 40 hex chars (SHA1)
		/\b([a-f0-9]{64})\b/i, // 64 hex chars
		/\b([A-Z0-9]{20,})\b/ // 20+ alphanumeric chars
	];
	
	for (const pattern of genericPatterns) {
		const matches = searchText.match(pattern);
		if (matches) {
			// Check if it looks like an API key (not part of normal text)
			const candidate = matches[0];
			if (candidate.length >= 20 && !/^[0-9]+$/.test(candidate)) {
				return {
					key: candidate,
					type: 'api',
					confidence: 'low',
					location: 'body'
				};
			}
		}
	}
	
	return {
		confidence: 'low',
		location: 'body'
	};
}

/**
 * Extract provider settings from a welcome/configuration email
 */
export function extractProviderSettings(email: EmailMessage | string): {
	providerId?: string;
	settings: {
		imap?: {
			host?: string;
			port?: number;
			secure?: boolean;
		};
		smtp?: {
			host?: string;
			port?: number;
			secure?: boolean;
		};
		apiKey?: string;
	};
	confidence: 'high' | 'medium' | 'low';
} {
	let text = '';
	let subject = '';
	
	if (typeof email === 'string') {
		try {
			const parsed = parseEmail(email);
			text = parsed.text || '';
			subject = parsed.metadata.subject || '';
		} catch {
			text = email;
		}
	} else {
		text = email.text || '';
		subject = email.subject || '';
	}
	
	const searchText = (subject + ' ' + text).toLowerCase();
	const settings: any = {};
	let providerId: string | undefined;
	let confidence: 'high' | 'medium' | 'low' = 'low';
	
	// Try to detect provider from email content
	const providerKeywords: Record<string, string[]> = {
		'gmail': ['gmail', 'google'],
		'outlook': ['outlook', 'office 365', 'microsoft', 'hotmail'],
		'yahoo': ['yahoo', 'ymail'],
		'icloud': ['icloud', 'apple', 'me.com', 'mac.com'],
		'brevo': ['brevo', 'sendinblue'],
		'sendgrid': ['sendgrid'],
		'mailgun': ['mailgun'],
		'postmark': ['postmark'],
		'ses': ['amazon ses', 'aws ses', 'simple email service']
	};
	
	for (const [id, keywords] of Object.entries(providerKeywords)) {
		for (const keyword of keywords) {
			if (searchText.includes(keyword.toLowerCase())) {
				providerId = id;
				confidence = 'medium';
				break;
			}
		}
		if (providerId) break;
	}
	
	// Extract IMAP settings
	const imapHostMatch = searchText.match(/imap[^a-z0-9]*([a-z0-9.-]+\.[a-z]{2,})/i);
	const imapPortMatch = searchText.match(/imap.*port[^0-9]*([0-9]{2,5})/i);
	
	if (imapHostMatch || imapPortMatch) {
		settings.imap = {};
		
		if (imapHostMatch) {
			settings.imap.host = imapHostMatch[1];
			confidence = 'high';
		}
		
		if (imapPortMatch) {
			settings.imap.port = parseInt(imapPortMatch[1], 10);
			confidence = 'high';
		}
		
		// Infer secure based on port
		if (settings.imap.port === 993) {
			settings.imap.secure = true;
		} else if (settings.imap.port === 143) {
			settings.imap.secure = false;
		}
	}
	
	// Extract SMTP settings
	const smtpHostMatch = searchText.match(/smtp[^a-z0-9]*([a-z0-9.-]+\.[a-z]{2,})/i);
	const smtpPortMatch = searchText.match(/smtp.*port[^0-9]*([0-9]{2,5})/i);
	
	if (smtpHostMatch || smtpPortMatch) {
		settings.smtp = {};
		
		if (smtpHostMatch) {
			settings.smtp.host = smtpHostMatch[1];
			confidence = 'high';
		}
		
		if (smtpPortMatch) {
			settings.smtp.port = parseInt(smtpPortMatch[1], 10);
			confidence = 'high';
		}
		
		// Infer secure based on port
		if (settings.smtp.port === 465) {
			settings.smtp.secure = true;
		} else if (settings.smtp.port === 587 || settings.smtp.port === 25) {
			settings.smtp.secure = false;
		}
	}
	
	// Extract API key if present
	const apiKeyResult = extractAPIKey(email, providerId);
	if (apiKeyResult.key) {
		settings.apiKey = apiKeyResult.key;
		if (apiKeyResult.confidence === 'high') {
			confidence = 'high';
		} else if (confidence !== 'high') {
			confidence = 'medium';
		}
	}
	
	// Return the result
	return {
		providerId,
		settings,
		confidence
	};
}