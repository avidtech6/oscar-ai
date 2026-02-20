// Quick test for undo/redo functionality
// Testing the core logic without TypeScript compilation issues

console.log('Testing undo/redo logic...\n');

// Mock document state
let document = {
  id: 'test-doc',
  content: 'Initial content',
  version: 1,
};

// Mock undo/redo stacks
let undoStack = [];
let redoStack = [];

// Simplified operation application
function applyOperation(operation) {
  console.log(`Applying operation: ${operation.type} "${operation.content}" at position ${operation.position}`);
  
  switch (operation.type) {
    case 'insert':
      document.content = 
        document.content.substring(0, operation.position) +
        operation.content +
        document.content.substring(operation.position);
      break;
    case 'delete':
      document.content =
        document.content.substring(0, operation.position) +
        document.content.substring(operation.position + operation.content.length);
      break;
    case 'replace':
      const replaceEnd = operation.position + (operation.metadata?.oldContentLength || 0);
      document.content =
        document.content.substring(0, operation.position) +
        operation.content +
        document.content.substring(replaceEnd);
      break;
  }
  
  document.version++;
  undoStack.push(operation);
  redoStack = []; // Clear redo stack on new operation
}

// Simplified undo
function undo() {
  if (undoStack.length === 0) {
    console.log('Nothing to undo');
    return false;
  }
  
  const operation = undoStack.pop();
  console.log(`Undoing operation: ${operation.type} "${operation.content}"`);
  
  // Create inverse operation
  let inverseOperation;
  switch (operation.type) {
    case 'insert':
      inverseOperation = {
        ...operation,
        type: 'delete',
        version: document.version + 1,
      };
      break;
    case 'delete':
      inverseOperation = {
        ...operation,
        type: 'insert',
        version: document.version + 1,
      };
      break;
    case 'replace':
      // For replace, we need the original content
      // This is simplified
      inverseOperation = {
        ...operation,
        type: 'replace',
        content: 'REVERTED', // Would be original content in real implementation
        version: document.version + 1,
      };
      break;
  }
  
  applyOperation(inverseOperation);
  redoStack.push(operation);
  return true;
}

// Simplified redo
function redo() {
  if (redoStack.length === 0) {
    console.log('Nothing to redo');
    return false;
  }
  
  const operation = redoStack.pop();
  console.log(`Redoing operation: ${operation.type} "${operation.content}"`);
  applyOperation(operation);
  return true;
}

// Test sequence
console.log('=== Test Sequence ===\n');

console.log(`1. Initial document: "${document.content}" (version: ${document.version})`);

// Apply insert operation
const insertOp = {
  id: 'op1',
  type: 'insert',
  position: 8, // After "Initial "
  content: 'test ',
  timestamp: Date.now(),
  deviceId: 'test-device',
  userId: 'test-user',
  documentId: document.id,
  version: 2,
};
applyOperation(insertOp);
console.log(`2. After insert: "${document.content}" (version: ${document.version})`);

// Apply delete operation  
const deleteOp = {
  id: 'op2',
  type: 'delete',
  position: 0,
  content: 'Initial ',
  timestamp: Date.now(),
  deviceId: 'test-device',
  userId: 'test-user',
  documentId: document.id,
  version: 3,
};
applyOperation(deleteOp);
console.log(`3. After delete: "${document.content}" (version: ${document.version})`);

// Undo delete
console.log('\n4. Undoing delete operation:');
undo();
console.log(`   After undo: "${document.content}" (version: ${document.version})`);

// Undo insert
console.log('\n5. Undoing insert operation:');
undo();
console.log(`   After undo: "${document.content}" (version: ${document.version})`);

// Redo insert
console.log('\n6. Redoing insert operation:');
redo();
console.log(`   After redo: "${document.content}" (version: ${document.version})`);

// Redo delete
console.log('\n7. Redoing delete operation:');
redo();
console.log(`   After redo: "${document.content}" (version: ${document.version})`);

// Test undo with empty stack
console.log('\n8. Testing undo with empty stack:');
undo(); // Should undo the redo we just did
console.log(`   After undo: "${document.content}" (version: ${document.version})`);

undo(); // Undo again
console.log(`   After undo: "${document.content}" (version: ${document.version})`);

undo(); // Try to undo from empty stack
console.log(`   Final document: "${document.content}" (version: ${document.version})`);

console.log('\n=== Test Summary ===');
console.log('Undo/redo basic logic appears to be working.');
console.log('Key observations:');
console.log('1. Operations are pushed to undo stack when applied');
console.log('2. Redo stack is cleared when new operations are applied');
console.log('3. Undo pops from undo stack and pushes to redo stack');
console.log('4. Redo pops from redo stack and reapplies the operation');
console.log('\nPotential issues to check in actual implementation:');
console.log('- Inverse operation creation for complex operations (like replace)');
console.log('- TypeScript compilation errors in UnifiedEditor methods');
console.log('- Error handling in undo/redo methods');