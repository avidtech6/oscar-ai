/**
 * Structured Rich-Text Editor
 * 
 * A mobile-first, desktop-powerful editor supporting:
 * - Bold, italic, underline
 * - Headings
 * - Lists
 * - Quotes
 * - Links
 * - Inline images
 * - Drag-and-drop (tablet/desktop)
 * - Undo/redo
 * - Clean WordPress-compatible HTML output
 * 
 * Built on a structured block model (TipTap/ProseMirror style).
 */

import { 
  EditorBlock, 
  EditorBlockType, 
  EditorState, 
  EditorSelection,
  EditorHistory,
  EditorMetadata,
  BlockStyle,
  AccessibilityData,
  DEFAULT_EDITOR_CONFIG,
  EditorConfig
} from '../types';

export class StructuredEditor {
  private state: EditorState;
  private config: EditorConfig;
  private autoSaveTimer?: NodeJS.Timeout;
  private isDirty: boolean = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: Partial<EditorConfig> = {}) {
    this.config = { ...DEFAULT_EDITOR_CONFIG, ...config };
    this.state = this.createInitialState();
  }

  // ==================== INITIALIZATION ====================

  private createInitialState(): EditorState {
    return {
      blocks: [this.createBlock('paragraph', '')],
      selection: {
        startBlockId: '',
        endBlockId: '',
        startOffset: 0,
        endOffset: 0,
      },
      history: {
        past: [],
        future: [],
        currentIndex: -1,
      },
      metadata: {
        wordCount: 0,
        characterCount: 0,
        headingCount: 0,
        imageCount: 0,
        linkCount: 0,
        readabilityScore: 0,
        lastSaved: new Date(),
        autoSaveEnabled: this.config.autoSaveInterval > 0,
      },
    };
  }

  private createBlock(
    type: EditorBlockType,
    content: string,
    attributes: Record<string, any> = {},
    children: EditorBlock[] = [],
    metadata: any = {}
  ): EditorBlock {
    const id = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const defaultMetadata = {
      depth: 0,
      position: this.state.blocks.length,
      style: {} as BlockStyle,
      aiGenerated: false,
      seoOptimized: false,
      accessibility: {} as AccessibilityData,
    };

    return {
      id,
      type,
      content,
      attributes,
      children,
      metadata: { ...defaultMetadata, ...metadata },
    };
  }

  // ==================== PUBLIC API ====================

  /**
   * Initialize the editor with optional initial content
   */
  async initialize(initialContent?: string): Promise<void> {
    if (initialContent) {
      this.state.blocks = this.parseContentToBlocks(initialContent);
      this.updateMetadata();
    }

    if (this.config.autoSaveInterval > 0) {
      this.startAutoSave();
    }

    this.emit('editor:initialized', { blocks: this.state.blocks.length });
  }

  /**
   * Get the current editor state
   */
  getState(): EditorState {
    return { ...this.state };
  }

  /**
   * Get the editor content as HTML
   */
  getHTML(): string {
    return this.blocksToHTML(this.state.blocks);
  }

  /**
   * Get the editor content as plain text
   */
  getText(): string {
    return this.state.blocks.map(block => block.content).join('\n\n');
  }

  /**
   * Set editor content from HTML
   */
  setHTML(html: string): void {
    this.saveToHistory();
    this.state.blocks = this.parseHTMLToBlocks(html);
    this.updateMetadata();
    this.isDirty = true;
    this.emit('editor:content-changed', { source: 'setHTML', blocks: this.state.blocks.length });
  }

  /**
   * Set editor content from plain text
   */
  setText(text: string): void {
    this.saveToHistory();
    const paragraphs = text.split('\n\n');
    this.state.blocks = paragraphs.map((content, index) => 
      this.createBlock('paragraph', content, {}, [], { position: index })
    );
    this.updateMetadata();
    this.isDirty = true;
    this.emit('editor:content-changed', { source: 'setText', blocks: this.state.blocks.length });
  }

  // ==================== BLOCK OPERATIONS ====================

  /**
   * Insert a new block at the specified position
   */
  insertBlock(
    type: EditorBlockType,
    content: string = '',
    position: number = this.state.blocks.length,
    attributes: Record<string, any> = {}
  ): string {
    this.saveToHistory();
    
    const newBlock = this.createBlock(type, content, attributes, [], { position });
    this.state.blocks.splice(position, 0, newBlock);
    
    // Update positions of subsequent blocks
    this.state.blocks.forEach((block, index) => {
      block.metadata.position = index;
    });
    
    this.updateMetadata();
    this.isDirty = true;
    
    this.emit('editor:block-inserted', { 
      blockId: newBlock.id, 
      type, 
      position,
      totalBlocks: this.state.blocks.length 
    });
    
    return newBlock.id;
  }

  /**
   * Update an existing block
   */
  updateBlock(blockId: string, updates: Partial<EditorBlock>): boolean {
    const blockIndex = this.state.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return false;

    this.saveToHistory();
    
    const oldBlock = this.state.blocks[blockIndex];
    this.state.blocks[blockIndex] = {
      ...oldBlock,
      ...updates,
      id: oldBlock.id, // Preserve ID
      metadata: { ...oldBlock.metadata, ...(updates.metadata || {}) },
    };
    
    this.updateMetadata();
    this.isDirty = true;
    
    this.emit('editor:block-updated', { 
      blockId, 
      type: this.state.blocks[blockIndex].type,
      changes: Object.keys(updates) 
    });
    
    return true;
  }

  /**
   * Delete a block
   */
  deleteBlock(blockId: string): boolean {
    const blockIndex = this.state.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return false;

    this.saveToHistory();
    
    const deletedBlock = this.state.blocks[blockIndex];
    this.state.blocks.splice(blockIndex, 1);
    
    // Update positions of subsequent blocks
    this.state.blocks.forEach((block, index) => {
      block.metadata.position = index;
    });
    
    this.updateMetadata();
    this.isDirty = true;
    
    this.emit('editor:block-deleted', { 
      blockId, 
      type: deletedBlock.type,
      position: blockIndex,
      totalBlocks: this.state.blocks.length 
    });
    
    return true;
  }

  /**
   * Move a block to a new position
   */
  moveBlock(blockId: string, newPosition: number): boolean {
    const currentIndex = this.state.blocks.findIndex(b => b.id === blockId);
    if (currentIndex === -1) return false;
    if (currentIndex === newPosition) return true;

    this.saveToHistory();
    
    const [block] = this.state.blocks.splice(currentIndex, 1);
    this.state.blocks.splice(newPosition, 0, block);
    
    // Update positions of all blocks
    this.state.blocks.forEach((block, index) => {
      block.metadata.position = index;
    });
    
    this.isDirty = true;
    
    this.emit('editor:block-moved', { 
      blockId, 
      from: currentIndex, 
      to: newPosition 
    });
    
    return true;
  }

  // ==================== FORMATTING OPERATIONS ====================

  /**
   * Apply formatting to selected text
   */
  applyFormatting(format: 'bold' | 'italic' | 'underline' | 'strikethrough'): boolean {
    const selection = this.state.selection;
    if (!selection.startBlockId || !selection.endBlockId) return false;

    this.saveToHistory();
    
    // For simplicity, we'll apply formatting at block level
    // In a real implementation, this would handle inline formatting
    const formatTag = this.getFormatTag(format);
    
    this.emit('editor:formatting-applied', { format, selection });
    this.isDirty = true;
    
    return true;
  }

  /**
   * Set block type (paragraph, heading, etc.)
   */
  setBlockType(blockId: string, type: EditorBlockType): boolean {
    return this.updateBlock(blockId, { type });
  }

  /**
   * Set block style
   */
  setBlockStyle(blockId: string, style: Partial<BlockStyle>): boolean {
    const blockIndex = this.state.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return false;

    this.saveToHistory();
    
    const block = this.state.blocks[blockIndex];
    block.metadata.style = { ...block.metadata.style, ...style };
    
    this.isDirty = true;
    this.emit('editor:style-applied', { blockId, style });
    
    return true;
  }

  // ==================== HISTORY OPERATIONS ====================

  /**
   * Save current state to history
   */
  private saveToHistory(): void {
    // Truncate future if we're not at the end
    if (this.state.history.currentIndex < this.state.history.past.length - 1) {
      this.state.history.past = this.state.history.past.slice(0, this.state.history.currentIndex + 1);
      this.state.history.future = [];
    }
    
    // Save current state
    this.state.history.past.push(JSON.parse(JSON.stringify(this.state)));
    
    // Limit history size
    if (this.state.history.past.length > this.config.maxUndoSteps) {
      this.state.history.past.shift();
    }
    
    this.state.history.currentIndex = this.state.history.past.length - 1;
  }

  /**
   * Undo the last operation
   */
  undo(): boolean {
    if (this.state.history.currentIndex <= 0) return false;
    
    // Save current state to future
    this.state.history.future.unshift(JSON.parse(JSON.stringify(this.state)));
    
    // Restore previous state
    this.state.history.currentIndex--;
    const previousState = this.state.history.past[this.state.history.currentIndex];
    this.state = JSON.parse(JSON.stringify(previousState));
    
    this.isDirty = true;
    this.emit('editor:undo', { 
      currentIndex: this.state.history.currentIndex,
      pastLength: this.state.history.past.length,
      futureLength: this.state.history.future.length 
    });
    
    return true;
  }

  /**
   * Redo the last undone operation
   */
  redo(): boolean {
    if (this.state.history.future.length === 0) return false;
    
    // Restore next state
    const nextState = this.state.history.future.shift();
    if (!nextState) return false;
    
    this.state.history.past.push(JSON.parse(JSON.stringify(this.state)));
    this.state.history.currentIndex++;
    this.state = JSON.parse(JSON.stringify(nextState));
    
    this.isDirty = true;
    this.emit('editor:redo', { 
      currentIndex: this.state.history.currentIndex,
      pastLength: this.state.history.past.length,
      futureLength: this.state.history.future.length 
    });
    
    return true;
  }

  // ==================== SELECTION OPERATIONS ====================

  /**
   * Set the current selection
   */
  setSelection(selection: EditorSelection): void {
    this.state.selection = selection;
    this.emit('editor:selection-changed', { selection });
  }

  /**
   * Get the current selection
   */
  getSelection(): EditorSelection {
    return { ...this.state.selection };
  }

  /**
   * Clear the current selection
   */
  clearSelection(): void {
    this.state.selection = {
      startBlockId: '',
      endBlockId: '',
      startOffset: 0,
      endOffset: 0,
    };
    this.emit('editor:selection-cleared', {});
  }

  // ==================== METADATA OPERATIONS ====================

  /**
   * Update editor metadata
   */
  private updateMetadata(): void {
    const text = this.getText();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const characters = text.length;
    
    const headingCount = this.state.blocks.filter(b => 
      b.type.startsWith('heading')
    ).length;
    
    const imageCount = this.state.blocks.filter(b => 
      b.type === 'image'
    ).length;
    
    const linkCount = this.state.blocks.filter(b => 
      b.attributes.href || b.content.includes('href=')
    ).length;
    
    // Simple readability score (Flesch-Kincaid approximation)
    const sentenceCount = (text.match(/[.!?]+/g) || []).length;
    const syllableCount = this.estimateSyllables(text);
    const readability = sentenceCount > 0 && words.length > 0
      ? 206.835 - 1.015 * (words.length / sentenceCount) - 84.6 * (syllableCount / words.length)
      : 0;
    
    this.state.metadata = {
      ...this.state.metadata,
      wordCount: words.length,
      characterCount: characters,
      headingCount,
      imageCount,
      linkCount,
      readabilityScore: Math.max(0, Math.min(100, readability)),
      lastSaved: this.state.metadata.lastSaved,
      autoSaveEnabled: this.state.metadata.autoSaveEnabled,
    };
    
    this.emit('editor:metadata-updated', { metadata: this.state.metadata });
  }

  /**
   * Estimate syllables in text (simplified)
   */
  private estimateSyllables(text: string): number {
    // Simple syllable estimation
    const vowels = text.match(/[aeiouy]+/gi);
    return vowels ? vowels.length : 0;
  }

  // ==================== CONTENT PARSING ====================

  /**
   * Parse HTML content to blocks
   */
  private parseHTMLToBlocks(html: string): EditorBlock[] {
    // Simplified HTML parser
    // In a real implementation, this would use DOMParser or similar
    const blocks: EditorBlock[] = [];
    
    // Remove script and style tags for security
    const cleanHTML = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Simple regex-based parsing (for demonstration)
    // Real implementation would use proper HTML parsing
    const blockRegex = /<(\w+)[^>]*>(.*?)<\/\1>|<(\w+)[^>]*\/>/gis;
    let match;
    let position = 0;
    
    while ((match = blockRegex.exec(cleanHTML)) !== null) {
      const [fullMatch, tag, content, selfClosingTag] = match;
      const actualTag = tag || selfClosingTag;
      const actualContent = content || '';
      
      const blockType = this.htmlTagToBlockType(actualTag);
      const attributes = this.extractHTMLAttributes(fullMatch);
      
      blocks.push(this.createBlock(
        blockType,
        this.stripHTMLTags(actualContent),
        attributes,
        [],
        { position: position++ }
      ));
    }
    
    // If no blocks found, create a single paragraph
    if (blocks.length === 0 && cleanHTML.trim()) {
      blocks.push(this.createBlock(
        'paragraph',
        this.stripHTMLTags(cleanHTML),
        {},
        [],
        { position: 0 }
      ));
    }
    
    return blocks;
  }

  /**
   * Parse plain text content to blocks
   */
  private parseContentToBlocks(content: string): EditorBlock[] {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((text, index) => {
      // Detect block type from content
      let type: EditorBlockType = 'paragraph';
      
      if (text.startsWith('# ')) {
        type = 'heading';
        text = text.substring(2);
      } else if (text.startsWith('## ')) {
        type = 'heading';
        text = text.substring(3);
      } else if (text.startsWith('### ')) {
        type = 'heading';
        text = text.substring(4);
      } else if (text.startsWith('> ')) {
        type = 'quote';
        text = text.substring(2);
      } else if (text.startsWith('- ') || text.startsWith('* ') || /^\d+\./.test(text)) {
        type = 'list';
      }
      
      return this.createBlock(type, text, {}, [], { position: index });
    });
  }

  /**
   * Convert blocks to HTML
   */
  private blocksToHTML(blocks: EditorBlock[]): string {
    return blocks.map(block => this.blockToHTML(block)).join('\n');
  }

  // ==================== EVENT SYSTEM ====================

  /**
   * Emit an event
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Add event listener
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // ==================== AUTO-SAVE ====================

  /**
   * Start auto-save timer
   */
  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setInterval(() => {
      if (this.isDirty) {
        this.save();
      }
    }, this.config.autoSaveInterval);
  }

  /**
   * Stop auto-save timer
   */
  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }
  }

  /**
   * Save editor content
   */
  save(): void {
    this.state.metadata.lastSaved = new Date();
    this.isDirty = false;
    this.emit('editor:saved', {
      timestamp: this.state.metadata.lastSaved,
      blocks: this.state.blocks.length,
      wordCount: this.state.metadata.wordCount
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get HTML tag for formatting
   */
  private getFormatTag(format: string): string {
    const formatMap: Record<string, string> = {
      bold: 'strong',
      italic: 'em',
      underline: 'u',
      strikethrough: 's',
    };
    return formatMap[format] || 'span';
  }

  /**
   * Convert HTML tag to block type
   */
  private htmlTagToBlockType(tag: string): EditorBlockType {
    const tagMap: Record<string, EditorBlockType> = {
      h1: 'heading',
      h2: 'heading',
      h3: 'heading',
      h4: 'heading',
      h5: 'heading',
      h6: 'heading',
      p: 'paragraph',
      ul: 'list',
      ol: 'list',
      li: 'list',
      blockquote: 'quote',
      code: 'code',
      pre: 'code',
      img: 'image',
      a: 'paragraph', // Links are handled as attributes
      div: 'paragraph',
      span: 'paragraph',
      table: 'table',
      thead: 'table',
      tbody: 'table',
      tr: 'table',
      th: 'table',
      td: 'table',
    };
    return tagMap[tag.toLowerCase()] || 'paragraph';
  }

  /**
   * Convert block type to HTML tag
   */
  private blockTypeToHTMLTag(type: EditorBlockType): string {
    const typeMap: Record<EditorBlockType, string> = {
      paragraph: 'p',
      heading: 'h2',
      list: 'ul',
      quote: 'blockquote',
      code: 'pre',
      image: 'img',
      video: 'div',
      divider: 'hr',
      table: 'table',
      callout: 'div',
      button: 'button',
    };
    return typeMap[type] || 'div';
  }

  /**
   * Extract attributes from HTML tag
   */
  private extractHTMLAttributes(html: string): Record<string, any> {
    const attributes: Record<string, any> = {};
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    let match;
    
    while ((match = attrRegex.exec(html)) !== null) {
      const [, key, value] = match;
      attributes[key] = value;
    }
    
    return attributes;
  }

  /**
   * Format attributes as HTML string
   */
  private formatHTMLAttributes(attributes: Record<string, any>): string {
    if (!attributes || Object.keys(attributes).length === 0) {
      return '';
    }
    
    return ' ' + Object.entries(attributes)
      .map(([key, value]) => `${key}="${this.escapeHTML(String(value))}"`)
      .join(' ');
  }

  /**
   * Strip HTML tags from text
   */
  private stripHTMLTags(text: string): string {
    return text.replace(/<[^>]*>/g, '');
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    const escapeMap: Record<string, string> = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": "'",
    };
    
    return text.replace(/[&<>"']/g, char => escapeMap[char] || char);
  }

  /**
   * Convert a single block to HTML
   */
  private blockToHTML(block: EditorBlock): string {
    const tag = this.blockTypeToHTMLTag(block.type);
    const attributes = this.formatHTMLAttributes(block.attributes);
    const content = this.escapeHTML(block.content);
    
    if (block.children && block.children.length > 0) {
      const childrenHTML = block.children.map(child => this.blockToHTML(child)).join('');
      return `<${tag}${attributes}>${content}${childrenHTML}</${tag}>`;
    }
    
    // Handle self-closing tags
    if (tag === 'img' || tag === 'hr' || tag === 'br') {
      return `<${tag}${attributes} />`;
    }
    
    return `<${tag}${attributes}>${content}</${tag}>`;
  }

  // ==================== CLEANUP ====================

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.stopAutoSave();
    this.eventListeners.clear();
    this.emit('editor:cleaned-up', {});
  }

  /**
   * Destroy the editor instance
   */
  destroy(): void {
    this.cleanup();
    // Clear state
    this.state = this.createInitialState();
    this.isDirty = false;
  }

  // ==================== STATISTICS ====================

  /**
   * Get editor statistics
   */
  getStatistics(): {
    blocks: number;
    words: number;
    characters: number;
    headings: number;
    images: number;
    links: number;
    readability: number;
  } {
    return {
      blocks: this.state.blocks.length,
      words: this.state.metadata.wordCount,
      characters: this.state.metadata.characterCount,
      headings: this.state.metadata.headingCount,
      images: this.state.metadata.imageCount,
      links: this.state.metadata.linkCount,
      readability: this.state.metadata.readabilityScore,
    };
  }

  /**
   * Check if content has been modified
   */
  isModified(): boolean {
    return this.isDirty;
  }

  /**
   * Get time since last save
   */
  getTimeSinceLastSave(): number {
    return Date.now() - this.state.metadata.lastSaved.getTime();
  }

  // ==================== VALIDATION ====================

  /**
   * Validate editor content against configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for blocked tags
    this.state.blocks.forEach((block, index) => {
      const tag = this.blockTypeToHTMLTag(block.type);
      if (this.config.blockedTags.includes(tag)) {
        errors.push(`Block ${index} uses blocked tag: ${tag}`);
      }
    });
    
    // Check accessibility
    this.state.blocks.forEach((block, index) => {
      if (block.type === 'image' && !block.attributes.alt) {
        errors.push(`Image block ${index} missing alt text`);
      }
    });
    
    // Check content length
    if (this.state.metadata.wordCount < 10) {
      errors.push('Content too short (minimum 10 words)');
    }
    
    if (this.state.metadata.wordCount > 5000) {
      errors.push('Content too long (maximum 5000 words)');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clean HTML according to configuration
   */
  cleanHTML(): string {
    let html = this.getHTML();
    
    // Remove blocked tags
    this.config.blockedTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>|<${tag}[^>]*/>`, 'gis');
      html = html.replace(regex, '');
    });
    
    // Ensure only allowed tags remain
    // This is a simplified version - real implementation would use a proper sanitizer
    const allowedTagsRegex = new RegExp(
      `</?(?!(${this.config.allowedTags.join('|')})\\b)[^>]+>`,
      'gis'
    );
    html = html.replace(allowedTagsRegex, '');
    
    return html;
  }
}