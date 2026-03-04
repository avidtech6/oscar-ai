/**
 * Content Intelligence Engine – main orchestrator for blog post generation, analysis, and publishing.
 */

import type { BlogPost } from './types/BlogPost';
import type { BrandProfile } from './types/BrandProfile';
import type { SocialPost } from './types/SocialPost';
import type { ContentTopic } from './types/ContentTopic';
import type { SEOData } from './types/SEOData';

import { TopicExtractor } from './ai/TopicExtractor';
import { ContentGenerator } from './ai/ContentGenerator';
import { SEOAnalyzer } from './ai/SEOAnalyzer';
import { TemplateEngine } from './ai/TemplateEngine';
import { SocialPublisher } from './publishing/SocialPublisher';
import { WordPressPublisher } from './publishing/WordPressPublisher';
import { EmailPublisher } from './publishing/EmailPublisher';
import { SchedulingEngine } from './publishing/SchedulingEngine';
import { ContentCalendar } from './publishing/ContentCalendar';
import { intelligenceEvents } from '../events';

export interface ContentIntelligenceConfig {
	brand: BrandProfile;
	enableAutoPublishing: boolean;
	enableSocialCrosspost: boolean;
	enableEmailNewsletter: boolean;
	wordPressSiteId?: string;
	emailListIds?: string[];
}

/**
 * Content Intelligence Engine – orchestrates the entire content pipeline.
 */
export class ContentIntelligenceEngine {
	private config: ContentIntelligenceConfig;
	private topicExtractor: TopicExtractor;
	private contentGenerator: ContentGenerator;
	private seoAnalyzer: SEOAnalyzer;
	private templateEngine: TemplateEngine;
	private socialPublisher: SocialPublisher;
	private wordPressPublisher: WordPressPublisher;
	private emailPublisher: EmailPublisher;
	private schedulingEngine: SchedulingEngine;
	private contentCalendar: ContentCalendar;

	constructor(config: ContentIntelligenceConfig) {
		this.config = config;
		this.topicExtractor = new TopicExtractor();
		this.contentGenerator = new ContentGenerator();
		this.seoAnalyzer = new SEOAnalyzer();
		this.templateEngine = new TemplateEngine();
		this.socialPublisher = new SocialPublisher([]);
		this.wordPressPublisher = new WordPressPublisher([]);
		this.emailPublisher = new EmailPublisher([]);
		this.schedulingEngine = new SchedulingEngine();
		this.contentCalendar = new ContentCalendar();
	}

	/**
	 * Generate a blog post from a topic.
	 */
	async generateBlogPost(topic: string, templateId?: string): Promise<BlogPost> {
		intelligenceEvents.emit('contentIntelligence:generationStarted', { topic, templateId });

		// Extract subtopics
		const subtopics = this.topicExtractor.extractSubtopics(topic, this.config.brand);
		// Generate content
		const draft = await this.contentGenerator.generate({
			topic,
			subtopics,
			brand: this.config.brand,
			tone: 'professional',
			wordCount: 1200,
		});
		// Apply template
		const template = templateId || this.selectTemplate(this.config.brand);
		const post = this.templateEngine.applyTemplate(draft, template);
		// Analyze SEO
		const seo = this.seoAnalyzer.analyze(post);
		post.seo = seo;

		intelligenceEvents.emit('contentIntelligence:generationCompleted', { post });
		return post;
	}

	/**
	 * Publish a blog post (WordPress, social, email).
	 */
	async publishBlogPost(post: BlogPost): Promise<{
		wordPress?: { success: boolean; postId?: number; url?: string };
		social?: { success: boolean; postId?: string }[];
		email?: { success: boolean; campaignId?: string };
	}> {
		intelligenceEvents.emit('contentIntelligence:publishingStarted', { post });

		const results: any = {};

		// WordPress
		if (this.config.enableAutoPublishing && this.config.wordPressSiteId) {
			const wpResult = await this.wordPressPublisher.publish(post, this.config.wordPressSiteId);
			results.wordPress = wpResult;
			if (wpResult.success) {
				post.wordpressId = wpResult.postId ?? null;
				post.wordpressSite = this.mapWordPressSiteId(this.config.wordPressSiteId);
				post.status = 'published';
				post.publishedAt = new Date().toISOString();
			}
		}

		// Social
		if (this.config.enableSocialCrosspost) {
			const socialPosts = this.socialPublisher.generateFromBlogPost(post, this.config.brand);
			const socialResults = [];
			for (const sp of socialPosts) {
				const result = await this.socialPublisher.publish(sp);
				socialResults.push(result);
				if (result.success) {
					post.socialPosts.push(this.toSocialPostRef(sp));
				}
			}
			results.social = socialResults;
		}

		// Email
		if (this.config.enableEmailNewsletter && this.config.emailListIds) {
			const campaign = this.emailPublisher.createCampaignFromBlogPost(post, this.config.emailListIds);
			const emailResult = await this.emailPublisher.sendCampaign(campaign);
			results.email = emailResult;
		}

		intelligenceEvents.emit('contentIntelligence:publishingCompleted', { post, results });
		return results;
	}

	/**
	 * Schedule a blog post for future publication.
	 */
	scheduleBlogPost(post: BlogPost, date: string, time: string): BlogPost {
		const slot = this.schedulingEngine.findNextBlogSlot(this.config.brand.id);
		if (!slot) {
			throw new Error('No available blog slot');
		}
		const scheduledFor = `${date}T${time}:00`;
		const scheduledPost = this.schedulingEngine.scheduleBlogPost(post, { ...slot, date, time });
		this.contentCalendar.addBlogPost(scheduledPost);
		return scheduledPost;
	}

	/**
	 * Analyze content performance.
	 */
	analyzePerformance(postId: string): any {
		// Mock performance analysis
		return {
			views: Math.floor(Math.random() * 1000),
			engagement: Math.random() * 10,
			seoScore: Math.floor(Math.random() * 100),
			recommendations: ['Add more internal links', 'Include a call‑to‑action'],
		};
	}

	/**
	 * Generate a content calendar for the next month.
	 */
	getContentCalendar(year: number, month: number) {
		return this.contentCalendar.getMonthView(year, month);
	}

	/**
	 * Get upcoming content.
	 */
	getUpcomingContent(days = 7) {
		return this.contentCalendar.getUpcomingEvents(days);
	}

	/**
	 * Select an appropriate template for the brand.
	 */
	private selectTemplate(brand: BrandProfile): string {
		const templates = this.templateEngine.getTemplatesForBrand(brand.id);
		if (templates.length === 0) return 'case-study';
		// Prefer case‑study for Cedarwood, lesson for Tree Academy
		if (brand.id === 'cedarwood') {
			return templates.find(t => t.id === 'case-study')?.id || templates[0].id;
		} else if (brand.id === 'tree-academy') {
			return templates.find(t => t.id === 'lesson')?.id || templates[0].id;
		}
		return templates[0].id;
	}

	/**
	 * Map WordPress site ID to allowed brand values.
	 */
	private mapWordPressSiteId(siteId?: string): 'cedarwood' | 'tree‑academy' | null {
		if (!siteId) return null;
		if (siteId.includes('cedarwood')) return 'cedarwood';
		if (siteId.includes('tree-academy')) return 'tree‑academy';
		return null;
	}

	/**
	 * Convert a SocialPost to a SocialPostRef.
	 */
	private toSocialPostRef(sp: SocialPost): import('./types/BlogPost').SocialPostRef {
		return {
			platform: sp.platform,
			postId: sp.platformPostId,
			scheduledFor: sp.scheduledFor,
			publishedAt: sp.publishedAt,
		};
	}
}