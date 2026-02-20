// Test to identify potential auto-save issues in SyncEngine
// Based on actual SyncEngine.ts implementation analysis

console.log('Analyzing SyncEngine auto-save potential issues...\n');

// Simulate the actual SyncEngine behavior
class SimulatedSyncEngine {
  constructor() {
    this.isSyncing = false;
    this.operationQueue = new Map();
    this.syncStates = new Map();
    this.config = {
      batchSize: 100,
      syncInterval: 5000,
    };
    this.syncAttempts = [];
    this.syncResults = [];
  }

  queueOperation(operation) {
    const documentId = operation.documentId;
    let queue = this.operationQueue.get(documentId);
    
    if (!queue) {
      queue = [];
      this.operationQueue.set(documentId, queue);
    }
    
    queue.push(operation);
    
    // Update sync state
    let syncState = this.syncStates.get(documentId);
    if (!syncState) {
      syncState = { documentId, status: 'pending', pendingOperations: 0 };
      this.syncStates.set(documentId, syncState);
    }
    syncState.pendingOperations = queue.length;
    syncState.status = 'pending';
    
    console.log(`Operation queued for ${documentId}: queue size = ${queue.length}`);
    
    // AUTO-SAVE TRIGGER: This is the actual logic from line 225-229
    if (queue.length >= this.config.batchSize) {
      console.log(`  -> Auto-save triggered (queue ${queue.length} >= batch ${this.config.batchSize})`);
      this.syncDocument(documentId).catch(error => {
        console.error(`  -> Auto-save failed: ${error.message}`);
      });
    }
    
    return { success: true };
  }

  async syncDocument(documentId) {
    // This is the actual logic from line 244-247
    if (this.isSyncing) {
      console.log(`  -> Sync already in progress, skipping document ${documentId}`);
      this.syncAttempts.push({ documentId, skipped: true, reason: 'already syncing' });
      return { success: true, data: undefined };
    }
    
    this.syncAttempts.push({ documentId, skipped: false });
    this.isSyncing = true;
    
    try {
      const queue = this.operationQueue.get(documentId);
      if (!queue || queue.length === 0) {
        console.log(`  -> No operations to sync for ${documentId}`);
        return { success: true, data: undefined };
      }
      
      console.log(`  -> Starting sync for ${documentId} (${queue.length} operations)`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Clear the queue
      const syncedCount = queue.length;
      queue.length = 0;
      
      const syncState = this.syncStates.get(documentId);
      if (syncState) {
        syncState.pendingOperations = 0;
        syncState.status = 'synced';
        syncState.lastSyncedAt = new Date();
      }
      
      this.syncResults.push({ documentId, syncedCount, success: true });
      console.log(`  -> Sync completed for ${documentId}: ${syncedCount} operations`);
      
      return { success: true, data: undefined };
    } catch (error) {
      this.syncResults.push({ documentId, success: false, error: error.message });
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  getStats() {
    return {
      syncAttempts: this.syncAttempts.length,
      skippedSyncs: this.syncAttempts.filter(a => a.skipped).length,
      successfulSyncs: this.syncResults.filter(r => r.success).length,
      failedSyncs: this.syncResults.filter(r => !r.success).length,
      totalOperationsSynced: this.syncResults.reduce((sum, r) => sum + (r.syncedCount || 0), 0),
    };
  }
}

// Test scenario 1: Rapid operations that trigger multiple auto-saves
async function testRapidOperations() {
  console.log('=== Test 1: Rapid Operations ===');
  console.log('Simulating rapid typing that generates many operations quickly...\n');
  
  const engine = new SimulatedSyncEngine();
  engine.config.batchSize = 5; // Small batch for testing
  
  // Simulate rapid typing: 20 operations in quick succession
  const promises = [];
  for (let i = 0; i < 20; i++) {
    const operation = {
      id: `op_${i}`,
      documentId: 'doc1',
      type: 'insert',
      position: i,
      content: `char${i}`,
      timestamp: Date.now(),
    };
    
    // Queue operation without waiting
    promises.push(Promise.resolve().then(() => {
      engine.queueOperation(operation);
    }));
    
    // Small delay to simulate typing speed
    if (i % 3 === 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  await Promise.all(promises);
  
  // Wait for any async sync operations to complete
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('\nResults:');
  const stats = engine.getStats();
  console.log(`Sync attempts: ${stats.syncAttempts}`);
  console.log(`Skipped syncs (due to already syncing): ${stats.skippedSyncs}`);
  console.log(`Successful syncs: ${stats.successfulSyncs}`);
  console.log(`Total operations synced: ${stats.totalOperationsSynced}`);
  
  const queue = engine.operationQueue.get('doc1');
  const pendingOps = queue ? queue.length : 0;
  console.log(`Pending operations in queue: ${pendingOps}`);
  
  if (pendingOps > 0) {
    console.log(`\n⚠️  ISSUE FOUND: ${pendingOps} operations still pending in queue!`);
    console.log('   This could be because auto-save was triggered but sync was already in progress.');
    console.log('   The operations remain in queue until next sync attempt.');
    return true;
  }
  
  console.log('\n✅ No issues found in rapid operations test');
  return false;
}

// Test scenario 2: Multiple documents with interleaved operations
async function testMultipleDocuments() {
  console.log('\n=== Test 2: Multiple Documents ===');
  console.log('Simulating editing multiple documents simultaneously...\n');
  
  const engine = new SimulatedSyncEngine();
  engine.config.batchSize = 3; // Very small batch
  
  const documents = ['doc_a', 'doc_b', 'doc_c'];
  let operationCount = 0;
  
  // Interleave operations across documents
  for (let i = 0; i < 15; i++) {
    const docIndex = i % documents.length;
    const documentId = documents[docIndex];
    
    const operation = {
      id: `op_${operationCount++}`,
      documentId,
      type: i % 2 === 0 ? 'insert' : 'delete',
      position: i * 5,
      content: `content_${i}`,
      timestamp: Date.now(),
    };
    
    engine.queueOperation(operation);
    
    // Small delay
    if (i % 4 === 0) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  // Wait for syncs to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\nResults:');
  const stats = engine.getStats();
  console.log(`Total sync attempts: ${stats.syncAttempts}`);
  console.log(`Skipped syncs: ${stats.skippedSyncs}`);
  
  // Check each document's queue
  let issuesFound = false;
  for (const docId of documents) {
    const queue = engine.operationQueue.get(docId);
    const pendingOps = queue ? queue.length : 0;
    const syncState = engine.syncStates.get(docId);
    
    console.log(`\nDocument ${docId}:`);
    console.log(`  Pending operations: ${pendingOps}`);
    console.log(`  Sync status: ${syncState?.status || 'unknown'}`);
    
    if (pendingOps > 0 && syncState?.status === 'synced') {
      console.log(`  ⚠️  ISSUE: Operations pending but status is 'synced'`);
      issuesFound = true;
    }
  }
  
  if (issuesFound) {
    console.log('\n⚠️  ISSUES FOUND: Status inconsistency or pending operations');
    return true;
  }
  
  console.log('\n✅ No issues found in multiple documents test');
  return false;
}

// Test scenario 3: Network latency causing sync delays
async function testNetworkLatency() {
  console.log('\n=== Test 3: Network Latency ===');
  console.log('Simulating slow network that causes sync to take longer...\n');
  
  const engine = new SimulatedSyncEngine();
  engine.config.batchSize = 2;
  
  // Override syncDocument to simulate network latency
  const originalSyncDocument = engine.syncDocument.bind(engine);
  engine.syncDocument = async function(documentId) {
    if (this.isSyncing) {
      console.log(`  -> [NETWORK TEST] Sync already in progress, skipping ${documentId}`);
      return { success: true };
    }
    
    this.isSyncing = true;
    console.log(`  -> [NETWORK TEST] Starting slow sync for ${documentId}`);
    
    // Simulate network latency (1 second)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const queue = this.operationQueue.get(documentId);
    if (queue) {
      queue.length = 0;
    }
    
    console.log(`  -> [NETWORK TEST] Slow sync completed for ${documentId}`);
    this.isSyncing = false;
    return { success: true };
  };
  
  // Queue operations while sync is in progress
  console.log('Queueing operations while sync is slow...');
  
  // Start with one operation to trigger sync
  engine.queueOperation({
    id: 'op1',
    documentId: 'slow_doc',
    type: 'insert',
    position: 0,
    content: 'first',
    timestamp: Date.now(),
  });
  
  engine.queueOperation({
    id: 'op2',
    documentId: 'slow_doc',
    type: 'insert',
    position: 5,
    content: 'second',
    timestamp: Date.now(),
  });
  
  // Immediately queue more operations while sync is in progress
  console.log('Immediately queueing more operations...');
  for (let i = 3; i <= 6; i++) {
    engine.queueOperation({
      id: `op${i}`,
      documentId: 'slow_doc',
      type: 'insert',
      position: i * 5,
      content: `content${i}`,
      timestamp: Date.now(),
    });
    
    // Small delay between operations
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Wait for sync to complete
  console.log('Waiting for sync to complete...');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const queue = engine.operationQueue.get('slow_doc');
  const pendingOps = queue ? queue.length : 0;
  
  console.log(`\nResults:`);
  console.log(`Pending operations after slow sync: ${pendingOps}`);
  
  if (pendingOps > 0) {
    console.log(`\n⚠️  ISSUE FOUND: ${pendingOps} operations accumulated during slow sync`);
    console.log('   These operations were queued while sync was in progress');
    console.log('   and will not be synced until next auto-save trigger');
    return true;
  }
  
  console.log('\n✅ No issues found in network latency test');
  return false;
}

// Run all tests
async function runAllTests() {
  console.log('========================================');
  console.log('Sync Engine Auto-save Issue Analysis');
  console.log('========================================\n');
  
  let issuesFound = false;
  
  issuesFound = await testRapidOperations() || issuesFound;
  issuesFound = await testMultipleDocuments() || issuesFound;
  issuesFound = await testNetworkLatency() || issuesFound;
  
  console.log('\n========================================');
  console.log('ANALYSIS COMPLETE');
  console.log('========================================\n');
  
  if (issuesFound) {
    console.log('🚨 POTENTIAL AUTO-SAVE ISSUES IDENTIFIED:');
    console.log('\n1. Race condition: When sync is already in progress,');
    console.log('   additional auto-save triggers are skipped.');
    console.log('2. Operations queued during sync remain pending until');
    console.log('   next sync trigger (batch size or interval).');
    console.log('3. No retry mechanism for skipped syncs.');
    console.log('\nRECOMMENDED FIXES:');
    console.log('1. Implement a sync queue or debouncing mechanism');
    console.log('2. Track "dirty" state and ensure sync happens eventually');
    console.log('3. Consider immediate sync for critical operations');
    console.log('4. Add retry logic for skipped sync attempts');
  } else {
    console.log('✅ No critical issues identified in auto-save logic.');
    console.log('   The basic functionality appears to be working correctly.');
  }
  
  return issuesFound;
}

// Execute the analysis
runAllTests().catch(err => {
  console.error('Test execution failed:', err);
});