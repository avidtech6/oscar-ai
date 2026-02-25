// Communication Hub Type Definitions

// Email Types
export interface Email {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  bodyHtml?: string;
  attachments?: EmailAttachment[];
  status: 'draft' | 'sent' | 'received' | 'read' | 'archived' | 'deleted';
  priority: 'low' | 'normal' | 'high';
  labels: string[];
  threadId?: string;
  inReplyTo?: string;
  projectId?: string;
  clientId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  readAt?: Date;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
  emailId: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  bodyHtml: string;
  variables: string[];
  category: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailFilter {
  id: string;
  name: string;
  conditions: EmailFilterCondition[];
  actions: EmailFilterAction[];
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailFilterCondition {
  field: 'from' | 'to' | 'subject' | 'body' | 'labels';
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'matches';
  value: string;
}

export interface EmailFilterAction {
  type: 'moveToFolder' | 'applyLabel' | 'markAsRead' | 'forwardTo' | 'delete';
  value: string;
}

// Campaign Types
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: 'email' | 'sms' | 'push' | 'newsletter';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'completed';
  templateId?: string;
  subject?: string;
  content: string;
  contentHtml: string;
  recipientListId?: string;
  recipientCount: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  scheduledFor?: Date;
  sentAt?: Date;
  completedAt?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  email: string;
  name?: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bounceReason?: string;
  unsubscribeReason?: string;
}

export interface RecipientList {
  id: string;
  name: string;
  description?: string;
  type: 'static' | 'dynamic' | 'segment';
  filterCriteria?: Record<string, any>;
  recipientCount: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'email' | 'system' | 'alert' | 'reminder' | 'campaign' | 'project';
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived' | 'deleted';
  actionUrl?: string;
  actionLabel?: string;
  readAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  channel: 'email' | 'push' | 'inApp' | 'sms';
  type: string;
  enabled: boolean;
  quietHours?: {
    start: string; // HH:mm
    end: string; // HH:mm
    enabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// AppFlowy Integration Types
export interface AppFlowyDocument {
  id: string;
  title: string;
  content: any; // JSON structure
  type: 'document' | 'spreadsheet' | 'kanban' | 'calendar';
  workspaceId: string;
  userId: string;
  lastModified: Date;
  version: number;
  collaborators: string[];
}

export interface AppFlowyWorkspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Communication Stats
export interface CommunicationStats {
  emails: {
    total: number;
    unread: number;
    sentToday: number;
    receivedToday: number;
  };
  campaigns: {
    total: number;
    active: number;
    scheduled: number;
    completed: number;
  };
  notifications: {
    total: number;
    unread: number;
    urgent: number;
  };
  performance: {
    emailOpenRate: number;
    campaignClickRate: number;
    responseTime: number; // in hours
  };
}

// AI Context Types
export interface AIContext {
  id: string;
  userId: string;
  contextType: 'emailDraft' | 'campaignIdea' | 'responseSuggestion' | 'toneAnalysis';
  input: string;
  output: string;
  model: string;
  parameters: Record<string, any>;
  tokensUsed: number;
  createdAt: Date;
}

// Rate Limit Types
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message: string;
}

export interface RateLimitStatus {
  current: number;
  remaining: number;
  resetTime: Date;
  isLimited: boolean;
}

// Mobile Bar Types
export interface MobileBarItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  isActive: boolean;
}

// Shared Types
export interface Contact {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  tags: string[];
  lastContacted?: Date;
  communicationCount: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  labels: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}