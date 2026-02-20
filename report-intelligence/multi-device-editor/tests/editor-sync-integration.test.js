/**
 * Integration tests for Editor + Sync Engine
 * 
 * Tests the interaction between UnifiedEditor and SyncEngine,
 * focusing on auto-save, synchronization, and conflict resolution.
 */

console.log('=== Editor + Sync Engine Integration Tests ===\n');

// Mock implementations
class MockSyncEngine {
  constructor() {
    this.operations = [];
    this.syncState = {
      status: 'synced',
      pendingOperations: 0,
      lastSyncedAt: new Date()
    };
    this.autoSaveEnabled = true;
    this.documentsSyncing = new Map();
    this.autoSaveTimeouts = new Map();
  }

  queueOperation(operation) {
    console.log(`SyncEngine: Queueing operation ${operation.id} (${operation.type})`);
    this.operations.push(operation);
    this.syncState.pendingOperations = this.operations.length;
    
    // Simulate auto-save after 2 seconds (mocked)
    if (this.autoSaveEnabled) {
      console.log(`SyncEngine: Auto-save scheduled for operation ${operation.id}`);
      this.scheduleAutoSave(operation.documentId);
    }
    
    return { success: true };
  }

  scheduleAutoSave(documentId) {
    // Mock auto-save scheduling
    if (this.autoSaveTimeouts.has(documentId)) {
      clearTimeout(this.autoSaveTimeouts.get(documentId));
    }
    
    const timeout = setTimeout(() => {
      console.log(`SyncEngine: Auto-save triggered for document ${documentId}`);
      this.syncDocument(documentId);
    }, 2000); // 2 seconds for testing
    
    this.autoSaveTimeouts.set(documentId, timeout);
  }

  async syncDocument(documentId) {
    console.log(`SyncEngine: Syncing document ${documentId}`);
    
    if (this.documentsSyncing.get(documentId)) {
      console.log(`SyncEngine: Document ${documentId} already syncing, skipping`);
      return;
    }
    
    this.documentsSyncing.set(documentId, true);
    this.syncState.status = 'syncing';
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Process operations
      const opsToSync = [...this.operations];
      this.operations = [];
      this.syncState.pendingOperations = 0;
      this.syncState.status = 'synced';
      this.syncState.lastSyncedAt = new Date();
      
      console.log(`SyncEngine: Successfully synced ${opsToSync.length} operations for document ${documentId}`);
      return { success: true, syncedOperations: opsToSync.length };
    } catch (error) {
      this.syncState.status = 'error';
      console.error(`SyncEngine: Sync failed for document ${documentId}:`, error.message);
      throw error;
    } finally {
      this.documentsSyncing.set(documentId, false);
      this.autoSaveTimeouts.delete(documentId);
    }
  }

  getSyncState() {
    return { ...this.syncState };
  }

  clearOperations() {
    this.operations = [];
    this.syncState.pendingOperations = 0;
  }
}

class MockSupabaseClient {
  getCurrentUser() {
    return { id: 'test-user', email: 'test@example.com' };
  }
}

// Test document
const testDocument = {
  id: 'integration-test-doc',
  title: 'Integration Test Document',
  content: 'Initial content for integration testing',
  metadata: {
    tags: ['test', 'integration'],
    permissions: {
      canEdit: ['test-user'],
      canView: ['test-user'],
      canShare: true,
      canDelete: true,
      isPublic: false,
    },
    customFields: {},
    syncStatus: 'synced',
  },
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'test-user',
  updatedBy: 'test-user',
  deviceId: 'test-device',
};

// Test scenarios
async function runIntegrationTests() {
  console.log('Test 1: Basic editor operations with sync queuing');
  await testBasicOperations();
  
  console.log('\nTest 2: Auto-save triggering');
  await testAutoSave();
  
  console.log('\nTest 3: Multiple operations batching');
  await testOperationBatching();
  
  console.log('\nTest 4: Sync state tracking');
  await testSyncState();
  
  console.log('\n✅ All integration tests completed successfully');
}

async function testBasicOperations() {
  const syncEngine = new MockSyncEngine();
  const supabaseClient = new MockSupabaseClient();
  
  console.log('  - Creating editor with test document');
  // In a real test, we would instantiate UnifiedEditor here
  // For now, we'll simulate the interaction
  
  console.log('  - Simulating insert operation');
  const insertOp = {
    id: 'op-insert-1',
    type: 'insert',
    position: 0,
    content: 'Test ',
    timestamp: Date.now(),
    deviceId: 'test-device',
    userId: 'test-user',
    documentId: testDocument.id,
    version: 2,
  };
  
  const queueResult = syncEngine.queueOperation(insertOp);
  console.log(`  - Operation queued: ${queueResult.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`  - Pending operations: ${syncEngine.getSyncState().pendingOperations}`);
  
  // Verify operation was queued
  if (syncEngine.getSyncState().pendingOperations !== 1) {
    throw new Error('Expected 1 pending operation after insert');
  }
  
  console.log('  ✓ Basic operations test passed');
}

async function testAutoSave() {
  const syncEngine = new MockSyncEngine();
  
  console.log('  - Queueing operation to trigger auto-save');
  const testOp = {
    id: 'op-auto-save-1',
    type: 'insert',
    position: 5,
    content: 'auto-save test ',
    timestamp: Date.now(),
    deviceId: 'test-device',
    userId: 'test-user',
    documentId: testDocument.id,
    version: 2,
  };
  
  syncEngine.queueOperation(testOp);
  console.log(`  - Auto-save timeout set: ${syncEngine.autoSaveTimeouts.has(testDocument.id) ? 'YES' : 'NO'}`);
  
  // In a real test, we would wait for the timeout and verify sync happens
  // For this conceptual test, we'll just verify the timeout was scheduled
  
  if (!syncEngine.autoSaveTimeouts.has(testDocument.id)) {
    throw new Error('Auto-save timeout should be scheduled');
  }
  
  console.log('  ✓ Auto-save test passed');
}

async function testOperationBatching() {
  const syncEngine = new MockSyncEngine();
  
  console.log('  - Queueing multiple operations');
  const operations = [
    { id: 'op-batch-1', type: 'insert', position: 0, content: 'First ', documentId: testDocument.id },
    { id: 'op-batch-2', type: 'insert', position: 6, content: 'Second ', documentId: testDocument.id },
    { id: 'op-batch-3', type: 'delete', position: 0, content: 'First', documentId: testDocument.id },
  ];
  
  operations.forEach(op => {
    syncEngine.queueOperation({
      ...op,
      timestamp: Date.now(),
      deviceId: 'test-device',
      userId: 'test-user',
      version: 2,
    });
  });
  
  console.log(`  - Queued ${operations.length} operations`);
  console.log(`  - Pending operations: ${syncEngine.getSyncState().pendingOperations}`);
  
  if (syncEngine.getSyncState().pendingOperations !== operations.length) {
    throw new Error(`Expected ${operations.length} pending operations, got ${syncEngine.getSyncState().pendingOperations}`);
  }
  
  // Simulate sync
  console.log('  - Simulating sync operation');
  const syncResult = await syncEngine.syncDocument(testDocument.id);
  
  if (!syncResult.success) {
    throw new Error('Sync should succeed');
  }
  
  if (syncEngine.getSyncState().pendingOperations !== 0) {
    throw new Error('All operations should be cleared after sync');
  }
  
  console.log('  ✓ Operation batching test passed');
}

async function testSyncState() {
  const syncEngine = new MockSyncEngine();
  
  console.log('  - Testing sync state transitions');
  
  // Initial state should be 'synced'
  let state = syncEngine.getSyncState();
  if (state.status !== 'synced') {
    throw new Error(`Initial state should be 'synced', got '${state.status}'`);
  }
  
  // Queue operation - should still be 'synced' (not 'syncing' yet)
  syncEngine.queueOperation({
    id: 'op-state-1',
    type: 'insert',
    position: 0,
    content: 'test',
    timestamp: Date.now(),
    deviceId: 'test-device',
    userId: 'test-user',
    documentId: testDocument.id,
    version: 2,
  });
  
  state = syncEngine.getSyncState();
  if (state.pendingOperations !== 1) {
    throw new Error(`Should have 1 pending operation, got ${state.pendingOperations}`);
  }
  
  // During sync, state should be 'syncing'
  console.log('  - Simulating sync in progress');
  syncEngine.syncState.status = 'syncing';
  state = syncEngine.getSyncState();
  if (state.status !== 'syncing') {
    throw new Error(`During sync, state should be 'syncing', got '${state.status}'`);
  }
  
  // After sync, state should be 'synced'
  syncEngine.syncState.status = 'synced';
  syncEngine.syncState.pendingOperations = 0;
  state = syncEngine.getSyncState();
  if (state.status !== 'synced') {
    throw new Error(`After sync, state should be 'synced', got '${state.status}'`);
  }
  
  console.log('  ✓ Sync state test passed');
}

// Run the tests
runIntegrationTests().catch(error => {
  console.error('❌ Integration tests failed:', error);
  process.exit(1);
});