<script lang="ts">
	export let searchQuery = '';
	export let onSearch: (e: Event) => void = () => {};
</script>

<form onsubmit={onSearch} class="search-form">
	<input
		type="search"
		placeholder="Search reports, notes, or intelligence..."
		bind:value={searchQuery}
		aria-label="Search"
	/>
	<button type="submit" aria-label="Search">
		🔍
	</button>
</form>

<style>
	.search-form {
		position: relative;
		width: 100%;
		max-width: 400px;
	}

	.search-form input {
		width: 100%;
		padding: 0.5rem 1rem 0.5rem 2.5rem;
		border: 1px solid #d1d5db;
		border-radius: 9999px;
		font-size: 0.875rem;
		outline: none;
		transition: border-color 0.2s ease;
	}

	.search-form input:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.search-form button {
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		font-size: 1rem;
		color: #6b7280;
		cursor: pointer;
	}
</style>