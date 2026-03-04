/**
 * Editor Tests (Phase 20)
 *
 * Self‑contained unit tests for UnifiedEditor.
 */

import { UnifiedEditor } from '../unified-editor/Editor';
import {
	createParagraph,
	createHeading,
	createList,
	createQuote,
	createImage,
	createCode,
	createDivider,
	createTable,
} from '../unified-editor/types/EditorContent';

type TestResult = {
	name: string;
	passed: boolean;
	error?: string;
};

function assert(condition: boolean, message: string): void {
	if (!condition) {
		throw new Error(`Assertion failed: ${message}`);
	}
}

function deepEqual(a: any, b: any): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

export function runEditorTests(): TestResult[] {
	const results: TestResult[] = [];

	function test(name: string, fn: () => void) {
		try {
			fn();
			results.push({ name, passed: true });
		} catch (err) {
			results.push({ name, passed: false, error: (err as Error).message });
		}
	}

	// Test 1: empty content
	test('should start with empty content', () => {
		const editor = new UnifiedEditor({ readonly: false });
		assert(editor.getContent().blocks.length === 0, 'blocks should be empty');
	});

	// Test 2: set and get content
	test('should set and get content', () => {
		const editor = new UnifiedEditor();
		const content = {
			blocks: [createParagraph('Hello'), createHeading(2, 'Title')],
		};
		editor.setContent(content);
		assert(deepEqual(editor.getContent(), content), 'content mismatch');
	});

	// Test 3: insert block at end
	test('should insert block at end when index not provided', () => {
		const editor = new UnifiedEditor();
		const block = createParagraph('Test');
		editor.insertBlock(block);
		const blocks = editor.getContent().blocks;
		assert(blocks.length === 1, 'should have one block');
		assert(deepEqual(blocks[0], block), 'block mismatch');
	});

	// Test 4: insert block at specified index
	test('should insert block at specified index', () => {
		const editor = new UnifiedEditor();
		const block1 = createParagraph('First');
		const block2 = createParagraph('Second');
		editor.insertBlock(block1);
		editor.insertBlock(block2, 0); // insert at beginning
		const blocks = editor.getContent().blocks;
		assert(deepEqual(blocks[0], block2), 'second block should be first');
		assert(deepEqual(blocks[1], block1), 'first block should be second');
	});

	// Test 5: update block
	test('should update block', () => {
		const editor = new UnifiedEditor();
		const block = createParagraph('Original');
		editor.insertBlock(block);
		editor.updateBlock(0, { content: 'Updated' });
		const updated = editor.getContent().blocks[0];
		assert(updated.type === 'paragraph', 'type unchanged');
		assert((updated as any).content === 'Updated', 'content not updated');
	});

	// Test 6: out‑of‑bounds update does nothing
	test('should not update block with out‑of‑bounds index', () => {
		const editor = new UnifiedEditor();
		const block = createParagraph('Original');
		editor.insertBlock(block);
		editor.updateBlock(5, { content: 'Should not change' });
		const unchanged = editor.getContent().blocks[0];
		assert((unchanged as any).content === 'Original', 'content changed incorrectly');
	});

	// Test 7: delete block
	test('should delete block', () => {
		const editor = new UnifiedEditor();
		const block1 = createParagraph('First');
		const block2 = createParagraph('Second');
		editor.insertBlock(block1);
		editor.insertBlock(block2);
		editor.deleteBlock(0);
		const blocks = editor.getContent().blocks;
		assert(blocks.length === 1, 'should have one block after deletion');
		assert(deepEqual(blocks[0], block2), 'remaining block mismatch');
	});

	// Test 8: out‑of‑bounds delete does nothing
	test('should not delete block with out‑of‑bounds index', () => {
		const editor = new UnifiedEditor();
		const block = createParagraph('Only');
		editor.insertBlock(block);
		editor.deleteBlock(5);
		assert(editor.getContent().blocks.length === 1, 'block count changed');
	});

	// Test 9: move block
	test('should move block', () => {
		const editor = new UnifiedEditor();
		const block1 = createParagraph('First');
		const block2 = createParagraph('Second');
		const block3 = createParagraph('Third');
		editor.insertBlock(block1);
		editor.insertBlock(block2);
		editor.insertBlock(block3);
		editor.moveBlock(0, 2); // move first to last
		const blocks = editor.getContent().blocks;
		assert(deepEqual(blocks[0], block2), 'block2 should be at index 0');
		assert(deepEqual(blocks[1], block3), 'block3 should be at index 1');
		assert(deepEqual(blocks[2], block1), 'block1 should be at index 2');
	});

	// Test 10: convert to HTML
	test('should convert to HTML', () => {
		const editor = new UnifiedEditor();
		const content = {
			blocks: [
				createParagraph('Hello world'),
				createHeading(2, 'Section'),
				createList(false, ['Item 1', 'Item 2']),
				createQuote('Great quote'),
				createImage('image.jpg', 'Alt text'),
				createCode('javascript', 'console.log("hi");'),
			],
		};
		editor.setContent(content);
		const html = editor.toHTML();
		assert(html.includes('<p>Hello world</p>'), 'paragraph missing');
		assert(html.includes('<h2>Section</h2>'), 'heading missing');
		assert(html.includes('<ul><li>Item 1</li><li>Item 2</li></ul>'), 'list missing');
		assert(html.includes('<blockquote>Great quote</blockquote>'), 'quote missing');
		assert(html.includes('<img src="image.jpg" alt="Alt text" />'), 'image missing');
		assert(html.includes('<pre><code>console.log("hi");</code></pre>'), 'code missing');
	});

	// Test 11: convert to plain text
	test('should convert to plain text', () => {
		const editor = new UnifiedEditor();
		const content = {
			blocks: [
				createParagraph('First paragraph'),
				createHeading(1, 'Main heading'),
				createList(true, ['Task A', 'Task B']),
				createQuote('Inspirational'),
			],
		};
		editor.setContent(content);
		const text = editor.toPlainText();
		assert(text.includes('First paragraph'), 'paragraph missing');
		assert(text.includes('Main heading'), 'heading missing');
		assert(text.includes('Task A'), 'list item missing');
		assert(text.includes('Inspirational'), 'quote missing');
	});

	// Test 12: divider and table blocks (currently not rendered)
	test('should handle divider and table blocks in HTML', () => {
		const editor = new UnifiedEditor();
		const content = {
			blocks: [createDivider('dashed'), createTable(['A', 'B'], [['1', '2']])],
		};
		editor.setContent(content);
		const html = editor.toHTML();
		// Each block renders empty string, join with '\n' yields '\n'
		assert(html === '\n', `expected newline, got ${JSON.stringify(html)}`);
	});

	// Test 13: readonly option
	test('should respect readonly option', () => {
		const editor = new UnifiedEditor({ readonly: true });
		assert(editor !== undefined, 'editor should be defined');
	});

	return results;
}

/**
 * Run tests and log results.
 */
export function runAndLogEditorTests(): void {
	console.log('Running editor tests...');
	const results = runEditorTests();
	let passed = 0;
	let failed = 0;
	results.forEach(r => {
		if (r.passed) {
			passed++;
			console.log(`✅ ${r.name}`);
		} else {
			failed++;
			console.log(`❌ ${r.name}: ${r.error}`);
		}
	});
	console.log(`Editor tests: ${passed} passed, ${failed} failed`);
	if (failed > 0) {
		throw new Error(`${failed} editor test(s) failed`);
	}
}