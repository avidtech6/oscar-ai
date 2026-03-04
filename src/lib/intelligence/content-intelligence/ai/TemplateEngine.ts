/**
 * Template Engine – applies brand‑aware content templates.
 */

import type { BlogPost } from '../types/BlogPost';
import type { BrandProfile } from '../types/BrandProfile';
import type { SEOData } from '../types/SEOData';

export interface ContentTemplate {
	id: string;
	name: string;
	description: string;
	brand: string[]; // brand IDs
	category: string;
	structure: TemplateStructure;
	seoPattern: SEOPattern;
	tone: string;
	imagePlacement: ImagePlacement[];
	callToAction: string;
}

export interface TemplateStructure {
	sections: TemplateSection[];
}

export interface TemplateSection {
	title: string;
	required: boolean;
	contentHint: string;
	allowedBlocks: string[];
}

export interface SEOPattern {
	titleTemplate: string;
	descriptionTemplate: string;
	keywords: string[];
}

export interface ImagePlacement {
	section: string;
	position: 'before' | 'after' | 'inline';
	aspectRatio: string;
	captionHint: string;
}

/**
 * Template Engine – selects and applies templates to blog posts.
 */
export class TemplateEngine {
	private templates: ContentTemplate[] = [];

	constructor() {
		this.loadDefaultTemplates();
	}

	/**
	 * Load default templates for Cedarwood and Tree Academy.
	 */
	private loadDefaultTemplates() {
		this.templates = [
			{
				id: 'case-study',
				name: 'Case Study',
				description: 'Detailed analysis of a project or client engagement.',
				brand: ['cedarwood'],
				category: 'Case Studies',
				structure: {
					sections: [
						{ title: 'Introduction', required: true, contentHint: 'Brief overview of the client and project.', allowedBlocks: ['paragraph', 'heading1'] },
						{ title: 'Challenge', required: true, contentHint: 'Describe the problem the client faced.', allowedBlocks: ['paragraph', 'bulletList'] },
						{ title: 'Solution', required: true, contentHint: 'Explain the approach and methodology.', allowedBlocks: ['paragraph', 'numberedList', 'image'] },
						{ title: 'Results', required: true, contentHint: 'Quantifiable outcomes and client feedback.', allowedBlocks: ['paragraph', 'bulletList', 'quote'] },
						{ title: 'Conclusion', required: true, contentHint: 'Key takeaways and future recommendations.', allowedBlocks: ['paragraph'] },
					],
				},
				seoPattern: {
					titleTemplate: 'Case Study: {topic} – {brand}',
					descriptionTemplate: 'How {brand} solved {topic} for a client. Read the full case study.',
					keywords: ['case study', 'client success', 'project analysis'],
				},
				tone: 'professional',
				imagePlacement: [
					{ section: 'Solution', position: 'inline', aspectRatio: '16:9', captionHint: 'Diagram of the solution' },
					{ section: 'Results', position: 'before', aspectRatio: '4:3', captionHint: 'Before/after comparison' },
				],
				callToAction: 'Contact us for a similar solution.',
			},
			{
				id: 'tree-of-the-week',
				name: 'Tree of the Week',
				description: 'Educational spotlight on a specific tree species.',
				brand: ['cedarwood', 'tree-academy'],
				category: 'Tree Identification',
				structure: {
					sections: [
						{ title: 'Species Name', required: true, contentHint: 'Common and scientific name.', allowedBlocks: ['heading1', 'paragraph'] },
						{ title: 'Identification', required: true, contentHint: 'Key features: leaves, bark, shape.', allowedBlocks: ['bulletList', 'image'] },
						{ title: 'Habitat', required: true, contentHint: 'Where it grows naturally.', allowedBlocks: ['paragraph'] },
						{ title: 'Uses & Significance', required: true, contentHint: 'Cultural, ecological, or economic importance.', allowedBlocks: ['paragraph', 'bulletList'] },
						{ title: 'Fun Fact', required: false, contentHint: 'An interesting trivia about the tree.', allowedBlocks: ['quote', 'paragraph'] },
					],
				},
				seoPattern: {
					titleTemplate: 'Tree of the Week: {species}',
					descriptionTemplate: 'Learn about {species}, its identification, habitat, and significance.',
					keywords: ['tree identification', 'arboriculture', 'species spotlight'],
				},
				tone: 'educational',
				imagePlacement: [
					{ section: 'Identification', position: 'inline', aspectRatio: '1:1', captionHint: 'Close‑up of leaves' },
					{ section: 'Habitat', position: 'after', aspectRatio: '16:9', captionHint: 'Natural habitat' },
				],
				callToAction: 'Share your photos of this tree!',
			},
			{
				id: 'lesson',
				name: 'Tree Academy Lesson',
				description: 'Step‑by‑step educational lesson for students.',
				brand: ['tree-academy'],
				category: 'Lessons',
				structure: {
					sections: [
						{ title: 'Learning Objectives', required: true, contentHint: 'What the student will learn.', allowedBlocks: ['bulletList'] },
						{ title: 'Introduction', required: true, contentHint: 'Engaging hook and context.', allowedBlocks: ['paragraph', 'heading2'] },
						{ title: 'Core Content', required: true, contentHint: 'Detailed explanation with examples.', allowedBlocks: ['paragraph', 'image', 'bulletList', 'numberedList'] },
						{ title: 'Activity', required: true, contentHint: 'Hands‑on exercise for the student.', allowedBlocks: ['paragraph', 'numberedList'] },
						{ title: 'Quiz', required: false, contentHint: 'Multiple‑choice questions to test understanding.', allowedBlocks: ['bulletList'] },
						{ title: 'Further Reading', required: false, contentHint: 'Links to additional resources.', allowedBlocks: ['bulletList'] },
					],
				},
				seoPattern: {
					titleTemplate: 'Lesson: {topic} – Tree Academy',
					descriptionTemplate: 'A free lesson on {topic} for tree enthusiasts of all ages.',
					keywords: ['lesson', 'education', 'tree care', 'learning'],
				},
				tone: 'educational',
				imagePlacement: [
					{ section: 'Core Content', position: 'inline', aspectRatio: '16:9', captionHint: 'Illustration of the concept' },
					{ section: 'Activity', position: 'before', aspectRatio: '4:3', captionHint: 'Step‑by‑step guide' },
				],
				callToAction: 'Download the lesson worksheet.',
			},
		];
	}

	/**
	 * Get templates applicable to a brand.
	 */
	getTemplatesForBrand(brandId: string): ContentTemplate[] {
		return this.templates.filter(t => t.brand.includes(brandId));
	}

	/**
	 * Apply a template to a blog post.
	 */
	applyTemplate(post: BlogPost, templateId: string): BlogPost {
		const template = this.templates.find(t => t.id === templateId);
		if (!template) return post;

		// Generate structured content based on template
		let content = '';
		for (const section of template.structure.sections) {
			content += `<h2>${section.title}</h2>\n`;
			content += `<p>${section.contentHint}</p>\n`;
		}

		// Update SEO
		const seo: SEOData = {
			...post.seo,
			title: template.seoPattern.titleTemplate.replace('{topic}', post.title).replace('{brand}', post.brand.name),
			description: template.seoPattern.descriptionTemplate.replace('{topic}', post.title).replace('{species}', post.title),
			keywords: [...post.seo.keywords, ...template.seoPattern.keywords],
		};

		// Update categories if not already set
		const categories = post.categories.length ? post.categories : [template.category];
		const tags = post.tags.length ? post.tags : [template.tone];

		return {
			...post,
			content,
			seo,
			categories,
			tags,
		};
	}

	/**
	 * Generate a new blog post from a template.
	 */
	generateFromTemplate(templateId: string, brand: BrandProfile, topic: string): BlogPost {
		const template = this.templates.find(t => t.id === templateId);
		if (!template) throw new Error(`Template ${templateId} not found`);

		const now = new Date().toISOString();
		const post: BlogPost = {
			id: `blog_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			title: topic,
			slug: topic.toLowerCase().replace(/\s+/g, '-'),
			author: 'Oscar AI',
			publishedAt: null,
			scheduledFor: null,
			status: 'draft',
			brand,
			content: '',
			excerpt: `An article about ${topic}.`,
			featuredImage: null,
			images: [],
			categories: [template.category],
			tags: [template.tone],
			seo: {
				title: template.seoPattern.titleTemplate.replace('{topic}', topic).replace('{brand}', brand.name),
				description: template.seoPattern.descriptionTemplate.replace('{topic}', topic).replace('{species}', topic),
				keywords: template.seoPattern.keywords,
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

		return this.applyTemplate(post, templateId);
	}
}