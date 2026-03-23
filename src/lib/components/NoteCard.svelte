<script lang="ts">
	export let note: {
		id: number;
		title: string;
		content: string;
		category: string;
		tags: string[];
		date: string;
		location?: string;
		treeSpecies?: string[];
		attachments?: number;
	};
	
	export let onEdit: (id: number) => void = () => {};
	export let onDelete: (id: number) => void = () => {};
	export let onExpand: (id: number) => void = () => {};
	export let onExport: (id: number) => void = () => {};
</script>

<div class="note-card">
	<div class="note-card-header">
		<div class="note-category category-{note.category}">
			{note.category}
		</div>
		<div class="note-date">{note.date}</div>
	</div>
	
	<div class="note-card-body">
		<h3 class="note-title">{note.title}</h3>
		<p class="note-content">{note.content}</p>
		
		{#if note.location}
			<div class="note-location">
				📍 {note.location}
			</div>
		{/if}
		
		{#if note.treeSpecies && note.treeSpecies.length > 0}
			<div class="note-species">
				🌳 {note.treeSpecies.join(', ')}
			</div>
		{/if}
		
		<div class="note-tags">
			{#each note.tags as tag}
				<span class="tag">#{tag}</span>
			{/each}
		</div>
		
		{#if note.attachments && note.attachments > 0}
			<div class="note-attachments">
				📎 {note.attachments} attachment{note.attachments === 1 ? '' : 's'}
			</div>
		{/if}
	</div>
	
	<div class="note-card-actions">
		<button class="btn-action" onclick={() => onExpand(note.id)}>
			👁️ View
		</button>
		<button class="btn-action" onclick={() => onEdit(note.id)}>
			✏️ Edit
		</button>
		<button class="btn-action" onclick={() => onExport(note.id)} title="Export">
			📤 Export
		</button>
		<button class="btn-action delete" onclick={() => onDelete(note.id)}>
			🗑️ Delete
		</button>
	</div>
</div>

<style>
	.note-card {
		background: var(--background);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		display: flex;
		flex-direction: column;
		border-left: 4px solid var(--primary);
		transition: all 0.2s ease;
	}
	
	.note-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
	}
	
	.note-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}
	
	.note-category {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		text-transform: uppercase;
		background: var(--primary);
		color: white;
	}
	
	.note-category.category-field {
		background: #10b981;
	}
	
	.note-category.category-observation {
		background: #3b82f6;
	}
	
	.note-category.category-measurement {
		background: #f59e0b;
	}
	
	.note-category.category-planning {
		background: #8b5cf6;
	}
	
	.note-date {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}
	
	.note-card-body {
		padding: 1.5rem;
		flex: 1;
	}
	
	.note-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 0.75rem 0;
		line-height: 1.4;
	}
	
	.note-content {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0 0 1rem 0;
		line-height: 1.5;
	}
	
	.note-location, .note-species, .note-attachments {
		font-size: 0.75rem;
		color: var(--text-secondary);
		margin-bottom: 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.note-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1rem;
	}
	
	.tag {
		font-size: 0.75rem;
		color: var(--text-secondary);
		background: var(--background-hover);
		padding: 0.25rem 0.5rem;
		border-radius: 6px;
		border: 1px solid var(--border);
	}
	
	.note-card-actions {
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--border);
		display: flex;
		gap: 0.5rem;
	}
	
	.btn-action {
		flex: 1;
		background: var(--background);
		color: var(--text);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
	}
	
	.btn-action:hover {
		background: var(--background-hover);
		border-color: var(--primary);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);
	}
	
	.btn-action.delete {
		color: #dc2626;
	}
	
	.btn-action.delete:hover {
		background: rgba(220, 38, 38, 0.1);
		border-color: #dc2626;
	}
	
	@media (max-width: 768px) {
		.note-card {
			margin-bottom: 1rem;
		}
		
		.note-card-header {
			padding: 0.75rem 1rem;
		}
		
		.note-card-body {
			padding: 1rem;
		}
		
		.note-card-actions {
			padding: 0.75rem 1rem;
			gap: 0.25rem;
		}
		
		.btn-action {
			padding: 0.375rem;
			font-size: 0.75rem;
		}
	}
</style>