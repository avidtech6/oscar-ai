/**
 * Blog Post – core content model for Phase 17.
 */

import type { SEOData } from './SEOData';
import type { BrandProfile } from './BrandProfile';

export interface BlogPost {
	/** Unique identifier */
	id: string;
	/** Title of the blog post */
	title: string;
	/** Slug for URL */
	slug: string;
	/** Author name */
	author: string;
	/** Publication date (ISO string) */
	publishedAt: string | null;
	/** Scheduled publication date (ISO string) */
	scheduledFor: string | null;
	/** Status: draft, scheduled, published, archived */
	status: 'draft' | 'scheduled' | 'published' | 'archived';
	/** Brand profile (Cedarwood or Tree Academy) */
	brand: BrandProfile;
	/** HTML content (structured editor output) */
	content: string;
	/** Excerpt for preview */
	excerpt: string;
	/** Featured image URL */
	featuredImage: string | null;
	/** List of image URLs used in the post */
	images: string[];
	/** Categories */
	categories: string[];
	/** Tags */
	tags: string[];
	/** SEO metadata */
	seo: SEOData;
	/** WordPress post ID (if published) */
	wordpressId: number | null;
	/** WordPress site (cedarwood | tree‑academy) */
	wordpressSite: 'cedarwood' | 'tree‑academy' | null;
	/** Social media posts derived from this blog post */
	socialPosts: SocialPostRef[];
	/** Timestamps */
	timestamps: {
		created: string;
		updated: string;
		published?: string;
	};
	/** Version for optimistic concurrency */
	version: number;
}

export interface SocialPostRef {
	platform: 'linkedin' | 'facebook' | 'twitter' | 'instagram' | 'tiktok';
	postId: string | null;
	scheduledFor: string | null;
	publishedAt: string | null;
}

/**
 * Create a new empty blog post.
 */
export function createEmptyBlogPost(brand: BrandProfile): BlogPost {
	const now = new Date().toISOString();
	return {
		id: `blog_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
		title: '',
		slug: '',
		author: 'Oscar AI',
		publishedAt: null,
		scheduledFor: null,
		status: 'draft',
		brand,
		content: '',
		excerpt: '',
		featuredImage: null,
		images: [],
		categories: [],
		tags: [],
		seo: {
			title: '',
			description: '',
			keywords: [],
			slug: '',
			openGraph: {
				title: '',
				description: '',
				image: '',
			},
			twitterCard: {
				title: '',
				description: '',
				image: '',
			},
			readabilityScore: 0,
			keywordDensity: {},
			internalLinks: [],
			externalLinks: [],
		},
		wordpressId: null,
		wordpressSite: null,
		socialPosts: [],
		timestamps: {
			created: now,
			updated: now,
		},
		version: 1,
	};
}

/**
 * Validate a blog post for required fields.
 */
export function validateBlogPost(post: BlogPost): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	if (!post.title.trim()) errors.push('Title is required');
	if (!post.slug.trim()) errors.push('Slug is required');
	if (!post.content.trim()) errors.push('Content is required');
	if (!post.brand) errors.push('Brand is required');
	if (!post.seo.title.trim()) errors.push('SEO title is required');
	if (!post.seo.description.trim()) errors.push('SEO description is required');
	return { valid: errors.length === 0, errors };
}