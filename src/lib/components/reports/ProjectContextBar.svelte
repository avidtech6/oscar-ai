<script lang="ts">
	import type { Project } from '$lib/db';
	
	export let selectedProject: Project | undefined;
	export let trees: any[] = [];
	export let notes: any[] = [];
	export let tasks: any[] = [];
	
	export let changeProject: () => void;
</script>

<div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
	<div>
		{#if selectedProject}
			<h2 class="font-medium text-blue-800">Building report for:</h2>
			<p class="text-blue-700 text-lg font-semibold">{selectedProject.name}</p>
			<p class="text-blue-600 text-sm">
				{trees.length} trees, {notes.length} notes, {tasks.length} tasks available
			</p>
		{:else}
			<h2 class="font-medium text-blue-800">Select a project to begin.</h2>
			<p class="text-blue-600 text-sm">
				All reports must be linked to a project.
			</p>
		{/if}
	</div>
	{#if selectedProject}
		<button
			on:click={changeProject}
			class="btn btn-secondary text-sm"
		>
			Change Project
		</button>
	{/if}
</div>

<style>
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
	
	.btn-secondary {
		background-color: white;
		color: #374151;
		border-color: #d1d5db;
	}
	
	.btn-secondary:hover {
		background-color: #f9fafb;
	}
</style>