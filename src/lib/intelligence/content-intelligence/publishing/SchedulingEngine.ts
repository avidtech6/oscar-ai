/**
 * Scheduling Engine – manages publication schedules for blog posts and social posts.
 */

import type { BlogPost } from '../types/BlogPost';
import type { SocialPost } from '../types/SocialPost';
import type { BrandProfile } from '../types/BrandProfile';

export interface ScheduleRule {
	id: string;
	brandId: string;
	platform: 'blog' | 'linkedin' | 'facebook' | 'twitter' | 'instagram' | 'tiktok';
	dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
	timeOfDay: string; // "14:30"
	maxPerDay: number;
	enabled: boolean;
}

export interface ScheduleSlot {
	date: string; // YYYY‑MM‑DD
	time: string; // HH:MM
	platform: string;
	postId?: string;
	status: 'available' | 'booked' | 'blocked';
}

/**
 * Scheduling Engine – determines optimal publication times.
 */
export class SchedulingEngine {
	private rules: ScheduleRule[] = [];

	constructor(rules: ScheduleRule[] = []) {
		this.rules = rules;
	}

	/**
	 * Add a schedule rule.
	 */
	addRule(rule: ScheduleRule) {
		this.rules.push(rule);
	}

	/**
	 * Get schedule rules for a brand and platform.
	 */
	getRules(brandId: string, platform: string): ScheduleRule[] {
		return this.rules.filter(r => r.brandId === brandId && r.platform === platform && r.enabled);
	}

	/**
	 * Find the next available slot for a blog post.
	 */
	findNextBlogSlot(brandId: string, minDate?: string): ScheduleSlot | null {
		const rules = this.getRules(brandId, 'blog');
		if (rules.length === 0) {
			// Default: Monday 10:00
			const nextMonday = this.getNextWeekday(1);
			return {
				date: nextMonday.toISOString().split('T')[0],
				time: '10:00',
				platform: 'blog',
				status: 'available',
			};
		}

		// Use the first rule for simplicity
		const rule = rules[0];
		const today = new Date();
		const targetDate = this.getNextWeekday(rule.dayOfWeek);
		return {
			date: targetDate.toISOString().split('T')[0],
			time: rule.timeOfDay,
			platform: 'blog',
			status: 'available',
		};
	}

	/**
	 * Find the next available slot for a social post.
	 */
	findNextSocialSlot(brandId: string, platform: string, minDate?: string): ScheduleSlot | null {
		const rules = this.getRules(brandId, platform);
		if (rules.length === 0) {
			// Default: tomorrow at 12:00
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			return {
				date: tomorrow.toISOString().split('T')[0],
				time: '12:00',
				platform,
				status: 'available',
			};
		}

		const rule = rules[0];
		const targetDate = this.getNextWeekday(rule.dayOfWeek);
		return {
			date: targetDate.toISOString().split('T')[0],
			time: rule.timeOfDay,
			platform,
			status: 'available',
		};
	}

	/**
	 * Schedule a blog post.
	 */
	scheduleBlogPost(post: BlogPost, slot: ScheduleSlot): BlogPost {
		const scheduledFor = `${slot.date}T${slot.time}:00`;
		return {
			...post,
			scheduledFor,
			status: 'scheduled',
		};
	}

	/**
	 * Schedule a social post.
	 */
	scheduleSocialPost(post: SocialPost, slot: ScheduleSlot): SocialPost {
		const scheduledFor = `${slot.date}T${slot.time}:00`;
		return {
			...post,
			scheduledFor,
			status: 'scheduled',
		};
	}

	/**
	 * Generate a schedule for the next week.
	 */
	generateWeeklySchedule(brandId: string, startDate?: string): ScheduleSlot[] {
		const slots: ScheduleSlot[] = [];
		const start = startDate ? new Date(startDate) : new Date();

		for (let i = 0; i < 7; i++) {
			const date = new Date(start);
			date.setDate(date.getDate() + i);
			const dateStr = date.toISOString().split('T')[0];
			const dayOfWeek = date.getDay();

			// Blog slot (once per week)
			const blogRule = this.getRules(brandId, 'blog').find(r => r.dayOfWeek === dayOfWeek);
			if (blogRule) {
				slots.push({
					date: dateStr,
					time: blogRule.timeOfDay,
					platform: 'blog',
					status: 'available',
				});
			}

			// Social slots (multiple platforms)
			const platforms = ['linkedin', 'facebook', 'twitter', 'instagram', 'tiktok'];
			for (const platform of platforms) {
				const rule = this.getRules(brandId, platform).find(r => r.dayOfWeek === dayOfWeek);
				if (rule) {
					slots.push({
						date: dateStr,
						time: rule.timeOfDay,
						platform,
						status: 'available',
					});
				}
			}
		}

		return slots;
	}

	/**
	 * Get the next occurrence of a weekday.
	 */
	private getNextWeekday(dayOfWeek: number): Date {
		const today = new Date();
		const todayDay = today.getDay();
		let diff = dayOfWeek - todayDay;
		if (diff <= 0) diff += 7;
		const target = new Date(today);
		target.setDate(today.getDate() + diff);
		return target;
	}
}