<script lang="ts">
	import { onMount } from 'svelte';
	import { db, type Task, type Project, getAllTasks, createTask, updateTask, deleteTask } from '$lib/db';
	import { projectContextStore } from '$lib/services/unified/ProjectContextStore';
	
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
	
	$: todoTasks = tasks.filter(t => t.status === 'todo');
	$: inProgressTasks = tasks.filter(t => t.status === 'in_progress');
	$: doneTasks = tasks.filter(t => t.status === 'done');
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
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- To Do -->
			<div class="card p-4">
				<h2 class="font-semibold text-gray-900 mb-4">To Do ({todoTasks.length})</h2>
				<div class="space-y-3">
					{#each todoTasks as task (task.id)}
						<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
							<div class="flex items-start justify-between mb-2">
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
									on:click={() => deleteTaskById(task.id!)}
									class="text-xs text-red-600 hover:underline"
								>
									Delete
								</button>
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
						<div class="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-blue-50">
							<div class="flex items-start justify-between mb-2">
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
									on:click={() => deleteTaskById(task.id!)}
									class="text-xs text-red-600 hover:underline"
								>
									Delete
								</button>
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
						<div class="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50 opacity-75">
							<div class="flex items-start justify-between mb-2">
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
									on:click={() => deleteTaskById(task.id!)}
									class="text-xs text-red-600 hover:underline"
								>
									Delete
								</button>
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
{/if}
