import { writable, type Writable } from 'svelte/store';
import type { PdfDocument } from '$lib/services/pdfStorage';

export interface PdfEditorState {
  currentDocument: PdfDocument | null;
  htmlContent: string;
  isEditing: boolean;
  selectedSection: string | null;
  outline: Array<{
    id: string;
    title: string;
    level: number;
    page: number;
  }>;
  metadata: {
    title: string;
    author: string;
    pageCount: number;
    [key: string]: any;
  };
}

// Initial state
const initialState: PdfEditorState = {
  currentDocument: null,
  htmlContent: '',
  isEditing: false,
  selectedSection: null,
  outline: [],
  metadata: {
    title: 'Untitled Document',
    author: '',
    pageCount: 0
  }
};

// Create the store
export const pdfEditorState: Writable<PdfEditorState> = writable(initialState);

// Helper functions
export function setHtmlContent(content: string): void {
  pdfEditorState.update(state => ({
    ...state,
    htmlContent: content
  }));
}

export function setCurrentDocument(doc: PdfDocument): void {
  pdfEditorState.update(state => ({
    ...state,
    currentDocument: doc,
    htmlContent: doc.html_content,
    metadata: {
      title: doc.metadata.title || 'Untitled Document',
      author: doc.metadata.author || '',
      ...doc.metadata,
      pageCount: doc.metadata.pageCount || 0
    } as PdfEditorState['metadata']
  }));
}

export function setEditing(isEditing: boolean): void {
  pdfEditorState.update(state => ({
    ...state,
    isEditing
  }));
}

export function setSelectedSection(sectionId: string | null): void {
  pdfEditorState.update(state => ({
    ...state,
    selectedSection: sectionId
  }));
}

export function setOutline(outline: PdfEditorState['outline']): void {
  pdfEditorState.update(state => ({
    ...state,
    outline
  }));
}

export function setMetadata(metadata: Partial<PdfEditorState['metadata']>): void {
  pdfEditorState.update(state => ({
    ...state,
    metadata: { ...state.metadata, ...metadata }
  }));
}

export function resetEditor(): void {
  pdfEditorState.set(initialState);
}

/**
 * Extract outline from HTML content
 */
export function extractOutlineFromHtml(html: string): PdfEditorState['outline'] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3');
  
  const outline: PdfEditorState['outline'] = [];
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    const title = heading.textContent || `Section ${index + 1}`;
    const page = 1; // Simplified - would need to calculate from page markers
    
    outline.push({
      id: `section-${index}`,
      title,
      level,
      page
    });
  });
  
  return outline;
}