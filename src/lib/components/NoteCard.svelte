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
</script>

<div class="note-card">
	<div class="note-card-header">
		<div class="note-category" class:category-{note.category}>
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
		<button class="btn-action" on:click={() => onExpand(note.id)}>
			👁️ View
		</button>
		<button class="btn-action" on:click={() => onEdit(note.id)}>
			✏️ Edit
		</button>
		<button class="btn-action delete" on:click={() => onDelete(note.id)}>
			🗑️ Delete
		</button>
	</div>
</div>

<style>
	.note-card {
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		border-left: 4px solid #10b981;
	}
	
	.note-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #f3f4f6;
	}
	
	.note-category {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		text-transform: uppercase;
	}
	
	.note-category.category-field {
		background: #f0fdf4;
		color: #166534;
	}
	
	.note-category.category-observation {
		background: #f0f9ff;
		color: #0369a1;
	}
	
	.note-category.category-measurement {
		background: #fef3c7;
		color: #92400e;
	}
	
	.note-category.category-planning {
		background: #f5f3ff;
		color: #7c3aed;
	}
	
	.note-date {
		font-size: 0.75rem;
		color: #6b7280;
	}
	
	.note-card-body {
		padding: 1.5rem;
		flex: 1;
	}
	
	.note-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.75rem 0;
		line-height: 1.4;
	}
	
	.note-content {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0 0 1rem 0;
		line-height: 1.5;
	}
	
	.note-location, .note-species, .note-attachments {
		font-size: 0.75rem;
		color: #4b5563;
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
		color: #6b7280;
		background: #f9fafb;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}
	
	.note-card-actions {
		padding: 1rem 1.5rem;
		border-top: 1px solid #f3f4f6;
		display: flex;
		gap: 0.5rem;
	}
	
	.btn-action {
		flex: 1;
		background: #f9fafb;
		color: #374151;
		border: 1px solid #e5e7eb;
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
		background: white;
		border-color: #9ca3af;
	}
	
	.btn-action.delete {
		color: #dc2626;
	}
	
	.btn-action.delete:hover {
		background: #fef2f2;
		border-color: #fca5a5;
	}
</style>