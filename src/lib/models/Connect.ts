/**
 * Module 9: Connect Data Models
 * 
 * This module handles communications + publishing layer for conversations, campaigns,
 * emails, social posts, blog + SEO, landing pages + funnels, audience + segments,
 * automations, and analytics. Everything uses the same card + cockpit architecture
 * as Files/Workspace/Projects.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// 9.1 Core Connect Types & Categories
// ============================================================================

/**
 * Connect Item Type - The type of connect item
 */
export type ConnectItemType = 'conversation' | 'campaign' | 'email' | 'social-post' | 'blog-post' | 'seo-metadata' | 'landing-page' | 'funnel-step' | 'automation' | 'audience-segment' | 'contact' | 'shared-content';

/**
 * Connect Channel - Channel for communication
 */
export type ConnectChannel = 'email' | 'facebook' | 'instagram' | 'linkedin' | 'x' | 'tiktok' | 'youtube' | 'whatsapp' | 'sms' | 'push' | 'web' | 'api';

/**
 * Connect Status - Status of a connect item
 */
export type ConnectStatus = 'draft' | 'scheduled' | 'sent' | 'published' | 'active' | 'paused' | 'completed' | 'archived' | 'failed';

/**
 * Connect Priority - Priority level
 */
export type ConnectPriority = 'low' | 'normal' | 'high' | 'urgent';

// ============================================================================
// 9.2 Inline Content Types (for messages)
// ============================================================================

/**
 * Inline Gallery - Gallery embedded in a message
 */
export interface InlineGallery {
  id: string;
  messageId: string;
  fileIds: string[];
  layout: 'grid' | 'carousel' | 'stack';
  title?: string;
  createdAt: Date;
}

/**
 * Inline Task - Task embedded in a message
 */
export interface InlineTask {
  id: string;
  messageId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
}

/**
 * Inline Summary - Summary embedded in a message
 */
export interface InlineSummary {
  id: string;
  messageId: string;
  content: string;
  keyPoints: string[];
  createdAt: Date;
}

// ============================================================================
// 9.3 Conversation & Thread Management
// ============================================================================

/**
 * Conversation - A conversation thread
 */
export interface Conversation {
  id: string;
  userId: string;
  
  // Core Identity
  title: string;
  type: ConnectItemType;
  status: ConnectStatus;
  priority: ConnectPriority;
  
  // Participants
  participantIds: string[]; // contact IDs
  participantNames: string[];
  participantEmails: string[];
  
  // Content
  lastMessage?: string;
  lastMessageTime: Date;
  unreadCount: number;
  totalMessages: number;
  
  // Channel
  channel: ConnectChannel;
  channelSpecificId?: string; // e.g., email thread ID, social thread ID
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Cross-domain links
  linkedWorkspaceItemIds: string[];
  linkedFileIds: string[];
  linkedMapPinIds: string[];
  linkedContactIds: string[];
  linkedCompanyIds: string[];
  linkedCampaignIds: string[];
  
  // Metadata
  tags: string[];
  labels: string[];
  categories: string[];
  
  // Settings
  isMuted: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isStarred: boolean;
  
  // Analytics
  engagementScore: number;
  lastEngagement: Date;
  responseRate?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

/**
 * Message - A message in a conversation
 */
export interface Message {
  id: string;
  conversationId: string;
  userId: string;
  
  // Content
  content: string;
  contentType: 'text' | 'html' | 'markdown' | 'rich';
  attachments: MessageAttachment[];
  
  // Sender/Recipient
  senderId: string;
  senderName: string;
  senderEmail?: string;
  recipientIds: string[];
  recipientNames: string[];
  
  // Status
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  readBy: string[]; // user IDs who read it
  readAt?: Date;
  
  // Channel
  channel: ConnectChannel;
  channelMessageId?: string;
  
  // Inline Content
  inlineGalleries: InlineGallery[];
  inlineTasks: InlineTask[];
  inlineSummaries: InlineSummary[];
  
  // Metadata
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  
  // Reactions
  reactions: MessageReaction[];
  
  // Timestamps
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message Attachment - Attachment in a message
 */
export interface MessageAttachment {
  id: string;
  messageId: string;
  
  // File Details
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  
  // Metadata
  description?: string;
  isInline: boolean;
  contentId?: string; // for inline attachments
  
  createdAt: Date;
}

/**
 * Message Reaction - Reaction to a message
 */
export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  
  // Reaction
  emoji: string;
  skinTone?: number;
  
  createdAt: Date;
}

// ============================================================================
// 9.4 Campaign Management
// ============================================================================

/**
 * Campaign - A multi-step campaign
 */
export interface Campaign {
  id: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: ConnectItemType;
  status: ConnectStatus;
  
  // Timeline
  startDate?: Date;
  endDate?: Date;
  schedule: CampaignSchedule[];
  
  // Content
  campaignItems: CampaignItem[];
  sequenceOrder: string[]; // campaign item IDs in order
  
  // Audience
  audienceSegmentIds: string[];
  targetAudienceSize?: number;
  
  // Goals
  goalType: 'awareness' | 'engagement' | 'conversion' | 'retention' | 'revenue';
  goalValue?: number;
  goalMetric?: string;
  
  // Budget
  budget?: number;
  budgetCurrency: string;
  spent?: number;
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Cross-domain links
  linkedWorkspaceItemIds: string[];
  linkedFileIds: string[];
  linkedMapPinIds: string[];
  linkedContactIds: string[];
  linkedCompanyIds: string[];
  
  // Analytics
  performance: CampaignPerformance;
  
  // Metadata
  tags: string[];
  categories: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedAt: Date;
}

/**
 * Campaign Schedule - Schedule for campaign items
 */
export interface CampaignSchedule {
  id: string;
  campaignId: string;
  campaignItemId: string;
  
  // Timing
  scheduledFor: Date;
  executedAt?: Date;
  
  // Conditions
  triggerType: 'time' | 'event' | 'condition' | 'manual';
  triggerConditions?: Record<string, any>;
  
  // Status
  status: 'pending' | 'scheduled' | 'executing' | 'completed' | 'failed' | 'skipped';
  error?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Campaign Item - An item in a campaign (email, social post, etc.)
 */
export interface CampaignItem {
  id: string;
  campaignId: string;
  
  // Core Identity
  name: string;
  type: ConnectItemType;
  status: ConnectStatus;
  
  // Content
  contentId: string; // reference to Email, SocialPost, etc.
  contentType: 'email' | 'social-post' | 'blog-post' | 'landing-page' | 'automation';
  
  // Timing
  delayAfterPrevious?: number; // in hours
  delayType: 'hours' | 'days' | 'weeks' | 'months';
  
  // Conditions
  conditions?: Record<string, any>;
  
  // Metadata
  order: number;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Campaign Performance - Performance metrics for a campaign
 */
export interface CampaignPerformance {
  campaignId: string;
  
  // Delivery
  sent: number;
  delivered: number;
  failed: number;
  
  // Engagement
  opened: number;
  clicked: number;
  replied: number;
  shared: number;
  liked: number;
  commented: number;
  
  // Conversion
  converted: number;
  revenue: number;
  roi?: number;
  
  // Rates
  openRate: number;
  clickRate: number;
  conversionRate: number;
  
  // Timestamps
  lastUpdated: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 9.5 Email Management
// ============================================================================

/**
 * Email - An email message
 */
export interface Email {
  id: string;
  userId: string;
  
  // Core Identity
  subject: string;
  previewText?: string;
  type: ConnectItemType;
  status: ConnectStatus;
  
  // Content
  body: string;
  bodyType: 'html' | 'markdown' | 'text' | 'rich';
  templateId?: string;
  
  // Sender/Recipient
  fromName: string;
  fromEmail: string;
  to: EmailRecipient[];
  cc: EmailRecipient[];
  bcc: EmailRecipient[];
  replyTo?: string;
  
  // Delivery
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  
  // Campaign
  campaignId?: string;
  campaignItemId?: string;
  
  // A/B Testing
  isAbTest: boolean;
  abTestVariantId?: string;
  abTestWinnerId?: string;
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Analytics
  analytics: EmailAnalytics;
  
  // Metadata
  tags: string[];
  categories: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email Recipient - Recipient of an email
 */
export interface EmailRecipient {
  id: string;
  emailId: string;
  
  // Recipient Details
  name?: string;
  email: string;
  type: 'to' | 'cc' | 'bcc';
  
  // Status
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
  statusUpdatedAt?: Date;
  
  // Engagement
  openedAt?: Date;
  clickedAt?: Date;
  clickedLinks: string[];
  
  createdAt: Date;
}

/**
 * Email Analytics - Analytics for an email
 */
export interface EmailAnalytics {
  emailId: string;
  
  // Delivery
  sent: number;
  delivered: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  
  // Engagement
  opened: number;
  uniqueOpens: number;
  clicked: number;
  uniqueClicks: number;
  replied: number;
  forwarded: number;
  
  // Rates
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  unsubscribeRate: number;
  
  // Device/Client
  devices: Record<string, number>;
  clients: Record<string, number>;
  
  // Geography
  countries: Record<string, number>;
  
  // Timestamps
  lastUpdated: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 9.6 Social Publishing
// ============================================================================

/**
 * Social Post - A social media post
 */
export interface SocialPost {
  id: string;
  userId: string;
  
  // Core Identity
  content: string;
  type: ConnectItemType;
  status: ConnectStatus;
  
  // Platform
  platform: ConnectChannel;
  platformSpecificId?: string;
  
  // Content
  mediaUrls: string[];
  link?: string;
  hashtags: string[];
  mentions: string[];
  
  // Scheduling
  scheduledFor?: Date;
  publishedAt?: Date;
  
  // Campaign
  campaignId?: string;
  campaignItemId?: string;
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Analytics
  analytics: SocialAnalytics;
  
  // Metadata
  tags: string[];
  categories: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Social Analytics - Analytics for a social post
 */
export interface SocialAnalytics {
  socialPostId: string;
  
  // Engagement
  impressions: number;
  reach: number;
  engagements: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  
  // Audience
  audienceDemographics: Record<string, any>;
  
  // Sentiment
  sentimentScore?: number;
  positiveReactions: number;
  negativeReactions: number;
  neutralReactions: number;
  
  // Timestamps
  lastUpdated: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 9.7 Blog & SEO
// ============================================================================

/**
 * Blog Post - A blog post
 */
export interface BlogPost {
  id: string;
  userId: string;
  
  // Core Identity
  title: string;
  slug: string;
  type: ConnectItemType;
  status: ConnectStatus;
  
  // Content
  content: string;
  excerpt?: string;
  featuredImage?: string;
  
  // SEO
  seoMetadata: SEOMetadata;
  
  // Publishing
  publishedAt?: Date;
  updatedAt?: Date;
  
  // Campaign
  campaignId?: string;
  campaignItemId?: string;
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Analytics
  analytics: BlogAnalytics;
  
  // Metadata
  tags: string[];
  categories: string[];
  author: string;
  
  // Timestamps
  createdAt: Date;
}

/**
 * SEO Metadata - SEO metadata for content
 */
export interface SEOMetadata {
  id: string;
  contentId: string;
  contentType: 'blog-post' | 'landing-page' | 'page';
  
  // Basic
  title: string;
  description: string;
  keywords: string[];
  
  // Advanced
  canonicalUrl?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  
  // Schema
  schemaMarkup?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Blog Analytics - Analytics for a blog post
 */
export interface BlogAnalytics {
  blogPostId: string;
  
  // Traffic
  pageviews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  
  // Sources
  trafficSources: Record<string, number>;
  
  // Engagement
  comments: number;
  shares: number;
  backlinks: number;
  
  // SEO
  keywordRankings: KeywordRanking[];
  
  // Timestamps
  lastUpdated: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Keyword Ranking - Ranking for a keyword
 */
export interface KeywordRanking {
  id: string;
  blogPostId: string;
  
  // Keyword
  keyword: string;
  position: number;
  searchVolume?: number;
  difficulty?: number;
  
  // Changes
  previousPosition?: number;
  change: number;
  
  // Timestamps
  checkedAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 9.8 Landing Pages & Funnels
// ============================================================================

/**
 * Landing Page - A landing page
 */
export interface LandingPage {
  id: string;
  userId: string;
  
  // Core Identity
  name: string;
  slug: string;
  type: ConnectItemType;
  status: ConnectStatus;
  
  // Content
  content: string; // HTML or structured content
  templateId?: string;
  
  // Forms
  formIds: string[];
  
  // CTAs
  ctaIds: string[];
  
  // A/B Testing
  isAbTest: boolean;
  abTestVariantId?: string;
  abTestWinnerId?: string;
  
  // Funnel
  funnelId?: string;
  funnelStep?: number;
  
  // Campaign
  campaignId?: string;
  campaignItemId?: string;
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Analytics
  analytics: LandingPageAnalytics;
  
  // Metadata
  tags: string[];
  categories: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Landing Page Analytics - Analytics for a landing page
 */
export interface LandingPageAnalytics {
  landingPageId: string;
  
  // Traffic
  visits: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  
  // Conversion
  conversions: number;
  conversionRate: number;
  revenue: number;
  
  // Form Submissions
  formSubmissions: number;
  
  // Sources
  trafficSources: Record<string, number>;
  
  // Device
  devices: Record<string, number>;
  
  // Geography
  countries: Record<string, number>;
  
  // Timestamps
  lastUpdated: Date;
  
  createdAt: Date;
  updatedAt: Date;
}// ============================================================================
// 9.9 Funnel Management
// ============================================================================

/**
 * Funnel - A conversion funnel
 */
export interface Funnel {
  id: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: ConnectItemType;
  status: ConnectStatus;
  
  // Steps
  steps: FunnelStep[];
  
  // Goals
  goalType: 'lead' | 'sale' | 'signup' | 'download' | 'other';
  goalValue?: number;
  goalMetric?: string;
  
  // Analytics
  analytics: FunnelAnalytics;
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Cross-domain links
  linkedWorkspaceItemIds: string[];
  linkedFileIds: string[];
  linkedMapPinIds: string[];
  linkedContactIds: string[];
  linkedCompanyIds: string[];
  linkedCampaignIds: string[];
  
  // Metadata
  tags: string[];
  categories: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Funnel Step - A step in a funnel
 */
export interface FunnelStep {
  id: string;
  funnelId: string;
  
  // Step Details
  name: string;
  description?: string;
  order: number;
  
  // Content
  landingPageId?: string;
  emailId?: string;
  socialPostId?: string;
  
  // Triggers
  triggerType: 'time' | 'event' | 'condition' | 'manual';
  triggerConditions?: Record<string, any>;
  
  // Metrics
  entryCount: number;
  exitCount: number;
  conversionCount: number;
  conversionRate: number;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Funnel Analytics - Analytics for a funnel
 */
export interface FunnelAnalytics {
  funnelId: string;
  
  // Traffic
  totalVisitors: number;
  uniqueVisitors: number;
  
  // Conversion
  totalConversions: number;
  conversionRate: number;
  revenue: number;
  
  // Step Performance
  stepPerformance: StepPerformance[];
  
  // Timestamps
  lastUpdated: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Step Performance - Performance metrics for a funnel step
 */
export interface StepPerformance {
  stepId: string;
  visitors: number;
  conversions: number;
  dropOffRate: number;
  avgTimeInStep: number;
}

// ============================================================================
// 9.10 Audience & Segments
// ============================================================================

/**
 * Audience Segment - A segment of contacts
 */
export interface AudienceSegment {
  id: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: ConnectItemType;
  status: ConnectStatus;
  
  // Rules
  rules: SegmentRule[];
  ruleType: 'static' | 'dynamic';
  
  // Contacts
  contactIds: string[];
  contactCount: number;
  
  // Usage
  usedInCampaignIds: string[];
  usedInAutomationIds: string[];
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Metadata
  tags: string[];
  categories: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastUpdated: Date;
}

/**
 * Segment Rule - A rule for segment membership
 */
export interface SegmentRule {
  id: string;
  segmentId: string;
  
  // Rule Details
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'starts-with' | 'ends-with' | 'greater-than' | 'less-than' | 'between' | 'in' | 'not-in';
  value: any;
  valueType: 'string' | 'number' | 'date' | 'boolean' | 'array';
  
  // Logic
  logicalOperator: 'and' | 'or';
  groupId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Contact - A contact/person
 */
export interface Contact {
  id: string;
  userId: string;
  
  // Core Identity
  firstName?: string;
  lastName?: string;
  fullName: string;
  email?: string;
  phone?: string;
  
  // Demographics
  company?: string;
  title?: string;
  location?: string;
  timezone?: string;
  language?: string;
  
  // Status
  status: 'active' | 'inactive' | 'unsubscribed' | 'bounced' | 'complained';
  source?: string;
  subscribedAt?: Date;
  unsubscribedAt?: Date;
  
  // Segments
  segmentIds: string[];
  tagIds: string[];
  
  // Engagement
  engagementScore: number;
  lastEngagement: Date;
  totalEngagements: number;
  
  // Campaign History
  campaignHistory: CampaignHistory[];
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Cross-domain links
  linkedWorkspaceItemIds: string[];
  linkedFileIds: string[];
  linkedMapPinIds: string[];
  linkedCompanyIds: string[];
  
  // Metadata
  customFields: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastContacted: Date;
}

/**
 * Campaign History - History of a contact's campaign interactions
 */
export interface CampaignHistory {
  id: string;
  contactId: string;
  campaignId: string;
  
  // Interaction
  interactionType: 'sent' | 'opened' | 'clicked' | 'replied' | 'converted' | 'unsubscribed' | 'bounced' | 'complained';
  interactionDetails?: Record<string, any>;
  
  // Timestamps
  interactedAt: Date;
  
  createdAt: Date;
}

// ============================================================================
// 9.11 Automations
// ============================================================================

/**
 * Automation - An automation workflow
 */
export interface Automation {
  id: string;
  userId: string;
  
  // Core Identity
  name: string;
  description?: string;
  type: ConnectItemType;
  status: ConnectStatus;
  
  // Trigger
  trigger: AutomationTrigger;
  
  // Conditions
  conditions: AutomationCondition[];
  
  // Actions
  actions: AutomationAction[];
  
  // Settings
  isActive: boolean;
  runLimit?: number;
  runCount: number;
  
  // Card Identity
  cardImageIds: string[];
  photostripLayoutId?: string;
  cardIdentityConfigurationId?: string;
  
  // Cross-domain links
  linkedWorkspaceItemIds: string[];
  linkedFileIds: string[];
  linkedMapPinIds: string[];
  linkedContactIds: string[];
  linkedCompanyIds: string[];
  linkedCampaignIds: string[];
  
  // Metadata
  tags: string[];
  categories: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  nextRunAt?: Date;
}

/**
 * Automation Trigger - Trigger for an automation
 */
export interface AutomationTrigger {
  id: string;
  automationId: string;
  
  // Trigger Details
  type: 'event' | 'schedule' | 'webhook' | 'api' | 'manual';
  eventType?: string;
  schedule?: string; // cron expression
  webhookUrl?: string;
  
  // Configuration
  configuration: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Automation Condition - Condition for an automation
 */
export interface AutomationCondition {
  id: string;
  automationId: string;
  
  // Condition Details
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'greater-than' | 'less-than' | 'between' | 'in' | 'not-in' | 'exists' | 'not-exists';
  value: any;
  valueType: 'string' | 'number' | 'date' | 'boolean' | 'array';
  
  // Logic
  logicalOperator: 'and' | 'or';
  groupId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Automation Action - Action for an automation
 */
export interface AutomationAction {
  id: string;
  automationId: string;
  
  // Action Details
  type: 'send-email' | 'add-to-segment' | 'remove-from-segment' | 'update-contact' | 'create-task' | 'send-notification' | 'webhook' | 'delay' | 'condition' | 'branch';
  order: number;
  
  // Configuration
  configuration: Record<string, any>;
  
  // Target
  targetType: 'contact' | 'segment' | 'campaign' | 'workspace' | 'file' | 'map';
  targetId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Automation Log - Log entry for an automation run
 */
export interface AutomationLog {
  id: string;
  automationId: string;
  
  // Run Details
  runId: string;
  status: 'success' | 'failed' | 'partial' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in milliseconds
  
  // Trigger
  triggerType: string;
  triggerDetails?: Record<string, any>;
  
  // Results
  actionsExecuted: number;
  actionsFailed: number;
  contactsProcessed: number;
  
  // Errors
  errors: string[];
  
  createdAt: Date;
}

// ============================================================================
// 9.12 Card Identity System (Shared with Files/Workspace)
// ============================================================================

/**
 * Connect Card Image - Image for connect card front/back
 */
export interface ConnectCardImage {
  id: string;
  connectItemId: string;
  connectItemType: ConnectItemType;
  
  // Image Details
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  caption?: string;
  
  // Display Configuration
  fitMode: 'fill' | 'contain' | 'cover' | 'fit-width' | 'fit-height' | 'smart-crop' | 'center' | 'tile';
  showOnFront: boolean;
  showOnBack: boolean;
  
  // Ordering
  order: number;
  
  // Source
  sourceType: 'file' | 'preview' | 'thumbnail' | 'custom';
  sourceFileId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Connect Photostrip Layout - Layout configuration for multiple images
 */
export interface ConnectPhotostripLayout {
  id: string;
  connectItemId: string;
  connectItemType: ConnectItemType;
  
  // Layout Type
  layoutType: 'single' | 'strip' | 'grid-2x2' | 'collage' | 'carousel' | 'mixed';
  
  // Configuration
  columns: number;
  rows: number;
  gap: number; // in pixels
  aspectRatio?: string; // e.g., "16:9"
  
  // Behaviour
  autoAdvance: boolean;
  advanceInterval?: number; // in milliseconds
  showControls: boolean;
  loop: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Connect Card Identity Configuration - How the connect card appears
 */
export interface ConnectCardIdentityConfiguration {
  id: string;
  connectItemId: string;
  connectItemType: ConnectItemType;
  
  // Card Appearance
  cornerRadius: number; // in pixels
  cardHeight: 'compact' | 'normal' | 'expanded';
  density: 'compact' | 'normal' | 'comfortable';
  
  // Image Configuration
  photostripLayoutId?: string;
  defaultFitMode: 'fill' | 'contain' | 'cover' | 'fit-width' | 'fit-height' | 'smart-crop' | 'center' | 'tile';
  
  // Metadata Display
  showNameOnFront: boolean;
  showTypeOnFront: boolean;
  showStatusOnFront: boolean;
  showDateOnFront: boolean;
  showTagsOnFront: boolean;
  
  // Field Ordering
  frontFieldOrder: string[]; // e.g., ['name', 'type', 'status', 'date', 'tags']
  
  // Template
  cardFrontTemplate?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 9.13 Gallery Views & Display Modes
// ============================================================================

/**
 * Connect Gallery View Mode - How connect items are displayed
 */
export type ConnectGalleryViewMode = 'full-card' | 'minimal-card' | 'image-only' | 'compact-list' | 'data-first-list';

/**
 * Connect Gallery Display Configuration - Configuration for gallery display
 */
export interface ConnectGalleryDisplayConfiguration {
  id: string;
  userId: string;
  
  // View Settings
  viewMode: ConnectGalleryViewMode;
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'status' | 'type' | 'priority';
  sortDirection: 'asc' | 'desc';
  grouping: 'none' | 'type' | 'status' | 'channel' | 'campaign' | 'segment' | 'date';
  
  // Filtering
  filterByType?: ConnectItemType[];
  filterByStatus?: ConnectStatus[];
  filterByChannel?: ConnectChannel[];
  filterByCampaign?: string[];
  filterBySegment?: string[];
  
  // Display
  showArchived: boolean;
  showDrafts: boolean;
  itemsPerPage: number;
  
  // Grid Settings
  gridColumns: number;
  gridGap: number; // in pixels
  cardAspectRatio?: string; // e.g., "4:3"
  
  // Context
  contextPill: 'connect' | 'workspace' | 'files' | 'map' | 'project';
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 9.14 Context Pills & Navigation
// ============================================================================

/**
 * Connect Context Pill - A context for viewing connect items
 */
export interface ConnectContextPill {
  id: string;
  userId: string;
  
  // Pill Details
  name: string;
  icon: string;
  color: string;
  
  // Context
  domain: 'connect' | 'workspace' | 'files' | 'map' | 'project';
  filter?: Record<string, any>;
  
  // Order
  order: number;
  isDefault: boolean;
  isVisible: boolean;
  
  // Metadata
  itemCount: number;
  lastAccessed: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Connect Navigation Rail - Navigation rail configuration for connect
 */
export interface ConnectNavigationRail {
  id: string;
  userId: string;
  
  // Rail Configuration
  isVisible: boolean;
  width: number; // in pixels
  position: 'left' | 'right';
  
  // Content
  showSiblings: boolean;
  showRelated: boolean;
  showConversations: boolean;
  showCampaigns: boolean;
  showSegments: boolean;
  
  // Grouping
  siblingGrouping: 'none' | 'type' | 'status' | 'channel' | 'campaign' | 'segment' | 'date';
  
  // Context
  activeContextPillId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 9.15 Preview/Editor States
// ============================================================================

/**
 * Connect Preview State - State of the connect preview
 */
export type ConnectPreviewState = 'collapsed' | 'normal' | 'full-page' | 'full-screen';

/**
 * Connect Preview Configuration - Configuration for connect preview
 */
export interface ConnectPreviewConfiguration {
  id: string;
  userId: string;
  
  // Preview Settings
  defaultState: ConnectPreviewState;
  autoPlayMedia: boolean;
  autoAdvanceSlides: boolean;
  showControls: boolean;
  
  // Editor Settings
  editorEnabled: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  
  // Email Settings
  emailPreviewMode: 'desktop' | 'mobile' | 'plain';
  showEmailHeaders: boolean;
  
  // Social Settings
  socialPreviewPlatforms: ConnectChannel[];
  
  // Blog Settings
  blogPreviewMode: 'desktop' | 'mobile' | 'print';
  showTableOfContents: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 9.16 Interactive Media & Embedded Content
// ============================================================================

/**
 * Connect Embedded Media - Media embedded in connect content
 */
export interface ConnectEmbeddedMedia {
  id: string;
  connectItemId: string;
  connectItemType: ConnectItemType;
  
  // Media Details
  type: 'image' | 'video' | 'audio' | 'document' | 'map' | 'code' | 'gallery' | 'form' | 'cta';
  url: string;
  thumbnailUrl?: string;
  
  // Position
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // Metadata
  caption?: string;
  altText?: string;
  sourceFileId?: string;
  
  // Interactive Actions
  actions: ConnectEmbeddedMediaAction[];
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Connect Embedded Media Action - Action for embedded media
 */
export interface ConnectEmbeddedMediaAction {
  id: string;
  embeddedMediaId: string;
  
  // Action Details
  type: 'open-peek' | 'open-gallery' | 'select-for-gallery' | 'add-to-photostrip' | 'replace-card-image' | 'set-fit-mode' | 'view-on-map' | 'return-to-document';
  label: string;
  icon: string;
  
  // Configuration
  requiresSelection: boolean;
  multiSelect: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
