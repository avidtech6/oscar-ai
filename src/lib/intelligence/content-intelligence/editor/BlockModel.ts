/**
 * Block Model – structured content blocks for the rich‑text editor.
 */

export type BlockType =
	| 'paragraph'
	| 'heading1'
	| 'heading2'
	| 'heading3'
	| 'bulletList'
	| 'numberedList'
	| 'quote'
	| 'image'
	| 'video'
	| 'divider'
	| 'code';

export interface Block {
	/** Unique identifier */
	id: string;
	/** Block type */
	type: BlockType;
	/** Text content (for text‑based blocks) */
	text: string;
	/** HTML content (for complex blocks) */
	html: string;
	/** Image URL (for image blocks) */
	imageUrl: string | null;
	/** Image alt text */
	imageAlt: string | null;
	/** Video URL (for video blocks) */
	videoUrl: string | null;
	/** List items (for list blocks) */
	listItems: string[];
	/** Metadata (e.g., language for code blocks) */
	metadata: Record<string, string>;
	/** Indentation level (0‑based) */
	indent: number;
	/** Whether the block is selected */
	selected: boolean;
	/** Whether the block is focused */
	focused: boolean;
}

/**
 * Create a new block.
 */
export function createBlock(type: BlockType, text = ''): Block {
	return {
		id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
		type,
		text,
		html: '',
		imageUrl: null,
		imageAlt: null,
		videoUrl: null,
		listItems: [],
		metadata: {},
		indent: 0,
		selected: false,
		focused: false,
	};
}

/**
 * Convert a block to HTML.
 */
export function blockToHTML(block: Block): string {
	switch (block.type) {
		case 'paragraph':
			return `<p>${escapeHTML(block.text)}</p>`;
		case 'heading1':
			return `<h1>${escapeHTML(block.text)}</h1>`;
		case 'heading2':
			return `<h2>${escapeHTML(block.text)}</h2>`;
		case 'heading3':
			return `<h3>${escapeHTML(block.text)}</h3>`;
		case 'bulletList':
			return `<ul>${block.listItems.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
		case 'numberedList':
			return `<ol>${block.listItems.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ol>`;
		case 'quote':
			return `<blockquote>${escapeHTML(block.text)}</blockquote>`;
		case 'image':
			if (!block.imageUrl) return '';
			return `<figure><img src="${block.imageUrl}" alt="${block.imageAlt || ''}" /><figcaption>${escapeHTML(block.text)}</figcaption></figure>`;
		case 'video':
			if (!block.videoUrl) return '';
			return `<video controls src="${block.videoUrl}">${escapeHTML(block.text)}</video>`;
		case 'divider':
			return '<hr />';
		case 'code':
			const lang = block.metadata.language || 'plaintext';
			return `<pre><code class="language-${lang}">${escapeHTML(block.text)}</code></pre>`;
		default:
			return '';
	}
}

/**
 * Convert an array of blocks to a complete HTML document.
 */
export function blocksToHTML(blocks: Block[]): string {
	return blocks.map(block => blockToHTML(block)).join('\n');
}

/**
 * Parse HTML into blocks (simplified).
 */
export function htmlToBlocks(html: string): Block[] {
	// This is a placeholder implementation; a real parser would be more complex.
	const blocks: Block[] = [];
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	doc.body.childNodes.forEach(node => {
		if (node.nodeType === Node.ELEMENT_NODE) {
			const el = node as HTMLElement;
			if (el.tagName === 'P') {
				blocks.push(createBlock('paragraph', el.textContent || ''));
			} else if (el.tagName === 'H1') {
				blocks.push(createBlock('heading1', el.textContent || ''));
			} else if (el.tagName === 'H2') {
				blocks.push(createBlock('heading2', el.textContent || ''));
			} else if (el.tagName === 'H3') {
				blocks.push(createBlock('heading3', el.textContent || ''));
			} else if (el.tagName === 'UL') {
				const listItems = Array.from(el.querySelectorAll('li')).map(li => li.textContent || '');
				const block = createBlock('bulletList', '');
				block.listItems = listItems;
				blocks.push(block);
			} else if (el.tagName === 'OL') {
				const listItems = Array.from(el.querySelectorAll('li')).map(li => li.textContent || '');
				const block = createBlock('numberedList', '');
				block.listItems = listItems;
				blocks.push(block);
			} else if (el.tagName === 'BLOCKQUOTE') {
				blocks.push(createBlock('quote', el.textContent || ''));
			} else if (el.tagName === 'HR') {
				blocks.push(createBlock('divider', ''));
			} else if (el.tagName === 'FIGURE') {
				const img = el.querySelector('img');
				const figcaption = el.querySelector('figcaption');
				const block = createBlock('image', figcaption?.textContent || '');
				block.imageUrl = img?.getAttribute('src') || null;
				block.imageAlt = img?.getAttribute('alt') || null;
				blocks.push(block);
			} else if (el.tagName === 'VIDEO') {
				const src = el.getAttribute('src');
				const block = createBlock('video', el.textContent || '');
				block.videoUrl = src;
				blocks.push(block);
			} else if (el.tagName === 'PRE') {
				const code = el.querySelector('code');
				const block = createBlock('code', code?.textContent || '');
				block.metadata.language = code?.className.replace('language-', '') || 'plaintext';
				blocks.push(block);
			}
		}
	});
	return blocks;
}

/**
 * Escape HTML special characters.
 */
function escapeHTML(text: string): string {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}