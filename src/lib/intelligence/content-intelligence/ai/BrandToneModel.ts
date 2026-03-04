/**
 * Brand Tone Model – manages tone switching between Cedarwood and Tree Academy.
 */

import type { BrandProfile } from '../types/BrandProfile';

export type Tone = 'professional' | 'educational' | 'friendly' | 'technical' | 'community';

export interface ToneProfile {
	tone: Tone;
	vocabulary: string[];
	sentenceLength: 'short' | 'medium' | 'long';
	formality: 'casual' | 'neutral' | 'formal';
	punctuation: 'minimal' | 'standard' | 'expressive';
	emojiUsage: 'none' | 'light' | 'moderate';
}

/**
 * Brand Tone Model – provides tone‑aware text transformations.
 */
export class BrandToneModel {
	private brand: BrandProfile;

	constructor(brand: BrandProfile) {
		this.brand = brand;
	}

	/**
	 * Get the tone profile for the current brand.
	 */
	getToneProfile(): ToneProfile {
		const base: Record<Tone, ToneProfile> = {
			professional: {
				tone: 'professional',
				vocabulary: ['ensure', 'implement', 'optimise', 'leverage', 'strategic'],
				sentenceLength: 'medium',
				formality: 'formal',
				punctuation: 'standard',
				emojiUsage: 'none',
			},
			educational: {
				tone: 'educational',
				vocabulary: ['learn', 'discover', 'explore', 'understand', 'guide'],
				sentenceLength: 'medium',
				formality: 'neutral',
				punctuation: 'standard',
				emojiUsage: 'light',
			},
			friendly: {
				tone: 'friendly',
				vocabulary: ['hello', 'great', 'awesome', 'share', 'community'],
				sentenceLength: 'short',
				formality: 'casual',
				punctuation: 'expressive',
				emojiUsage: 'moderate',
			},
			technical: {
				tone: 'technical',
				vocabulary: ['algorithm', 'parameter', 'syntax', 'implementation', 'optimisation'],
				sentenceLength: 'long',
				formality: 'formal',
				punctuation: 'standard',
				emojiUsage: 'none',
			},
			community: {
				tone: 'community',
				vocabulary: ['together', 'support', 'volunteer', 'connect', 'engage'],
				sentenceLength: 'short',
				formality: 'casual',
				punctuation: 'expressive',
				emojiUsage: 'light',
			},
		};
		return base[this.brand.tone];
	}

	/**
	 * Adjust a piece of text to match the brand's tone.
	 */
	adjustText(text: string): string {
		const profile = this.getToneProfile();
		// Simple placeholder transformation
		let adjusted = text;
		if (profile.formality === 'formal') {
			adjusted = adjusted.replace(/\b(can't|don't|won't)\b/g, match => ({
				"can't": 'cannot',
				"don't": 'do not',
				"won't": 'will not',
			}[match] || match));
			adjusted = adjusted.replace(/\b(get|got)\b/g, 'obtain');
		} else if (profile.formality === 'casual') {
			adjusted = adjusted.replace(/\b(cannot|do not|will not)\b/g, match => ({
				'cannot': "can't",
				'do not': "don't",
				'will not': "won't",
			}[match] || match));
			adjusted = adjusted.replace(/\b(obtain)\b/g, 'get');
		}
		if (profile.sentenceLength === 'short') {
			// Split long sentences
			adjusted = adjusted.replace(/\.\s+/g, '.\n');
		}
		if (profile.emojiUsage === 'light') {
			// Add a smiley at the end of paragraphs
			adjusted = adjusted.replace(/\n\n/g, ' 🙂\n\n');
		} else if (profile.emojiUsage === 'moderate') {
			adjusted = adjusted.replace(/\n/g, ' ✨\n');
		}
		return adjusted;
	}

	/**
	 * Generate a headline in the brand's tone.
	 */
	generateHeadline(topic: string): string {
		const profile = this.getToneProfile();
		const templates: Record<Tone, string[]> = {
			professional: [
				`Strategic Insights: ${topic}`,
				`Optimising ${topic} for Maximum Impact`,
				`A Professional Guide to ${topic}`,
			],
			educational: [
				`Learn About ${topic}`,
				`${topic}: A Beginner's Guide`,
				`Discover the World of ${topic}`,
			],
			friendly: [
				`Hey! Let's Talk About ${topic}`,
				`${topic} Made Easy & Fun`,
				`Our Favorite Things About ${topic}`,
			],
			technical: [
				`Technical Deep Dive: ${topic}`,
				`${topic} – Implementation & Best Practices`,
				`Advanced ${topic} Methodology`,
			],
			community: [
				`${topic} – Bringing Our Community Together`,
				`Share Your ${topic} Stories`,
				`Community Spotlight: ${topic}`,
			],
		};
		const options = templates[profile.tone];
		return options[Math.floor(Math.random() * options.length)];
	}

	/**
	 * Generate a call‑to‑action in the brand's tone.
	 */
	generateCTA(action: string): string {
		const profile = this.getToneProfile();
		const ctas: Record<Tone, string[]> = {
			professional: [
				`Contact our team to ${action}.`,
				`Schedule a consultation to ${action}.`,
				`Download our whitepaper on ${action}.`,
			],
			educational: [
				`Start learning how to ${action} today.`,
				`Enrol in our course to ${action}.`,
				`Explore our resources on ${action}.`,
			],
			friendly: [
				`Ready to ${action}? Let's go!`,
				`Join us and ${action} together.`,
				`Get started with ${action} – it's easy!`,
			],
			technical: [
				`Implement ${action} with our detailed documentation.`,
				`Review the technical specifications for ${action}.`,
				`Access the source code to ${action}.`,
			],
			community: [
				`Share your ${action} experience with the community.`,
				`Volunteer to help others ${action}.`,
				`Connect with peers who ${action}.`,
			],
		};
		const options = ctas[profile.tone];
		return options[Math.floor(Math.random() * options.length)];
	}
}