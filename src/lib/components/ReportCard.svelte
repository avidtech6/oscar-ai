<script lang="ts">
	export let report: {
		id: number;
		title: string;
		type: string;
		typeLabel: string;
		status: string;
		date: string;
		client: string;
		location: string;
		tags: string[];
		description: string;
	};
	
	export let onEdit: (id: number) => void = () => {};
	export let onView: (id: number) => void = () => {};
	export let onShare: (id: number) => void = () => {};
	export let onExport: (id: number) => void = () => {};
</script>

<div class="report-card status-{report.status}">
	<div class="report-card-header">
		<div class="report-type-badge type-{report.type}">
			{report.typeLabel}
		</div>
		<div class="report-status status-{report.status}">
			{report.status}
		</div>
	</div>
	
	<div class="report-card-body">
		<h3 class="report-title">{report.title}</h3>
		<p class="report-description">{report.description}</p>
		
		<div class="report-meta">
			<div class="meta-item">
				<span class="meta-label">Client:</span>
				<span class="meta-value">{report.client}</span>
			</div>
			<div class="meta-item">
				<span class="meta-label">Location:</span>
				<span class="meta-value">{report.location}</span>
			</div>
			<div class="meta-item">
				<span class="meta-label">Date:</span>
				<span class="meta-value">{report.date}</span>
			</div>
		</div>
		
		<div class="report-tags">
			{#each report.tags as tag}
				<span class="tag">#{tag}</span>
			{/each}
		</div>
	</div>
	
	<div class="report-card-actions">
		<button class="btn-action" onclick={() => onEdit(report.id)}>
			✏️ Edit
		</button>
		<button class="btn-action" onclick={() => onView(report.id)}>
			👁️ View
		</button>
		<button class="btn-action" onclick={() => onShare(report.id)}>
			↗️ Share
		</button>
		<button class="btn-action" onclick={() => onExport(report.id)} title="Export">
			📤 Export
		</button>
	</div>
</div>

<style>
	.report-card {
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		border-top: 4px solid #3b82f6;
	}
	
	.report-card.status-draft {
		border-top-color: #f59e0b;
	}
	
	.report-card.status-review {
		border-top-color: #3b82f6;
	}
	
	.report-card.status-published {
		border-top-color: #10b981;
	}
	
	.report-card.status-archived {
		border-top-color: #6b7280;
	}
	
	.report-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #f3f4f6;
	}
	
	.report-type-badge {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		text-transform: uppercase;
	}
	
	.report-type-badge.type-risk {
		background: #fee2e2;
		color: #991b1b;
	}
	
	.report-type-badge.type-method {
		background: #dbeafe;
		color: #1e40af;
	}
	
	.report-type-badge.type-survey {
		background: #f0f9ff;
		color: #0369a1;
	}
	
	.report-type-badge.type-management {
		background: #f0fdf4;
		color: #166534;
	}
	
	.report-type-badge.type-inspection {
		background: #fef3c7;
		color: #92400e;
	}
	
	.report-status {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		text-transform: uppercase;
	}
	
	.report-status.status-draft {
		background: #fef3c7;
		color: #92400e;
	}
	
	.report-status.status-review {
		background: #dbeafe;
		color: #1e40af;
	}
	
	.report-status.status-published {
		background: #d1fae5;
		color: #065f46;
	}
	
	.report-status.status-archived {
		background: #f3f4f6;
		color: #374151;
	}
	
	.report-card-body {
		padding: 1.5rem;
		flex: 1;
	}
	
	.report-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.75rem 0;
		line-height: 1.4;
	}
	
	.report-description {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0 0 1rem 0;
		line-height: 1.5;
	}
	
	.report-meta {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	
	.meta-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.meta-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: #374151;
		min-width: 60px;
	}
	
	.meta-value {
		font-size: 0.875rem;
		color: #111827;
	}
	
	.report-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	
	.tag {
		font-size: 0.75rem;
		color: #6b7280;
		background: #f9fafb;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}
	
	.report-card-actions {
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
</style>