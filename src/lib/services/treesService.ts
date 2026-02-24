import { supabase } from '$lib/supabase/client';
import type { Tree } from '$lib/db';

export interface SupabaseTree {
	id: string;
	project_id: string;
	number: string;
	species: string;
	scientific_name: string | null;
	dbh: number | null;
	height: number | null;
	age: string | null;
	category: 'A' | 'B' | 'C' | 'U' | '' | null;
	condition: string | null;
	notes: string | null;
	photos: string[];
	rpa: number | null;
	is_dummy: boolean;
	user_id: string;
	created_at: string;
	updated_at: string;
}

export async function getTrees(projectId: string): Promise<Tree[]> {
	try {
		const { data, error } = await supabase
			.from('trees')
			.select('*')
			.eq('project_id', projectId)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching trees:', error);
			return [];
		}

		return (data as SupabaseTree[]).map(mapSupabaseTreeToTree);
	} catch (error) {
		console.error('Error in getTrees:', error);
		return [];
	}
}

export async function getTreeById(treeId: string): Promise<Tree | null> {
	try {
		const { data, error } = await supabase
			.from('trees')
			.select('*')
			.eq('id', treeId)
			.single();

		if (error) {
			console.error('Error fetching tree:', error);
			return null;
		}

		return mapSupabaseTreeToTree(data as SupabaseTree);
	} catch (error) {
		console.error('Error in getTreeById:', error);
		return null;
	}
}

export async function createTree(tree: Omit<Tree, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
	try {
		const supabaseTree: any = {
			project_id: tree.projectId,
			number: tree.number || '',
			species: tree.species,
			scientific_name: tree.scientificName || null,
			dbh: tree.DBH || null,
			height: tree.height || null,
			age: tree.age || null,
			category: (tree.category as 'A' | 'B' | 'C' | 'U' | '' | null) || null,
			condition: tree.condition || null,
			notes: tree.notes || null,
			photos: tree.photos || [],
			rpa: tree.RPA || null,
			is_dummy: tree.isDummy || false
		};

		const { data, error } = await supabase
			.from('trees')
			.insert(supabaseTree)
			.select()
			.single();

		if (error) {
			console.error('Error creating tree:', error);
			return null;
		}

		return (data as SupabaseTree).id;
	} catch (error) {
		console.error('Error in createTree:', error);
		return null;
	}
}

export async function updateTree(treeId: string, updates: Partial<Tree>): Promise<boolean> {
	try {
		const supabaseUpdates: any = {};
		
		if (updates.number !== undefined) supabaseUpdates.number = updates.number;
		if (updates.species !== undefined) supabaseUpdates.species = updates.species;
		if (updates.scientificName !== undefined) supabaseUpdates.scientific_name = updates.scientificName;
		if (updates.DBH !== undefined) supabaseUpdates.dbh = updates.DBH;
		if (updates.height !== undefined) supabaseUpdates.height = updates.height;
		if (updates.age !== undefined) supabaseUpdates.age = updates.age;
		if (updates.category !== undefined) supabaseUpdates.category = (updates.category as 'A' | 'B' | 'C' | 'U' | '' | null) || null;
		if (updates.condition !== undefined) supabaseUpdates.condition = updates.condition;
		if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
		if (updates.photos !== undefined) supabaseUpdates.photos = updates.photos;
		if (updates.RPA !== undefined) supabaseUpdates.rpa = updates.RPA;
		
		// Always update updated_at
		supabaseUpdates.updated_at = new Date().toISOString();

		const { error } = await supabase
			.from('trees')
			.update(supabaseUpdates)
			.eq('id', treeId);

		if (error) {
			console.error('Error updating tree:', error);
			return false;
		}

		return true;
	} catch (error) {
		console.error('Error in updateTree:', error);
		return false;
	}
}

export async function deleteTree(treeId: string): Promise<boolean> {
	try {
		const { error } = await supabase
			.from('trees')
			.delete()
			.eq('id', treeId);

		if (error) {
			console.error('Error deleting tree:', error);
			return false;
		}

		return true;
	} catch (error) {
		console.error('Error in deleteTree:', error);
		return false;
	}
}

export async function getTreesBySpecies(species: string): Promise<Tree[]> {
	try {
		const { data, error } = await supabase
			.from('trees')
			.select('*')
			.ilike('species', `%${species}%`)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching trees by species:', error);
			return [];
		}

		return (data as SupabaseTree[]).map(mapSupabaseTreeToTree);
	} catch (error) {
		console.error('Error in getTreesBySpecies:', error);
		return [];
	}
}

export async function getTreesByCategory(category: string): Promise<Tree[]> {
	try {
		const { data, error } = await supabase
			.from('trees')
			.select('*')
			.eq('category', category)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching trees by category:', error);
			return [];
		}

		return (data as SupabaseTree[]).map(mapSupabaseTreeToTree);
	} catch (error) {
		console.error('Error in getTreesByCategory:', error);
		return [];
	}
}

function mapSupabaseTreeToTree(supabaseTree: SupabaseTree): Tree {
	return {
		id: supabaseTree.id,
		projectId: supabaseTree.project_id,
		number: supabaseTree.number || '',
		species: supabaseTree.species,
		scientificName: supabaseTree.scientific_name || '',
		DBH: supabaseTree.dbh || 0,
		height: supabaseTree.height || 0,
		age: supabaseTree.age || '',
		category: (supabaseTree.category as 'A' | 'B' | 'C' | 'U' | '') || '',
		condition: supabaseTree.condition || '',
		notes: supabaseTree.notes || '',
		photos: supabaseTree.photos || [],
		RPA: supabaseTree.rpa || 0,
		isDummy: supabaseTree.is_dummy,
		createdAt: new Date(supabaseTree.created_at),
		updatedAt: new Date(supabaseTree.updated_at)
	};
}

function mapTreeToSupabaseTree(tree: Tree): Partial<SupabaseTree> {
	return {
		project_id: tree.projectId,
		number: tree.number || '',
		species: tree.species,
		scientific_name: tree.scientificName || null,
		dbh: tree.DBH || null,
		height: tree.height || null,
		age: tree.age || null,
		category: (tree.category as 'A' | 'B' | 'C' | 'U' | '' | null) || null,
		condition: tree.condition || null,
		notes: tree.notes || null,
		photos: tree.photos || [],
		rpa: tree.RPA || null,
		is_dummy: tree.isDummy || false
	};
}