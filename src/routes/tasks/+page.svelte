<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="page">
	<h1>Tasks</h1>
	<p class="subtitle">Manage your arboricultural tasks and to‑dos.</p>
	
	<div class="placeholder-content">
		<div class="placeholder-card">
			<h2>📋 Task Management</h2>
			<p>This section is under construction. In the future you'll be able to create, assign, and track tasks related to tree surveys, reports, and maintenance.</p>
			<ul>
				<li>Create new tasks</li>
				<li>Assign to team members</li>
				<li>Set due dates and priorities</li>
				<li>Track completion status</li>
			</ul>
			<button class="btn" on:click={() => alert('Feature coming soon!')}>Create a Task</button>
		</div>
		
		<div class="placeholder-card">
			<h2>📅 Upcoming</h2>
			<p>No tasks scheduled.</p>
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
	.placeholder-content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}
	.placeholder-card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		border: 1px solid #e5e7eb;
	}
	.placeholder-card h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 1rem;
	}
	.placeholder-card p {
		color: #4b5563;
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}
	.placeholder-card ul {
		padding-left: 1.5rem;
		margin-bottom: 1.5rem;
	}
	.placeholder-card li {
		color: #4b5563;
		margin-bottom: 0.5rem;
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
</style>