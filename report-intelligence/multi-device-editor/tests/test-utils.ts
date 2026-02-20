/**
 * Test utilities for Multi-Device Editor testing
 * 
 * This module provides mock implementations and test helpers for editor testing.
 */

import type { Document, EditorOperation, DocumentMetadata, DocumentPermissions, SyncStatus } from '../types';

/**
 * Create a test document
 */
export function createTestDocument(overrides: Partial<Document> = {}): Document {
  const defaultMetadata: DocumentMetadata = {
    tags: [],
    permissions: {
      canEdit: ['test-user'],
      canView: ['test-user'],
      canShare: true,
      canDelete: true,
      isPublic: false,
    },
    customFields: {},
    syncStatus: 'synced' as SyncStatus,
  };

  return {
    id: overrides.id || 'test-doc-123',
    title: overrides.title || 'Test Document',
    content: overrides.content || 'Initial content',
    metadata: overrides.metadata || defaultMetadata,
    version: overrides.version || 1,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    createdBy: overrides.createdBy || 'test-user',
    updatedBy: overrides.updatedBy || 'test-user',
    deviceId: overrides.deviceId || 'test-device',
    ...overrides
  };
}

/**
 * Simple mock sync engine for testing
 */
export class MockSyncEngine {
  private operations: EditorOperation[] = [];
  private connected = true;
  
  queueOperation(operation: EditorOperation): void {
    this.operations.push(operation);
  }
  
  getQueuedOperations(): EditorOperation[] {
    return [...this.operations];
  }
  
  clearOperations(): void {
    this.operations = [];
  }
  
  isConnected(): boolean {
    return this.connected;
  }
  
  setConnected(connected: boolean): void {
    this.connected = connected;
  }
  
  // Mock methods for testing
  async syncDocument(documentId: string): Promise<void> {
    // Mock implementation
  }
  
  registerDocument(document: any): void {
    // Mock implementation
  }
  
  unregisterDocument(documentId: string): void {
    // Mock implementation
  }
}

/**
 * Simple mock Supabase client for testing
 */
export class MockSupabaseClient {
  private currentUser: any = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  };
  
  getCurrentUser(): any {
    return this.currentUser;
  }
  
  setCurrentUser(user: any): void {
    this.currentUser = user;
  }
  
  // Mock methods for testing
  async saveDocument(): Promise<void> {
    return Promise.resolve();
  }
  
  async loadDocument(): Promise<Document | null> {
    return createTestDocument();
  }
  
  async listDocuments(): Promise<Document[]> {
    return [createTestDocument()];
  }
  
  async deleteDocument(): Promise<void> {
    return Promise.resolve();
  }
  
  subscribeToDocument(): () => void {
    return () => {};
  }
  
  unsubscribeFromDocument(): void {
    // No-op
  }
}

/**
 * Wait for a condition to be true
 */
export function waitFor(condition: () => boolean, timeout = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Condition not met within ${timeout}ms`));
      } else {
        setTimeout(checkCondition, 10);
      }
    };
    
    checkCondition();
  });
}

/**
 * Create a test editor operation
 */
export function createTestOperation(
  type: 'insert' | 'delete' | 'replace' | 'format',
  position: number,
  content: string,
  overrides: Partial<EditorOperation> = {}
): EditorOperation {
  const baseOperation: EditorOperation = {
    id: `test-op-${Date.now()}-${Math.random()}`,
    type,
    position,
    content,
    timestamp: Date.now(),
    deviceId: 'test-device',
    userId: 'test-user',
    documentId: 'test-doc',
    version: 1,
    previousOperationId: undefined,
    metadata: {}
  };
  
  return { ...baseOperation, ...overrides };
}

/**
 * Assert that two values are equal with helpful error messages
 */
export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      message || `Assertion failed:\nExpected: ${JSON.stringify(expected, null, 2)}\nActual: ${JSON.stringify(actual, null, 2)}`
    );
  }
}

/**
 * Run a test with setup and teardown
 */
export async function runTest(
  name: string,
  testFn: () => Promise<void> | void,
  setup?: () => Promise<void> | void,
  teardown?: () => Promise<void> | void
): Promise<void> {
  console.log(`Running test: ${name}`);
  
  try {
    if (setup) await setup();
    await testFn();
    console.log(`✓ Test passed: ${name}`);
  } catch (error) {
    console.error(`✗ Test failed: ${name}`, error);
    throw error;
  } finally {
    if (teardown) await teardown();
  }
}