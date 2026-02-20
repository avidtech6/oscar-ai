<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	// Email page placeholder
	let loading = true;
	let emailCount = 0;

	onMount(() => {
		// Simulate loading
		setTimeout(() => {
			loading = false;
			emailCount = 3; // Example count
		}, 500);
	});
</script>

<svelte:head>
	<title>Email - Oscar AI</title>
</svelte:head>

<div class="p-6 max-w-6xl mx-auto">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-forest-800 mb-2">Email</h1>
		<p class="text-gray-600">
			Email integration for managing client communications, notifications, and automated reports.
		</p>
	</div>

	<!-- Coming Soon Banner -->
	<div class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
		<div class="flex items-start gap-4">
			<div class="flex-shrink-0">
				<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
				</svg>
			</div>
			<div>
				<h3 class="text-lg font-semibold text-blue-800 mb-1">Email Integration Coming Soon</h3>
				<p class="text-blue-700 mb-3">
					This feature is currently under development. Planned capabilities include:
				</p>
				<ul class="list-disc pl-5 text-blue-700 space-y-1">
					<li>Send automated reports to clients via email</li>
					<li>Receive and process client inquiries</li>
					<li>Email notifications for project updates</li>
					<li>Integration with Gmail/Outlook/IMAP</li>
					<li>Email templates for common communications</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Placeholder Content -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<!-- Inbox Card -->
		<div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
			<div class="flex items-center justify-between mb-4">
				<h3 class="font-semibold text-gray-800">Inbox</h3>
				<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
					{emailCount} unread
				</span>
			</div>
			<div class="space-y-3">
				{#each Array(3) as _, i}
					<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
						<div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
							<span class="text-xs font-medium text-gray-700">C{i+1}</span>
						</div>
						<div class="flex-1">
							<div class="font-medium text-sm text-gray-800">Client Inquiry #{i+1}</div>
							<div class="text-xs text-gray-500 truncate">Regarding project updates and scheduling...</div>
						</div>
						<div class="text-xs text-gray-400">2h ago</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Compose Card -->
		<div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
			<h3 class="font-semibold text-gray-800 mb-4">Compose Email</h3>
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">To</label>
					<input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="client@example.com">
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
					<input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Project Update">
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
					<textarea class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32" placeholder="Write your email here..."></textarea>
				</div>
				<button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
					Send Email
				</button>
			</div>
		</div>

		<!-- Templates Card -->
		<div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
			<h3 class="font-semibold text-gray-800 mb-4">Email Templates</h3>
			<div class="space-y-3">
				{#each ['Project Proposal', 'Site Visit Report', 'Invoice Reminder', 'Follow-up'] as template}
					<div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
						<div>
							<div class="font-medium text-sm text-gray-800">{template}</div>
							<div class="text-xs text-gray-500">Pre-written template for {template.toLowerCase()}</div>
						</div>
						<button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
							Use
						</button>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Integration Status -->
	<div class="mt-8 pt-6 border-t border-gray-200">
		<h3 class="text-lg font-semibold text-gray-800 mb-4">Integration Status</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="bg-gray-50 p-4 rounded-lg">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm font-medium text-gray-700">Gmail Integration</span>
					<span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Not Connected</span>
				</div>
				<p class="text-sm text-gray-600">Connect your Gmail account to send and receive emails directly.</p>
			</div>
			<div class="bg-gray-50 p-4 rounded-lg">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm font-medium text-gray-700">Outlook Integration</span>
					<span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Not Connected</span>
				</div>
				<p class="text-sm text-gray-600">Connect your Outlook account for business email management.</p>
			</div>
		</div>
	</div>
</div>