<script lang="ts" context="module">
	export interface QuickAction {
		title: string;
		description: string;
		href: string;
		iconColor: string;
		iconBgColor: string;
		iconPath: string;
	}
</script>

<script lang="ts">
	// Default quick actions
	const defaultActions: QuickAction[] = [
		{
			title: 'Compose Email',
			description: 'Send a new email',
			href: '/communication/email/compose',
			iconColor: 'text-blue-600',
			iconBgColor: 'bg-blue-50',
			iconPath: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
		},
		{
			title: 'Create Campaign',
			description: 'Start a new campaign',
			href: '/communication/campaigns/new',
			iconColor: 'text-green-600',
			iconBgColor: 'bg-green-50',
			iconPath: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
		},
		{
			title: 'View Calendar',
			description: 'Check upcoming events',
			href: '/calendar',
			iconColor: 'text-purple-600',
			iconBgColor: 'bg-purple-50',
			iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
		},
		{
			title: 'Notifications',
			description: 'Manage alerts',
			href: '/communication/notifications',
			iconColor: 'text-yellow-600',
			iconBgColor: 'bg-yellow-50',
			iconPath: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
		}
	];

	export let actions: QuickAction[] = defaultActions;
	export let title: string = 'Quick Actions';
</script>

<div class="mb-8">
	<h2 class="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each actions as action}
			<a href={action.href} class="bg-white border border-gray-200 rounded-xl p-5 hover:border-forest-500 hover:shadow-md transition-all">
				<div class="flex items-center gap-3">
					<div class={`p-2 ${action.iconBgColor} rounded-lg`}>
						<svg class={`w-5 h-5 ${action.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={action.iconPath}></path>
						</svg>
					</div>
					<div>
						<h3 class="font-medium text-gray-900">{action.title}</h3>
						<p class="text-sm text-gray-500">{action.description}</p>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>