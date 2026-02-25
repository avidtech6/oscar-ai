/**
 * SMTP Types and Interfaces
 * Core type definitions for SMTP client and sending operations
 */

export interface SmtpConnectionConfig {
  host: string;
  port: number;
  secure: boolean; // SSL
  requireTLS?: boolean; // STARTTLS
  auth: {
    user: string;
    pass: string;
  };
  tls?: {
    rejectUnauthorized?: boolean;
  };
  pool?: boolean;
  maxConnections?: number;
  rateLimit?: number;
  timeout?: number;
}

export interface EmailAddress {
  name?: string;
  address: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
  cid?: string; // Content ID for inline images
}

export interface EmailMessage {
  from: EmailAddress | string;
  to: EmailAddress | string | (EmailAddress | string)[];
  cc?: EmailAddress | string | (EmailAddress | string)[];
  bcc?: EmailAddress | string | (EmailAddress | string)[];
  replyTo?: EmailAddress | string | (EmailAddress | string)[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string | string[]>;
  priority?: 'high' | 'normal' | 'low';
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
}

export interface SendEmailOptions {
  timeout?: number;
  requireTLS?: boolean;
  disableFileAccess?: boolean;
  disableUrlAccess?: boolean;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  response?: string;
  envelope?: {
    from: string;
    to: string[];
  };
  accepted: string[];
  rejected: string[];
  pending?: string[];
  error?: string;
}

// Alias for backward compatibility
export type SmtpSendOptions = SendEmailOptions;
export type SmtpSendResult = SendEmailResult;

export interface BatchSendOptions {
  batchSize?: number;
  delayBetweenBatches?: number;
  concurrency?: number;
  onProgress?: (progress: BatchProgress) => void;
}

export interface BatchProgress {
  total: number;
  sent: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
}

export interface BatchSendResult {
  success: boolean;
  total: number;
  sent: number;
  failed: number;
  results: SendEmailResult[];
  errors: Array<{ email: EmailMessage; error: string }>;
}

export enum SmtpConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error'
}

export interface SmtpConnectionStatus {
  state: SmtpConnectionState;
  lastActivity?: Date;
  error?: string;
  poolSize?: number;
  activeConnections?: number;
}

export interface TransportFactory {
  createTransport(config: SmtpConnectionConfig): any;
  verifyConnection(transport: any): Promise<boolean>;
  closeTransport(transport: any): Promise<void>;
}

export interface OAuth2Config {
  type: 'OAuth2';
  user: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  expires?: number;
  accessUrl?: string;
}

export type AuthMethod = 'password' | 'oauth2';

export interface SmtpAuthConfig {
  method: AuthMethod;
  credentials: SmtpConnectionConfig['auth'] | OAuth2Config;
}