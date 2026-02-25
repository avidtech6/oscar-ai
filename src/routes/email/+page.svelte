<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect to Communication Hub email section
		setTimeout(() => {
			goto('/communication?tab=email');
		}, 1000);
	});
</script>

<svelte:head>
	<title>Email - Oscar AI</title>
</svelte:head>

<div class="p-6 max-w-6xl mx-auto">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-forest-800 mb-2">Email</h1>
		<p class="text-gray-600">
			Email integration for managing client communications, notifications, and automated reports.
		</p>
	</div>

	<!-- Migration Banner -->
	<div class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
		<div class="flex items-start gap-4">
			<div class="flex-shrink-0">
				<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
			</div>
			<div>
				<h3 class="text-lg font-semibold text-blue-800 mb-1">Email Feature Moved to Communication Hub</h3>
				<p class="text-blue-700 mb-3">
					The email functionality has been enhanced and moved to the new Communication Hub. You'll be redirected automatically in a moment.
				</p>
				<div class="space-y-2">
					<div class="flex items-center gap-2">
						<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
						<span class="text-blue-700">Premium email UI with real-time updates</span>
					</div>
					<div class="flex items-center gap-2">
						<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
						<span class="text-blue-700">Email templates and campaign management</span>
					</div>
					<div class="flex items-center gap-2">
						<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
						<span class="text-blue-700">Integration with notifications and calendar</span>
					</div>
				</div>
				<div class="mt-4">
					<a href="/communication?tab=email" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
						Go to Communication Hub Now
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
						</svg>
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Loading Indicator -->
	<div class="flex flex-col items-center justify-center py-12">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
		<p class="text-gray-600">Redirecting to Communication Hub...</p>
	</div>
</div>