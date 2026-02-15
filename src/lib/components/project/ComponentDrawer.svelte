<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { projectComponents, selectedComponent, type ProjectComponent } from '$lib/stores/appStore';
	
	export let isOpen: boolean = false;
	
	const dispatch = createEventDispatcher();
	
	const componentIcons: Record<string, string> = {
		text: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
		map: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>`,
		diagram: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>`,
		photo: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`,
		table: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18M10 3v18M14 3v18"/></svg>`,
		aerial: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`,
		'tree-data': `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>`,
		constraints: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`
	};
	
	const componentColors: Record<string, string> = {
		text: 'bg-blue-100 text-blue-600',
		map: 'bg-green-100 text-green-600',
		diagram: 'bg-purple-100 text-purple-600',
		photo: 'bg-yellow-100 text-yellow-600',
		table: 'bg-indigo-100 text-indigo-600',
		aerial: 'bg-teal-100 text-teal-600',
		'tree-data': 'bg-emerald-100 text-emerald-600',
		constraints: 'bg-red-100 text-red-600'
	};
	
	function handleSelectComponent(component: ProjectComponent) {
		selectedComponent.set(component);
		dispatch('select', component);
	}
	
	function handleDeleteComponent(component: ProjectComponent) {
		dispatch('delete', component);
	}
	
	function handleDragStart(event: DragEvent, component: ProjectComponent) {
		if (event.dataTransfer) {
			event.dataTransfer.setData('text/plain', component.id);
			event.dataTransfer.effectAllowed = 'move';
		}
	}
	
	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		event.dataTransfer!.dropEffect = 'move';
	}
	
	function handleDrop(event: DragEvent, targetComponent: ProjectComponent) {
		event.preventDefault();
		const sourceId = event.dataTransfer?.getData('text/plain');
		if (sourceId) {
			dispatch('reorder', { sourceId, targetId: targetComponent.id });
		}
	}
	
	function formatDate(timestamp?: string): string {
		if (!timestamp) return '';
		return new Date(timestamp).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

{#if isOpen}
	<div class="component-drawer fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-40 flex flex-col">
		<!-- Header -->
		<div class="p-4 border-b border-gray-200">
			<div class="flex items-center justify-between">
				<h3 class="font-semibold text-gray-800">Components</h3>
				<button 
					class="p-1 hover:bg-gray-100 rounded"
					on:click={() => dispatch('close')}
				>
					<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
					</svg>
				</button>
			</div>
			<p class="text-sm text-gray-500 mt-1">{$projectComponents.length} components</p>
		</div>
		
		<!-- Component List -->
		<div class="flex-1 overflow-y-auto p-2 space-y-2">
			{#each $projectComponents as component (component.id)}
				<div 
					class="component-card p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:border-blue-300 transition-colors"
					draggable="true"
					on:dragstart={(e) => handleDragStart(e, component)}
					on:dragover={handleDragOver}
					on:drop={(e) => handleDrop(e, component)}
					role="button"
					tabindex="0"
				>
					<div class="flex items-start gap-3">
						<div class="p-2 rounded-lg {componentColors[component.type] || 'bg-gray-100'}">
							{@html componentIcons[component.type] || componentIcons.text}
						</div>
						
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-gray-800 capitalize">
									{component.type.replace('-', ' ')}
								</span>
								<span class="text-xs text-gray-400">#{component.order + 1}</span>
							</div>
							
							{#if component.meta.caption}
								<p class="text-xs text-gray-500 mt-1 truncate">{component.meta.caption}</p>
							{/if}
							
							{#if component.meta.timestamp}
								<p class="text-xs text-gray-400 mt-1">{formatDate(component.meta.timestamp)}</p>
							{/if}
							
							{#if component.meta.gps}
								<p class="text-xs text-gray-400">
									📍 {component.meta.gps.latitude.toFixed(4)}, {component.meta.gps.longitude.toFixed(4)}
								</p>
							{/if}
						</div>
						
						<div class="flex gap-1">
							<button 
								class="p-1 hover:bg-gray-200 rounded"
								on:click={() => handleSelectComponent(component)}
								title="Edit"
							>
								<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
								</svg>
							</button>
							<button 
								class="p-1 hover:bg-red-100 rounded"
								on:click={() => handleDeleteComponent(component)}
								title="Delete"
							>
								<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
								</svg>
							</button>
						</div>
					</div>
					
					{#if component.src}
						<div class="mt-2 rounded overflow-hidden bg-gray-100">
							<img 
								src={component.src} 
								alt={component.meta.caption || component.type}
								class="w-full h-24 object-cover"
							/>
						</div>
					{/if}
				</div>
			{/each}
			
			{#if $projectComponents.length === 0}
				<div class="text-center py-8 text-gray-500">
					<p class="text-sm">No components yet</p>
					<p class="text-xs mt-1">Add photos, maps, diagrams via chat</p>
				</div>
			{/if}
		</div>
		
		<!-- Add Component Buttons -->
		<div class="p-4 border-t border-gray-200 bg-gray-50">
			<div class="grid grid-cols-4 gap-2">
				<button 
					class="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
					on:click={() => dispatch('add', 'photo')}
					title="Add Photo"
				>
					{@html componentIcons.photo}
					<span class="text-xs text-gray-600">Photo</span>
				</button>
				<button 
					class="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
					on:click={() => dispatch('add', 'map')}
					title="Add Map"
				>
					{@html componentIcons.map}
					<span class="text-xs text-gray-600">Map</span>
				</button>
				<button 
					class="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
					on:click={() => dispatch('add', 'diagram')}
					title="Add Diagram"
				>
					{@html componentIcons.diagram}
					<span class="text-xs text-gray-600">Diagram</span>
				</button>
				<button 
					class="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
					on:click={() => dispatch('add', 'table')}
					title="Add Table"
				>
					{@html componentIcons.table}
					<span class="text-xs text-gray-600">Table</span>
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.component-card:active {
		cursor: grabbing;
	}
</style>
