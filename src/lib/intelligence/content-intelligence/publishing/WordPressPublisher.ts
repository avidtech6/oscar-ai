/**
 * WordPress Publisher – publishes blog posts to WordPress via REST API.
 */

import type { BlogPost } from '../types/BlogPost';
import type { BrandProfile } from '../types/BrandProfile';

export interface WordPressSiteConfig {
	id: string;
	name: string;
	url: string;
	username: string;
	password: string; // Application password
	apiBase: string;
	defaultCategoryId?: number;
	defaultTagIds?: number[];
	featuredImageMediaId?: number;
}

export interface WordPressPublishResult {
	success: boolean;
	postId?: number;
	url?: string;
	error?: string;
}

/**
 * WordPress Publisher – handles WordPress REST API integration.
 */
export class WordPressPublisher {
	private configs: WordPressSiteConfig[] = [];

	constructor(configs: WordPressSiteConfig[] = []) {
		this.configs = configs;
	}

	/**
	 * Publish a blog post to WordPress.
	 */
	async publish(post: BlogPost, siteId: string): Promise<WordPressPublishResult> {
		const config = this.configs.find(c => c.id === siteId);
		if (!config) {
			return { success: false, error: `WordPress site ${siteId} not configured` };
		}

		// Mock implementation – in reality this would call the WordPress REST API
		try {
			const wpPostId = Math.floor(Math.random() * 10000) + 1;
			const url = `${config.url}/?p=${wpPostId}`;
			// Simulate API delay
			await new Promise(resolve => setTimeout(resolve, 800));
			return {
				success: true,
				postId: wpPostId,
				url,
			};
		} catch (error: any) {
			return { success: false, error: error.message };
		}
	}

	/**
	 * Update an existing WordPress post.
	 */
	async update(post: BlogPost, siteId: string, wpPostId: number): Promise<WordPressPublishResult> {
		const config = this.configs.find(c => c.id === siteId);
		if (!config) {
			return { success: false, error: `WordPress site ${siteId} not configured` };
		}

		// Mock update
		await new Promise(resolve => setTimeout(resolve, 500));
		return { success: true, postId: wpPostId };
	}

	/**
	 * Draft a post (save as draft).
	 */
	async draft(post: BlogPost, siteId: string): Promise<WordPressPublishResult> {
		const config = this.configs.find(c => c.id === siteId);
		if (!config) {
			return { success: false, error: `WordPress site ${siteId} not configured` };
		}

		// Mock draft creation
		const wpPostId = Math.floor(Math.random() * 10000) + 1;
		await new Promise(resolve => setTimeout(resolve, 300));
		return { success: true, postId: wpPostId };
	}

	/**
	 * Map blog post to WordPress API payload.
	 */
	private mapToWordPressPayload(post: BlogPost, config: WordPressSiteConfig): any {
		return {
			title: post.title,
			content: post.content,
			excerpt: post.excerpt,
			status: post.status === 'published' ? 'publish' : 'draft',
			categories: [config.defaultCategoryId || 1],
			tags: config.defaultTagIds || [],
			featured_media: config.featuredImageMediaId || 0,
			meta: {
				oscar_ai_post_id: post.id,
				oscar_ai_version: post.version,
				oscar_ai_brand: post.brand.id,
			},
		};
	}

	/**
	 * Get WordPress sites for a brand.
	 */
	getSitesForBrand(brandId: string): WordPressSiteConfig[] {
		return this.configs.filter(c => c.id.startsWith(brandId));
	}

	/**
	 * Add a WordPress site configuration.
	 */
	addSite(config: WordPressSiteConfig) {
		this.configs.push(config);
	}
}