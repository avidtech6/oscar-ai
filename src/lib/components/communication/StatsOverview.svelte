<script lang="ts">
	export let stats: Array<{
		title: string;
		value: number;
		icon: string;
		description: string;
		color: string;
	}> = [
		{
			title: 'Unread Emails',
			value: 12,
			icon: 'email',
			description: '+2 from yesterday',
			color: 'blue'
		},
		{
			title: 'Active Campaigns',
			value: 3,
			icon: 'campaign',
			description: 'All campaigns performing well',
			color: 'green'
		},
		{
			title: 'Unread Notifications',
			value: 5,
			icon: 'notification',
			description: '2 require attention',
			color: 'yellow'
		},
		{
			title: 'Calendar Events',
			value: 7,
			icon: 'calendar',
			description: 'Next: Tomorrow at 2 PM',
			color: 'purple'
		}
	];
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
	{#each stats as stat}
		<div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-500">{stat.title}</p>
					<p class="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
				</div>
				<div class="p-3 {stat.color === 'blue' ? 'bg-blue-50' : stat.color === 'green' ? 'bg-green-50' : stat.color === 'yellow' ? 'bg-yellow-50' : 'bg-purple-50'} rounded-lg">
					{#if stat.icon === 'email'}
						<svg class="w-6 h-6 {stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'yellow' ? 'text-yellow-600' : 'text-purple-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
						</svg>
					{:else if stat.icon === 'campaign'}
						<svg class="w-6 h-6 {stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'yellow' ? 'text-yellow-600' : 'text-purple-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
						</svg>
					{:else if stat.icon === 'notification'}
						<svg class="w-6 h-6 {stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'yellow' ? 'text-yellow-600' : 'text-purple-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
						</svg>
					{:else}
						<svg class="w-6 h-6 {stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'yellow' ? 'text-yellow-600' : 'text-purple-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
						</svg>
					{/if}
				</div>
			</div>
			<p class="text-sm text-gray-500 mt-4">{stat.description}</p>
		</div>
	{/each}
</div>