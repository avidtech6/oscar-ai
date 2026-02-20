/**
 * Unit tests for UnifiedEditor
 * 
 * Tests the core functionality of the multi-device editor.
 */

import { UnifiedEditor } from '../core/editor/UnifiedEditor';
import { createTestDocument, MockSyncEngine, MockSupabaseClient, assertEqual, runTest } from './test-utils';

/**
 * Test suite for UnifiedEditor
 */
async function runUnifiedEditorTests() {
  console.log('=== Running UnifiedEditor Tests ===\n');

  let mockSyncEngine: MockSyncEngine;
  let mockSupabaseClient: MockSupabaseClient;
  let testDocument: any;

  // Setup before each test
  const setup = async () => {
    mockSyncEngine = new MockSyncEngine();
    mockSupabaseClient = new MockSupabaseClient();
    testDocument = createTestDocument();
  };

  // Teardown after each test
  const teardown = async () => {
    // Clean up if needed
  };

  // Test 1: Initialization
  await runTest('should initialize with a document', async () => {
    await setup();
    const editor = new UnifiedEditor(
      testDocument,
      mockSyncEngine as any,
      mockSupabaseClient as any
    );

    const state = editor.getState();
    const document = editor.getDocument();

    assertEqual(document.id, testDocument.id, 'Document ID should match');
    assertEqual(document.content, testDocument.content, 'Document content should match');
    assertEqual(document.version, testDocument.version, 'Document version should match');
    await teardown();
  });

  // Test 2: Get and set content
  await runTest('should get and set content', async () => {
    await setup();
    const editor = new UnifiedEditor(
      testDocument,
      mockSyncEngine as any,
      mockSupabaseClient as any
    );

    const newContent = 'New document content for testing';
    const result = await editor.setContent(newContent);

    assertEqual(result.success, true, 'setContent should succeed');
    assertEqual(editor.getContent(), newContent, 'Content should be updated');
    await teardown();
  });

  // Test 3: Insert text
  await runTest('should insert text at position', async () => {
    await setup();
    const editor = new UnifiedEditor(
      testDocument,
      mockSyncEngine as any,
      mockSupabaseClient as any
    );

    const initialContent = editor.getContent();
    const insertPosition = 8; // After "Initial "
    const textToInsert = 'test ';

    const result = await editor.insertText(insertPosition, textToInsert);

    assertEqual(result.success, true, 'insertText should succeed');
    const expectedContent = initialContent.substring(0, insertPosition) +
                           textToInsert +
                           initialContent.substring(insertPosition);
    assertEqual(editor.getContent(), expectedContent, 'Content should have inserted text');
    await teardown();
  });

  // Test 4: Delete text
  await runTest('should delete text from range', async () => {
    await setup();
    const editor = new UnifiedEditor(
      testDocument,
      mockSyncEngine as any,
      mockSupabaseClient as any
    );

    const initialContent = editor.getContent();
    const deleteStart = 0;
    const deleteEnd = 8; // Delete "Initial "

    const result = await editor.deleteText(deleteStart, deleteEnd);

    assertEqual(result.success, true, 'deleteText should succeed');
    const expectedContent = initialContent.substring(deleteEnd);
    assertEqual(editor.getContent(), expectedContent, 'Content should have deleted text');
    await teardown();
  });

  // Test 5: Invalid insert position
  await runTest('should handle invalid insert position', async () => {
    await setup();
    const editor = new UnifiedEditor(
      testDocument,
      mockSyncEngine as any,
      mockSupabaseClient as any
    );

    const contentLength = editor.getContent().length;
    const invalidPosition = contentLength + 10;

    const result = await editor.insertText(invalidPosition, 'test');

    assertEqual(result.success, false, 'insertText with invalid position should fail');
    await teardown();
  });

  // Test 6: Selection operations
  await runTest('should set and get selection', async () => {
    await setup();
    const editor = new UnifiedEditor(
      testDocument,
      mockSyncEngine as any,
      mockSupabaseClient as any
    );

    const selectionStart = 5;
    const selectionEnd = 10;
    const direction = 'forward' as const;

    const result = await editor.setSelection(selectionStart, selectionEnd, direction);

    assertEqual(result.success, true, 'setSelection should succeed');
    
    const selection = editor.getSelection();
    assertEqual(selection.start, selectionStart, 'Selection start should match');
    assertEqual(selection.end, selectionEnd, 'Selection end should match');
    assertEqual(selection.direction, direction, 'Selection direction should match');
    await teardown();
  });

  // Test 7: Get selected text
  await runTest('should get selected text', async () => {
    await setup();
    const editor = new UnifiedEditor(
      testDocument,
      mockSyncEngine as any,
      mockSupabaseClient as any
    );

    const content = editor.getContent();
    const selectionStart = 0;
    const selectionEnd = 7; // "Initial"

    editor.setSelection(selectionStart, selectionEnd);
    const selectedText = editor.getSelectedText();

    const expectedText = content.substring(selectionStart, selectionEnd);
    assertEqual(selectedText, expectedText, 'Selected text should match content range');
    await teardown();
  });

  // Test 8: Undo operation
  await runTest('should undo last operation', async () => {
    await setup();
    const editor = new UnifiedEditor(
      testDocument,
      mockSyncEngine as any,
      mockSupabaseClient as any
    );

    const initialContent = editor.getContent();
    await editor.insertText(0, 'Test ');
    const afterInsertContent = editor.getContent();

    await editor.undo();
    const afterUndoContent = editor.getContent();

    assertEqual(afterUndoContent, initialContent, 'Undo should revert to initial content');
    assertEqual(afterInsertContent !== initialContent, true, 'Insert should change content');
    await teardown();
  });

  // Test 9: Redo operation
  await runTest('should redo undone operation', async () => {
    await setup();
    const editor = new UnifiedEditor(
      testDocument,
      mockSyncEngine as any,
      mockSupabaseClient as any
    );

    const initialContent = editor.getContent();
    await editor.insertText(0, 'Test ');
    const afterInsertContent = editor.getContent();

    await editor.undo();
    await editor.redo();
    const afterRedoContent = editor.getContent();

    assertEqual(afterRedoContent, afterInsertContent, 'Redo should reapply the operation');
    assertEqual(afterRedoContent !== initialContent, true, 'Content should be changed after redo');
    await teardown();
  });

  // Test 10: Formatting
  await runTest('should apply formatting to selection', async () => {
    await setup();
    const editor = new UnifiedEditor(
      testDocument,
      mockSyncEngine as any,
      mockSupabaseClient as any
    );

    // Set a selection
    await editor.setSelection(0, 7); // Select "Initial"
    
    const formatType = 'bold';
    const formatValue = true;
    const result = await editor.applyFormatting(formatType, formatValue);

    assertEqual(result.success, true, 'applyFormatting should succeed');
    await teardown();
  });

  // Test 11: Event listeners
  await runTest('should add and remove event listeners', async () => {
    await setup();
    const editor = new UnifiedEditor(
      testDocument,
      mockSyncEngine as any,
      mockSupabaseClient as any
    );

    let eventCount = 0;
    const listener = () => {
      eventCount++;
    };

    // Add listener
    editor.addEventListener('contentChanged', listener);
    
    // Trigger an event
    await editor.insertText(0, 'Test ');
    
    // Remove listener
    editor.removeEventListener('contentChanged', listener);
    
    // Trigger another event
    await editor.insertText(0, 'Another ');
    
    // Event count should be 1 (only the first insert triggered the listener)
    assertEqual(eventCount, 1, 'Only first event should trigger listener');
    await teardown();
  });

  // Test 12: Cleanup
  await runTest('should destroy editor without errors', async () => {
    await setup();
    const editor = new UnifiedEditor(
      testDocument,
      mockSyncEngine as any,
      mockSupabaseClient as any
    );

    // Perform some operations
    await editor.insertText(0, 'Test ');
    await editor.setSelection(0, 5);

    // Destroy should not throw
    editor.destroy();
    await teardown();
  });

  console.log('\n=== All UnifiedEditor tests completed ===');
}

// Run the tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runUnifiedEditorTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export { runUnifiedEditorTests };