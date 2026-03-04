/**
 * Topic Extractor – identifies relevant subtopics and angles for a given topic.
 */

import type { BrandProfile } from '../types/BrandProfile';
import type { ContentTopic } from '../types/ContentTopic';

export interface ExtractedTopic {
	title: string;
	angle: string;
	keywords: string[];
	depth: 'intro' | 'intermediate' | 'advanced';
	estimatedWordCount: number;
}

/**
 * Topic Extractor – uses brand context to generate subtopics.
 */
export class TopicExtractor {
	/**
	 * Extract subtopics for a given topic.
	 */
	extractSubtopics(topic: string, brand: BrandProfile): ExtractedTopic[] {
		// Mock extraction – in reality this would call an LLM or use a knowledge base
		const baseSubtopics = [
			{
				title: `What is ${topic}?`,
				angle: 'Definition and basic explanation',
				keywords: ['definition', 'basics', 'introduction'],
				depth: 'intro' as const,
				estimatedWordCount: 300,
			},
			{
				title: `Benefits of ${topic}`,
				angle: 'Key advantages and why it matters',
				keywords: ['benefits', 'advantages', 'value'],
				depth: 'intermediate' as const,
				estimatedWordCount: 400,
			},
			{
				title: `How to implement ${topic}`,
				angle: 'Step‑by‑step guide',
				keywords: ['implementation', 'steps', 'guide'],
				depth: 'advanced' as const,
				estimatedWordCount: 500,
			},
			{
				title: `Common mistakes with ${topic}`,
				angle: 'Pitfalls to avoid',
				keywords: ['mistakes', 'pitfalls', 'avoid'],
				depth: 'intermediate' as const,
				estimatedWordCount: 350,
			},
			{
				title: `Future trends in ${topic}`,
				angle: 'Emerging developments',
				keywords: ['trends', 'future', 'innovations'],
				depth: 'advanced' as const,
				estimatedWordCount: 450,
			},
		];

		// Filter based on brand focus
		if (brand.id === 'cedarwood') {
			// Cedarwood prefers practical, client‑focused content
			return baseSubtopics.filter(t => t.depth !== 'intro');
		} else if (brand.id === 'tree-academy') {
			// Tree Academy prefers educational, beginner‑friendly content
			return baseSubtopics.filter(t => t.depth !== 'advanced');
		}

		return baseSubtopics;
	}

	/**
	 * Generate topic ideas for a brand.
	 */
	generateTopicIdeas(brand: BrandProfile, count = 5): ContentTopic[] {
		const seedTopics = [
			'Sustainable tree management',
			'Urban forestry benefits',
			'Tree disease identification',
			'Seasonal tree care',
			'Wildlife habitat creation',
			'Soil health for trees',
			'Tree planting techniques',
			'Pruning best practices',
			'Climate‑resilient species',
			'Community tree projects',
		];

		const selected = seedTopics.slice(0, count);
		return selected.map((title, idx) => ({
			id: `topic_${Date.now()}_${idx}`,
			title,
			category: this.mapToCategory(title),
			priority: Math.floor(Math.random() * 10) + 1,
			brandId: brand.id,
			keywords: title.toLowerCase().split(' '),
			lastUsed: null,
			timestamps: {
				created: new Date().toISOString(),
				updated: new Date().toISOString(),
			},
		}));
	}

	/**
	 * Map a topic title to a category.
	 */
	private mapToCategory(title: string): string {
		if (title.includes('management') || title.includes('care')) return 'Tree Care';
		if (title.includes('disease') || title.includes('health')) return 'Tree Health';
		if (title.includes('planting') || title.includes('pruning')) return 'Techniques';
		if (title.includes('urban') || title.includes('community')) return 'Urban Forestry';
		if (title.includes('sustainable') || title.includes('climate')) return 'Sustainability';
		return 'General';
	}
}