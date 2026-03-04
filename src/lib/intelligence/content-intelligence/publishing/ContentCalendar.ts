/**
 * Content Calendar – visual calendar of scheduled and published content.
 */

import type { BlogPost } from '../types/BlogPost';
import type { SocialPost } from '../types/SocialPost';
import type { BrandProfile } from '../types/BrandProfile';

export interface CalendarEvent {
	id: string;
	type: 'blog' | 'social';
	title: string;
	date: string; // YYYY‑MM‑DD
	time?: string; // HH:MM
	platform?: string;
	status: 'draft' | 'scheduled' | 'published' | 'failed';
	postId: string;
	brandId: string;
	color?: string;
}

export interface CalendarView {
	month: number;
	year: number;
	events: CalendarEvent[];
}

/**
 * Content Calendar – aggregates blog and social posts into a calendar view.
 */
export class ContentCalendar {
	private blogPosts: BlogPost[] = [];
	private socialPosts: SocialPost[] = [];

	constructor(blogPosts: BlogPost[] = [], socialPosts: SocialPost[] = []) {
		this.blogPosts = blogPosts;
		this.socialPosts = socialPosts;
	}

	/**
	 * Add a blog post.
	 */
	addBlogPost(post: BlogPost) {
		this.blogPosts.push(post);
	}

	/**
	 * Add a social post.
	 */
	addSocialPost(post: SocialPost) {
		this.socialPosts.push(post);
	}

	/**
	 * Get all calendar events for a date range.
	 */
	getEvents(startDate: string, endDate: string): CalendarEvent[] {
		const events: CalendarEvent[] = [];

		// Blog posts
		for (const post of this.blogPosts) {
			const date = post.scheduledFor || post.publishedAt;
			if (!date) continue;
			const eventDate = date.split('T')[0];
			if (eventDate >= startDate && eventDate <= endDate) {
				events.push({
					id: `blog_${post.id}`,
					type: 'blog',
					title: post.title,
					date: eventDate,
					time: date.split('T')[1]?.substring(0, 5),
					platform: 'blog',
					status: post.status as any,
					postId: post.id,
					brandId: post.brand.id,
					color: '#3b82f6', // blue
				});
			}
		}

		// Social posts
		for (const post of this.socialPosts) {
			const date = post.scheduledFor || post.publishedAt;
			if (!date) continue;
			const eventDate = date.split('T')[0];
			if (eventDate >= startDate && eventDate <= endDate) {
				events.push({
					id: `social_${post.id}`,
					type: 'social',
					title: `Post on ${post.platform}`,
					date: eventDate,
					time: date.split('T')[1]?.substring(0, 5),
					platform: post.platform,
					status: post.status as any,
					postId: post.id,
					brandId: post.blogPostId ? this.getBrandFromBlogPost(post.blogPostId) : 'unknown',
					color: this.getPlatformColor(post.platform),
				});
			}
		}

		return events.sort((a, b) => {
			if (a.date !== b.date) return a.date.localeCompare(b.date);
			return (a.time || '00:00').localeCompare(b.time || '00:00');
		});
	}

	/**
	 * Get calendar view for a specific month.
	 */
	getMonthView(year: number, month: number): CalendarView {
		const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
		const lastDay = new Date(year, month, 0).getDate();
		const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
		const events = this.getEvents(startDate, endDate);
		return { month, year, events };
	}

	/**
	 * Get upcoming events (next 7 days).
	 */
	getUpcomingEvents(days = 7): CalendarEvent[] {
		const today = new Date().toISOString().split('T')[0];
		const future = new Date();
		future.setDate(future.getDate() + days);
		const futureStr = future.toISOString().split('T')[0];
		return this.getEvents(today, futureStr);
	}

	/**
	 * Get events for a specific brand.
	 */
	getBrandEvents(brandId: string, startDate?: string, endDate?: string): CalendarEvent[] {
		const start = startDate || '2000-01-01';
		const end = endDate || '2100-12-31';
		const all = this.getEvents(start, end);
		return all.filter(e => e.brandId === brandId);
	}

	/**
	 * Find conflicts (multiple posts at same time).
	 */
	findConflicts(): Array<{ date: string; time: string; events: CalendarEvent[] }> {
		const events = this.getEvents('2000-01-01', '2100-12-31');
		const grouped: Record<string, CalendarEvent[]> = {};

		for (const event of events) {
			const key = `${event.date}_${event.time || '00:00'}`;
			if (!grouped[key]) grouped[key] = [];
			grouped[key].push(event);
		}

		const conflicts = [];
		for (const [key, events] of Object.entries(grouped)) {
			if (events.length > 1) {
				const [date, time] = key.split('_');
				conflicts.push({ date, time, events });
			}
		}
		return conflicts;
	}

	/**
	 * Get brand ID from a blog post ID (helper).
	 */
	private getBrandFromBlogPost(blogPostId: string): string {
		const post = this.blogPosts.find(p => p.id === blogPostId);
		return post?.brand.id || 'unknown';
	}

	/**
	 * Get platform color.
	 */
	private getPlatformColor(platform: string): string {
		const colors: Record<string, string> = {
			linkedin: '#0a66c2',
			facebook: '#1877f2',
			twitter: '#1da1f2',
			instagram: '#e4405f',
			tiktok: '#000000',
		};
		return colors[platform] || '#6b7280';
	}
}