<script lang="ts">
	export let newKey = {
		keyName: '',
		plaintextKey: '',
		provider: 'openai' as const,
		modelFamily: ''
	};
	export let isLoading = false;
	export let addKey: () => void = () => {};
	export let cancel: () => void = () => {};
</script>

<!-- Add Key Form -->
<div class="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
	<h2 class="text-xl font-semibold text-gray-900 mb-4">Add New API Key</h2>
	
	<form on:submit|preventDefault={addKey} class="space-y-4">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="keyName" class="block text-sm font-medium text-gray-700 mb-1">
					Key Name *
				</label>
				<input
					id="keyName"
					type="text"
					bind:value={newKey.keyName}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="e.g., OpenAI Production Key"
					required
				/>
			</div>
			
			<div>
				<label for="provider" class="block text-sm font-medium text-gray-700 mb-1">
					Provider *
				</label>
				<select
					id="provider"
					bind:value={newKey.provider}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="openai">OpenAI</option>
					<option value="anthropic">Anthropic</option>
					<option value="google">Google AI</option>
					<option value="azure">Azure OpenAI</option>
					<option value="grok">Grok</option>
					<option value="custom">Custom</option>
				</select>
			</div>
		</div>
		
		<div>
			<label for="modelFamily" class="block text-sm font-medium text-gray-700 mb-1">
				Model Family (Optional)
			</label>
			<input
				id="modelFamily"
				type="text"
				bind:value={newKey.modelFamily}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="e.g., gpt-4, claude-3"
			/>
		</div>
		
		<div>
			<label for="plaintextKey" class="block text-sm font-medium text-gray-700 mb-1">
				API Key *
			</label>
			<input
				id="plaintextKey"
				type="password"
				bind:value={newKey.plaintextKey}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="sk-..."
				required
			/>
			<p class="mt-1 text-sm text-gray-500">
				Your API key is encrypted locally before storage and never sent to our servers in plaintext.
			</p>
		</div>
		
		<div class="flex justify-end gap-3 pt-4">
			<button
				type="button"
				on:click={cancel}
				class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
			>
				Cancel
			</button>
			<button
				type="submit"
				disabled={isLoading}
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? 'Adding...' : 'Add Key'}
			</button>
		</div>
	</form>
</div>