/**
 * Social Publisher – handles publishing to LinkedIn, Facebook, Twitter, Instagram, TikTok.
 */

import type { SocialPost } from '../types/SocialPost';
import type { BlogPost } from '../types/BlogPost';
import type { BrandProfile } from '../types/BrandProfile';

export interface SocialPlatformConfig {
	platform: 'linkedin' | 'facebook' | 'twitter' | 'instagram' | 'tiktok';
	apiKey?: string;
	apiSecret?: string;
	accessToken?: string;
	pageId?: string;
	username?: string;
}

export interface PublishResult {
	success: boolean;
	postId?: string;
	error?: string;
	publishedAt?: string;
}

/**
 * Social Publisher – manages cross‑platform social media publishing.
 */
export class SocialPublisher {
	private configs: SocialPlatformConfig[] = [];

	constructor(configs: SocialPlatformConfig[]) {
		this.configs = configs;
	}

	/**
	 * Publish a social post.
	 */
	async publish(post: SocialPost): Promise<PublishResult> {
		const config = this.configs.find(c => c.platform === post.platform);
		if (!config) {
			return { success: false, error: `No configuration for platform ${post.platform}` };
		}

		// Mock publishing – in reality this would call platform APIs
		try {
			const postId = `social_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
			const publishedAt = new Date().toISOString();
			// Simulate API delay
			await new Promise(resolve => setTimeout(resolve, 500));
			return {
				success: true,
				postId,
				publishedAt,
			};
		} catch (error: any) {
			return { success: false, error: error.message };
		}
	}

	/**
	 * Schedule a social post for future publication.
	 */
	async schedule(post: SocialPost, scheduleTime: string): Promise<PublishResult> {
		// In a real implementation, this would call a scheduling API (e.g., Buffer, Hootsuite)
		// For now, just update the post's scheduledFor
		post.scheduledFor = scheduleTime;
		post.status = 'scheduled';
		return { success: true };
	}

	/**
	 * Generate social posts from a blog post.
	 */
	generateFromBlogPost(blogPost: BlogPost, brand: BrandProfile): SocialPost[] {
		const platforms: ('linkedin' | 'facebook' | 'twitter' | 'instagram' | 'tiktok')[] = ['linkedin', 'facebook', 'twitter'];
		const posts: SocialPost[] = [];

		for (const platform of platforms) {
			const content = this.adaptContentForPlatform(blogPost, platform, brand);
			const post: SocialPost = {
				id: `social_${Date.now()}_${platform}_${Math.random().toString(36).substring(2, 5)}`,
				platform,
				content,
				images: blogPost.images.slice(0, platform === 'instagram' ? 1 : 4),
				videoUrl: platform === 'tiktok' ? blogPost.images[0] || null : null,
				hashtags: this.generateHashtags(blogPost, brand),
				scheduledFor: null,
				publishedAt: null,
				status: 'draft',
				blogPostId: blogPost.id,
				platformPostId: null,
				error: null,
				timestamps: {
					created: new Date().toISOString(),
					updated: new Date().toISOString(),
				},
			};
			posts.push(post);
		}

		return posts;
	}

	/**
	 * Adapt blog post content for a specific platform.
	 */
	private adaptContentForPlatform(blogPost: BlogPost, platform: string, brand: BrandProfile): string {
		const excerpt = blogPost.excerpt || blogPost.content.substring(0, 200);
		const base = `${blogPost.title}\n\n${excerpt}…\n\nRead more: ${this.generateShortLink(blogPost)}`;

		const platformRules: Record<string, (base: string) => string> = {
			linkedin: (base) => `${base}\n\n#${brand.seoFocusKeywords[0] || 'Arboriculture'}`,
			facebook: (base) => `${base}\n\nLike and share!`,
			twitter: (base) => {
				const max = 280;
				const trimmed = base.length > max ? base.substring(0, max - 3) + '…' : base;
				return `${trimmed}\n\n${this.generateHashtags(blogPost, brand).map(h => `#${h}`).join(' ')}`;
			},
			instagram: (base) => `${blogPost.title}\n\n${excerpt}…\n\n${this.generateHashtags(blogPost, brand).map(h => `#${h}`).join(' ')}`,
			tiktok: (base) => `Check out our latest blog: ${blogPost.title}\n\n${this.generateShortLink(blogPost)}`,
		};

		return platformRules[platform]?.(base) || base;
	}

	/**
	 * Generate relevant hashtags.
	 */
	private generateHashtags(blogPost: BlogPost, brand: BrandProfile): string[] {
		const tags = [
			...blogPost.tags,
			...brand.seoFocusKeywords,
			...blogPost.categories.map(c => c.replace(/\s+/g, '')),
		];
		// Deduplicate and limit
		return [...new Set(tags.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, '')))].slice(0, 5);
	}

	/**
	 * Generate a short link for the blog post (mock).
	 */
	private generateShortLink(blogPost: BlogPost): string {
		return `https://${blogPost.brand.id}.co/blog/${blogPost.slug}`;
	}
}