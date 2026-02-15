<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	
	// Redirect directly to dashboard - no auth required in dev
	onMount(() => {
		goto('/dashboard', { replaceState: true });
	});
</script>

<svelte:head>
	<title>Oscar AI - Loading...</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-forest-800 via-forest-700 to-oak-600 flex items-center justify-center p-4">
	<div class="text-center text-white">
		<div class="text-6xl mb-6">🌳</div>
		<h1 class="text-4xl font-bold mb-4">Oscar AI</h1>
		<p class="text-forest-200 text-lg">Loading...</p>
	</div>
</div>
