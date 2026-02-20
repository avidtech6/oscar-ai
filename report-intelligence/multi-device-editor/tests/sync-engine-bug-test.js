// Test to identify the specific auto-save bug for multiple documents
// Based on actual SyncEngine.ts implementation

console.log('Testing specific auto-save bug for multiple documents...\n');

// This simulates the EXACT logic from SyncEngine.ts
class ExactSyncEngineSimulation {
  constructor() {
    this.isSyncing = false;
    this.operationQueue = new Map();
    this.syncStates = new Map();
    this.config = {
      batchSize: 100, // Default from SyncEngine
      syncInterval: 5000,
    };
    this.syncLog = [];
  }

  // Exact logic from line 179-238
  queueOperation(operation) {
    const documentId = operation.documentId;
    const queue = this.operationQueue.get(documentId);
    
    if (!queue) {
      // Document not registered - in real implementation this would return error
      return { success: false, error: new Error(`Document ${documentId} not registered`) };
    }
    
    queue.push(operation);
    
    // Update sync state (line 202-206)
    const syncState = this.syncStates.get(documentId);
    if (syncState) {
      syncState.pendingOperations = queue.length;
      syncState.status = 'pending';
    }
    
    console.log(`[${documentId}] Operation queued: queue=${queue.length}, batchSize=${this.config.batchSize}`);
    
    // AUTO-SAVE TRIGGER (line 225-229)
    if (queue.length >= this.config.batchSize) {
      console.log(`[${documentId}] 🚨 AUTO-SAVE TRIGGERED: queue ${queue.length} >= ${this.config.batchSize}`);
      this.syncDocument(documentId).catch(error => {
        console.error(`[${documentId}] Auto-save failed:`, error.message);
      });
    }
    
    return { success: true };
  }

  // Exact logic from line 243-345 (simplified)
  async syncDocument(documentId) {
    // Line 244-247: Check if already syncing
    if (this.isSyncing) {
      console.log(`[${documentId}] ⏸️  SKIPPED: Sync already in progress`);
      this.syncLog.push({ documentId, action: 'skipped', reason: 'already syncing' });
      return { success: true, data: undefined };
    }
    
    this.isSyncing = true;
    this.syncLog.push({ documentId, action: 'started' });
    
    try {
      const queue = this.operationQueue.get(documentId);
      const syncState = this.syncStates.get(documentId);
      
      if (!queue || !syncState) {
        throw new Error(`Document ${documentId} not found`);
      }
      
      if (queue.length === 0) {
        console.log(`[${documentId}] No operations to sync`);
        syncState.status = 'synced';
        this.isSyncing = false;
        return;
      }
      
      console.log(`[${documentId}] 🔄 SYNCING: ${queue.length} operations`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Clear the queue (line 280: queue.splice(0, this.config.batchSize))
      const operationsToSync = queue.splice(0, this.config.batchSize);
      
      // Update sync state (line 300-303)
      syncState.pendingOperations = queue.length;
      syncState.lastSyncedAt = new Date();
      syncState.status = 'synced';
      
      console.log(`[${documentId}] ✅ SYNC COMPLETE: ${operationsToSync.length} ops synced, ${queue.length} remaining`);
      this.syncLog.push({ documentId, action: 'completed', synced: operationsToSync.length, remaining: queue.length });
      
    } catch (error) {
      console.error(`[${documentId}] ❌ SYNC FAILED:`, error.message);
      this.syncLog.push({ documentId, action: 'failed', error: error.message });
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  registerDocument(document) {
    this.operationQueue.set(document.id, []);
    this.syncStates.set(document.id, {
      documentId: document.id,
      status: 'pending',
      pendingOperations: 0,
    });
    console.log(`[${document.id}] Document registered`);
  }

  getStatus() {
    const status = {};
    for (const [docId, queue] of this.operationQueue) {
      const syncState = this.syncStates.get(docId);
      status[docId] = {
        queueLength: queue.length,
        syncStatus: syncState?.status || 'unknown',
        pendingOps: syncState?.pendingOperations || 0,
      };
    }
    return status;
  }
}

// Test the exact scenario that might be causing the bug
async function testExactBugScenario() {
  console.log('=== Testing Exact Bug Scenario ===\n');
  console.log('Scenario: User editing 3 documents simultaneously');
  console.log('Batch size: 3 (small for testing)\n');
  
  const engine = new ExactSyncEngineSimulation();
  engine.config.batchSize = 3;
  
  // Register 3 documents
  const docs = ['report1', 'report2', 'report3'];
  docs.forEach(docId => {
    engine.registerDocument({ id: docId });
  });
  
  console.log('\n--- Phase 1: Fill each document to batch size ---');
  
  // Add 3 operations to each document (reaching batch size)
  for (const docId of docs) {
    for (let i = 0; i < 3; i++) {
      engine.queueOperation({
        id: `${docId}_op${i}`,
        documentId: docId,
        type: 'insert',
        position: i * 10,
        content: `Content ${i}`,
        timestamp: Date.now(),
      });
    }
  }
  
  // Wait for any async syncs to start
  await new Promise(resolve => setTimeout(resolve, 50));
  
  console.log('\n--- Phase 2: Check status after initial auto-save triggers ---');
  const status1 = engine.getStatus();
  console.log('Document statuses:');
  for (const [docId, stat] of Object.entries(status1)) {
    console.log(`  ${docId}: queue=${stat.queueLength}, status=${stat.syncStatus}, pending=${stat.pendingOps}`);
  }
  
  // Wait for sync to complete
  console.log('\nWaiting for sync to complete...');
  await new Promise(resolve => setTimeout(resolve, 200));
  
  console.log('\n--- Phase 3: Add more operations while sync might be in progress ---');
  
  // Add 2 more operations to each document
  for (const docId of docs) {
    for (let i = 3; i < 5; i++) {
      engine.queueOperation({
        id: `${docId}_op${i}`,
        documentId: docId,
        type: 'insert',
        position: i * 10,
        content: `More content ${i}`,
        timestamp: Date.now(),
      });
    }
  }
  
  // Wait a bit more
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log('\n--- Phase 4: Final status ---');
  const finalStatus = engine.getStatus();
  console.log('Final document statuses:');
  for (const [docId, stat] of Object.entries(finalStatus)) {
    console.log(`  ${docId}: queue=${stat.queueLength}, status=${stat.syncStatus}, pending=${stat.pendingOps}`);
  }
  
  console.log('\n--- Sync Log ---');
  engine.syncLog.forEach((log, i) => {
    console.log(`  ${i + 1}. ${log.documentId}: ${log.action}${log.synced ? ` (${log.synced} ops)` : ''}${log.reason ? ` - ${log.reason}` : ''}`);
  });
  
  // Analyze for bugs
  console.log('\n=== BUG ANALYSIS ===');
  
  let bugFound = false;
  const issues = [];
  
  // Check if any document has pending operations but status is 'synced'
  for (const [docId, stat] of Object.entries(finalStatus)) {
    if (stat.queueLength > 0 && stat.syncStatus === 'synced') {
      issues.push(`Document ${docId} has ${stat.queueLength} pending operations but status is 'synced'`);
      bugFound = true;
    }
    
    if (stat.queueLength > 0 && stat.syncStatus === 'pending') {
      issues.push(`Document ${docId} has ${stat.queueLength} pending operations waiting for sync`);
      // This might be expected if sync was skipped
    }
  }
  
  // Check sync log for skipped syncs
  const skippedSyncs = engine.syncLog.filter(log => log.action === 'skipped');
  if (skippedSyncs.length > 0) {
    issues.push(`${skippedSyncs.length} sync attempts were skipped due to "already syncing"`);
    bugFound = true;
  }
  
  if (bugFound) {
    console.log('🚨 POTENTIAL BUGS IDENTIFIED:');
    issues.forEach(issue => console.log(`  - ${issue}`));
    
    console.log('\n🔧 ROOT CAUSE ANALYSIS:');
    console.log('The issue appears to be in the syncDocument() method:');
    console.log('1. When isSyncing = true, all other sync attempts are skipped');
    console.log('2. This means only one document can sync at a time');
    console.log('3. Other documents must wait for periodic sync or next batch trigger');
    console.log('\nThis could explain why "auto-save not working" for multiple documents.');
    
    return true;
  } else {
    console.log('✅ No bugs identified in this scenario');
    return false;
  }
}

// Test with realistic batch size (100)
async function testRealisticScenario() {
  console.log('\n\n=== Testing Realistic Scenario (batchSize=100) ===\n');
  console.log('Realistic scenario: User edits one document extensively');
  console.log('Batch size: 100 (default)\n');
  
  const engine = new ExactSyncEngineSimulation();
  // Keep default batchSize = 100
  
  engine.registerDocument({ id: 'main_report' });
  
  console.log('Simulating extensive editing: 150 operations...');
  
  // Add 150 operations (exceeding batch size)
  for (let i = 0; i < 150; i++) {
    engine.queueOperation({
      id: `op${i}`,
      documentId: 'main_report',
      type: 'insert',
      position: i * 5,
      content: `Char ${i}`,
      timestamp: Date.now(),
    });
    
    // Simulate typing speed
    if (i % 20 === 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  // Wait for syncs
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const status = engine.getStatus();
  const syncLog = engine.syncLog;
  
  console.log('\nResults:');
  console.log(`Final queue length: ${status.main_report?.queueLength || 0}`);
  console.log(`Sync attempts: ${syncLog.length}`);
  console.log(`Successful syncs: ${syncLog.filter(l => l.action === 'completed').length}`);
  console.log(`Skipped syncs: ${syncLog.filter(l => l.action === 'skipped').length}`);
  
  if (status.main_report?.queueLength > 0) {
    console.log(`\n⚠️  ISSUE: ${status.main_report.queueLength} operations still pending`);
    console.log('   With batchSize=100, auto-save only triggers every 100 operations');
    console.log('   This could feel like "auto-save not working" to users');
    return true;
  }
  
  console.log('\n✅ All operations synced successfully');
  return false;
}

// Run tests
async function runBugTests() {
  const bug1 = await testExactBugScenario();
  const bug2 = await testRealisticScenario();
  
  console.log('\n\n=== FINAL CONCLUSION ===');
  
  if (bug1 || bug2) {
    console.log('🚨 AUTO-SAVE BUG CONFIRMED');
    console.log('\nThe issue appears to be:');
    console.log('1. Only one document can sync at a time (global isSyncing flag)');
    console.log('2. With default batchSize=100, auto-save triggers infrequently');
    console.log('3. Skipped syncs are not retried automatically');
    console.log('\nThis matches the reported issue: "Auto-save not working"');
    console.log('\nRECOMMENDED FIX:');
    console.log('1. Allow concurrent syncs for different documents');
    console.log('2. Add a "dirty" flag that triggers sync on document blur or timeout');
    console.log('3. Implement a sync queue with retry logic');
  } else {
    console.log('✅ No critical bugs found in auto-save logic');
    console.log('The reported issue might be elsewhere (UI integration, etc.)');
  }
}

runBugTests().catch(err => {
  console.error('Test failed:', err);
});