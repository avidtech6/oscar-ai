/**
 * Brand Profile – defines tone, SEO strategy, and publishing targets.
 */

export interface BrandProfile {
	/** Unique identifier */
	id: string;
	/** Display name */
	name: string;
	/** Description */
	description: string;
	/** Primary colour (hex) */
	primaryColor: string;
	/** Logo URL */
	logoUrl: string;
	/** Tone of voice */
	tone: 'professional' | 'educational' | 'friendly' | 'technical' | 'community';
	/** Target audience */
	audience: string[];
	/** Primary social platform */
	primarySocialPlatform: 'linkedin' | 'facebook' | 'twitter' | 'instagram' | 'tiktok';
	/** SEO focus keywords */
	seoFocusKeywords: string[];
	/** WordPress site URL */
	wordpressUrl: string | null;
	/** WordPress OAuth client ID */
	wordpressClientId: string | null;
	/** WordPress OAuth client secret (encrypted) */
	wordpressClientSecret: string | null;
	/** Social media OAuth tokens (encrypted) */
	socialTokens: Record<string, string>;
	/** Content templates enabled */
	enabledTemplates: string[];
	/** Default categories */
	defaultCategories: string[];
	/** Default tags */
	defaultTags: string[];
}

/**
 * Cedarwood Tree Consultants brand profile.
 */
export const cedarwoodBrand: BrandProfile = {
	id: 'cedarwood',
	name: 'Cedarwood Tree Consultants',
	description: 'Professional arboricultural consultancy serving commercial and residential clients.',
	primaryColor: '#2e7d32',
	logoUrl: '/brands/cedarwood-logo.svg',
	tone: 'professional',
	audience: ['Property managers', 'Local authorities', 'Insurance companies', 'Homeowners'],
	primarySocialPlatform: 'linkedin',
	seoFocusKeywords: ['tree surgery', 'arboriculture', 'tree risk assessment', 'tree management', 'tree consultancy'],
	wordpressUrl: 'https://cedarwoodtreeconsultants.co.uk',
	wordpressClientId: null,
	wordpressClientSecret: null,
	socialTokens: {},
	enabledTemplates: ['case-study', 'tree-of-the-week', 'seasonal-advice', 'event-announcement'],
	defaultCategories: ['Tree Care', 'Case Studies', 'Industry News'],
	defaultTags: ['arboriculture', 'tree-safety', 'consultancy'],
};

/**
 * Oscar’s Tree Academy brand profile.
 */
export const treeAcademyBrand: BrandProfile = {
	id: 'tree-academy',
	name: 'Oscar’s Tree Academy',
	description: 'Community‑focused educational platform teaching tree identification, care, and conservation.',
	primaryColor: '#8bc34a',
	logoUrl: '/brands/tree-academy-logo.svg',
	tone: 'educational',
	audience: ['Students', 'Teachers', 'Community groups', 'Volunteers', 'Nature enthusiasts'],
	primarySocialPlatform: 'facebook',
	seoFocusKeywords: ['tree identification', 'tree care', 'community education', 'nature conservation', 'outdoor learning'],
	wordpressUrl: 'https://oscarstreeacademy.org',
	wordpressClientId: null,
	wordpressClientSecret: null,
	socialTokens: {},
	enabledTemplates: ['lesson', 'tree-of-the-week', 'community-update', 'educational-post'],
	defaultCategories: ['Tree Identification', 'Care Guides', 'Community Stories'],
	defaultTags: ['education', 'community', 'conservation'],
};

/**
 * Get brand profile by ID.
 */
export function getBrandProfile(id: string): BrandProfile {
	if (id === 'cedarwood') return cedarwoodBrand;
	if (id === 'tree-academy') return treeAcademyBrand;
	throw new Error(`Unknown brand ID: ${id}`);
}

/**
 * List all available brands.
 */
export function listBrands(): BrandProfile[] {
	return [cedarwoodBrand, treeAcademyBrand];
}