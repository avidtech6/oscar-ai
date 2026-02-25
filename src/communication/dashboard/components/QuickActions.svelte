<script lang="ts">
	import { goto } from '$app/navigation';
	
	// Quick action buttons configuration
	const quickActions = [
		{
			id: 'new-email',
			label: 'New Email',
			icon: 'email',
			route: '/communication/email/new',
			color: 'bg-blue-600 hover:bg-blue-700',
			iconColor: 'text-blue-100'
		},
		{
			id: 'new-campaign',
			label: 'New Campaign',
			icon: 'campaign',
			route: '/communication/campaigns/new',
			color: 'bg-purple-600 hover:bg-purple-700',
			iconColor: 'text-purple-100'
		},
		{
			id: 'client-update',
			label: 'Client Update',
			icon: 'update',
			route: '/communication/email?type=client-update',
			color: 'bg-green-600 hover:bg-green-700',
			iconColor: 'text-green-100'
		}
	];
	
	function handleAction(route: string) {
		goto(route);
	}
	
	// Icon definitions
	const icons: Record<string, string> = {
		email: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>`,
		campaign: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>`,
		update: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
	};
</script>

<div class="quick-actions">
	<div class="flex flex-wrap gap-3">
		{#each quickActions as action}
			<button
				class="flex items-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-colors shadow-sm {action.color}"
				on:click={() => handleAction(action.route)}
				aria-label={action.label}
			>
				<span class={action.iconColor}>
					{@html icons[action.icon]}
				</span>
				<span>{action.label}</span>
			</button>
		{/each}
		
		<!-- Additional space for future actions -->
		<button
			class="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 font-medium transition-colors shadow-sm bg-gray-100 hover:bg-gray-200 border border-gray-300"
			on:click={() => console.log('More actions')}
			aria-label="More actions"
		>
			<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
			</svg>
			<span>More</span>
		</button>
	</div>
	
	<!-- Quick tip -->
	<div class="mt-3 text-sm text-gray-500">
		<p>Quickly create new communications with one click</p>
	</div>
</div>

<style>
	.quick-actions {
		/* Component styles */
	}
</style>