import { supabase } from '$lib/supabase/client';
import { HAS_VALID_SUPABASE } from '$lib/config/keys';
import type { Note } from '$lib/db';
import { dummyNotes } from '$lib/dummy/dummyData';

export interface SupabaseNote {
	id: string;
	project_id: string;
	title: string;
	content: string;
	type: 'general' | 'voice' | 'field';
	tags: string[];
	transcript?: string;
	is_dummy: boolean;
	user_id: string;
	created_at: string;
	updated_at: string;
}

export async function getNotes(projectId: string): Promise<Note[]> {
	// If Supabase is not configured, return dummy data
	if (!HAS_VALID_SUPABASE) {
		console.warn('Supabase not configured, returning dummy notes');
		const filteredDummyNotes = dummyNotes.filter(note => note.projectId === projectId || !projectId);
		return convertDummyNotesToNotes(filteredDummyNotes);
	}

	try {
		const { data, error } = await supabase
			.from('notes')
			.select('*')
			.eq('project_id', projectId)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching notes:', error);
			// Fall back to dummy data on error
			const filteredDummyNotes = dummyNotes.filter(note => note.projectId === projectId || !projectId);
			return convertDummyNotesToNotes(filteredDummyNotes);
		}

		return (data as SupabaseNote[]).map(mapSupabaseNoteToNote);
	} catch (error) {
		console.error('Error in getNotes:', error);
		// Fall back to dummy data on error
		const filteredDummyNotes = dummyNotes.filter(note => note.projectId === projectId || !projectId);
		return convertDummyNotesToNotes(filteredDummyNotes);
	}
}

export async function getNoteById(noteId: string): Promise<Note | null> {
	try {
		const { data, error } = await supabase
			.from('notes')
			.select('*')
			.eq('id', noteId)
			.single();

		if (error) {
			console.error('Error fetching note:', error);
			return null;
		}

		return mapSupabaseNoteToNote(data as SupabaseNote);
	} catch (error) {
		console.error('Error in getNoteById:', error);
		return null;
	}
}

export async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
	try {
		const supabaseNote: any = {
			project_id: note.projectId || '',
			title: note.title,
			content: note.content,
			type: note.type,
			tags: note.tags || [],
			is_dummy: note.isDummy || false
		};
		
		// Only add transcript if it exists
		if (note.transcript !== undefined) {
			supabaseNote.transcript = note.transcript;
		}

		const { data, error } = await supabase
			.from('notes')
			.insert(supabaseNote)
			.select()
			.single();

		if (error) {
			console.error('Error creating note:', error);
			return null;
		}

		return (data as SupabaseNote).id;
	} catch (error) {
		console.error('Error in createNote:', error);
		return null;
	}
}

export async function updateNote(noteId: string, updates: Partial<Note>): Promise<boolean> {
	try {
		const supabaseUpdates: any = {};
		
		if (updates.title !== undefined) supabaseUpdates.title = updates.title;
		if (updates.content !== undefined) supabaseUpdates.content = updates.content;
		if (updates.type !== undefined) supabaseUpdates.type = updates.type;
		if (updates.tags !== undefined) supabaseUpdates.tags = updates.tags;
		if (updates.transcript !== undefined) supabaseUpdates.transcript = updates.transcript;
		
		// Always update updated_at
		supabaseUpdates.updated_at = new Date().toISOString();

		const { error } = await supabase
			.from('notes')
			.update(supabaseUpdates)
			.eq('id', noteId);

		if (error) {
			console.error('Error updating note:', error);
			return false;
		}

		return true;
	} catch (error) {
		console.error('Error in updateNote:', error);
		return false;
	}
}

export async function deleteNote(noteId: string): Promise<boolean> {
	try {
		const { error } = await supabase
			.from('notes')
			.delete()
			.eq('id', noteId);

		if (error) {
			console.error('Error deleting note:', error);
			return false;
		}

		return true;
	} catch (error) {
		console.error('Error in deleteNote:', error);
		return false;
	}
}

export async function getNotesByTag(tag: string): Promise<Note[]> {
	try {
		const { data, error } = await supabase
			.from('notes')
			.select('*')
			.contains('tags', [tag])
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching notes by tag:', error);
			return [];
		}

		return (data as SupabaseNote[]).map(mapSupabaseNoteToNote);
	} catch (error) {
		console.error('Error in getNotesByTag:', error);
		return [];
	}
}

function mapSupabaseNoteToNote(supabaseNote: SupabaseNote): Note {
	return {
		id: supabaseNote.id,
		projectId: supabaseNote.project_id,
		title: supabaseNote.title,
		content: supabaseNote.content,
		type: supabaseNote.type,
		tags: supabaseNote.tags || [],
		transcript: supabaseNote.transcript,
		isDummy: supabaseNote.is_dummy,
		createdAt: new Date(supabaseNote.created_at),
		updatedAt: new Date(supabaseNote.updated_at)
	};
}

function mapNoteToSupabaseNote(note: Note): Partial<SupabaseNote> {
	const result: any = {
		project_id: note.projectId || '',
		title: note.title,
		content: note.content,
		type: note.type,
		tags: note.tags || [],
		is_dummy: note.isDummy || false
	};
	
	// Only add transcript if it exists
	if (note.transcript !== undefined) {
		result.transcript = note.transcript;
	}
	
	return result;
}

// Helper function to convert dummy notes to full Note objects
function convertDummyNotesToNotes(dummyNotes: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>[]): Note[] {
	const now = new Date();
	return dummyNotes.map((dummyNote, index) => ({
		...dummyNote,
		id: `dummy-note-${index}`,
		createdAt: now,
		updatedAt: now
	}));
}