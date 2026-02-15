<script lang="ts">
	import { onMount } from 'svelte';
	
	// Task interface
	interface Task {
		id: string;
		title: string;
		description: string;
		priority: 'low' | 'medium' | 'high';
		status: 'pending' | 'in_progress' | 'completed';
		dueDate?: string;
		projectId?: string;
		createdAt: string;
		updatedAt: string;
	}
	
	let tasks: Task[] = [];
	let loading = true;
	let showAddForm = false;
	let editingTask: Task | null = null;
	
	// Form data
	let formData = {
		title: '',
		description: '',
		priority: 'medium' as 'low' | 'medium' | 'high',
		dueDate: ''
	};
	
	const STORAGE_KEY = 'oscar_tasks';
	
	onMount(() => {
		loadTasks();
	});
	
	function loadTasks() {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				tasks = JSON.parse(stored);
			}
		} catch (e) {
			console.error('Failed to load tasks:', e);
		} finally {
			loading = false;
		}
	}
	
	function saveTasks() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
	}
	
	function addTask() {
		if (!formData.title.trim()) return;
		
		const newTask: Task = {
			id: crypto.randomUUID(),
			title: formData.title.trim(),
			description: formData.description.trim(),
			priority: formData.priority,
			status: 'pending',
			dueDate: formData.dueDate || undefined,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		
		tasks = [newTask, ...tasks];
		saveTasks();
		resetForm();
		showAddForm = false;
	}
	
	function updateTaskStatus(task: Task, status: Task['status']) {
		task.status = status;
		task.updatedAt = new Date().toISOString();
		tasks = tasks;
		saveTasks();
	}
	
	function deleteTask(id: string) {
		if (!confirm('Are you sure you want to delete this task?')) return;
		tasks = tasks.filter(t => t.id !== id);
		saveTasks();
	}
	
	function editTask(task: Task) {
		editingTask = task;
		formData = {
			title: task.title,
			description: task.description,
			priority: task.priority,
			dueDate: task.dueDate || ''
		};
		showAddForm = true;
	}
	
	function saveEdit() {
		if (!editingTask || !formData.title.trim()) return;
		
		editingTask.title = formData.title.trim();
		editingTask.description = formData.description.trim();
		editingTask.priority = formData.priority;
		editingTask.dueDate = formData.dueDate || undefined;
		editingTask.updatedAt = new Date().toISOString();
		
		tasks = tasks;
		saveTasks();
		resetForm();
		showAddForm = false;
		editingTask = null;
	}
	
	function resetForm() {
		formData = {
			title: '',
			description: '',
			priority: 'medium',
			dueDate: ''
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
			case 'completed': return 'bg-green-100 text-green-800';
			case 'in_progress': return 'bg-blue-100 text-blue-800';
			case 'pending': return 'bg-gray-100 text-gray-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
	
	$: pendingTasks = tasks.filter(t => t.status === 'pending');
	$: inProgressTasks = tasks.filter(t => t.status === 'in_progress');
	$: completedTasks = tasks.filter(t => t.status === 'completed');
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
				on:click={() => { showAddForm = !showAddForm; if (!showAddForm) resetForm(); }}
				class="btn btn-primary"
			>
				{showAddForm ? 'Cancel' : '+ Add Task'}
			</button>
		</div>
	</div>
	
	{#if showAddForm}
		<div class="card p-6 mb-6">
			<h2 class="text-lg font-semibold mb-4">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
			<div class="space-y-4">
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
					<input 
						id="title" 
						type="text" 
						bind:value={formData.title} 
						placeholder="Enter task title"
						class="input w-full"
					/>
				</div>
				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
					<textarea 
						id="description" 
						bind:value={formData.description} 
						placeholder="Enter task description"
						rows="3"
						class="input w-full"
					></textarea>
				</div>
				<div class="grid grid-cols-2 gap-4">
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
				<div class="flex gap-2">
					{#if editingTask}
						<button on:click={saveEdit} class="btn btn-primary">Save Changes</button>
					{:else}
						<button on:click={addTask} class="btn btn-primary">Add Task</button>
					{/if}
					<button on:click={() => { showAddForm = false; resetForm(); editingTask = null; }} class="btn btn-secondary">Cancel</button>
				</div>
			</div>
		</div>
	{/if}
	
	{#if loading}
		<p class="text-gray-500">Loading tasks...</p>
	{:else if tasks.length === 0}
		<div class="card p-8 text-center">
			<p class="text-gray-500 mb-4">No tasks yet. Create your first task!</p>
			<button on:click={() => showAddForm = true} class="btn btn-primary">+ Add Task</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Pending -->
			<div class="card p-4">
				<h2 class="font-semibold text-gray-900 mb-4">Pending ({pendingTasks.length})</h2>
				<div class="space-y-3">
					{#each pendingTasks as task (task.id)}
						<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
							<div class="flex items-start justify-between mb-2">
								<h3 class="font-medium text-gray-900">{task.title}</h3>
								<span class="text-xs px-2 py-1 rounded {getPriorityColor(task.priority)}">
									{task.priority}
								</span>
							</div>
							{#if task.description}
								<p class="text-sm text-gray-600 mb-3">{task.description}</p>
							{/if}
							{#if task.dueDate}
								<p class="text-xs text-gray-500 mb-3">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
							{/if}
							<div class="flex gap-2">
								<button 
									on:click={() => updateTaskStatus(task, 'in_progress')}
									class="text-xs text-blue-600 hover:underline"
								>
									Start
								</button>
								<button 
									on:click={() => editTask(task)}
									class="text-xs text-gray-600 hover:underline"
								>
									Edit
								</button>
								<button 
									on:click={() => deleteTask(task.id)}
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
							{#if task.description}
								<p class="text-sm text-gray-600 mb-3">{task.description}</p>
							{/if}
							{#if task.dueDate}
								<p class="text-xs text-gray-500 mb-3">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
							{/if}
							<div class="flex gap-2">
								<button 
									on:click={() => updateTaskStatus(task, 'completed')}
									class="text-xs text-green-600 hover:underline"
								>
									Complete
								</button>
								<button 
									on:click={() => updateTaskStatus(task, 'pending')}
									class="text-xs text-gray-600 hover:underline"
								>
									Back
								</button>
								<button 
									on:click={() => editTask(task)}
									class="text-xs text-gray-600 hover:underline"
								>
									Edit
								</button>
								<button 
									on:click={() => deleteTask(task.id)}
									class="text-xs text-red-600 hover:underline"
								>
									Delete
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
			
			<!-- Completed -->
			<div class="card p-4">
				<h2 class="font-semibold text-gray-900 mb-4">Completed ({completedTasks.length})</h2>
				<div class="space-y-3">
					{#each completedTasks as task (task.id)}
						<div class="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50 opacity-75">
							<div class="flex items-start justify-between mb-2">
								<h3 class="font-medium text-gray-900 line-through">{task.title}</h3>
								<span class="text-xs px-2 py-1 rounded {getStatusColor(task.status)}">
									{task.status}
								</span>
							</div>
							{#if task.description}
								<p class="text-sm text-gray-600 mb-3">{task.description}</p>
							{/if}
							<div class="flex gap-2">
								<button 
									on:click={() => updateTaskStatus(task, 'in_progress')}
									class="text-xs text-blue-600 hover:underline"
								>
									Reopen
								</button>
								<button 
									on:click={() => deleteTask(task.id)}
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
