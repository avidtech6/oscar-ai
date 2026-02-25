import type { Project, Note, Task, Tree, VoiceNote } from '$lib/db';
import type { CopilotContext } from '$lib/copilot/context/contextTypes';

export interface ProjectInsight {
	label: string;
	action?: string;
	type: 'note' | 'task' | 'photo' | 'general';
}

/**
 * Generate professional, observational insights about a project.
 * 
 * Tone rules:
 * - No teaching, no explaining arboriculture
 * - No patronising language
 * - Assume user expertise
 * - Observational framing: "You may want to review...", "Here are a few things that stand out...", "If helpful, I can summarise this..."
 */
export async function getProjectInsights(project: Project, context: CopilotContext): Promise<ProjectInsight[]> {
	const insights: ProjectInsight[] = [];

	// Fetch all project data
	const projectData = await fetchProjectData(project.id!);
	const { notes, tasks, trees, voiceNotes, photoCount } = projectData;

	// 1. Notes insights
	const noteInsights = getNotesInsights(notes, project);
	insights.push(...noteInsights);

	// 2. Tasks insights
	const taskInsights = getTasksInsights(tasks, project);
	insights.push(...taskInsights);

	// 3. Photos insights
	const photoInsights = getPhotosInsights(photoCount, notes, project);
	insights.push(...photoInsights);

	// 4. Voice notes insights
	const voiceInsights = getVoiceNotesInsights(voiceNotes, project);
	insights.push(...voiceInsights);

	// 5. Activity insights (based on recent activity)
	const activityInsights = getActivityInsights(projectData, context);
	insights.push(...activityInsights);

	// 6. Empty project insights
	if (insights.length === 0) {
		insights.push(...getEmptyProjectInsights(project));
	}

	// Limit to 5 most relevant insights
	return insights.slice(0, 5);
}

/**
 * Helper to fetch project data for insight generation
 */
async function fetchProjectData(projectId: string): Promise<{
	notes: Note[];
	tasks: Task[];
	trees: Tree[];
	voiceNotes: VoiceNote[];
	photoCount: number;
}> {
	// Import dynamically to avoid circular dependencies
	const { db } = await import('$lib/db');
	
	const [notes, tasks, trees, voiceNotes, photos] = await Promise.all([
		db.notes.where('projectId').equals(projectId).toArray(),
		db.tasks.where('projectId').equals(projectId).toArray(),
		db.trees.where('projectId').equals(projectId).toArray(),
		db.voiceNotes.where('projectId').equals(projectId).toArray(),
		db.photos.where('projectId').equals(projectId).count()
	]);

	return {
		notes,
		tasks,
		trees,
		voiceNotes,
		photoCount: photos
	};
}

/**
 * Generate insights about notes in the project
 */
function getNotesInsights(notes: Note[], project: Project): ProjectInsight[] {
	const insights: ProjectInsight[] = [];

	if (notes.length === 0) {
		insights.push({
			label: `No notes yet for ${project.name}. You may want to add some observations.`,
			action: `Add a note about ${project.name}`,
			type: 'note'
		});
		return insights;
	}

	// Check for notes without content
	const emptyNotes = notes.filter(note => !note.content || note.content.trim().length === 0);
	if (emptyNotes.length > 0) {
		insights.push({
			label: `${emptyNotes.length} note${emptyNotes.length > 1 ? 's' : ''} without content. You may want to review them.`,
			action: `Review empty notes in ${project.name}`,
			type: 'note'
		});
	}

	// Check for recent notes
	const recentNotes = notes.filter(note => {
		const noteDate = new Date(note.updatedAt);
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		return noteDate > sevenDaysAgo;
	});

	if (recentNotes.length > 0) {
		insights.push({
			label: `${recentNotes.length} recent note${recentNotes.length > 1 ? 's' : ''}. Here are a few things that stand out.`,
			action: `Review recent notes in ${project.name}`,
			type: 'note'
		});
	}

	// Check for notes with photos
	const notesWithPhotos = notes.filter(note => note.attachments && note.attachments.length > 0);
	if (notesWithPhotos.length > 0) {
		insights.push({
			label: `${notesWithPhotos.length} note${notesWithPhotos.length > 1 ? 's' : ''} with photos. If helpful, I can summarise them.`,
			action: `Review photos in ${project.name}`,
			type: 'photo'
		});
	}

	return insights;
}

/**
 * Generate insights about tasks in the project
 */
function getTasksInsights(tasks: Task[], project: Project): ProjectInsight[] {
	const insights: ProjectInsight[] = [];

	if (tasks.length === 0) {
		insights.push({
			label: `No tasks yet for ${project.name}. You may want to plan next steps.`,
			action: `Add a task for ${project.name}`,
			type: 'task'
		});
		return insights;
	}

	// Check for overdue tasks
	const now = new Date();
	const overdueTasks = tasks.filter(task => {
		if (!task.dueDate) return false;
		const dueDate = new Date(task.dueDate);
		return task.status !== 'done' && dueDate < now;
	});

	if (overdueTasks.length > 0) {
		insights.push({
			label: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. You may want to review them.`,
			action: `Review overdue tasks in ${project.name}`,
			type: 'task'
		});
	}

	// Check for high priority tasks
	const highPriorityTasks = tasks.filter(task => 
		task.priority === 'high' && task.status !== 'done'
	);

	if (highPriorityTasks.length > 0) {
		insights.push({
			label: `${highPriorityTasks.length} high‑priority task${highPriorityTasks.length > 1 ? 's' : ''}. Here are a few things that stand out.`,
			action: `Review high‑priority tasks in ${project.name}`,
			type: 'task'
		});
	}

	// Check for tasks in progress
	const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
	if (inProgressTasks.length > 0) {
		insights.push({
			label: `${inProgressTasks.length} task${inProgressTasks.length > 1 ? 's' : ''} in progress. If helpful, I can provide updates.`,
			action: `Check progress on ${project.name}`,
			type: 'task'
		});
	}

	return insights;
}

/**
 * Generate insights about photos in the project
 */
function getPhotosInsights(photoCount: number, notes: Note[], project: Project): ProjectInsight[] {
	const insights: ProjectInsight[] = [];

	if (photoCount === 0) {
		// Only suggest adding photos if there are notes to attach them to
		const notesWithContent = notes.filter(note => note.content && note.content.trim().length > 0);
		if (notesWithContent.length > 0) {
			insights.push({
				label: `No photos yet for ${project.name}. You may want to add visual documentation.`,
				action: `Add photos to ${project.name}`,
				type: 'photo'
			});
		}
		return insights;
	}

	// Check if photos are attached to notes
	const notesWithPhotos = notes.filter(note => note.attachments && note.attachments.length > 0);
	const unattachedPhotoCount = photoCount - notesWithPhotos.reduce((sum, note) => sum + (note.attachments?.length || 0), 0);

	if (unattachedPhotoCount > 0) {
		insights.push({
			label: `${unattachedPhotoCount} photo${unattachedPhotoCount > 1 ? 's' : ''} not attached to notes. You may want to review them.`,
			action: `Attach photos to notes in ${project.name}`,
			type: 'photo'
		});
	}

	if (photoCount >= 10) {
		insights.push({
			label: `${photoCount} photos in this project. If helpful, I can create a visual summary.`,
			action: `Create photo summary for ${project.name}`,
			type: 'photo'
		});
	}

	return insights;
}

/**
 * Generate insights about voice notes in the project
 */
function getVoiceNotesInsights(voiceNotes: VoiceNote[], project: Project): ProjectInsight[] {
	const insights: ProjectInsight[] = [];

	if (voiceNotes.length === 0) {
		return insights;
	}

	// Check for recent voice notes
	const recentVoiceNotes = voiceNotes.filter(voiceNote => {
		const voiceDate = new Date(voiceNote.timestamp);
		const threeDaysAgo = new Date();
		threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
		return voiceDate > threeDaysAgo;
	});

	if (recentVoiceNotes.length > 0) {
		insights.push({
			label: `${recentVoiceNotes.length} recent voice note${recentVoiceNotes.length > 1 ? 's' : ''}. You may want to review transcripts.`,
			action: `Review voice notes in ${project.name}`,
			type: 'note'
		});
	}

	// Check for voice notes without proper transcripts
	const incompleteTranscripts = voiceNotes.filter(voiceNote => 
		!voiceNote.transcript || voiceNote.transcript.trim().length < 50
	);

	if (incompleteTranscripts.length > 0) {
		insights.push({
			label: `${incompleteTranscripts.length} voice note${incompleteTranscripts.length > 1 ? 's' : ''} with minimal transcripts. Here are a few things that stand out.`,
			action: `Improve transcripts in ${project.name}`,
			type: 'note'
		});
	}

	return insights;
}

/**
 * Generate insights based on recent activity and context
 */
function getActivityInsights(
	projectData: { notes: Note[]; tasks: Task[]; trees: Tree[]; voiceNotes: VoiceNote[]; photoCount: number },
	context: CopilotContext
): ProjectInsight[] {
	const insights: ProjectInsight[] = [];
	const { notes, tasks } = projectData;

	// Check if user just added something
	if (context.recentAction) {
		switch (context.recentAction) {
			case 'photoCaptured':
				insights.push({
					label: "You just added a photo. You may want to attach it to a note or task.",
					action: "Attach photo to note",
					type: 'photo'
				});
				break;
			case 'voiceNoteSaved':
				insights.push({
					label: "You just recorded a voice note. You may want to review the transcript.",
					action: "Review voice note transcript",
					type: 'note'
				});
				break;
			case 'taskCreated':
				insights.push({
					label: "You just created a task. Here are a few things that stand out.",
					action: "Break down task into steps",
					type: 'task'
				});
				break;
			case 'noteCreated':
				insights.push({
					label: "You just created a note. If helpful, I can help expand it.",
					action: "Expand note with AI",
					type: 'note'
				});
				break;
		}
	}

	// Check for project completion status
	const totalTasks = tasks.length;
	const completedTasks = tasks.filter(task => task.status === 'done').length;
	const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

	if (totalTasks > 0) {
		if (completionRate === 100) {
			insights.push({
				label: "All tasks completed. You may want to review the project for finalisation.",
				action: "Review completed project",
				type: 'general'
			});
		} else if (completionRate > 75) {
			insights.push({
				label: `${Math.round(completionRate)}% of tasks completed. Here are a few things that stand out.`,
				action: "Review project progress",
				type: 'general'
			});
		}
	}

	return insights;
}

/**
 * Generate insights for empty projects
 */
function getEmptyProjectInsights(project: Project): ProjectInsight[] {
	return [
		{
			label: `New project ${project.name}. You may want to start with observations or tasks.`,
			action: `Add first note to ${project.name}`,
			type: 'note'
		},
		{
			label: `No content yet for ${project.name}. Here are a few things that stand out.`,
			action: `Plan ${project.name}`,
			type: 'task'
		},
		{
			label: `If helpful, I can help you structure ${project.name}.`,
			action: `Get help with ${project.name}`,
			type: 'general'
		}
	];
}