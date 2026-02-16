<script lang="ts">
	export let isOpen: boolean = false;
	
	// Tree form data
	let newTree = {
		number: '',
		species: '',
		scientificName: '',
		DBH: 0,
		height: 0,
		age: '',
		category: '' as 'A' | 'B' | 'C' | 'U' | '',
		condition: '',
		notes: ''
	};

	// Events
	export let onClose: () => void = () => {};
	export let onSave: (treeData: typeof newTree) => void = () => {};

	function handleSubmit() {
		if (!newTree.number || !newTree.species) {
			alert('Please fill in required fields: Tree Number and Species');
			return;
		}
		
		onSave(newTree);
		resetForm();
		onClose();
	}

	function resetForm() {
		newTree = {
			number: '',
			species: '',
			scientificName: '',
			DBH: 0,
			height: 0,
			age: '',
			category: '',
			condition: '',
			notes: ''
		};
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
		on:keydown={handleKeydown}
		tabindex="0"
		role="dialog"
		aria-label="Add New Tree"
		aria-modal="true"
	>
		<div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
			<div class="p-4 border-b border-gray-200 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-gray-900">Add New Tree</h2>
				<button
					on:click={onClose}
					class="text-gray-400 hover:text-gray-600"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
				<form on:submit|preventDefault={handleSubmit} class="space-y-6">
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div>
							<label for="treeNumber" class="block text-sm font-medium text-gray-700 mb-1">
								Tree Number *
							</label>
							<input
								id="treeNumber"
								type="text"
								bind:value={newTree.number}
								placeholder="e.g., T1"
								class="input w-full"
								required
							/>
						</div>

						<div>
							<label for="species" class="block text-sm font-medium text-gray-700 mb-1">
								Species *
							</label>
							<input
								id="species"
								type="text"
								bind:value={newTree.species}
								placeholder="e.g., English Oak"
								class="input w-full"
								required
							/>
						</div>

						<div>
							<label for="scientificName" class="block text-sm font-medium text-gray-700 mb-1">
								Scientific Name
							</label>
							<input
								id="scientificName"
								type="text"
								bind:value={newTree.scientificName}
								placeholder="e.g., Quercus robur"
								class="input w-full"
							/>
						</div>

						<div>
							<label for="DBH" class="block text-sm font-medium text-gray-700 mb-1">
								DBH (mm)
							</label>
							<input
								id="DBH"
								type="number"
								bind:value={newTree.DBH}
								placeholder="e.g., 450"
								class="input w-full"
								min="0"
								step="1"
							/>
						</div>

						<div>
							<label for="height" class="block text-sm font-medium text-gray-700 mb-1">
								Height (m)
							</label>
							<input
								id="height"
								type="number"
								bind:value={newTree.height}
								placeholder="e.g., 12"
								class="input w-full"
								min="0"
								step="0.1"
							/>
						</div>

						<div>
							<label for="age" class="block text-sm font-medium text-gray-700 mb-1">
								Age Class
							</label>
							<select id="age" bind:value={newTree.age} class="input w-full">
								<option value="">Select...</option>
								<option value="Young">Young</option>
								<option value="Semi-mature">Semi-mature</option>
								<option value="Mature">Mature</option>
								<option value="Over-mature">Over-mature</option>
								<option value="Ancient">Ancient</option>
							</select>
						</div>

						<div>
							<label for="category" class="block text-sm font-medium text-gray-700 mb-1">
								Category
							</label>
							<select id="category" bind:value={newTree.category} class="input w-full">
								<option value="">Select...</option>
								<option value="A">A - High Quality</option>
								<option value="B">B - Moderate Quality</option>
								<option value="C">C - Low Quality</option>
								<option value="U">U - Unsuitable</option>
							</select>
						</div>

						<div>
							<label for="condition" class="block text-sm font-medium text-gray-700 mb-1">
								Condition
							</label>
							<input
								id="condition"
								type="text"
								bind:value={newTree.condition}
								placeholder="e.g., Good"
								class="input w-full"
							/>
						</div>
					</div>

					<div>
						<label for="treeNotes" class="block text-sm font-medium text-gray-700 mb-1">
							Notes
						</label>
						<textarea
							id="treeNotes"
							bind:value={newTree.notes}
							placeholder="Additional observations..."
							rows="3"
							class="input w-full"
						></textarea>
					</div>

					<div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
						<button
							type="button"
							on:click={onClose}
							class="btn btn-secondary"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="btn btn-primary"
						>
							Add Tree
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}