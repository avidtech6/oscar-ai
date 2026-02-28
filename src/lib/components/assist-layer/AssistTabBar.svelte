<script lang="ts">
	export let currentTab: 'actions' | 'hints' | 'tools' | 'voice' = 'actions';
	export let onTabChange: (tab: 'actions' | 'hints' | 'tools' | 'voice') => void = () => {};
</script>

<div class="assist-tab-bar">
	<button
		class="tab-button {currentTab === 'actions' ? 'active' : ''}"
		on:click={() => onTabChange('actions')}
	>
		Actions
	</button>
	<button
		class="tab-button {currentTab === 'hints' ? 'active' : ''}"
		on:click={() => onTabChange('hints')}
	>
		Hints
	</button>
	<button
		class="tab-button {currentTab === 'tools' ? 'active' : ''}"
		on:click={() => onTabChange('tools')}
	>
		Tools
	</button>
	<button
		class="tab-button {currentTab === 'voice' ? 'active' : ''}"
		on:click={() => onTabChange('voice')}
	>
		Voice
	</button>
</div>

<style>
	.assist-tab-bar {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid #e5e7eb;
	}
	.tab-button {
		flex: 1;
		padding: 0.5rem 0.75rem;
		background: none;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.2s;
	}
	.tab-button:hover {
		background-color: #f3f4f6;
		color: #374151;
	}
	.tab-button.active {
		background-color: #3b82f6;
		color: white;
	}
</style>