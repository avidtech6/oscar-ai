<script lang="ts">
	// Import dashboard components
	import QuickActions from './components/QuickActions.svelte';
	import EmailWidget from './components/EmailWidget.svelte';
	import CampaignsWidget from './components/CampaignsWidget.svelte';
	import CalendarWidget from './components/CalendarWidget.svelte';
	import NotificationsWidget from './components/NotificationsWidget.svelte';
</script>

<div class="p-4 md:p-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-800">Communication Dashboard</h1>
		<p class="text-gray-600 mt-1">Overview of your communication activities</p>
	</div>

	<!-- Quick Actions Row -->
	<div class="mb-8">
		<h2 class="text-lg font-semibold text-gray-700 mb-3">Quick Actions</h2>
		<QuickActions />
	</div>

	<!-- Widgets Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<EmailWidget />
		<CampaignsWidget />
		<CalendarWidget />
		<NotificationsWidget />
	</div>

	<!-- Recent Activity Section -->
	<div class="mt-8">
		<h2 class="text-lg font-semibold text-gray-700 mb-3">Recent Activity</h2>
		<div class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
			<div class="space-y-3">
				<div class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
							<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-800">Email sent to client</p>
							<p class="text-xs text-gray-500">Project proposal sent to Green Gardens Ltd.</p>
						</div>
					</div>
					<span class="text-xs text-gray-500">10 min ago</span>
				</div>
				
				<div class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
							<svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-800">Campaign scheduled</p>
							<p class="text-xs text-gray-500">"Spring Promotion" scheduled for March 15</p>
						</div>
					</div>
					<span class="text-xs text-gray-500">1 hour ago</span>
				</div>
				
				<div class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
							<svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-800">Meeting reminder</p>
							<p class="text-xs text-gray-500">Team sync at 2:30 PM today</p>
						</div>
					</div>
					<span class="text-xs text-gray-500">2 hours ago</span>
				</div>
			</div>
			
			<div class="mt-4 pt-3 border-t border-gray-100">
				<button class="text-sm text-forest-600 font-medium hover:text-forest-700">
					View all activity →
				</button>
			</div>
		</div>
	</div>
</div>