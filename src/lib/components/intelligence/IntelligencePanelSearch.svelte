<script lang="ts">
	export let searchQuery = '';
	export let placeholder = 'Search phase files...';
</script>

<div class="search-box">
	<input 
		type="text" 
		bind:value={searchQuery}
		placeholder={placeholder}
		class="search-input"
	/>
	<div class="search-icon">🔍</div>
</div>

<style>
	.search-box {
		position: relative;
		margin-bottom: 1rem;
	}

	.search-input {
		width: 100%;
		padding: 0.5rem 2.5rem 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		color: #374151;
	}

	.search-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.search-icon {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: #9ca3af;
	}
</style>