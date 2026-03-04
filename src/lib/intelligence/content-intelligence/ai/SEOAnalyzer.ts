/**
 * SEO Analyzer – analyzes and optimizes blog post SEO.
 */

import type { BlogPost } from '../types/BlogPost';
import type { SEOData } from '../types/SEOData';

export interface SEOAnalysis {
	score: number; // 0‑100
	recommendations: string[];
	keywordDensity: Record<string, number>;
	readabilityScore: number;
	missingElements: string[];
}

/**
 * SEO Analyzer – evaluates and improves SEO of a blog post.
 */
export class SEOAnalyzer {
	/**
	 * Analyze a blog post's SEO.
	 */
	analyze(post: BlogPost): SEOData {
		const content = post.content;
		const words = content.split(/\s+/).length;
		const keywords = post.seo.keywords || [];

		// Calculate keyword density
		const density: Record<string, number> = {};
		for (const kw of keywords) {
			const matches = (content.toLowerCase().match(new RegExp(kw.toLowerCase(), 'g')) || []).length;
			density[kw] = matches / words;
		}

		// Readability score (Flesch‑Kincaid approximation)
		const sentences = content.split(/[.!?]+/).length;
		const syllables = this.estimateSyllables(content);
		const readability = sentences > 0 ? 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words) : 0;

		// Missing elements
		const missing: string[] = [];
		if (!post.featuredImage) missing.push('featured image');
		if (post.content.length < 800) missing.push('more content');
		if (keywords.length < 3) missing.push('more keywords');
		if (!post.excerpt || post.excerpt.length < 50) missing.push('better excerpt');

		// Generate recommendations
		const recommendations: string[] = [];
		if (readability < 60) recommendations.push('Improve readability by using shorter sentences.');
		if (words < 1000) recommendations.push('Increase word count for better SEO.');
		if (Object.keys(density).length === 0) recommendations.push('Add target keywords to the content.');

		const score = this.calculateScore(words, readability, missing.length, keywords.length);

		return {
			...post.seo,
			readabilityScore: Math.round(readability),
			keywordDensity: density,
			internalLinks: [],
			externalLinks: [],
		};
	}

	/**
	 * Calculate an overall SEO score.
	 */
	private calculateScore(
		wordCount: number,
		readability: number,
		missingCount: number,
		keywordCount: number
	): number {
		let score = 0;
		if (wordCount >= 800) score += 30;
		else if (wordCount >= 500) score += 20;
		else score += 10;

		if (readability >= 60) score += 30;
		else if (readability >= 40) score += 20;
		else score += 10;

		if (keywordCount >= 3) score += 20;
		else if (keywordCount >= 1) score += 10;

		score -= missingCount * 5;
		return Math.max(0, Math.min(100, score));
	}

	/**
	 * Estimate syllable count (simplified).
	 */
	private estimateSyllables(text: string): number {
		// Very rough approximation: assume average 1.5 syllables per word
		return Math.floor(text.split(/\s+/).length * 1.5);
	}

	/**
	 * Generate meta description from content.
	 */
	generateMetaDescription(content: string, maxLength = 160): string {
		const plain = content.replace(/<[^>]*>/g, '');
		if (plain.length <= maxLength) return plain;
		return plain.substring(0, maxLength - 3) + '...';
	}

	/**
	 * Suggest keywords based on content.
	 */
	suggestKeywords(content: string, count = 5): string[] {
		const words = content.toLowerCase().split(/\W+/);
		const freq: Record<string, number> = {};
		for (const w of words) {
			if (w.length > 4) freq[w] = (freq[w] || 0) + 1;
		}
		const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
		return sorted.slice(0, count).map(([kw]) => kw);
	}
}