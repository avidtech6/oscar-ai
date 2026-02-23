<script lang="ts">
	import { onMount } from 'svelte';
	import { db, type Task, type Project, getAllTasks, createTask, updateTask, deleteTask } from '$lib/db';
	import { projectContextStore } from '$lib/services/unified/ProjectContextStore';
	// Copilot store for confirmation messages
	import { addConfirmation } from '$lib/copilot/copilotStore';
	
	let tasks: Task[] = [];
	let projects: Project[] = [];
	let loading = true;
	let showTaskModal = false;
	let editingTask: Task | null = null;
	
	// Form data
	let formData = {
		title: '',
		description: '',
		priority: 'medium' as 'low' | 'medium' | 'high',
		dueDate: '',
		projectId: '',
		tags: ''
	};

	// Multi-select state
	let selectedTasks = new Set<string>();
	let showMultiSelectActions = false;
	let bulkAIPrompt = '';
	let bulkAIProcessing = false;
	let bulkAIResult = '';
	
	onMount(async () => {
		await loadTasks();
		await loadProjects();
	});
	
	async function loadTasks() {
		loading = true;
		try {
			tasks = await getAllTasks();
		} catch (e) {
			console.error('Failed to load tasks:', e);
		} finally {
			loading = false;
		}
	}
	
	async function loadProjects() {
		try {
			projects = await db.projects.toArray();
		} catch (e) {
			console.error('Failed to load projects:', e);
		}
	}
	
	async function saveTask() {
		if (!formData.title.trim()) return;
		
		const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
		const dueDate = formData.dueDate ? new Date(formData.dueDate) : undefined;
		
		try {
			if (editingTask && editingTask.id) {
				// Update existing task
				await updateTask(editingTask.id, {
					title: formData.title.trim(),
					content: formData.description.trim(),
					priority: formData.priority,
					dueDate,
					projectId: formData.projectId || undefined,
					tags,
					status: editingTask.status // Keep existing status
				});
				addConfirmation('Task updated successfully');
			} else {
				// Create new task
				await createTask({
					title: formData.title.trim(),
					content: formData.description.trim(),
					priority: formData.priority,
					status: 'todo',
					dueDate,
					projectId: formData.projectId || undefined,
					tags,
					linkedNoteId: undefined
				});
				addConfirmation('Task created successfully');
			}
			
			await loadTasks();
			closeTaskModal();
		} catch (e) {
			console.error('Failed to save task:', e);
			alert('Failed to save task. Please try again.');
		}
	}
	
	async function updateTaskStatus(task: Task, status: Task['status']) {
		try {
			if (task.id) {
				await updateTask(task.id, { status });
				await loadTasks();
				addConfirmation(`Task marked as ${status === 'done' ? 'completed' : status}`);
			}
		} catch (e) {
			console.error('Failed to update task status:', e);
		}
	}
	
	async function deleteTaskById(id: string) {
		if (!confirm('Are you sure you want to delete this task?')) return;
		
		try {
			await deleteTask(id);
			await loadTasks();
			addConfirmation('Task deleted successfully');
		} catch (e) {
			console.error('Failed to delete task:', e);
			alert('Failed to delete task. Please try again.');
		}
	}
	
	function openTaskModal(task?: Task) {
		if (task) {
			editingTask = task;
			formData = {
				title: task.title,
				description: task.content,
				priority: task.priority,
				dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
				projectId: task.projectId || '',
				tags: task.tags?.join(', ') || ''
			};
		} else {
			editingTask = null;
			formData = {
				title: '',
				description: '',
				priority: 'medium',
				dueDate: '',
				projectId: $projectContextStore.currentProjectId || '',
				tags: ''
			};
		}
		showTaskModal = true;
	}
	
	function closeTaskModal() {
		showTaskModal = false;
		editingTask = null;
		formData = {
			title: '',
			description: '',
			priority: 'medium',
			dueDate: '',
			projectId: '',
			tags: ''
		};
	}
	
	function getPriorityColor(priority: string): string {
		switch (priority) {
			case 'high': return 'bg-red-100 text-red-800';
			case 'medium': return 'bg-yellow-100 text-yellow-800';
			case 'low': return 'bg-green-100 text-green-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
	
	function getStatusColor(status: string): string {
		switch (status) {
			case 'done': return 'bg-green-100 text-green-800';
			case 'in_progress': return 'bg-blue-100 text-blue-800';
			case 'todo': return 'bg-gray-100 text-gray-800';
			case 'archived': return 'bg-purple-100 text-purple-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
	
	function getStatusDisplayName(status: string): string {
		switch (status) {
			case 'todo': return 'To Do';
			case 'in_progress': return 'In Progress';
			case 'done': return 'Done';
			case 'archived': return 'Archived';
			default: return status;
		}
	}
	
	function getProjectName(projectId?: string) {
		if (!projectId) return null;
		const project = projects.find(p => p.id === projectId);
		return project?.name || null;
	}
	
	function formatDate(date: Date | string | undefined) {
		if (!date) return '';
		const d = new Date(date);
		return d.toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
		});
	}
	
	// Multi-select functions
	function toggleTaskSelection(taskId: string) {
		if (selectedTasks.has(taskId)) {
			selectedTasks.delete(taskId);
		} else {
			selectedTasks.add(taskId);
		}
		showMultiSelectActions = selectedTasks.size > 0;
	}

	function selectAllTasks() {
		selectedTasks.clear();
		tasks.forEach(task => {
			if (task.id) selectedTasks.add(task.id);
		});
		showMultiSelectActions = true;
	}

	function clearSelection() {
		selectedTasks.clear();
		showMultiSelectActions = false;
	}

	function getSelectedTasks(): Task[] {
		return tasks.filter(task => task.id && selectedTasks.has(task.id));
	}

	async function deleteSelectedTasks() {
		const selected = getSelectedTasks();
		if (selected.length === 0) return;
		
		if (!confirm(`Are you sure you want to delete ${selected.length} task${selected.length !== 1 ? 's' : ''}?`)) {
			return;
		}
		
		try {
			for (const task of selected) {
				if (task.id) {
					await deleteTask(task.id);
				}
			}
			await loadTasks();
			addConfirmation(`${selected.length} task${selected.length !== 1 ? 's' : ''} deleted successfully`);
			clearSelection();
		} catch (e) {
			console.error('Failed to delete tasks:', e);
			alert('Failed to delete tasks. Please try again.');
		}
	}

	async function updateSelectedTasksStatus(status: Task['status']) {
		const selected = getSelectedTasks();
		if (selected.length === 0) return;
		
		try {
			for (const task of selected) {
				if (task.id) {
					await updateTask(task.id, { status });
				}
			}
			await loadTasks();
			addConfirmation(`${selected.length} task${selected.length !== 1 ? 's' : ''} marked as ${status === 'done' ? 'completed' : status}`);
		} catch (e) {
			console.error('Failed to update task status:', e);
			alert('Failed to update task status. Please try again.');
		}
	}

	async function tagSelectedTasks() {
		const selected = getSelectedTasks();
		if (selected.length === 0) return;
		
		const tag = prompt('Enter tag to add to selected tasks:');
		if (!tag) return;
		
		try {
			for (const task of selected) {
				if (task.id) {
					const currentTags = task.tags || [];
					if (!currentTags.includes(tag)) {
						await updateTask(task.id, {
							tags: [...currentTags, tag],
							updatedAt: new Date()
						});
					}
				}
			}
			await loadTasks();
			addConfirmation(`Tag "${tag}" added to ${selected.length} task${selected.length !== 1 ? 's' : ''}`);
		} catch (e) {
			console.error('Failed to tag tasks:', e);
			alert('Failed to tag tasks. Please try again.');
		}
	}

	$: todoTasks = tasks.filter(t => t.status === 'todo');
	$: inProgressTasks = tasks.filter(t => t.status === 'in_progress');
	$: doneTasks = tasks.filter(t => t.status === 'done');
	$: showMultiSelectActions = selectedTasks.size > 0;
</script>

<svelte:head>
	<title>Tasks - Oscar AI</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-6">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900 mb-2">Tasks</h1>
				<p class="text-gray-600">Manage your tree survey tasks and to-dos</p>
			</div>
			<button 
				on:click={() => openTaskModal()}
				class="btn btn-primary"
			>
				+ Add Task
			</button>
		</div>
	</div>
	
	{#if loading}
		<p class="text-gray-500">Loading tasks...</p>
	{:else if tasks.length === 0}
		<div class="card p-8 text-center">
			<p class="text-gray-500 mb-4">No tasks yet. Create your first task!</p>
			<button on:click={() => openTaskModal()} class="btn btn-primary">+ Add Task</button>
		</div>
	{:else}
		<!-- Multi-select Actions Bar -->
		{#if showMultiSelectActions}
			<div class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-4">
						<span class="font-medium text-blue-800">
							{selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
						</span>
						<div class="flex gap-2">
							<button
								on:click={() => updateSelectedTasksStatus('in_progress')}
								class="btn btn-secondary text-sm"
							>
								<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
								</svg>
								Start
							</button>
							<button
								on:click={() => updateSelectedTasksStatus('done')}
								class="btn btn-primary text-sm"
							>
								<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
								</svg>
								Complete
							</button>
							<button
								on:click={tagSelectedTasks}
								class="btn btn-secondary text-sm"
							>
								<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
								</svg>
								Add Tag
							</button>
							<button
								on:click={deleteSelectedTasks}
								class="btn btn-danger text-sm"
							>
								<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
								</svg>
								Delete
							</button>
						</div>
					</div>
					<button
						on:click={clearSelection}
						class="text-blue-600 hover:text-blue-800 text-sm"
					>
						Clear Selection
					</button>
				</div>
			</div>
		{:else if tasks.length > 0}
			<div class="mb-4 flex justify-between items-center">
				<button
					on:click={selectAllTasks}
					class="text-sm text-gray-600 hover:text-gray-900"
				>
					<svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
					Select All
				</button>
			</div>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- To Do -->
			<div class="card p-4">
				<h2 class="font-semibold text-gray-900 mb-4">To Do ({todoTasks.length})</h2>
				<div class="space-y-3">
					{#each todoTasks as task (task.id)}
						<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow {task.id && selectedTasks.has(task.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}">
							<div class="flex items-start gap-3 mb-2">
								<!-- Checkbox for selection -->
								<input
									type="checkbox"
									checked={task.id && selectedTasks.has(task.id)}
									on:change={() => task.id && toggleTaskSelection(task.id)}
									class="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
								/>
								
								<div class="flex-1">
									<div class="flex items-start justify-between">
										<h3 class="font-medium text-gray-900">{task.title}</h3>
										<span class="text-xs px-2 py-1 rounded {getPriorityColor(task.priority)}">
											{task.priority}
										</span>
									</div>
									
									{#if task.content}
										<p class="text-sm text-gray-600 mb-3 line-clamp-2">{task.content}</p>
									{/if}
									
									<div class="flex items-center justify-between text-xs text-gray-500 mb-3">
										{#if task.dueDate}
											<span class="text-red-600 font-medium">Due: {formatDate(task.dueDate)}</span>
										{/if}
										{#if getProjectName(task.projectId)}
											<span class="text-forest-600">{getProjectName(task.projectId)}</span>
										{/if}
									</div>
									
									<div class="flex gap-2">
										<button
											on:click={() => updateTaskStatus(task, 'in_progress')}
											class="text-xs text-blue-600 hover:underline"
										>
											Start
										</button>
										<button
											on:click={() => openTaskModal(task)}
											class="text-xs text-gray-600 hover:underline"
										>
											Edit
										</button>
										<button
											on:click={() => task.id && deleteTaskById(task.id)}
											class="text-xs text-red-600 hover:underline"
										>
											Delete
										</button>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
			
			<!-- In Progress -->
			<div class="card p-4">
				<h2 class="font-semibold text-gray-900 mb-4">In Progress ({inProgressTasks.length})</h2>
				<div class="space-y-3">
					{#each inProgressTasks as task (task.id)}
						<div class="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-blue-50 {task.id && selectedTasks.has(task.id) ? 'ring-2 ring-blue-500' : ''}">
							<div class="flex items-start gap-3 mb-2">
								<!-- Checkbox for selection -->
								<input
									type="checkbox"
									checked={task.id && selectedTasks.has(task.id)}
									on:change={() => task.id && toggleTaskSelection(task.id)}
									class="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
								/>
								
								<div class="flex-1">
									<div class="flex items-start justify-between">
										<h3 class="font-medium text-gray-900">{task.title}</h3>
										<span class="text-xs px-2 py-1 rounded {getPriorityColor(task.priority)}">
											{task.priority}
										</span>
									</div>
									
									{#if task.content}
										<p class="text-sm text-gray-600 mb-3 line-clamp-2">{task.content}</p>
									{/if}
									
									<div class="flex items-center justify-between text-xs text-gray-500 mb-3">
										{#if task.dueDate}
											<span class="text-red-600 font-medium">Due: {formatDate(task.dueDate)}</span>
										{/if}
										{#if getProjectName(task.projectId)}
											<span class="text-forest-600">{getProjectName(task.projectId)}</span>
										{/if}
									</div>
									
									<div class="flex gap-2">
										<button
											on:click={() => updateTaskStatus(task, 'done')}
											class="text-xs text-green-600 hover:underline"
										>
											Complete
										</button>
										<button
											on:click={() => updateTaskStatus(task, 'todo')}
											class="text-xs text-gray-600 hover:underline"
										>
											Back
										</button>
										<button
											on:click={() => openTaskModal(task)}
											class="text-xs text-gray-600 hover:underline"
										>
											Edit
										</button>
										<button
											on:click={() => task.id && deleteTaskById(task.id)}
											class="text-xs text-red-600 hover:underline"
										>
											Delete
										</button>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
			
			<!-- Done -->
			<div class="card p-4">
				<h2 class="font-semibold text-gray-900 mb-4">Done ({doneTasks.length})</h2>
				<div class="space-y-3">
					{#each doneTasks as task (task.id)}
						<div class="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50 opacity-75 {task.id && selectedTasks.has(task.id) ? 'ring-2 ring-blue-500' : ''}">
							<div class="flex items-start gap-3 mb-2">
								<!-- Checkbox for selection -->
								<input
									type="checkbox"
									checked={task.id && selectedTasks.has(task.id)}
									on:change={() => task.id && toggleTaskSelection(task.id)}
									class="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
								/>
								
								<div class="flex-1">
									<div class="flex items-start justify-between">
										<h3 class="font-medium text-gray-900 line-through">{task.title}</h3>
										<span class="text-xs px-2 py-1 rounded {getStatusColor(task.status)}">
											{getStatusDisplayName(task.status)}
										</span>
									</div>
									
									{#if task.content}
										<p class="text-sm text-gray-600 mb-3 line-clamp-2">{task.content}</p>
									{/if}
									
									<div class="flex items-center justify-between text-xs text-gray-500 mb-3">
										{#if task.dueDate}
											<span class="text-gray-500">Due: {formatDate(task.dueDate)}</span>
										{/if}
										{#if getProjectName(task.projectId)}
											<span class="text-forest-600">{getProjectName(task.projectId)}</span>
										{/if}
									</div>
									
									<div class="flex gap-2">
										<button
											on:click={() => updateTaskStatus(task, 'in_progress')}
											class="text-xs text-blue-600 hover:underline"
										>
											Reopen
										</button>
										<button
											on:click={() => task.id && deleteTaskById(task.id)}
											class="text-xs text-red-600 hover:underline"
										>
											Delete
										</button>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Task Modal -->
{#if showTaskModal}
	<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
			<!-- Header -->
			<div class="px-6 py-4 border-b flex items-center justify-between">
				<h2 class="text-lg font-semibold">
					{editingTask ? 'Edit Task' : 'Add New Task'}
				</h2>
				<button on:click={closeTaskModal} class="text-gray-400 hover:text-gray-600">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
			
			<!-- Form -->
			<div class="flex-1 overflow-y-auto p-6 space-y-4">
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
					<input
						id="title"
						type="text"
						bind:value={formData.title}
						placeholder="Enter task title"
						class="input w-full"
						required
					/>
				</div>
				
				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
					<textarea
						id="description"
						bind:value={formData.description}
						placeholder="Enter task description"
						rows="4"
						class="input w-full resize-none"
					></textarea>
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="priority" class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
						<select id="priority" bind:value={formData.priority} class="input w-full">
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>
					</div>
					
					<div>
						<label for="dueDate" class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
						<input
							id="dueDate"
							type="date"
							bind:value={formData.dueDate}
							class="input w-full"
						/>
					</div>
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="project" class="block text-sm font-medium text-gray-700 mb-1">Link to Project</label>
						<select id="project" bind:value={formData.projectId} class="input w-full">
							<option value="">None</option>
							{#each projects as project}
								<option value={project.id}>{project.name}</option>
							{/each}
						</select>
					</div>
					
					<div>
						<label for="tags" class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
						<input
							id="tags"
							type="text"
							bind:value={formData.tags}
							placeholder="e.g., urgent, client, follow-up"
							class="input w-full"
						/>
					</div>
				</div>
			<!-- Footer -->
			<div class="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
				<button
					on:click={closeTaskModal}
					class="btn btn-secondary"
				>
					Cancel
				</button>
				<button
					on:click={saveTask}
					class="btn btn-primary"
				>
					{editingTask ? 'Save Changes' : 'Create Task'}
				</button>
			</div>
		</div>
	</div>
</div>
{/if}
