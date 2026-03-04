/**
 * Email Publisher – sends blog posts as email newsletters.
 */

import type { BlogPost } from '../types/BlogPost';
import type { BrandProfile } from '../types/BrandProfile';

export interface EmailList {
	id: string;
	name: string;
	subscriberCount: number;
	brandId: string;
}

export interface EmailCampaign {
	id: string;
	subject: string;
	previewText: string;
	content: string;
	listIds: string[];
	scheduledFor?: string;
	sentAt?: string;
	openRate?: number;
	clickRate?: number;
}

export interface EmailPublishResult {
	success: boolean;
	campaignId?: string;
	error?: string;
}

/**
 * Email Publisher – manages email newsletter campaigns.
 */
export class EmailPublisher {
	private lists: EmailList[] = [];

	constructor(lists: EmailList[] = []) {
		this.lists = lists;
	}

	/**
	 * Create an email campaign from a blog post.
	 */
	createCampaignFromBlogPost(post: BlogPost, listIds: string[]): EmailCampaign {
		const subject = `New post: ${post.title}`;
		const previewText = post.excerpt || post.content.substring(0, 150);
		const content = this.generateEmailContent(post);

		return {
			id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			subject,
			previewText,
			content,
			listIds,
			scheduledFor: undefined,
			sentAt: undefined,
			openRate: 0,
			clickRate: 0,
		};
	}

	/**
	 * Send an email campaign.
	 */
	async sendCampaign(campaign: EmailCampaign): Promise<EmailPublishResult> {
		// Mock sending – in reality this would integrate with Mailchimp, SendGrid, etc.
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			campaign.sentAt = new Date().toISOString();
			return { success: true, campaignId: campaign.id };
		} catch (error: any) {
			return { success: false, error: error.message };
		}
	}

	/**
	 * Schedule an email campaign.
	 */
	scheduleCampaign(campaign: EmailCampaign, scheduleTime: string): EmailCampaign {
		return {
			...campaign,
			scheduledFor: scheduleTime,
		};
	}

	/**
	 * Get email lists for a brand.
	 */
	getListsForBrand(brandId: string): EmailList[] {
		return this.lists.filter(l => l.brandId === brandId);
	}

	/**
	 * Add an email list.
	 */
	addList(list: EmailList) {
		this.lists.push(list);
	}

	/**
	 * Generate HTML email content from a blog post.
	 */
	private generateEmailContent(post: BlogPost): string {
		return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>${post.title}</title>
	<style>
		body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
		.title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
		.excerpt { color: #666; font-size: 16px; margin-bottom: 20px; }
		.content { margin-bottom: 30px; }
		.cta { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
		.footer { color: #999; font-size: 14px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
	</style>
</head>
<body>
	<div class="header">
		<div class="title">${post.title}</div>
		<div class="excerpt">${post.excerpt}</div>
	</div>
	<div class="content">
		${post.content.substring(0, 500)}…
	</div>
	<a href="https://${post.brand.id}.co/blog/${post.slug}" class="cta">Read the full post</a>
	<div class="footer">
		Sent by ${post.brand.name} · <a href="#">Unsubscribe</a>
	</div>
</body>
</html>
		`.trim();
	}
}