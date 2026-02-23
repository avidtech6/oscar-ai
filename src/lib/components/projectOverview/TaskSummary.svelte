<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Task } from '$lib/db';

	export let tasks: Task[] = [];
	export let projectId: string = '';

	// Calculate task statistics
	$: taskStats = {
		total: tasks.length,
		todo: tasks.filter(t => t.status === 'todo').length,
		inProgress: tasks.filter(t => t.status === 'in_progress').length,
		done: tasks.filter(t => t.status === 'done').length,
		archived: tasks.filter(t => t.status === 'archived').length,
		highPriority: tasks.filter(t => t.priority === 'high').length,
		mediumPriority: tasks.filter(t => t.priority === 'medium').length,
		lowPriority: tasks.filter(t => t.priority === 'low').length
	};

	// Get recent tasks (sorted by date, newest first)
	$: recentTasks = tasks
		.slice()
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
		.slice(0, 3);

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'todo': return 'bg-gray-100 text-gray-800';
			case 'in_progress': return 'bg-blue-100 text-blue-800';
			case 'done': return 'bg-green-100 text-green-800';
			case 'archived': return 'bg-purple-100 text-purple-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'todo': return 'To Do';
			case 'in_progress': return 'In Progress';
			case 'done': return 'Done';
			case 'archived': return 'Archived';
			default: return status;
		}
	}

	function getPriorityColor(priority: string): string {
		switch (priority) {
			case 'high': return 'bg-red-100 text-red-800';
			case 'medium': return 'bg-yellow-100 text-yellow-800';
			case 'low': return 'bg-green-100 text-green-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function getPriorityLabel(priority: string): string {
		switch (priority) {
			case 'high': return 'High';
			case 'medium': return 'Medium';
			case 'low': return 'Low';
			default: return priority;
		}
	}

	function handleViewAll() {
		goto(`/tasks?project=${projectId}`);
	}

	function handleViewTask(taskId: string | undefined) {
		if (!taskId) return;
		goto(`/tasks?task=${taskId}`);
	}
</script>

<div class="border border-gray-200 rounded-lg p-4 h-full flex flex-col">
	<div class="flex justify-between items-center mb-4">
		<h3 class="font-medium text-gray-700">Tasks Summary</h3>
		<button
			on:click={handleViewAll}
			class="text-sm text-blue-500 hover:text-blue-700 font-medium"
		>
			View All
		</button>
	</div>

	{#if tasks.length === 0}
		<div class="flex-1 flex items-center justify-center text-gray-400 text-sm">
			<p>No tasks yet</p>
		</div>
	{:else}
		<!-- Task Statistics -->
		<div class="mb-4">
			<div class="grid grid-cols-2 gap-2 mb-3">
				<div class="text-center p-2 bg-gray-50 rounded">
					<div class="text-lg font-semibold text-gray-800">{taskStats.total}</div>
					<div class="text-xs text-gray-500">Total</div>
				</div>
				<div class="text-center p-2 bg-blue-50 rounded">
					<div class="text-lg font-semibold text-blue-800">{taskStats.inProgress}</div>
					<div class="text-xs text-blue-600">In Progress</div>
				</div>
				<div class="text-center p-2 bg-green-50 rounded">
					<div class="text-lg font-semibold text-green-800">{taskStats.done}</div>
					<div class="text-xs text-green-600">Done</div>
				</div>
				<div class="text-center p-2 bg-red-50 rounded">
					<div class="text-lg font-semibold text-red-800">{taskStats.highPriority}</div>
					<div class="text-xs text-red-600">High Priority</div>
				</div>
			</div>
		</div>

		<!-- Recent Tasks -->
		<div class="space-y-3 flex-1">
			<h4 class="text-sm font-medium text-gray-600 mb-2">Recent Tasks</h4>
			{#each recentTasks as task (task.id)}
				<div
					on:click={() => handleViewTask(task.id)}
					class="border border-gray-100 rounded p-3 hover:bg-gray-50 cursor-pointer transition-colors"
				>
					<div class="flex justify-between items-start mb-1">
						<h4 class="font-medium text-gray-800 text-sm truncate">{task.title}</h4>
						<span class="text-xs text-gray-500 whitespace-nowrap ml-2">
							{formatDate(task.createdAt)}
						</span>
					</div>
					<div class="flex items-center gap-2 mt-2">
						<span class="text-xs px-2 py-1 rounded {getStatusColor(task.status)}">
							{getStatusLabel(task.status)}
						</span>
						<span class="text-xs px-2 py-1 rounded {getPriorityColor(task.priority)}">
							{getPriorityLabel(task.priority)}
						</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mt-4 pt-3 border-t border-gray-100">
		<button
			on:click={() => goto(`/tasks?project=${projectId}&action=create`)}
			class="w-full btn btn-outline btn-sm"
		>
			+ Create Task
		</button>
	</div>
</div>