<script lang="ts">
	export let activities: Array<{
		icon: string;
		title: string;
		description: string;
		time: string;
		status: string;
		statusColor: string;
	}> = [
		{
			icon: 'email',
			title: 'Email sent to John Smith',
			description: 'Project proposal for Oak Tree Survey',
			time: '10 minutes ago',
			status: 'Sent',
			statusColor: 'green'
		},
		{
			icon: 'campaign',
			title: 'Campaign "Spring Promotion" launched',
			description: 'Sent to 250 recipients',
			time: '2 hours ago',
			status: 'Active',
			statusColor: 'blue'
		},
		{
			icon: 'notification',
			title: 'Notification: Project deadline approaching',
			description: 'Oak Tree Survey due in 3 days',
			time: '1 day ago',
			status: 'Pending',
			statusColor: 'yellow'
		}
	];
</script>

<div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-xl font-semibold text-gray-900">Recent Activity</h2>
		<a href="/communication/activity" class="text-forest-600 hover:text-forest-700 font-medium">View All</a>
	</div>

	<div class="space-y-4">
		{#each activities as activity}
			<div class="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
				<div class="flex items-center gap-4">
					<div class="p-2 {activity.icon === 'email' ? 'bg-blue-50' : activity.icon === 'campaign' ? 'bg-green-50' : 'bg-yellow-50'} rounded-lg">
						{#if activity.icon === 'email'}
							<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
							</svg>
						{:else if activity.icon === 'campaign'}
							<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
							</svg>
						{:else}
							<svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
							</svg>
						{/if}
					</div>
					<div>
						<h3 class="font-medium text-gray-900">{activity.title}</h3>
						<p class="text-sm text-gray-500">{activity.description}</p>
					</div>
				</div>
				<div class="text-right">
					<p class="text-sm text-gray-500">{activity.time}</p>
					<p class="text-xs text-{activity.statusColor}-600 font-medium">{activity.status}</p>
				</div>
			</div>
		{/each}
	</div>
</div>