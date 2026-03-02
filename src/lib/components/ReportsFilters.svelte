<script lang="ts">
	export let searchQuery = '';
	export let selectedType = 'all';
	export let selectedStatus = 'all';
	
	export const reportTypes = [
		{ id: 'all', label: 'All Types' },
		{ id: 'risk', label: 'Risk Assessment' },
		{ id: 'method', label: 'Method Statement' },
		{ id: 'survey', label: 'Survey Report' },
		{ id: 'management', label: 'Management Plan' },
		{ id: 'inspection', label: 'Inspection Report' }
	];
	
	export const statusOptions = [
		{ id: 'all', label: 'All Status' },
		{ id: 'draft', label: 'Draft' },
		{ id: 'review', label: 'In Review' },
		{ id: 'published', label: 'Published' },
		{ id: 'archived', label: 'Archived' }
	];
</script>

<div class="filters-section">
	<div class="search-box">
		🔍
		<input 
			type="search" 
			placeholder="Search reports by title, client, or description..." 
			bind:value={searchQuery}
		/>
	</div>
	
	<div class="filter-controls">
		<div class="filter-group">
			<label for="type-filter">Report Type</label>
			<select id="type-filter" bind:value={selectedType}>
				{#each reportTypes as type}
					<option value={type.id}>{type.label}</option>
				{/each}
			</select>
		</div>
		
		<div class="filter-group">
			<label for="status-filter">Status</label>
			<select id="status-filter" bind:value={selectedStatus}>
				{#each statusOptions as status}
					<option value={status.id}>{status.label}</option>
				{/each}
			</select>
		</div>
	</div>
</div>

<style>
	.filters-section {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	.search-box {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 0.75rem 1rem;
		margin-bottom: 1.5rem;
	}
	
	.search-box input {
		flex: 1;
		background: none;
		border: none;
		outline: none;
		font-size: 0.875rem;
		color: #111827;
	}
	
	.search-box input::placeholder {
		color: #9ca3af;
	}
	
	.filter-controls {
		display: flex;
		gap: 1.5rem;
	}
	
	.filter-group {
		flex: 1;
	}
	
	.filter-group label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}
	
	.filter-group select {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		font-size: 0.875rem;
		color: #111827;
		outline: none;
		cursor: pointer;
	}
	
	.filter-group select:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
</style>