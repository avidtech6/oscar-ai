/**
 * IMAP Types and Interfaces
 * Core type definitions for IMAP client and sync operations
 */

export interface ImapConnectionConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls?: {
    rejectUnauthorized?: boolean;
  };
  clientId?: string;
}

export interface ImapFolder {
  name: string;
  path: string;
  delimiter: string;
  flags: string[];
  specialUse?: 'inbox' | 'sent' | 'drafts' | 'trash' | 'archive' | 'junk' | 'spam';
  exists?: number;
  unseen?: number;
}

export interface ImapMessage {
  uid: number;
  seq: number;
  envelope: {
    date: Date;
    subject: string;
    from: Array<{ name?: string; address: string }>;
    to: Array<{ name?: string; address: string }>;
    cc?: Array<{ name?: string; address: string }>;
    bcc?: Array<{ name?: string; address: string }>;
    replyTo?: Array<{ name?: string; address: string }>;
    messageId: string;
    inReplyTo?: string;
    references?: string[];
  };
  flags: string[];
  internalDate: Date;
  size: number;
  bodyStructure?: any;
  headers?: Map<string, string | string[]>;
}

export interface ImapSyncState {
  lastSyncUid: number;
  lastSyncDate: Date;
  folderStates: Record<string, FolderSyncState>;
  totalMessages: number;
  unseenCount: number;
}

export interface FolderSyncState {
  folderPath: string;
  highestUid: number;
  uidValidity: number;
  messageCount: number;
  unseenCount: number;
  lastSync: Date;
}

export interface ImapSyncOptions {
  incremental: boolean;
  maxMessages?: number;
  since?: Date;
  before?: Date;
  includeFlags?: boolean;
  includeHeaders?: boolean;
  includeBody?: boolean;
}

export interface ImapSyncResult {
  success: boolean;
  messages: ImapMessage[];
  newMessages: number;
  updatedMessages: number;
  deletedMessages: number;
  syncState: ImapSyncState;
  error?: string;
}

export interface ImapIdleOptions {
  timeout?: number;
  onNewMessage?: (message: ImapMessage) => void;
  onExpunge?: (uid: number) => void;
  onFlagChange?: (uid: number, flags: string[]) => void;
}

export enum ImapConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  AUTHENTICATED = 'authenticated',
  SELECTED = 'selected',
  IDLE = 'idle',
  ERROR = 'error'
}

export interface ImapConnectionStatus {
  state: ImapConnectionState;
  folder?: string;
  lastActivity?: Date;
  error?: string;
}

export type ImapEvent = 
  | 'connect'
  | 'authenticate'
  | 'select'
  | 'idle'
  | 'newMessage'
  | 'expunge'
  | 'flagChange'
  | 'error'
  | 'close';

export interface ImapEventListener {
  (event: ImapEvent, data?: any): void;
}