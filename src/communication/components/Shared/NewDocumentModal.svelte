<script lang="ts">
	export let show: boolean = false;
	export let document: {
		title: string;
		type: 'document' | 'spreadsheet' | 'kanban';
		workspaceId: string;
		userId: string;
		content: any;
		collaborators: string[];
	};
	
	export let workspaces: Array<{ id: string; name: string }> = [];
	
	// Define a type for the document to avoid circular reference
	type DocumentData = {
		title: string;
		type: 'document' | 'spreadsheet' | 'kanban';
		workspaceId: string;
		userId: string;
		content: any;
		collaborators: string[];
	};
	
	export let onCreate: (document: DocumentData) => Promise<boolean>;
	export let onClose: () => void;
	
	async function handleSubmit() {
		if (!document.title.trim()) {
			alert('Please enter a document title');
			return;
		}
		
		if (!document.workspaceId) {
			alert('Please select a workspace');
			return;
		}
		
		const success = await onCreate(document);
		if (success) {
			onClose();
		}
	}
</script>

{#if show}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-900">Create New Document</h3>
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
						Document Title *
					</label>
					<input
						type="text"
						bind:value={document.title}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="e.g., Project Requirements"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Document Type
					</label>
					<select
						bind:value={document.type}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="document">Document</option>
						<option value="spreadsheet">Spreadsheet</option>
						<option value="kanban">Kanban Board</option>
					</select>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Workspace *
					</label>
					<select
						bind:value={document.workspaceId}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="">Select a workspace</option>
						{#each workspaces as workspace}
							<option value={workspace.id}>{workspace.name}</option>
						{/each}
					</select>
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
						Create Document
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}