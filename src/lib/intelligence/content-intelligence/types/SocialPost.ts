/**
 * Social Post – a post scheduled or published to a social platform.
 */

export type SocialPlatform = 'linkedin' | 'facebook' | 'twitter' | 'instagram' | 'tiktok';

export interface SocialPost {
	/** Unique identifier */
	id: string;
	/** Platform */
	platform: SocialPlatform;
	/** Content text */
	content: string;
	/** Image URLs */
	images: string[];
	/** Video URL (for TikTok/Instagram) */
	videoUrl: string | null;
	/** Hashtags */
	hashtags: string[];
	/** Scheduled publication time (ISO string) */
	scheduledFor: string | null;
	/** Actual publication time (ISO string) */
	publishedAt: string | null;
	/** Status: draft, scheduled, published, failed */
	status: 'draft' | 'scheduled' | 'published' | 'failed';
	/** Reference to the blog post this social post derives from */
	blogPostId: string | null;
	/** Platform‑specific post ID (after publishing) */
	platformPostId: string | null;
	/** Error message if failed */
	error: string | null;
	/** Timestamps */
	timestamps: {
		created: string;
		updated: string;
	};
}

/**
 * Create a new social post.
 */
export function createSocialPost(
	platform: SocialPlatform,
	content: string,
	blogPostId: string | null = null
): SocialPost {
	const now = new Date().toISOString();
	return {
		id: `social_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
		platform,
		content,
		images: [],
		videoUrl: null,
		hashtags: [],
		scheduledFor: null,
		publishedAt: null,
		status: 'draft',
		blogPostId,
		platformPostId: null,
		error: null,
		timestamps: {
			created: now,
			updated: now,
		},
	};
}

/**
 * Validate a social post for platform‑specific constraints.
 */
export function validateSocialPost(post: SocialPost): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	if (!post.content.trim()) errors.push('Content is required');
	const maxLengths: Record<SocialPlatform, number> = {
		linkedin: 3000,
		facebook: 63206,
		twitter: 280,
		instagram: 2200,
		tiktok: 2200,
	};
	if (post.content.length > maxLengths[post.platform]) {
		errors.push(`Content exceeds ${maxLengths[post.platform]} characters for ${post.platform}`);
	}
	if (post.platform === 'instagram' && post.images.length === 0 && !post.videoUrl) {
		errors.push('Instagram requires at least one image or video');
	}
	if (post.platform === 'tiktok' && !post.videoUrl) {
		errors.push('TikTok requires a video');
	}
	return { valid: errors.length === 0, errors };
}