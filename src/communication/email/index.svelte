<script lang="ts">
	import EmailSidebar from './components/EmailSidebar.svelte';
	import EmailList from './components/EmailList.svelte';
	import EmailViewer from './components/EmailViewer.svelte';
	import { goto } from '$app/navigation';
	
	// Empty UI shell - navigation placeholders only
	function navigateToComposer() {
		goto('/communication/email/new');
	}
	
	function navigateToInbox() {
		goto('/communication/email');
	}
</script>

<div class="email-container flex flex-col h-full">
	<!-- Desktop Header with Compose Button -->
	<div class="hidden md:flex border-b border-gray-200 p-4 items-center justify-between">
		<h1 class="text-xl font-bold text-gray-800">Email</h1>
		<button 
			on:click={navigateToComposer}
			class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 flex items-center gap-2"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
			</svg>
			Compose
		</button>
	</div>
	
	<!-- Mobile Header (hidden on desktop) -->
	<div class="md:hidden border-b border-gray-200 p-4 flex items-center justify-between">
		<h1 class="text-xl font-bold text-gray-800">Email</h1>
		<button 
			on:click={navigateToComposer}
			class="p-2 bg-blue-600 text-white rounded-full"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
			</svg>
		</button>
	</div>
	
	<!-- Three-Pane Layout -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Left Sidebar - Hidden on mobile, visible on desktop -->
		<div class="hidden md:block">
			<EmailSidebar />
		</div>
		
		<!-- Middle Email List - Full width on mobile, partial on desktop -->
		<div class="flex-1 md:flex-none md:w-96">
			<EmailList />
		</div>
		
		<!-- Right Email Viewer - Hidden on mobile, visible on desktop -->
		<div class="hidden md:block flex-1">
			<EmailViewer />
		</div>
	</div>
	
	<!-- Mobile Bottom Navigation -->
	<div class="md:hidden border-t border-gray-200 p-3">
		<div class="flex items-center justify-around">
			<button 
				on:click={navigateToInbox}
				class="flex flex-col items-center text-blue-600"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
				</svg>
				<span class="text-xs mt-1">Inbox</span>
			</button>
			<button 
				on:click={navigateToComposer}
				class="flex flex-col items-center text-gray-500"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
				</svg>
				<span class="text-xs mt-1">Compose</span>
			</button>
			<button class="flex flex-col items-center text-gray-500">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
				</svg>
				<span class="text-xs mt-1">Saved</span>
			</button>
			<button class="flex flex-col items-center text-gray-500">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
				</svg>
				<span class="text-xs mt-1">Settings</span>
			</button>
		</div>
	</div>
</div>

<style>
	.email-container {
		height: calc(100vh - 64px); /* Adjust based on your layout header height */
	}
	
	@media (max-width: 768px) {
		.email-container {
			height: calc(100vh - 128px); /* Adjust for mobile header + bottom nav */
		}
	}
</style>