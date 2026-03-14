<script lang="ts">
	export let tabs: Array<{ id: string; label: string; icon: string }> = [];
	export let activeTab = '';
	export let onTabChange: (id: string) => void = () => {};
</script>

<div class="tabs">
	{#each tabs as tab}
		<button 
			class="tab-button {activeTab === tab.id ? 'active' : ''}"
			on:click={() => onTabChange(tab.id)}
		>
			<span class="tab-icon">{tab.icon}</span>
			<span class="tab-label">{tab.label}</span>
		</button>
	{/each}
</div>

<style>
	.tabs {
		display: flex;
		gap: 0.25rem;
		margin-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 0.5rem;
	}

	.tab-button {
		background: transparent;
		border: none;
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		color: #6b7280;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	.tab-button:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.tab-button.active {
		background: #3b82f6;
		color: white;
	}

	.tab-icon {
		font-size: 0.875rem;
	}

	.tab-label {
		font-weight: 500;
	}
</style>