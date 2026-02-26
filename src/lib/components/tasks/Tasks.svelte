<script lang="ts">
	import { tasksStore } from '$lib/stores/tasks';

	let newTaskTitle = '';
	let newTaskPriority: 'low' | 'medium' | 'high' = 'medium';

	function handleAddTask() {
		if (!newTaskTitle.trim()) return;
		tasksStore.addTask({
			title: newTaskTitle,
			priority: newTaskPriority,
			completed: false
		});
		newTaskTitle = '';
		newTaskPriority = 'medium';
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleAddTask();
		}
	}

	const pendingTasks = $tasksStore.filter(t => !t.completed);
	const completedTasks = $tasksStore.filter(t => t.completed);
</script>

<div class="flex flex-col min-h-[70vh] p-4">
	<h1 class="text-2xl font-bold text-gray-900 mb-6">Tasks</h1>

	<!-- Add task form -->
	<div class="mb-8">
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={newTaskTitle}
				on:keypress={handleKeyPress}
				placeholder="What needs to be done?"
				class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
			/>
			<select
				bind:value={newTaskPriority}
				class="px-4 py-2 border border-gray-300 rounded-lg"
			>
				<option value="low">Low</option>
				<option value="medium">Medium</option>
				<option value="high">High</option>
			</select>
			<button
				on:click={handleAddTask}
				class="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
			>
				Add
			</button>
		</div>
	</div>

	<!-- Task stats -->
	<div class="grid grid-cols-3 gap-4 mb-6">
		<div class="bg-blue-50 p-4 rounded-lg">
			<div class="text-2xl font-bold text-blue-700">{pendingTasks.length}</div>
			<div class="text-sm text-blue-600">Pending</div>
		</div>
		<div class="bg-green-50 p-4 rounded-lg">
			<div class="text-2xl font-bold text-green-700">{completedTasks.length}</div>
			<div class="text-sm text-green-600">Completed</div>
		</div>
		<div class="bg-gray-50 p-4 rounded-lg">
			<div class="text-2xl font-bold text-gray-700">{$tasksStore.length}</div>
			<div class="text-sm text-gray-600">Total</div>
		</div>
	</div>

	<!-- Pending tasks -->
	<div class="mb-8">
		<h2 class="text-lg font-medium mb-4">Pending Tasks</h2>
		{#if pendingTasks.length === 0}
			<p class="text-gray-500">No pending tasks. Add one above!</p>
		{:else}
			<div class="space-y-3">
				{#each pendingTasks as task (task.id)}
					<div class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
						<div class="flex items-center gap-3">
							<button
								on:click={() => tasksStore.toggleTask(task.id)}
								class="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
							>
								{#if task.completed}
									<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</button>
							<div>
								<h3 class="font-medium {task.completed ? 'line-through text-gray-400' : ''}">
									{task.title}
								</h3>
								<div class="flex items-center gap-2 mt-1">
									<span class="text-xs px-2 py-1 rounded {task.priority === 'high' ? 'bg-red-100 text-red-800' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}">
										{task.priority}
									</span>
									<span class="text-xs text-gray-500">
										Created {new Date(task.createdAt).toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>
						<button
							on:click={() => tasksStore.deleteTask(task.id)}
							class="text-gray-400 hover:text-red-500 p-1"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Completed tasks (collapsible) -->
	<div>
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-medium">Completed Tasks</h2>
			<span class="text-sm text-gray-500">{completedTasks.length} tasks</span>
		</div>
		{#if completedTasks.length === 0}
			<p class="text-gray-500">No completed tasks yet.</p>
		{:else}
			<div class="space-y-3">
				{#each completedTasks as task (task.id)}
					<div class="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-75">
						<div class="flex items-center gap-3">
							<button
								on:click={() => tasksStore.toggleTask(task.id)}
								class="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center bg-green-100"
							>
								<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							</button>
							<div>
								<h3 class="font-medium line-through text-gray-500">
									{task.title}
								</h3>
								<div class="flex items-center gap-2 mt-1">
									<span class="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">
										{task.priority}
									</span>
									<span class="text-xs text-gray-500">
										Completed {new Date(task.completedAt || task.createdAt).toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>
						<button
							on:click={() => tasksStore.deleteTask(task.id)}
							class="text-gray-400 hover:text-red-500 p-1"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>