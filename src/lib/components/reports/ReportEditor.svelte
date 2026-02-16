<script lang="ts">
	export let generatedReport = '';
	export let selectedTemplate: any = null;
	export let selectedProject: any = undefined;
	
	export let enterSectionEditMode: () => void;
	export let copyToClipboard: () => void;
	export let downloadAsHtml: () => void;
	export let startOver: () => void;
</script>

<div class="card">
	<div class="p-4 border-b border-gray-200 flex items-center justify-between">
		<h2 class="text-lg font-semibold">Edit Report</h2>
		<div class="flex gap-2">
			<button
				on:click={enterSectionEditMode}
				class="btn btn-secondary text-sm"
			>
				Edit by Sections
			</button>
			<button
				on:click={copyToClipboard}
				class="btn btn-secondary text-sm"
			>
				Copy HTML
			</button>
			<button
				on:click={downloadAsHtml}
				class="btn btn-primary text-sm"
			>
				Download HTML
			</button>
			<button
				on:click={startOver}
				class="btn btn-secondary text-sm"
			>
				New Report
			</button>
		</div>
	</div>
	
	<div class="p-6">
		<div class="mb-4">
			<textarea
				bind:value={generatedReport}
				rows="20"
				class="input w-full font-mono text-sm"
				placeholder="Edit your report HTML here..."
			></textarea>
		</div>
		
		<div class="flex gap-4">
			<button
				on:click={downloadAsHtml}
				class="btn btn-primary"
			>
				Save & Download
			</button>
			<button
				on:click={startOver}
				class="btn btn-secondary"
			>
				Discard Changes
			</button>
		</div>
	</div>
</div>

<style>
	.card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	}
	
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-weight: 500;
		font-size: 0.875rem;
		line-height: 1.25rem;
		cursor: pointer;
		transition: all 0.2s;
		border: 1px solid transparent;
	}
	
	.btn-primary {
		background-color: #059669;
		color: white;
	}
	
	.btn-primary:hover {
		background-color: #047857;
	}
	
	.btn-primary:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}
	
	.btn-secondary {
		background-color: white;
		color: #374151;
		border-color: #d1d5db;
	}
	
	.btn-secondary:hover {
		background-color: #f9fafb;
	}
	
	.input {
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		width: 100%;
	}
	
	.input:focus {
		outline: none;
		box-shadow: 0 0 0 2px #059669;
		border-color: #059669;
	}
</style>