<script lang="ts">
	export let show: boolean = false;
	export let workspace: {
		name: string;
		description: string;
		ownerId: string;
		members: string[];
		documents: string[];
	};
	
	// Define a type for the workspace to avoid circular reference
	type WorkspaceData = {
		name: string;
		description: string;
		ownerId: string;
		members: string[];
		documents: string[];
	};
	
	export let onCreate: (workspace: WorkspaceData) => Promise<boolean>;
	export let onClose: () => void;
	
	async function handleSubmit() {
		if (!workspace.name.trim()) {
			alert('Please enter a workspace name');
			return;
		}
		
		const success = await onCreate(workspace);
		if (success) {
			onClose();
		}
	}
</script>

{#if show}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900">Create New Workspace</h3>
				<button
					on:click={onClose}
					class="text-gray-400 hover:text-gray-600"
				>
					✕
				</button>
			</div>
			
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Workspace Name *
					</label>
					<input
						type="text"
						bind:value={workspace.name}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="e.g., Marketing Campaigns"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Description
					</label>
					<textarea
						bind:value={workspace.description}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						rows={3}
						placeholder="Describe the purpose of this workspace..."
					/>
				</div>
				
				<div class="flex justify-end space-x-3 pt-4">
					<button
						on:click={onClose}
						class="px-4 py-2 text-gray-700 hover:text-gray-900"
					>
						Cancel
					</button>
					<button
						on:click={handleSubmit}
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Create Workspace
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}