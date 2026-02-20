// Core type definitions for Unified Multi-Device Editor & Supabase Integration
// Phase 18 - Type System v1.0

// ============================================================================
// Editor Core Types
// ============================================================================

/**
 * Represents a document in the multi-device editor system
 */
export interface Document {
  id: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deviceId?: string; // Last device that modified the document
}

/**
 * Document metadata including permissions, tags, and custom fields
 */
export interface DocumentMetadata {
  tags: string[];
  permissions: DocumentPermissions;
  customFields: Record<string, any>;
  lastSyncAt?: Date;
  lastConflictResolvedAt?: Date;
  syncStatus: SyncStatus;
}

/**
 * Document permissions for collaborative editing
 */
export interface DocumentPermissions {
  canEdit: string[]; // User IDs who can edit
  canView: string[]; // User IDs who can view
  canShare: boolean;
  canDelete: boolean;
  isPublic: boolean;
}

/**
 * Editor operation types for CRDT-based editing
 */
export type EditorOperationType = 
  | 'insert' 
  | 'delete' 
  | 'format' 
  | 'move' 
  | 'replace'
  | 'annotation'
  | 'comment';

/**
 * A single editor operation with position and content
 */
export interface EditorOperation {
  id: string;
  type: EditorOperationType;
  position: number; // Character position
  content: string;
  timestamp: number; // Unix timestamp in milliseconds
  deviceId: string;
  userId: string;
  documentId: string;
  version: number;
  previousOperationId?: string; // For operation chaining
  metadata?: Record<string, any>;
}

/**
 * Batch of operations for efficient synchronization
 */
export interface OperationBatch {
  id: string;
  operations: EditorOperation[];
  documentId: string;
  deviceId: string;
  userId: string;
  timestamp: number;
  versionRange: [number, number]; // Inclusive range of versions in this batch
  isCompressed: boolean;
}

// ============================================================================
// Synchronization Types
// ============================================================================

/**
 * Synchronization status for documents and operations
 */
export type SyncStatus = 
  | 'synced' 
  | 'pending' 
  | 'conflict' 
  | 'offline' 
  | 'error' 
  | 'syncing';

/**
 * Synchronization state for a document
 */
export interface SyncState {
  documentId: string;
  status: SyncStatus;
  lastSyncedAt?: Date;
  pendingOperations: number;
  conflictCount: number;
  error?: SyncError;
  retryCount: number;
  deviceSyncStates: DeviceSyncState[];
}

/**
 * Device-specific synchronization state
 */
export interface DeviceSyncState {
  deviceId: string;
  lastSeenAt: Date;
  version: number;
  pendingOperations: number;
  isOnline: boolean;
  networkQuality: NetworkQuality;
}

/**
 * Network quality levels for synchronization
 */
export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';

/**
 * Synchronization error details
 */
export interface SyncError {
  code: SyncErrorCode;
  message: string;
  timestamp: Date;
  operationId?: string;
  retryable: boolean;
  details?: Record<string, any>;
}

/**
 * Synchronization error codes
 */
export type SyncErrorCode = 
  | 'network_timeout'
  | 'authentication_failed'
  | 'conflict_detected'
  | 'storage_full'
  | 'version_mismatch'
  | 'device_offline'
  | 'server_error'
  | 'rate_limited';

/**
 * Change tracking information for synchronization
 */
export interface ChangeTracking {
  documentId: string;
  changes: DocumentChange[];
  lastTrackedAt: Date;
  changeCount: number;
  compressedSize: number;
}

/**
 * Individual document change
 */
export interface DocumentChange {
  id: string;
  type: 'insert' | 'delete' | 'format' | 'metadata';
  position: number;
  length: number;
  content?: string;
  timestamp: Date;
  deviceId: string;
  operationId: string;
}

// ============================================================================
// Conflict Resolution Types
// ============================================================================

/**
 * Conflict types that can occur during multi-device editing
 */
export type ConflictType = 
  | 'content_conflict'      // Different content at same position
  | 'version_conflict'      // Version mismatch
  | 'merge_conflict'        // Merge failure
  | 'permission_conflict'   // Permission mismatch
  | 'device_timeout'        // Device synchronization timeout
  | 'network_partition';    // Network partition causing divergence

/**
 * A detected conflict between operations
 */
export interface Conflict {
  id: string;
  type: ConflictType;
  documentId: string;
  operations: EditorOperation[]; // Conflicting operations
  detectedAt: Date;
  resolvedAt?: Date;
  resolutionStrategy?: ConflictResolutionStrategy;
  resolutionResult?: ConflictResolutionResult;
  severity: ConflictSeverity;
}

/**
 * Conflict severity levels
 */
export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Conflict resolution strategies
 */
export type ConflictResolutionStrategy = 
  | 'last_write_wins'
  | 'manual_resolution'
  | 'merge_auto'
  | 'merge_semantic'
  | 'operation_transform'
  | 'device_priority'
  | 'user_priority';

/**
 * Result of conflict resolution
 */
export interface ConflictResolutionResult {
  strategy: ConflictResolutionStrategy;
  resolvedOperations: EditorOperation[];
  discardedOperations: EditorOperation[];
  mergedContent: string;
  resolutionTimestamp: Date;
  resolvedBy: string; // User ID or 'system'
  notes?: string;
}

// ============================================================================
// Device & Capability Types
// ============================================================================

/**
 * Device types supported by the editor
 */
export type DeviceType = 
  | 'desktop'
  | 'laptop' 
  | 'tablet'
  | 'phone'
  | 'embedded'
  | 'unknown';

/**
 * Operating system types
 */
export type OperatingSystem = 
  | 'windows'
  | 'macos'
  | 'linux'
  | 'ios'
  | 'android'
  | 'chromeos'
  | 'unknown';

/**
 * Browser types
 */
export type BrowserType = 
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'edge'
  | 'opera'
  | 'brave'
  | 'unknown';

/**
 * Device capabilities for editor optimization
 */
export interface DeviceCapabilities {
  deviceId: string;
  deviceType: DeviceType;
  operatingSystem: OperatingSystem;
  browser: BrowserType;
  screenSize: ScreenSize;
  memory: DeviceMemory;
  storage: DeviceStorage;
  network: NetworkCapabilities;
  inputMethods: InputMethod[];
  supportsOffline: boolean;
  supportsRealtime: boolean;
  maxDocumentSize: number; // in bytes
}

/**
 * Screen size categories
 */
export interface ScreenSize {
  width: number;
  height: number;
  pixelRatio: number;
  category: ScreenSizeCategory;
}

/**
 * Screen size categories for responsive design
 */
export type ScreenSizeCategory = 
  | 'xs'    // < 576px (phones)
  | 'sm'    // 576px - 767px
  | 'md'    // 768px - 991px (tablets)
  | 'lg'    // 992px - 1199px (small desktops)
  | 'xl'    // 1200px - 1399px
  | 'xxl';  // ≥ 1400px (large desktops)

/**
 * Device memory information
 */
export interface DeviceMemory {
  total: number; // in MB
  available: number; // in MB
  isLimited: boolean;
}

/**
 * Device storage information
 */
export interface DeviceStorage {
  total: number; // in MB
  available: number; // in MB
  isPersistent: boolean;
  quota?: number; // Storage quota if available
}

/**
 * Network capabilities
 */
export interface NetworkCapabilities {
  type: NetworkType;
  effectiveType: EffectiveNetworkType;
  downlink: number; // Mbps
  rtt: number; // Round-trip time in ms
  saveData: boolean;
  isOnline: boolean;
}

/**
 * Network connection types
 */
export type NetworkType = 
  | 'wifi'
  | 'cellular'
  | 'ethernet'
  | 'bluetooth'
  | 'wimax'
  | 'other'
  | 'unknown'
  | 'none';

/**
 * Effective network type for quality assessment
 */
export type EffectiveNetworkType = 
  | 'slow-2g'
  | '2g'
  | '3g'
  | '4g'
  | '5g'
  | 'unknown';

/**
 * Input methods supported by the device
 */
export type InputMethod = 
  | 'keyboard'
  | 'mouse'
  | 'touch'
  | 'pen'
  | 'voice'
  | 'gesture';

// ============================================================================
// Storage Types
// ============================================================================

/**
 * Storage backend types
 */
export type StorageBackend = 
  | 'localStorage'
  | 'indexedDB'
  | 'supabase'
  | 'memory'
  | 'fileSystem';

/**
 * Storage configuration for offline-first capabilities
 */
export interface StorageConfig {
  backends: StorageBackend[];
  primaryBackend: StorageBackend;
  fallbackOrder: StorageBackend[];
  maxSize: number; // in MB
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  syncThreshold: number; // Operations before sync
}

/**
 * Storage operation types
 */
export type StorageOperation = 
  | 'get'
  | 'set'
  | 'delete'
  | 'clear'
  | 'keys'
  | 'entries';

/**
 * Storage operation result
 */
export interface StorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  backend: StorageBackend;
  timestamp: Date;
  size?: number; // Size in bytes
}

// ============================================================================
// Supabase Integration Types
// ============================================================================

/**
 * Supabase authentication state
 */
export interface SupabaseAuthState {
  isAuthenticated: boolean;
  user?: SupabaseUser;
  session?: SupabaseSession;
  expiresAt?: Date;
  provider?: string;
}

/**
 * Supabase user information
 */
export interface SupabaseUser {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Supabase session information
 */
export interface SupabaseSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: SupabaseUser;
}

/**
 * Supabase realtime subscription state
 */
export interface RealtimeSubscription {
  id: string;
  channel: string;
  status: RealtimeStatus;
  subscribedAt: Date;
  lastMessageAt?: Date;
  errorCount: number;
}

/**
 * Realtime subscription status
 */
export type RealtimeStatus = 
  | 'subscribed'
  | 'subscribing'
  | 'unsubscribed'
  | 'error'
  | 'closed';

/**
 * Supabase storage file information
 */
export interface SupabaseFile {
  id: string;
  name: string;
  bucket: string;
  path: string;
  size: number;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
  signedUrl?: string;
  expiresAt?: Date;
}

// ============================================================================
// UI & Framework Types
// ============================================================================

/**
 * UI adapter types for different frameworks
 */
export type UIAdapterType = 
  | 'svelte'
  | 'react'
  | 'vue'
  | 'angular'
  | 'vanilla';

/**
 * UI configuration for the editor
 */
export interface UIConfig {
  adapter: UIAdapterType;
  theme: UITheme;
  layout: UILayout;
  features: UIFeatures;
  accessibility: UIAccessibility;
}

/**
 * UI theme options
 */
export interface UITheme {
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  fontSize: number;
  fontFamily: string;
  spacing: number;
}

/**
 * Theme modes
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * UI layout configurations
 */
export interface UILayout {
  toolbarPosition: ToolbarPosition;
  sidebarVisible: boolean;
  sidebarWidth: number;
  maxWidth: number;
  responsiveBreakpoints: Record<ScreenSizeCategory, UILayoutBreakpoint>;
}

/**
 * Toolbar position options
 */
export type ToolbarPosition = 'top' | 'bottom' | 'left' | 'right' | 'floating';

/**
 * UI layout breakpoint configuration
 */
export interface UILayoutBreakpoint {
  toolbarPosition: ToolbarPosition;
  sidebarVisible: boolean;
  fontSize: number;
}

/**
 * UI features that can be enabled/disabled
 */
export interface UIFeatures {
  spellCheck: boolean;
  autoSave: boolean;
  realtimeCollaboration: boolean;
  conflictVisualization: boolean;
  offlineIndicator: boolean;
  deviceSwitcher: boolean;
  versionHistory: boolean;
  exportOptions: boolean;
}

/**
 * Accessibility configuration
 */
export interface UIAccessibility {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  fontSizeMultiplier: number;
}

// ============================================================================
// Integration Types
// ============================================================================

/**
 * Phase 17 (Content Intelligence) integration types
 */
export interface Phase17Integration {
  contentSuggestions: boolean;
  seoAnalysis: boolean;
  brandToneEnforcement: boolean;
  templateSupport: boolean;
  schedulingIntegration: boolean;
}

/**
 * Oscar AI platform integration types
 */
export interface OscarIntegration {
  userContext: boolean;
  projectSystem: boolean;
  aiServices: boolean;
  reporting: boolean;
  authentication: boolean;
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Editor event types
 */
export type EditorEventType = 
  | 'contentChanged'
  | 'selectionChanged'
  | 'operationApplied'
  | 'syncStarted'
  | 'syncCompleted'
  | 'syncFailed'
  | 'conflictDetected'
  | 'conflictResolved'
  | 'deviceChanged'
  | 'networkChanged'
  | 'storageChanged'
  | 'errorOccurred';

/**
 * Base event interface
 */
export interface EditorEvent {
  type: EditorEventType;
  timestamp: Date;
  source: 'editor' | 'sync' | 'device' | 'network' | 'storage';
  data: Record<string, any>;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Result type for operations that can succeed or fail
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Async result type for asynchronous operations
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationParams & { total: number };
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for checking if a value is a Document
 */
export function isDocument(value: any): value is Document {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.content === 'string' &&
    typeof value.version === 'number' &&
    value.metadata &&
    typeof value.metadata === 'object'
  );
}

/**
 * Type guard for checking if a value is an EditorOperation
 */
export function isEditorOperation(value: any): value is EditorOperation {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    typeof value.position === 'number' &&
    typeof value.timestamp === 'number' &&
    typeof value.deviceId === 'string'
  );
}

/**
 * Type guard for checking if a value is a Conflict
 */
export function isConflict(value: any): value is Conflict {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    typeof value.documentId === 'string' &&
    Array.isArray(value.operations) &&
    value.detectedAt instanceof Date
  );
}

/**
 * Type guard for checking if a value is a DeviceCapabilities object
 */
export function isDeviceCapabilities(value: any): value is DeviceCapabilities {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.deviceId === 'string' &&
    typeof value.deviceType === 'string' &&
    value.screenSize &&
    typeof value.screenSize === 'object'
  );
}

/**
 * Type guard for checking if a value is a SyncState object
 */
export function isSyncState(value: any): value is SyncState {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.documentId === 'string' &&
    typeof value.status === 'string' &&
    Array.isArray(value.deviceSyncStates)
  );
}