import type { Project, Task, Note, Report, Tree } from '../db/index.js';
import { db, createProject, createTask, createNote, saveReport, createTree, deleteAllDummyData, countDummyItems } from '../db/index.js';

// Static dummy dataset matching the real schema exactly
// All items include isDummy: true and all required fields

export const dummyProjects: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[] = [
	{
		name: 'Dummy Project: Urban Park Survey',
		description: 'A comprehensive tree survey of Central Park for biodiversity assessment and management planning.',
		location: 'Central Park, London',
		client: 'London Borough Council',
		isDummy: true
	},
	{
		name: 'Dummy Project: Residential Development',
		description: 'Tree impact assessment for new residential development in Surrey.',
		location: 'Surrey, UK',
		client: 'Greenfield Developers Ltd',
		isDummy: true
	},
	{
		name: 'Dummy Project: Highway Widening',
		description: 'BS5837 survey for highway widening project affecting mature woodland.',
		location: 'M25 Junction 10',
		client: 'National Highways',
		isDummy: true
	}
];

export const dummyTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
	{
		title: 'Complete BS5837 report for Urban Park',
		content: 'Generate the full BS5837 report with all tree data and recommendations.',
		status: 'todo',
		priority: 'high',
		dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
		projectId: '', // Will be set dynamically
		tags: ['report', 'bs5837', 'urgent'],
		isDummy: true
	},
	{
		title: 'Review tree condition assessments',
		content: 'Check all tree condition ratings and update where necessary.',
		status: 'in_progress',
		priority: 'medium',
		tags: ['review', 'quality-check'],
		isDummy: true
	},
	{
		title: 'Schedule client meeting',
		content: 'Arrange meeting with London Borough Council to present findings.',
		status: 'todo',
		priority: 'medium',
		dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
		tags: ['meeting', 'client'],
		isDummy: true
	},
	{
		title: 'Upload field photos',
		content: 'Process and upload all photos from yesterday\'s site visit.',
		status: 'done',
		priority: 'low',
		tags: ['photos', 'upload'],
		isDummy: true
	}
];

export const dummyNotes: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>[] = [
	{
		title: 'Site visit observations',
		content: 'Noticed several trees with signs of decay near the playground. Need to flag for safety assessment.',
		projectId: '', // Will be set dynamically
		tags: ['observation', 'safety', 'decay'],
		type: 'field',
		isDummy: true
	},
	{
		title: 'Client requirements',
		content: 'Client emphasized need for biodiversity net gain in final report. Include specific recommendations for native species planting.',
		tags: ['client', 'requirements', 'biodiversity'],
		type: 'general',
		isDummy: true
	},
	{
		title: 'Voice memo: Tree identification',
		content: 'Identified three mature oak trees near the entrance. All appear healthy with good crown structure.',
		transcript: 'Identified three mature oak trees near the entrance. All appear healthy with good crown structure.',
		tags: ['voice', 'identification', 'oak'],
		type: 'voice',
		isDummy: true
	},
	{
		title: 'Meeting notes with arborist',
		content: 'Discussed potential tree preservation orders for the veteran beech trees. Need to submit TPO application by end of month.',
		tags: ['meeting', 'tpo', 'beech'],
		type: 'general',
		isDummy: true
	}
];

export const dummyReports: Omit<Report, 'id' | 'generatedAt'>[] = [
	{
		projectId: '', // Will be set dynamically
		title: 'BS5837 Tree Survey Report - Central Park',
		type: 'bs5837',
		pdfBlob: new Blob(['Dummy PDF content for BS5837 report'], { type: 'application/pdf' }),
		isDummy: true
	},
	{
		projectId: '', // Will be set dynamically
		title: 'Tree Impact Assessment - Residential Development',
		type: 'impact',
		pdfBlob: new Blob(['Dummy PDF content for impact assessment'], { type: 'application/pdf' }),
		isDummy: true
	}
];

export const dummyTrees: Omit<Tree, 'id' | 'createdAt' | 'updatedAt'>[] = [
	{
		projectId: '', // Will be set dynamically
		number: 'T001',
		species: 'English Oak',
		scientificName: 'Quercus robur',
		DBH: 85,
		height: 22,
		age: 'Mature (80-100 years)',
		category: 'A',
		condition: 'Good',
		photos: [],
		isDummy: true
	},
	{
		projectId: '', // Will be set dynamically
		number: 'T002',
		species: 'Silver Birch',
		scientificName: 'Betula pendula',
		DBH: 35,
		height: 15,
		age: 'Semi-mature (30-40 years)',
		category: 'B',
		condition: 'Fair',
		photos: [],
		isDummy: true
	},
	{
		projectId: '', // Will be set dynamically
		number: 'T003',
		species: 'Common Beech',
		scientificName: 'Fagus sylvatica',
		DBH: 120,
		height: 28,
		age: 'Veteran (150+ years)',
		category: 'A',
		condition: 'Poor (decay present)',
		photos: [],
		isDummy: true
	}
];

// Helper function to insert all dummy data
export async function insertDummyData(): Promise<void> {
	console.log('insertDummyData: Starting...');
	
	try {
		// First delete any existing dummy data
		console.log('insertDummyData: Deleting existing dummy data...');
		await deleteAllDummyData();
		console.log('insertDummyData: Existing dummy data deleted');
		
		// Create dummy projects
		console.log('insertDummyData: Creating dummy projects...');
		const projectIds: string[] = [];
		for (const project of dummyProjects) {
			const id = await createProject(project);
			projectIds.push(id);
			console.log('insertDummyData: Created project', id, project.name);
		}
		
		// Create dummy trees for first project
		if (projectIds[0]) {
			console.log('insertDummyData: Creating dummy trees for project', projectIds[0]);
			for (const tree of dummyTrees) {
				await createTree({ ...tree, projectId: projectIds[0] });
				console.log('insertDummyData: Created tree', tree.number);
			}
		}
		
		// Create dummy tasks (some with project association)
		console.log('insertDummyData: Creating dummy tasks...');
		for (let i = 0; i < dummyTasks.length; i++) {
			const task = dummyTasks[i];
			const projectId = i === 0 ? projectIds[0] : undefined;
			await createTask({ ...task, projectId });
			console.log('insertDummyData: Created task', task.title);
		}
		
		// Create dummy notes (some with project association)
		console.log('insertDummyData: Creating dummy notes...');
		for (let i = 0; i < dummyNotes.length; i++) {
			const note = dummyNotes[i];
			const projectId = i === 0 ? projectIds[0] : undefined;
			await createNote({ ...note, projectId });
			console.log('insertDummyData: Created note', note.title);
		}
		
		// Create dummy reports for first project
		if (projectIds[0]) {
			console.log('insertDummyData: Creating dummy reports...');
			for (const report of dummyReports) {
				await saveReport({ ...report, projectId: projectIds[0] });
				console.log('insertDummyData: Created report', report.title);
			}
		}
		
		console.log('insertDummyData: Completed successfully');
	} catch (error) {
		console.error('insertDummyData: Error:', error);
		throw error;
	}
}

// Helper function to remove all dummy data
export async function removeDummyData(): Promise<void> {
	await deleteAllDummyData();
}

// Helper function to check if dummy data exists
export async function hasDummyData(): Promise<boolean> {
	const count = await countDummyItems();
	return count.projects > 0 || count.tasks > 0 || count.notes > 0 || count.trees > 0 || count.reports > 0;
}