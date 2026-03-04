/**
 * SEO Data – metadata for search engine optimisation.
 */

export interface SEOData {
	/** SEO title (max 60 characters) */
	title: string;
	/** SEO description (max 160 characters) */
	description: string;
	/** Keywords (max 10) */
	keywords: string[];
	/** URL slug */
	slug: string;
	/** OpenGraph metadata */
	openGraph: OpenGraphData;
	/** Twitter Card metadata */
	twitterCard: TwitterCardData;
	/** Readability score (0‑100) */
	readabilityScore: number;
	/** Keyword density map */
	keywordDensity: Record<string, number>;
	/** Suggested internal links */
	internalLinks: InternalLink[];
	/** Suggested external links */
	externalLinks: ExternalLink[];
}

export interface OpenGraphData {
	title: string;
	description: string;
	image: string;
}

export interface TwitterCardData {
	title: string;
	description: string;
	image: string;
}

export interface InternalLink {
	text: string;
	url: string;
	anchor?: string;
}

export interface ExternalLink {
	text: string;
	url: string;
	domain: string;
}

/**
 * Create empty SEO data.
 */
export function createEmptySEOData(): SEOData {
	return {
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
	};
}

/**
 * Validate SEO data.
 */
export function validateSEOData(seo: SEOData): { valid: boolean; warnings: string[] } {
	const warnings: string[] = [];
	if (seo.title.length > 60) warnings.push('SEO title exceeds 60 characters');
	if (seo.description.length > 160) warnings.push('SEO description exceeds 160 characters');
	if (seo.keywords.length > 10) warnings.push('More than 10 keywords may dilute SEO');
	if (seo.readabilityScore < 30) warnings.push('Readability score is low (<30)');
	return { valid: warnings.length === 0, warnings };
}