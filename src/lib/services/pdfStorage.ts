import { supabase } from '$lib/supabase/client';

export interface PdfDocument {
  id?: string;
  title: string;
  original_pdf?: string; // base64 encoded PDF
  html_content: string;
  metadata: {
    pageCount: number;
    author?: string;
    creationDate?: string;
    coverImage?: string;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

/**
 * Save a PDF document to Supabase
 */
export async function savePdfDocument(doc: PdfDocument): Promise<string> {
  try {
    const documentToSave = {
      ...doc,
      updated_at: new Date().toISOString(),
      created_at: doc.created_at || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('pdf_documents')
      .upsert(documentToSave as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save PDF document: ${error.message}`);
    }

    return (data as any).id;
  } catch (error) {
    console.error('Error saving PDF document:', error);
    throw error;
  }
}

/**
 * Load a PDF document by ID
 */
export async function loadPdfDocument(id: string): Promise<PdfDocument> {
  try {
    const { data, error } = await supabase
      .from('pdf_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to load PDF document: ${error.message}`);
    }

    return data as PdfDocument;
  } catch (error) {
    console.error('Error loading PDF document:', error);
    throw error;
  }
}

/**
 * List all PDF documents
 */
export async function listPdfDocuments(): Promise<PdfDocument[]> {
  try {
    const { data, error } = await supabase
      .from('pdf_documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list PDF documents: ${error.message}`);
    }

    return data as PdfDocument[];
  } catch (error) {
    console.error('Error listing PDF documents:', error);
    throw error;
  }
}

/**
 * Update a PDF document
 */
export async function updatePdfDocument(id: string, updates: Partial<PdfDocument>): Promise<void> {
  try {
    const { error } = await supabase
      .from('pdf_documents')
      // @ts-ignore - Supabase type mismatch
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update PDF document: ${error.message}`);
    }
  } catch (error) {
    console.error('Error updating PDF document:', error);
    throw error;
  }
}

/**
 * Delete a PDF document
 */
export async function deletePdfDocument(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('pdf_documents')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete PDF document: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting PDF document:', error);
    throw error;
  }
}