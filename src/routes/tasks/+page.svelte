<script lang="ts">
	import { page } from '$app/stores';

	let tasks = [
		{ id: 1, title: 'Complete Oak Park risk assessment', priority: 'high', due: 'Today', assignee: 'You', status: 'in-progress' },
		{ id: 2, title: 'Review arboricultural method statement', priority: 'medium', due: 'Tomorrow', assignee: 'Team', status: 'pending' },
		{ id: 3, title: 'Schedule tree survey with client', priority: 'low', due: 'Mar 10', assignee: 'You', status: 'pending' },
		{ id: 4, title: 'Update woodland management plan', priority: 'medium', due: 'Mar 12', assignee: 'Team', status: 'completed' },
		{ id: 5, title: 'Prepare quarterly report', priority: 'high', due: 'Mar 15', assignee: 'You', status: 'in-progress' }
	];

	let newTaskTitle = '';

	function addTask() {
		if (!newTaskTitle.trim()) return;
		tasks = [
			...tasks,
			{
				id: tasks.length + 1,
				title: newTaskTitle,
				priority: 'medium',
				due: 'Soon',
				assignee: 'You',
				status: 'pending'
			}
		];
		newTaskTitle = '';
	}

	function toggleStatus(taskId: number) {
		tasks = tasks.map(t =>
			t.id === taskId
				? { ...t, status: t.status === 'completed' ? 'in-progress' : 'completed' }
				: t
		);
	}
</script>

<div class="page">
	<h1>Tasks</h1>
	<p class="subtitle">Manage your arboricultural tasks and to‑dos.</p>

	<div class="stats-row">
		<div class="stat-card">
			<div class="stat-icon">📋</div>
			<div class="stat-content">
				<div class="stat-value">{tasks.length}</div>
				<div class="stat-label">Total Tasks</div>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon">⏳</div>
			<div class="stat-content">
				<div class="stat-value">{tasks.filter(t => t.status === 'in-progress').length}</div>
				<div class="stat-label">In Progress</div>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon">✅</div>
			<div class="stat-content">
				<div class="stat-value">{tasks.filter(t => t.status === 'completed').length}</div>
				<div class="stat-label">Completed</div>
			</div>
		</div>
	</div>

	<div class="content-grid">
		<div class="card">
			<h2>📝 Task List</h2>
			<div class="task-list">
				{#each tasks as task (task.id)}
					<div class="task-item {task.status}">
						<div class="task-checkbox" onclick={() => toggleStatus(task.id)}>
							{#if task.status === 'completed'}✅{:else}⬜{/if}
						</div>
						<div class="task-details">
							<div class="task-title">{task.title}</div>
							<div class="task-meta">
								<span class="priority priority-{task.priority}">{task.priority}</span>
								<span class="due">Due: {task.due}</span>
								<span class="assignee">Assigned to: {task.assignee}</span>
							</div>
						</div>
						<div class="task-actions">
							<button class="btn-small" onclick={() => console.log('Edit', task.id)}>Edit</button>
						</div>
					</div>
				{/each}
			</div>
			<div class="add-task">
				<input
					type="text"
					bind:value={newTaskTitle}
					placeholder="Add a new task..."
					onkeydown={(e) => e.key === 'Enter' && addTask()}
				/>
				<button class="btn" onclick={addTask}>Add Task</button>
			</div>
		</div>

		<div class="card">
			<h2>📅 Upcoming Deadlines</h2>
			<div class="deadline-list">
				{#each tasks.filter(t => t.status !== 'completed') as task}
					<div class="deadline-item">
						<div class="deadline-date">{task.due}</div>
						<div class="deadline-title">{task.title}</div>
						<div class="deadline-priority priority-{task.priority}">{task.priority}</div>
					</div>
				{/each}
			</div>
			<p class="hint">Prioritize high‑priority tasks to stay on schedule.</p>
		</div>
	</div>
</div>

<style>
	.page {
		padding: 2rem;
	}
	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 0.5rem;
	}
	.subtitle {
		color: #6b7280;
		font-size: 1.125rem;
		margin-bottom: 2rem;
	}
	.stats-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}
	.stat-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border-left: 4px solid #3b82f6;
	}
	.stat-icon {
		font-size: 2rem;
	}
	.stat-content {
		flex: 1;
	}
	.stat-value {
		font-size: 1.75rem;
		font-weight: 700;
		color: #111827;
		line-height: 1;
	}
	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
		margin-top: 0.25rem;
	}
	.content-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 2rem;
	}
	.card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		border: 1px solid #e5e7eb;
	}
	.card h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 1.5rem;
	}
	.task-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}
	.task-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		transition: background 0.2s;
	}
	.task-item.completed {
		opacity: 0.7;
		background: #f9fafb;
	}
	.task-checkbox {
		cursor: pointer;
		font-size: 1.25rem;
		user-select: none;
	}
	.task-details {
		flex: 1;
	}
	.task-title {
		font-weight: 500;
		color: #111827;
		margin-bottom: 0.25rem;
	}
	.task-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.75rem;
		color: #6b7280;
	}
	.priority {
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		font-weight: 600;
		text-transform: uppercase;
	}
	.priority-high {
		background: #fee2e2;
		color: #991b1b;
	}
	.priority-medium {
		background: #fef3c7;
		color: #92400e;
	}
	.priority-low {
		background: #d1fae5;
		color: #065f46;
	}
	.task-actions .btn-small {
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		cursor: pointer;
	}
	.add-task {
		display: flex;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}
	.add-task input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
	}
	.btn {
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}
	.btn:hover {
		background: #2563eb;
	}
	.deadline-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.deadline-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem;
		border-bottom: 1px solid #f3f4f6;
	}
	.deadline-date {
		font-weight: 600;
		color: #111827;
		min-width: 60px;
	}
	.deadline-title {
		flex: 1;
		color: #4b5563;
	}
	.hint {
		font-size: 0.875rem;
		color: #6b7280;
		margin-top: 1.5rem;
	}
</style>