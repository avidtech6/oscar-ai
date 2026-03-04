/**
 * Content Generator – generates blog post content from a topic and subtopics.
 */

import type { BrandProfile } from '../types/BrandProfile';
import type { BlogPost } from '../types/BlogPost';
import type { ExtractedTopic } from './TopicExtractor';

export interface ContentGenerationOptions {
	topic: string;
	subtopics: ExtractedTopic[];
	brand: BrandProfile;
	tone: 'professional' | 'educational' | 'conversational';
	wordCount: number;
}

/**
 * Content Generator – creates structured blog post content.
 */
export class ContentGenerator {
	/**
	 * Generate a blog post draft.
	 */
	async generate(options: ContentGenerationOptions): Promise<BlogPost> {
		const { topic, subtopics, brand, tone, wordCount } = options;
		const now = new Date().toISOString();

		// Build content from subtopics
		let content = '';
		for (const st of subtopics) {
			content += `<h2>${st.title}</h2>\n`;
			content += `<p>${this.generateParagraph(st.angle, tone)}</p>\n`;
			if (st.depth === 'advanced') {
				content += `<ul>${st.keywords.map(k => `<li>${k}</li>`).join('')}</ul>\n`;
			}
			content += '\n';
		}

		// Ensure word count roughly matches
		const currentWords = content.split(/\s+/).length;
		if (currentWords < wordCount) {
			content += `<p>${this.generateParagraph('Additional insights', tone)}</p>\n`;
		}

		const post: BlogPost = {
			id: `blog_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			title: topic,
			slug: topic.toLowerCase().replace(/\s+/g, '-'),
			author: 'Oscar AI',
			publishedAt: null,
			scheduledFor: null,
			status: 'draft',
			brand,
			content,
			excerpt: this.generateExcerpt(topic, tone),
			featuredImage: null,
			images: [],
			categories: [this.mapToCategory(topic)],
			tags: [tone, ...subtopics.flatMap(st => st.keywords).slice(0, 3)],
			seo: {
				title: `${topic} – ${brand.name}`,
				description: `Learn about ${topic} with ${brand.name}.`,
				keywords: subtopics.flatMap(st => st.keywords).slice(0, 5),
				slug: topic.toLowerCase().replace(/\s+/g, '-'),
				openGraph: { title: '', description: '', image: '' },
				twitterCard: { title: '', description: '', image: '' },
				readabilityScore: 0,
				keywordDensity: {},
				internalLinks: [],
				externalLinks: [],
			},
			wordpressId: null,
			wordpressSite: null,
			socialPosts: [],
			timestamps: { created: now, updated: now },
			version: 1,
		};

		return post;
	}

	/**
	 * Generate a paragraph based on angle and tone.
	 */
	private generateParagraph(angle: string, tone: string): string {
		const toneMap = {
			professional: `This section discusses ${angle} in a professional context.`,
			educational: `Let's explore ${angle} in an educational manner.`,
			conversational: `So, about ${angle} – here's what you need to know.`,
		};
		return toneMap[tone as keyof typeof toneMap] || `Discussion of ${angle}.`;
	}

	/**
	 * Generate an excerpt.
	 */
	private generateExcerpt(topic: string, tone: string): string {
		const excerpts = {
			professional: `A comprehensive analysis of ${topic}.`,
			educational: `Learn the fundamentals of ${topic}.`,
			conversational: `Curious about ${topic}? Let's dive in.`,
		};
		return excerpts[tone as keyof typeof excerpts] || `An article about ${topic}.`;
	}

	/**
	 * Map topic to a category.
	 */
	private mapToCategory(topic: string): string {
		if (topic.includes('tree') || topic.includes('forest')) return 'Arboriculture';
		if (topic.includes('care') || topic.includes('health')) return 'Tree Care';
		if (topic.includes('sustainable') || topic.includes('climate')) return 'Sustainability';
		if (topic.includes('urban') || topic.includes('city')) return 'Urban Forestry';
		return 'General';
	}
}