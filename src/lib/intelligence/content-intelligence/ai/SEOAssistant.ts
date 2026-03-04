/**
 * SEO Assistant – analyses and optimises content for search engines.
 */

import type { BlogPost } from '../types/BlogPost';
import type { SEOData } from '../types/SEOData';

export interface SEOAnalysis {
	score: number; // 0‑100
	strengths: string[];
	weaknesses: string[];
	recommendations: string[];
	keywordDensity: Record<string, number>;
	readability: 'very poor' | 'poor' | 'fair' | 'good' | 'excellent';
	metaLength: {
		title: { length: number; optimal: boolean };
		description: { length: number; optimal: boolean };
	};
	imageAlt: { present: number; total: number };
	internalLinks: number;
	externalLinks: number;
}

/**
 * SEO Assistant – provides actionable SEO insights.
 */
export class SEOAssistant {
	/**
	 * Analyse a blog post for SEO.
	 */
	analyse(post: BlogPost): SEOAnalysis {
		const content = post.content;
		const plainText = this.stripHTML(content);
		const words = plainText.split(/\s+/).filter(w => w.length > 0);
		const wordCount = words.length;

		// Keyword density
		const keywordDensity: Record<string, number> = {};
		post.seo.keywords.forEach((kw: string) => {
			const matches = plainText.toLowerCase().match(new RegExp(kw.toLowerCase(), 'g')) || [];
			keywordDensity[kw] = matches.length / wordCount * 100;
		});

		// Readability (simplified Flesch‑Kincaid approximation)
		const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
		const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
		const avgSyllablesPerWord = this.estimateSyllables(plainText) / Math.max(wordCount, 1);
		const readabilityScore = Math.max(0, Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord));
		let readability: SEOAnalysis['readability'] = 'fair';
		if (readabilityScore >= 80) readability = 'excellent';
		else if (readabilityScore >= 60) readability = 'good';
		else if (readabilityScore >= 40) readability = 'fair';
		else if (readabilityScore >= 20) readability = 'poor';
		else readability = 'very poor';

		// Meta lengths
		const titleLen = post.seo.title.length;
		const descLen = post.seo.description.length;

		// Image alt text
		const images = (content.match(/<img[^>]*>/g) || []).length;
		const altImages = (content.match(/<img[^>]*alt=["'][^"']*["'][^>]*>/g) || []).length;

		// Links
		const internalLinks = (content.match(/<a[^>]*href=["'][^"']*["'][^>]*>/g) || []).length; // simplistic
		const externalLinks = (content.match(/<a[^>]*href=["']https?:\/\/(?!cedarwoodtreeconsultants|oscarstreeacademy)[^"']*["'][^>]*>/g) || []).length;

		// Score calculation (simplified)
		let score = 0;
		if (titleLen >= 30 && titleLen <= 60) score += 20;
		if (descLen >= 50 && descLen <= 160) score += 20;
		if (wordCount >= 300) score += 20;
		if (altImages === images && images > 0) score += 10;
		if (internalLinks >= 2) score += 10;
		if (externalLinks >= 1) score += 10;
		if (readabilityScore >= 60) score += 10;

		// Strengths & weaknesses
		const strengths: string[] = [];
		const weaknesses: string[] = [];
		if (titleLen >= 30 && titleLen <= 60) strengths.push('Title length is optimal');
		else weaknesses.push('Title length is outside recommended range (30‑60 characters)');
		if (descLen >= 50 && descLen <= 160) strengths.push('Description length is optimal');
		else weaknesses.push('Description length is outside recommended range (50‑160 characters)');
		if (wordCount >= 300) strengths.push('Content length is sufficient');
		else weaknesses.push('Content is too short (aim for at least 300 words)');
		if (altImages === images && images > 0) strengths.push('All images have alt text');
		else if (images > 0) weaknesses.push('Some images are missing alt text');
		if (internalLinks >= 2) strengths.push('Good internal linking');
		else weaknesses.push('Add more internal links');
		if (externalLinks >= 1) strengths.push('Includes external references');
		else weaknesses.push('Consider adding external links for credibility');
		if (readabilityScore >= 60) strengths.push('Readability is good');
		else weaknesses.push('Readability could be improved');

		// Recommendations
		const recommendations: string[] = [];
		if (post.seo.keywords.length === 0) recommendations.push('Add target keywords to SEO settings');
		if (wordCount < 500) recommendations.push('Expand content to at least 500 words for better ranking');
		if (images === 0) recommendations.push('Add relevant images to increase engagement');
		if (internalLinks < 3) recommendations.push('Link to at least three other relevant posts');
		if (externalLinks === 0) recommendations.push('Include authoritative external links');

		return {
			score,
			strengths,
			weaknesses,
			recommendations,
			keywordDensity,
			readability,
			metaLength: {
				title: { length: titleLen, optimal: titleLen >= 30 && titleLen <= 60 },
				description: { length: descLen, optimal: descLen >= 50 && descLen <= 160 },
			},
			imageAlt: { present: altImages, total: images },
			internalLinks,
			externalLinks,
		};
	}

	/**
	 * Generate SEO title suggestions.
	 */
	generateTitleSuggestions(post: BlogPost): string[] {
		const base = post.title;
		const keywords = post.seo.keywords;
		const suggestions = [
			`${base} – ${post.brand.name}`,
			`${base}: A Complete Guide`,
			`${base} | ${keywords[0] || 'Expert Insights'}`,
			`Why ${base} Matters for ${post.brand.audience[0] || 'Your Business'}`,
			`${base} – Best Practices & Tips`,
		];
		return suggestions.slice(0, 5);
	}

	/**
	 * Generate SEO description suggestions.
	 */
	generateDescriptionSuggestions(post: BlogPost): string[] {
		const excerpt = post.excerpt || post.content.substring(0, 150);
		const suggestions = [
			`${excerpt}… Read more on ${post.brand.name}.`,
			`Learn about ${post.title} with ${post.brand.name}. ${excerpt}…`,
			`${post.title} explained. ${excerpt}… Discover more.`,
			`${post.brand.name} presents: ${post.title}. ${excerpt}…`,
			`${excerpt}… Explore our guide to ${post.title}.`,
		];
		return suggestions.map(desc => desc.length > 160 ? desc.substring(0, 157) + '…' : desc);
	}

	/**
	 * Suggest keywords based on content.
	 */
	suggestKeywords(content: string, brandKeywords: string[]): string[] {
		const words = content.toLowerCase().split(/\W+/).filter(w => w.length > 3);
		const freq: Record<string, number> = {};
		words.forEach(w => freq[w] = (freq[w] || 0) + 1);
		const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w]) => w);
		return [...new Set([...brandKeywords, ...sorted])].slice(0, 10);
	}

	/**
	 * Strip HTML tags from text.
	 */
	private stripHTML(html: string): string {
		const div = document.createElement('div');
		div.innerHTML = html;
		return div.textContent || div.innerText || '';
	}

	/**
	 * Estimate syllables per word (very rough approximation).
	 */
	private estimateSyllables(text: string): number {
		const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 0);
		let syllables = 0;
		for (const word of words) {
			// Simple rule: each vowel group counts as one syllable
			const vowelGroups = word.match(/[aeiouy]+/g);
			syllables += vowelGroups ? vowelGroups.length : 1;
		}
		return syllables;
	}
}