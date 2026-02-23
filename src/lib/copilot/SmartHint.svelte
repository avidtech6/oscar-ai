<script lang="ts">
	export let hint = '';
	
	$: displayHint = hint || getDefaultHint();
	
	function getDefaultHint() {
		const hints = [
			"Try asking: 'Summarize this project'",
			"Try asking: 'What trees need attention?'",
			"Try asking: 'Generate a report outline'",
			"Try asking: 'Help me write a note'",
			"Try asking: 'What photos are missing?'"
		];
		return hints[Math.floor(Math.random() * hints.length)];
	}
</script>

<div class="flex items-center text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
	<svg class="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
	<span class="truncate">{displayHint}</span>
</div>