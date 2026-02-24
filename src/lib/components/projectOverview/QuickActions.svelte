<script lang="ts">
	import { goto } from '$app/navigation';

	export let projectId: string = '';

	const quickActions = [
		{
			id: 'add_note',
			label: 'Add Note',
			icon: '📝',
			color: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
			action: () => goto(`/project/${projectId}?tab=notes&action=create`)
		},
		{
			id: 'add_tree',
			label: 'Add Tree',
			icon: '🌳',
			color: 'bg-green-50 hover:bg-green-100 text-green-700',
			action: () => goto(`/project/${projectId}?tab=trees&action=create`)
		},
		{
			id: 'upload_photo',
			label: 'Upload Photo',
			icon: '📷',
			color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700',
			action: () => goto(`/project/${projectId}?tab=photos&action=upload`)
		},
		{
			id: 'create_report',
			label: 'Create Report',
			icon: '📄',
			color: 'bg-purple-50 hover:bg-purple-100 text-purple-700',
			action: () => goto(`/reports?project=${projectId}&action=create`)
		},
		{
			id: 'add_task',
			label: 'Add Task',
			icon: '✅',
			color: 'bg-red-50 hover:bg-red-100 text-red-700',
			action: () => goto(`/tasks?project=${projectId}&action=create`)
		},
		{
			id: 'voice_note',
			label: 'Voice Note',
			icon: '🎤',
			color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700',
			action: () => goto(`/project/${projectId}?tab=voice`)
		},
		{
			id: 'compile_notes',
			label: 'Compile',
			icon: '📚',
			color: 'bg-teal-50 hover:bg-teal-100 text-teal-700',
			action: () => {
				// This would trigger the note compilation engine
				// For now, we'll navigate to a compilation page or show a modal
				// We'll use the unified AI prompt for now
				const event = new CustomEvent('openUnifiedAIPrompt', {
					detail: {
						projectId,
						initialPrompt: 'Compile all project notes into a draft report'
					}
				});
				window.dispatchEvent(event);
			}
		}
	];

	function handleAction(action: () => void) {
		action();
	}
</script>

<div class="border border-gray-200 rounded-lg p-4 h-full flex flex-col">
	<h3 class="font-medium text-gray-700 mb-4">Quick Actions</h3>

	<div class="grid grid-cols-2 gap-3 flex-1">
		{#each quickActions as action (action.id)}
			<button
				on:click={() => handleAction(action.action)}
				class="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100 {action.color} transition-colors hover:shadow-sm"
			>
				<div class="text-2xl mb-1">{action.icon}</div>
				<div class="text-xs font-medium text-center">{action.label}</div>
			</button>
		{/each}
	</div>

	<div class="mt-4 pt-3 border-t border-gray-100">
		<button
			on:click={() => goto(`/project/${projectId}?tab=all`)}
			class="w-full btn btn-outline btn-sm"
		>
			View All Items
		</button>
	</div>
</div>