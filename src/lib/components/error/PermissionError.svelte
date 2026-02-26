<script lang="ts">
	export let type: 'camera' | 'microphone' | 'storage' | 'general' = 'general';
	export let message = '';
	export let retry: () => void = () => {};

	function getTitle() {
		switch (type) {
			case 'camera': return 'Camera permission required';
			case 'microphone': return 'Microphone permission required';
			case 'storage': return 'Storage access required';
			default: return 'Permission needed';
		}
	}

	function getDescription() {
		switch (type) {
			case 'camera':
				return 'To use the camera feature, please allow camera access in your browser settings.';
			case 'microphone':
				return 'To record voice notes, please allow microphone access in your browser settings.';
			case 'storage':
				return 'To save your work, please allow storage access (IndexedDB) in your browser settings.';
			default:
				return message || 'This feature requires a permission that hasn’t been granted.';
		}
	}

	function getIcon() {
		switch (type) {
			case 'camera':
				return `<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`;
			case 'microphone':
				return `<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>`;
			case 'storage':
				return `<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>`;
			default:
				return `<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>`;
		}
	}
</script>

<div class="min-h-[50vh] flex items-center justify-center p-6">
	<div class="max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 text-center">
		<div class="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
			{@html getIcon()}
		</div>
		<h1 class="text-2xl font-bold text-gray-900 mb-2">{getTitle()}</h1>
		<p class="text-gray-600 mb-6">
			{getDescription()}
		</p>

		<div class="space-y-3">
			<button
				on:click={retry}
				class="w-full py-3 bg-forest-600 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors"
			>
				Try again
			</button>
			<button
				on:click={() => window.location.href = '/help'}
				class="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
			>
				View help guide
			</button>
			<button
				on:click={() => window.history.back()}
				class="w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
			>
				Go back
			</button>
		</div>

		<div class="mt-8 pt-6 border-t border-gray-200 text-left">
			<h3 class="text-sm font-medium text-gray-700 mb-2">How to grant permission:</h3>
			<ul class="text-sm text-gray-600 space-y-1">
				<li>1. Look for a permission prompt near the address bar</li>
				<li>2. Click "Allow" or "Grant"</li>
				<li>3. If no prompt appears, check browser settings</li>
				<li>4. Ensure your browser supports this feature</li>
			</ul>
		</div>
	</div>
</div>