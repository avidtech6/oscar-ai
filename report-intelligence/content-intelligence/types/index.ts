/**
 * Content Intelligence Type Definitions
 * 
 * Core types for Phase 17: Content Intelligence & Blog Post Engine
 */

// ==================== BLOG POST TYPES ====================

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  authorId: string;
  brand: BrandType;
  categories: string[];
  tags: string[];
  featuredImage?: MediaItem;
  images: MediaItem[];
  seoData: SEOData;
  socialData: SocialPostData;
  wordpressData?: WordPressPostData;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  scheduledFor?: Date;
  wordpressId?: string;
  wordpressUrl?: string;
  metadata: Record<string, any>;
}

export interface BlogPostDraft {
  id: string;
  postId?: string;
  title: string;
  content: string;
  version: number;
  authorId: string;
  savedAt: Date;
  changes: string[];
}

export interface BlogPostRevision {
  id: string;
  postId: string;
  title: string;
  content: string;
  version: number;
  authorId: string;
  createdAt: Date;
  changes: string[];
}

// ==================== SOCIAL POST TYPES ====================

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  media: MediaItem[];
  scheduledFor: Date;
  publishedAt?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  postId?: string; // Reference to blog post
  brand: BrandType;
  hashtags: string[];
  metadata: SocialPostMetadata;
  analytics?: SocialPostAnalytics;
}

export type SocialPlatform = 
  | 'linkedin'
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'tiktok'
  | 'pinterest';

export interface SocialPostData {
  platforms: SocialPlatform[];
  contentVariations: Record<SocialPlatform, string>;
  hashtags: string[];
  scheduledTimes: Record<SocialPlatform, Date>;
  crossPosting: boolean;
  analyticsTracking: boolean;
}

export interface SocialPostMetadata {
  characterCount: number;
  hashtagCount: number;
  linkCount: number;
  mediaCount: number;
  platformSpecific: Record<string, any>;
}

export interface SocialPostAnalytics {
  impressions: number;
  engagements: number;
  clicks: number;
  shares: number;
  likes: number;
  comments: number;
  collectedAt: Date;
}

// ==================== SEO TYPES ====================

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  slug: string;
  openGraph: OpenGraphData;
  twitterCard: TwitterCardData;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  internalLinks: InternalLink[];
  externalLinks: ExternalLink[];
  imageAltText: Record<string, string>;
  imageCaptions: Record<string, string>;
  metaRobots: string;
  canonicalUrl?: string;
  schemaMarkup?: Record<string, any>;
}

export interface OpenGraphData {
  title: string;
  description: string;
  image?: string;
  url: string;
  type: 'article' | 'website' | 'blog';
  siteName: string;
  locale: string;
}

export interface TwitterCardData {
  card: 'summary' | 'summary_large_image' | 'player' | 'app';
  title: string;
  description: string;
  image?: string;
  site?: string;
  creator?: string;
}

export interface InternalLink {
  text: string;
  url: string;
  targetPostId?: string;
}

export interface ExternalLink {
  text: string;
  url: string;
  nofollow: boolean;
  sponsored: boolean;
}

// ==================== BRAND TYPES ====================

export type BrandType = 'cedarwood' | 'tree-academy' | 'oscar-ai';

export interface BrandProfile {
  id: BrandType;
  name: string;
  description: string;
  tone: BrandTone;
  seoStrategy: SEOStrategy;
  socialStrategy: SocialStrategy;
  templates: TemplatePreferences;
  wordpressConfig?: WordPressConfig;
  colorScheme: ColorScheme;
  typography: TypographySettings;
  toneGuidelines?: ToneGuidelines;
  brandKeywords?: string[];
  prohibitedTerms?: string[];
  preferredPhrases?: string[];
  exampleContent?: string[];
  metadata?: BrandProfileMetadata;
}

export interface BrandProfileMetadata {
  createdAt: Date;
  updatedAt: Date;
  sampleCount: number;
  consistencyScore: number;
  learningEnabled: boolean;
}

export interface BrandTone {
  formality: 'casual' | 'neutral' | 'formal';
  voice: 'friendly' | 'professional' | 'educational' | 'authoritative';
  humor: 'none' | 'subtle' | 'moderate' | 'high';
  empathy: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
}

// ==================== BRAND TONE MODEL TYPES ====================

export interface BrandToneConfig {
  formalityThreshold: number;
  sentenceLengthThreshold: number;
  vocabularyThreshold: number;
  prohibitedTermThreshold: number;
  consistencyThreshold: number;
  learningEnabled: boolean;
  maxLearningSamples: number;
  eventEmission: boolean;
}

export const DEFAULT_BRAND_TONE_CONFIG: BrandToneConfig = {
  formalityThreshold: 0.6,
  sentenceLengthThreshold: 0.7,
  vocabularyThreshold: 0.65,
  prohibitedTermThreshold: 0.9,
  consistencyThreshold: 0.75,
  learningEnabled: true,
  maxLearningSamples: 1000,
  eventEmission: true,
};

export interface ToneAnalysis {
  brand: BrandType;
  consistencyScore: number;
  formalityScore: number;
  sentenceLengthScore: number;
  vocabularyScore: number;
  keywordAlignment: number;
  deviations: ToneDeviation[];
  suggestions: ToneSuggestion[];
  metadata: ToneAnalysisMetadata;
}

export interface ToneAnalysisMetadata {
  analyzedAt: Date;
  contentLength: number;
  wordCount: number;
  sentenceCount: number;
}

export interface ToneDeviation {
  type: 'formality' | 'sentence-length' | 'vocabulary' | 'prohibited-terms' | 'brand-keywords' | 'tone';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  details?: any;
}

export interface ToneSuggestion {
  type: 'rewrite' | 'adjust' | 'add' | 'remove' | 'replace';
  text: string;
  target: string;
  reason: string;
  confidence: number;
  implementation: string;
}

export interface ContentAnalysis {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  avgSentenceLength: number;
  avgWordLength: number;
  formalityScore: number;
  readabilityScore: number;
  emotionalTone: string;
  technicalDepth: string;
}

export interface BrandConsistencyScore {
  overall: number;
  formality: number;
  vocabulary: number;
  sentenceStructure: number;
  keywordAlignment: number;
  tone: number;
  brandGuidelines: number;
}

export interface BrandLearningData {
  brand: BrandType;
  content: string;
  analysis: ToneAnalysis;
  approved: boolean;
  feedback?: string;
  learnedAt: Date;
  metadata: Record<string, any>;
}

export interface SEOStrategy {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  targetAudience: string[];
  competitorAnalysis: string[];
  contentGaps: string[];
  focusAreas: string[];
}

export interface SocialStrategy {
  primaryPlatforms: SocialPlatform[];
  postingFrequency: Record<SocialPlatform, 'daily' | 'weekly' | 'monthly'>;
  optimalPostingTimes: Record<SocialPlatform, string[]>;
  hashtagStrategy: Record<SocialPlatform, string[]>;
  engagementStrategy: string[];
}

export interface TemplatePreferences {
  preferredStructures: string[];
  imagePlacement: 'top' | 'inline' | 'gallery' | 'mixed';
  callToAction: string;
  lengthPreference: 'short' | 'medium' | 'long';
  sectionTemplates: Record<string, string>;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  fontSizeScale: Record<'h1' | 'h2' | 'h3' | 'h4' | 'p', number>;
  lineHeight: number;
  letterSpacing: number;
}

// ==================== MEDIA & GALLERY TYPES ====================

export interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  altText: string;
  caption: string;
  tags: string[];
  categories: string[];
  brand: BrandType[];
  projects: string[];
  blogPosts: string[];
  reports: string[];
  exifData?: EXIFData;
  aiGeneratedAlt?: string;
  aiGeneratedCaption?: string;
  uploadedAt: Date;
  uploadedBy: string;
  metadata: Record<string, any>;
}

export interface EXIFData {
  cameraMake?: string;
  cameraModel?: string;
  lens?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  focalLength?: string;
  dateTaken?: Date;
  gps?: GPSData;
  orientation?: number;
}

export interface GPSData {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface GalleryFilter {
  tags?: string[];
  categories?: string[];
  brands?: BrandType[];
  projects?: string[];
  mimeTypes?: string[];
  dateRange?: { start: Date; end: Date };
  sizeRange?: { min: number; max: number };
}

// ==================== EDITOR TYPES ====================

export interface EditorBlock {
  id: string;
  type: EditorBlockType;
  content: string;
  attributes: Record<string, any>;
  children?: EditorBlock[];
  metadata: BlockMetadata;
}

export type EditorBlockType = 
  | 'paragraph'
  | 'heading'
  | 'list'
  | 'quote'
  | 'code'
  | 'image'
  | 'video'
  | 'divider'
  | 'table'
  | 'callout'
  | 'button';

export interface BlockMetadata {
  depth: number;
  position: number;
  parentId?: string;
  style: BlockStyle;
  aiGenerated: boolean;
  seoOptimized: boolean;
  accessibility: AccessibilityData;
}

export interface BlockStyle {
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  backgroundColor?: string;
  margin?: string;
  padding?: string;
}

export interface AccessibilityData {
  ariaLabel?: string;
  role?: string;
  tabIndex?: number;
  altText?: string;
  caption?: string;
}

export interface EditorState {
  blocks: EditorBlock[];
  selection: EditorSelection;
  history: EditorHistory;
  metadata: EditorMetadata;
}

export interface EditorSelection {
  startBlockId: string;
  endBlockId: string;
  startOffset: number;
  endOffset: number;
}

export interface EditorHistory {
  past: EditorState[];
  future: EditorState[];
  currentIndex: number;
}

export interface EditorMetadata {
  wordCount: number;
  characterCount: number;
  headingCount: number;
  imageCount: number;
  linkCount: number;
  readabilityScore: number;
  lastSaved: Date;
  autoSaveEnabled: boolean;
}

// ==================== TEMPLATE TYPES ====================

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  brand: BrandType;
  structure: TemplateStructure;
  seoPattern: SEOPattern;
  toneGuidelines: ToneGuidelines;
  imagePlacement: ImagePlacement[];
  callToAction: string;
  metadata: TemplateMetadata;
}

export type TemplateType = 
  | 'case-study'
  | 'tree-of-week'
  | 'educational'
  | 'lesson'
  | 'seasonal'
  | 'event'
  | 'community'
  | 'safety'
  | 'news'
  | 'tutorial';

export interface TemplateStructure {
  sections: TemplateSection[];
  order: string[];
  requiredSections: string[];
  optionalSections: string[];
}

export interface TemplateSection {
  id: string;
  title: string;
  type: EditorBlockType;
  contentHint: string;
  minLength: number;
  maxLength: number;
  required: boolean;
  aiPrompt?: string;
}

export interface SEOPattern {
  titleTemplate: string;
  descriptionTemplate: string;
  keywordSuggestions: string[];
  internalLinkSuggestions: string[];
  externalLinkSuggestions: string[];
  imageAltPattern: string;
}

export interface ToneGuidelines {
  formality: string;
  voice: string;
  pointOfView: 'first' | 'second' | 'third';
  sentenceLength: 'short' | 'medium' | 'long';
  vocabularyLevel: 'basic' | 'intermediate' | 'advanced';
}

export interface ImagePlacement {
  sectionId: string;
  position: 'before' | 'after' | 'inline';
  type: 'featured' | 'supporting' | 'decorative';
  aspectRatio: string;
  minWidth: number;
  maxWidth: number;
}

export interface TemplateMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  usageCount: number;
  successRate: number;
  averageReadTime: number;
}

// ==================== PUBLISHING TYPES ====================

export interface WordPressConfig {
  siteUrl: string;
  apiUrl: string;
  username: string;
  applicationPassword: string;
  categories: WordPressCategory[];
  tags: WordPressTag[];
  featuredImageField: string;
  seoPlugin: 'yoast' | 'rankmath' | 'none';
  customFields: WordPressCustomField[];
  autoPublish: boolean;
  draftOnError: boolean;
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
}

export interface WordPressCustomField {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'array';
}

export interface WordPressPostData {
  postId?: number;
  status: 'draft' | 'publish' | 'future' | 'pending';
  categories: number[];
  tags: number[];
  featuredMediaId?: number;
  customFields: Record<string, any>;
  yoastSeo?: YoastSEOData;
  rankmathSeo?: RankMathSEOData;
}

export interface YoastSEOData {
  title: string;
  description: string;
  focusKeyword: string;
  readabilityScore: number;
  schema: Record<string, any>;
}

export interface RankMathSEOData {
  title: string;
  description: string;
  focusKeyword: string;
  seoScore: number;
  schema: Record<string, any>;
}

export interface PublishingResult {
  success: boolean;
  platform: SocialPlatform | 'wordpress';
  postId?: string;
  url?: string;
  publishedAt?: Date;
  error?: string;
  metadata: Record<string, any>;
}

// ==================== SCHEDULING TYPES ====================

export interface ScheduleItem {
  id: string;
  type: 'blog' | 'social';
  contentId: string;
  scheduledFor: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  platform?: SocialPlatform | 'wordpress';
  retryCount: number;
  maxRetries: number;
  lastAttempt?: Date;
  error?: string;
  metadata: Record<string, any>;
}

export interface ContentCalendar {
  id: string;
  month: number;
  year: number;
  items: CalendarItem[];
  holidays: Holiday[];
  optimalPostingTimes: OptimalTime[];
}

export interface CalendarItem {
  date: Date;
  items: ScheduleItem[];
  blogPosts: BlogPost[];
  socialPosts: SocialPost[];
}

export interface Holiday {
  date: Date;
  name: string;
  type: 'public' | 'religious' | 'cultural' | 'company';
  impact: 'high' | 'medium' | 'low';
}

export interface OptimalTime {
  platform: SocialPlatform;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  engagementScore: number;
  sampleSize: number;
  lastUpdated: Date;
}

// ==================== AI COPILOT TYPES ====================

export interface AICopilotRequest {
  type: CopilotRequestType;
  context: CopilotContext;
  instructions: string;
  constraints: CopilotConstraints;
  brand: BrandType;
  templateId?: string;
}

export type CopilotRequestType = 
  | 'generate'
  | 'rewrite'
  | 'expand'
  | 'summarize'
  | 'translate'
  | 'seo-optimize'
  | 'tone-adjust'
  | 'structure'
  | 'suggest-title'
  | 'suggest-image'
  | 'suggest-hashtags';

export interface CopilotContext {
  currentContent: string;
  selection?: string;
  surroundingBlocks?: EditorBlock[];
  postMetadata?: Partial<BlogPost>;
  seoData?: Partial<SEOData>;
  brandProfile?: Partial<BrandProfile>;
}

export interface CopilotConstraints {
  length: 'short' | 'medium' | 'long';
  tone: string;
  keywords: string[];
  avoid: string[];
  format: 'paragraph' | 'list' | 'heading' | 'bullet';
}

export interface AICopilotResponse {
  success: boolean;
  content: string;
  suggestions: CopilotSuggestion[];
  metadata: CopilotMetadata;
  error?: string;
}

export interface CopilotSuggestion {
  type: 'content' | 'seo' | 'structure' | 'image' | 'link';
  text: string;
  confidence: number;
  action: CopilotAction;
}

export interface CopilotAction {
  type: 'insert' | 'replace' | 'delete' | 'move';
  target: string;
  value: string;
}

export interface CopilotMetadata {
  tokensUsed: number;
  processingTime: number;
  model: string;
  temperature: number;
  brandAdherence: number;
  seoScore: number;
}

// ==================== CONFIGURATION TYPES ====================

export interface ContentIntelligenceConfig {
  editor: EditorConfig;
  ai: AIConfig;
  seo: SEOConfig;
  publishing: PublishingConfig;
  scheduling: SchedulingConfig;
  gallery: GalleryConfig;
  templates: TemplatesConfig;
}

export interface EditorConfig {
  autoSaveInterval: number;
  maxUndoSteps: number;
  spellCheck: boolean;
  grammarCheck: boolean;
  accessibilityCheck: boolean;
  cleanHTML: boolean;
  allowedTags: string[];
  blockedTags: string[];
}

export interface AIConfig {
  enabled: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
  costLimit: number;
  brandProfiles: Record<BrandType, BrandProfile>;
  toneModels: Record<string, any>;
}

export interface SEOConfig {
  enabled: boolean;
  targetReadability: number;
  minKeywordDensity: number;
  maxKeywordDensity: number;
  internalLinkRatio: number;
  externalLinkRatio: number;
  imageAltRequired: boolean;
  schemaMarkup: boolean;
}

export interface PublishingConfig {
  wordpress: WordPressConfig[];
  social: SocialPlatformConfig[];
  autoPublish: boolean;
  errorHandling: 'stop' | 'continue' | 'draft';
  retryAttempts: number;
  retryDelay: number;
}

export interface SocialPlatformConfig {
  platform: SocialPlatform;
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  autoPost: boolean;
  characterLimit: number;
  imageLimit: number;
  hashtagLimit: number;
}

export interface SchedulingConfig {
  enabled: boolean;
  timezone: string;
  optimalTimes: boolean;
  conflictCheck: boolean;
  maxPostsPerDay: number;
  bufferTime: number;
}

export interface GalleryConfig {
  maxFileSize: number;
  allowedTypes: string[];
  autoAltText: boolean;
  autoCaption: boolean;
  maxImagesPerPost: number;
  storagePath: string;
  backupEnabled: boolean;
}

export interface TemplatesConfig {
  enabled: boolean;
  autoApply: boolean;
  suggestionThreshold: number;
  customTemplates: boolean;
  templateLibrary: string[];
}

// ==================== DEFAULT CONFIGURATIONS ====================

export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  autoSaveInterval: 30000, // 30 seconds
  maxUndoSteps: 50,
  spellCheck: true,
  grammarCheck: true,
  accessibilityCheck: true,
  cleanHTML: true,
  allowedTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'img', 'a', 'strong', 'em', 'u', 's', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
  blockedTags: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
};

export const DEFAULT_AI_CONFIG: AIConfig = {
  enabled: true,
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  costLimit: 100,
  brandProfiles: {} as Record<BrandType, BrandProfile>,
  toneModels: {},
};

export const DEFAULT_SEO_CONFIG: SEOConfig = {
  enabled: true,
  targetReadability: 60,
  minKeywordDensity: 0.5,
  maxKeywordDensity: 2.5,
  internalLinkRatio: 0.1,
  externalLinkRatio: 0.05,
  imageAltRequired: true,
  schemaMarkup: true,
};

export const DEFAULT_PUBLISHING_CONFIG: PublishingConfig = {
  wordpress: [],
  social: [],
  autoPublish: false,
  errorHandling: 'draft',
  retryAttempts: 3,
  retryDelay: 5000,
};

export const DEFAULT_SCHEDULING_CONFIG: SchedulingConfig = {
  enabled: true,
  timezone: 'UTC',
  optimalTimes: true,
  conflictCheck: true,
  maxPostsPerDay: 5,
  bufferTime: 300000, // 5 minutes
};

export const DEFAULT_GALLERY_CONFIG: GalleryConfig = {
  maxFileSize: 10485760, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  autoAltText: true,
  autoCaption: true,
  maxImagesPerPost: 10,
  storagePath: './media/gallery',
  backupEnabled: true,
};

export const DEFAULT_TEMPLATES_CONFIG: TemplatesConfig = {
  enabled: true,
  autoApply: false,
  suggestionThreshold: 0.7,
  customTemplates: true,
  templateLibrary: ['case-study', 'tree-of-week', 'educational', 'lesson', 'seasonal', 'event', 'community', 'safety'],
};

export const DEFAULT_CONTENT_INTELLIGENCE_CONFIG: ContentIntelligenceConfig = {
  editor: DEFAULT_EDITOR_CONFIG,
  ai: DEFAULT_AI_CONFIG,
  seo: DEFAULT_SEO_CONFIG,
  publishing: DEFAULT_PUBLISHING_CONFIG,
  scheduling: DEFAULT_SCHEDULING_CONFIG,
  gallery: DEFAULT_GALLERY_CONFIG,
  templates: DEFAULT_TEMPLATES_CONFIG,
};

// ==================== UTILITY TYPES ====================

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type Nullable<T> = T | null | undefined;

export type AsyncResult<T, E = Error> = Promise<{ success: true; data: T } | { success: false; error: E }>;

// ==================== EVENT TYPES ====================

export interface ContentIntelligenceEvent {
  type: ContentEventType;
  data: any;
  timestamp: Date;
  userId?: string;
  postId?: string;
  brand?: BrandType;
}

export type ContentEventType =
  | 'editor:created'
  | 'editor:updated'
  | 'editor:saved'
  | 'editor:published'
  | 'ai:assisted'
  | 'seo:analyzed'
  | 'seo:optimized'
  | 'publishing:scheduled'
  | 'publishing:started'
  | 'publishing:completed'
  | 'publishing:failed'
  | 'social:scheduled'
  | 'social:published'
  | 'gallery:uploaded'
  | 'gallery:tagged'
  | 'template:applied'
  | 'calendar:updated'
  | 'brand:switched'
  | 'error:occurred';

// ==================== EXPORT ALL ====================

// Note: Individual type files can be created later for better organization
// For now, all types are exported from this single file