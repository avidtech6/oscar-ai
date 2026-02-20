/**
 * Type definitions for the Real‑Time Collaboration Layer
 */

/**
 * CRDT Operation Types
 */
export type CrdtOperationType = 
  | 'insert' 
  | 'delete' 
  | 'update' 
  | 'format' 
  | 'move';

/**
 * CRDT Operation
 */
export interface CrdtOperation {
  id: string;
  type: CrdtOperationType;
  timestamp: CrdtTimestamp;
  siteId: string; // Unique identifier for the site (user/device)
  position?: number; // For text operations
  content?: string; // Content to insert/update
  length?: number; // Length for delete operations
  properties?: Record<string, any>; // Additional properties
  parentId?: string; // Parent operation ID for dependency tracking
}

/**
 * CRDT Timestamp (Lamport Clock)
 */
export interface CrdtTimestamp {
  counter: number;
  siteId: string;
}

/**
 * CRDT Document State
 */
export interface CrdtDocument {
  id: string;
  content: string;
  operations: CrdtOperation[];
  versionVector: Map<string, number>; // siteId -> counter
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
  };
}

/**
 * Presence State
 */
export interface PresenceState {
  userId: string;
  deviceId: string;
  userName: string;
  userColor: string; // Color for UI representation
  cursorPosition?: number;
  selectionRange?: { start: number; end: number };
  lastActivity: Date;
  status: 'active' | 'idle' | 'away' | 'offline';
}

/**
 * Conflict Information
 */
export interface ConflictInfo {
  operation1: CrdtOperation;
  operation2: CrdtOperation;
  type: 'insert-insert' | 'insert-delete' | 'delete-delete' | 'update-update';
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  resolutionStrategy?: string;
}

/**
 * Real-Time Message Types
 */
export type RealtimeMessageType = 
  | 'operation' 
  | 'presence' 
  | 'sync' 
  | 'ack' 
  | 'error';

/**
 * Real-Time Message
 */
export interface RealtimeMessage {
  type: RealtimeMessageType;
  data: any;
  timestamp: Date;
  senderId: string;
  messageId: string;
}

/**
 * Collaboration Session
 */
export interface CollaborationSession {
  sessionId: string;
  documentId: string;
  participants: PresenceState[];
  createdAt: Date;
  isActive: boolean;
}

/**
 * Resolution Strategy
 */
export type ResolutionStrategy =
  | 'last-write-wins'
  | 'operational-transform'
  | 'manual'
  | 'priority-based'
  | 'auto'
  | 'hybrid';

/**
 * Error Types
 */
export interface CollaborationError {
  code: string;
  message: string;
  operation?: CrdtOperation;
  timestamp: Date;
}