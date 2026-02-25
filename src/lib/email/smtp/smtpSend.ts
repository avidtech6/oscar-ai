/**
 * SMTP Send Engine
 * 
 * High-level email sending functions including sendEmail, sendWithAttachments, and sendCampaignBatch.
 */

import type { 
	EmailMessage, 
	SmtpSendResult, 
	SmtpSendOptions,
	EmailAttachment
} from './smtpTypes';
import { SmtpClient } from './smtpClient';

export class SmtpSendEngine {
	private client: SmtpClient;

	constructor(client: SmtpClient) {
		this.client = client;
	}

	/**
	 * Send a single email
	 */
	async sendEmail(message: EmailMessage, options: SmtpSendOptions = {}): Promise<SmtpSendResult> {
		console.log(`Sending email to: ${this.formatRecipients(message.to)}`);
		
		try {
			const result = await this.client.sendEmail(message, options);
			
			console.log(`Email sent successfully: ${result.messageId}`);
			console.log(`Accepted: ${result.accepted.length}, Rejected: ${result.rejected.length}`);
			
			if (result.rejected.length > 0) {
				console.warn(`Some recipients were rejected: ${result.rejected.join(', ')}`);
			}
			
			return result;
		} catch (error) {
			console.error(`Failed to send email:`, error);
			throw error;
		}
	}

	/**
	 * Send email with attachments
	 */
	async sendWithAttachments(
		message: EmailMessage,
		attachments: EmailAttachment[],
		options: SmtpSendOptions = {}
	): Promise<SmtpSendResult> {
		console.log(`Sending email with ${attachments.length} attachments to: ${this.formatRecipients(message.to)}`);
		
		const messageWithAttachments: EmailMessage = {
			...message,
			attachments
		};
		
		return this.sendEmail(messageWithAttachments, options);
	}

	/**
	 * Send campaign batch (multiple emails with similar content)
	 */
	async sendCampaignBatch(
		messages: EmailMessage[],
		options: SmtpSendOptions = {},
		concurrency: number = 5,
		onProgress?: (sent: number, total: number, currentMessage?: EmailMessage) => void
	): Promise<Array<{ message: EmailMessage; result?: SmtpSendResult; error?: Error }>> {
		console.log(`Starting campaign batch: ${messages.length} emails, concurrency: ${concurrency}`);
		
		const total = messages.length;
		let sent = 0;
		const results: Array<{ message: EmailMessage; result?: SmtpSendResult; error?: Error }> = [];
		
		// Process in batches
		for (let i = 0; i < total; i += concurrency) {
			const batch = messages.slice(i, i + concurrency);
			const batchPromises = batch.map(async (message, index) => {
				try {
					if (onProgress) {
						onProgress(sent + index + 1, total, message);
					}
					
					const result = await this.client.sendEmail(message, options);
					return { message, result };
				} catch (error) {
					console.error(`Failed to send email in batch:`, error);
					return { message, error: error as Error };
				}
			});
			
			const batchResults = await Promise.all(batchPromises);
			results.push(...batchResults);
			sent += batchResults.length;
			
			// Update progress
			if (onProgress) {
				onProgress(sent, total);
			}
			
			// Small delay between batches to be polite to the SMTP server
			if (i + concurrency < total) {
				await new Promise(resolve => setTimeout(resolve, 500));
			}
		}
		
		// Calculate statistics
		const successful = results.filter(r => r.result && !r.error).length;
		const failed = results.filter(r => r.error).length;
		
		console.log(`Campaign batch completed: ${successful} successful, ${failed} failed out of ${total} total`);
		
		return results;
	}

	/**
	 * Send templated email (placeholder for template engine integration)
	 */
	async sendTemplatedEmail(
		templateName: string,
		templateData: Record<string, any>,
		recipients: string | { name?: string; address: string } | Array<string | { name?: string; address: string }>,
		options: SmtpSendOptions = {}
	): Promise<SmtpSendResult[]> {
		console.log(`Sending templated email "${templateName}" to ${this.formatRecipients(recipients)}`);
		
		// In a real implementation, this would:
		// 1. Load template from storage
		// 2. Render with templateData
		// 3. Send to each recipient
		
		// For now, create a simple message
		const baseMessage: EmailMessage = {
			from: { name: 'Oscar AI', address: 'noreply@oscarai.com' },
			to: recipients as any, // Type assertion to handle the union type
			subject: `Template: ${templateName}`,
			text: `This is a template email for ${templateName} with data: ${JSON.stringify(templateData)}`,
			html: `<p>This is a template email for <strong>${templateName}</strong></p>`
		};
		
		// If recipients is an array, send individually
		if (Array.isArray(recipients) && recipients.length > 1) {
			const messages = recipients.map(recipient => ({
				...baseMessage,
				to: recipient
			}));
			
			const results = await this.sendCampaignBatch(messages as EmailMessage[], options, 3);
			return results.map(r => r.result!).filter(r => r !== undefined);
		}
		
		// Single recipient
		const result = await this.sendEmail(baseMessage, options);
		return [result];
	}

	/**
	 * Send test email (for connection testing)
	 */
	async sendTestEmail(
		to: string | { name?: string; address: string },
		from?: string | { name?: string; address: string }
	): Promise<SmtpSendResult> {
		const testMessage: EmailMessage = {
			from: from || { name: 'Oscar AI Test', address: 'test@oscarai.com' },
			to: to as any, // Type assertion
			subject: 'Test Email from Oscar AI',
			text: 'This is a test email sent from the Oscar AI email engine.\n\nIf you received this email, your SMTP configuration is working correctly.',
			html: `
				<h1>Test Email from Oscar AI</h1>
				<p>This is a test email sent from the Oscar AI email engine.</p>
				<p>If you received this email, your SMTP configuration is working correctly.</p>
				<hr>
				<p><small>Sent at: ${new Date().toISOString()}</small></p>
			`
		};
		
		console.log(`Sending test email to: ${this.formatRecipients(to as any)}`);
		
		return this.sendEmail(testMessage);
	}

	/**
	 * Validate email message before sending
	 */
	validateMessage(message: EmailMessage): { valid: boolean; errors: string[] } {
		const errors: string[] = [];
		
		// Check required fields
		if (!message.from) {
			errors.push('Missing "from" address');
		}
		
		if (!message.to) {
			errors.push('Missing "to" address(es)');
		}
		
		if (!message.subject && !message.subject?.trim()) {
			errors.push('Missing or empty subject');
		}
		
		if (!message.text && !message.html) {
			errors.push('Missing message body (both text and html are empty)');
		}
		
		// Validate email format (simple check)
		const validateEmailFormat = (email: any): boolean => {
			if (typeof email === 'string') {
				return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
			}
			if (email && typeof email === 'object' && email.address) {
				return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.address);
			}
			return false;
		};
		
		// Validate from address
		if (message.from && !validateEmailFormat(message.from)) {
			errors.push('Invalid "from" email format');
		}
		
		// Validate recipients
		const recipients = Array.isArray(message.to) ? message.to : [message.to];
		for (const recipient of recipients) {
			if (!validateEmailFormat(recipient)) {
				errors.push(`Invalid recipient email format: ${JSON.stringify(recipient)}`);
			}
		}
		
		return {
			valid: errors.length === 0,
			errors
		};
	}

	/**
	 * Format recipients for logging
	 */
	private formatRecipients(recipients: string | { name?: string; address: string } | Array<string | { name?: string; address: string }>): string {
		if (typeof recipients === 'string') {
			return recipients;
		}
		
		if (Array.isArray(recipients)) {
			return recipients.map(r => {
				if (typeof r === 'string') return r;
				return r.address;
			}).join(', ');
		}
		
		if (recipients && typeof recipients === 'object' && 'address' in recipients) {
			return recipients.address;
		}
		
		return 'Unknown recipient';
	}
}