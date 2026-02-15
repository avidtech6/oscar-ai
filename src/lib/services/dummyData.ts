import { db, createProject, createTask, createNote, createTree, saveReport, createLink, saveChatMessage, deleteAllDummyData, countDummyItems } from '$lib/db';

// Storage keys for dummy data settings
const DUMMY_DATA_ENABLED_KEY = 'oscar_dummy_data_enabled';

// Check if dummy data is enabled
export function isDummyDataEnabled(): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem(DUMMY_DATA_ENABLED_KEY) === 'true';
}

// Toggle dummy data visibility
export function setDummyDataEnabled(enabled: boolean): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(DUMMY_DATA_ENABLED_KEY, enabled ? 'true' : 'false');
	window.dispatchEvent(new CustomEvent('dummyDataToggled', { detail: { enabled } }));
}

// Generate all dummy data
export async function generateDummyData(): Promise<void> {
	const now = new Date();
	
	// 1. Create Dummy Project
	const projectId = await createProject({
		name: '[DUMMY] Alpha Site Survey',
		description: 'BS5837 tree survey for residential development at Alpha Site. This is a dummy project for testing purposes.',
		location: '123 Test Lane, Testing Town, TT1 1TT',
		client: 'Test Developments Ltd',
		isDummy: true
	});
	
	// 2. Create Dummy Task (linked to project)
	const taskId = await createTask({
		title: '[DUMMY] Inspect Oak at North Gate',
		content: 'Conduct detailed inspection of mature oak tree at north gate entrance. Assess condition, measure DBH, and document any visible defects or signs of disease.',
		status: 'todo',
		priority: 'high',
		dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
		projectId: projectId,
		tags: ['dummy', 'sample', 'test', 'inspection'],
		isDummy: true
	});
	
	// 3. Create Dummy Subtask
	const subtaskId = crypto.randomUUID();
	await db.tasks.add({
		id: subtaskId,
		title: '[DUMMY] Measure Root Protection Area',
		content: 'Calculate and mark the Root Protection Area (RPA) based on BS5837 guidelines.',
		status: 'todo',
		priority: 'medium',
		projectId: projectId,
		tags: ['dummy', 'sample', 'test', 'rpa'],
		isDummy: true,
		createdAt: now,
		updatedAt: now
	});
	
	// Link subtask to parent task
	await createLink({
		sourceId: subtaskId,
		sourceType: 'task',
		targetId: taskId,
		targetType: 'task',
		relationType: 'subtask'
	});
	
	// 4. Create Dummy Note
	const noteId = await createNote({
		title: '[DUMMY] Client Meeting Notes',
		content: 'Meeting with client regarding the Alpha Site survey. Key points: Client concerned about T1 Oak, requested detailed assessment of Category A trees, wants PDF report by end of month. Follow-up: Schedule site visit, complete survey, prepare BS5837 report.',
		tags: ['dummy', 'sample', 'test', 'meeting'],
		type: 'general',
		projectId: projectId,
		isDummy: true
	});
	
	// Link note to task
	await createLink({
		sourceId: taskId,
		sourceType: 'task',
		targetId: noteId,
		targetType: 'note',
		relationType: 'context'
	});
	
	// 5. Create Dummy Report
	const reportContent = 'BS5837 Arboricultural Impact Assessment - Alpha Site';
	await saveReport({
		projectId: projectId,
		title: '[DUMMY] BS5837 Arboricultural Impact Assessment',
		type: 'bs5837',
		pdfBlob: new Blob([reportContent], { type: 'text/plain' }),
		isDummy: true
	});
	
	// 6. Create Dummy Tree
	await createTree({
		projectId: projectId,
		number: 'T1',
		species: 'Oak',
		scientificName: 'Quercus robur',
		DBH: 650,
		height: 14,
		age: 'Mature',
		category: 'A',
		condition: 'Good',
		photos: [],
		isDummy: true
	});
	
	// 7. Create Dummy Blog Post
	await db.notes.add({
		id: crypto.randomUUID(),
		title: '[DUMMY] Update on Survey Technology',
		content: 'Latest developments in tree survey technology including LIDAR, drone photography, and AI-powered analysis.',
		tags: ['dummy', 'sample', 'test', 'blog'],
		type: 'general',
		isDummy: true,
		createdAt: now,
		updatedAt: now
	});
	
	// 8. Create Dummy Diagram
	await db.notes.add({
		id: crypto.randomUUID(),
		title: '[DUMMY] Survey Workflow',
		content: 'Survey workflow: Client Request -> Site Visit -> Tree Survey -> Data Analysis -> Report Preparation -> Client Delivery',
		tags: ['dummy', 'sample', 'test', 'diagram'],
		type: 'general',
		isDummy: true,
		createdAt: now,
		updatedAt: now
	});
	
	// 9. Create Dummy Voice Note
	await db.notes.add({
		id: crypto.randomUUID(),
		title: '[DUMMY] Site Visit Audio Notes',
		content: '',
		transcript: 'Arrived at site at 9am. Weather: Overcast, dry. T1 Oak in good condition with no visible signs of disease. Crown spread approximately 12 meters. Client concerned about T1 oak. Will complete full survey tomorrow.',
		tags: ['dummy', 'sample', 'test', 'voice'],
		type: 'voice',
		projectId: projectId,
		isDummy: true,
		createdAt: now,
		updatedAt: now
	});
	
	// 10. Create Dummy Chat History
	const chatHistory = [
		{ role: 'user' as const, content: 'Show me my tasks', timestamp: new Date(Date.now() - 3600000) },
		{ role: 'oscar' as const, content: 'I found 1 task: [DUMMY] Inspect Oak at North Gate (High Priority)', timestamp: new Date(Date.now() - 3500000) },
		{ role: 'user' as const, content: 'Add a subtask', timestamp: new Date(Date.now() - 1800000) },
		{ role: 'oscar' as const, content: 'Added subtask: [DUMMY] Measure Root Protection Area', timestamp: new Date(Date.now() - 1700000) }
	];
	
	for (const message of chatHistory) {
		await saveChatMessage(message);
	}
}

// Clear all dummy data
export async function clearDummyData(): Promise<void> {
	await deleteAllDummyData();
}

export { DUMMY_DATA_ENABLED_KEY };
