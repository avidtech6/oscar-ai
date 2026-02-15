<script lang="ts">
	import { driveConnected, driveError, user } from '$lib/stores/appStore';
	import { onMount } from 'svelte';
	
	export let compact = false;
	
	let checkingConnection = false;
	let connectionStatus: 'unknown' | 'connected' | 'disconnected' | 'error' = 'unknown';
	let statusMessage = '';
	
	onMount(async () => {
		await checkDriveConnection();
	});
	
	async function checkDriveConnection() {
		if (!$user) {
			connectionStatus = 'disconnected';
			statusMessage = 'Not signed in';
			return;
		}
		
		checkingConnection = true;
		
		try {
			const response = await fetch('/api/drive/list?action=ping');
			if (response.ok) {
				connectionStatus = 'connected';
				statusMessage = 'Google Drive connected';
				driveConnected.set(true);
				driveError.set(null);
			} else {
				connectionStatus = 'error';
				const data = await response.json();
				statusMessage = data.error || 'Failed to connect to Google Drive';
				driveConnected.set(false);
				driveError.set(statusMessage);
			}
		} catch (err) {
			connectionStatus = 'error';
			statusMessage = err instanceof Error ? err.message : 'Connection failed';
			driveConnected.set(false);
			driveError.set(statusMessage);
		} finally {
			checkingConnection = false;
		}
	}
	
	function handleReconnect() {
		window.location.href = '/api/auth/login';
	}
</script>

{#if compact}
	<!-- Compact indicator in header/sidebar -->
	<button 
		class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
			{connectionStatus === 'connected' ? 'bg-green-100 text-green-700' : 
			 connectionStatus === 'error' ? 'bg-red-100 text-red-700' : 
			 'bg-yellow-100 text-yellow-700'}"
		on:click={checkDriveConnection}
		disabled={checkingConnection}
	>
		{#if checkingConnection}
			<div class="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></div>
		{:else if connectionStatus === 'connected'}
			<span class="h-2 w-2 bg-green-500 rounded-full"></span>
		{:else if connectionStatus === 'error'}
			<span class="h-2 w-2 bg-red-500 rounded-full"></span>
		{:else}
			<span class="h-2 w-2 bg-yellow-500 rounded-full"></span>
		{/if}
		{statusMessage || 'Checking...'}
	</button>
{:else}
	<!-- Full diagnostic panel -->
	<div class="card p-6">
		<h3 class="font-semibold text-lg mb-4 flex items-center gap-2">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
			</svg>
			Google Drive Connection
		</h3>
		
		<div class="space-y-4">
			<!-- Connection status -->
			<div class="flex items-center gap-3">
				{#if checkingConnection}
					<div class="animate-spin h-6 w-6 border-3 border-blue-600 border-t-transparent rounded-full"></div>
					<span class="text-gray-600">Checking connection...</span>
				{:else if connectionStatus === 'connected'}
					<div class="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
						</svg>
					</div>
					<div>
						<p class="font-medium text-green-700">Connected</p>
						<p class="text-sm text-gray-500">Your Google Drive is accessible</p>
					</div>
				{:else if connectionStatus === 'error'}
					<div class="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						</svg>
					</div>
					<div>
						<p class="font-medium text-red-700">Connection Error</p>
						<p class="text-sm text-gray-500">{statusMessage}</p>
					</div>
				{:else}
					<div class="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
						</svg>
					</div>
					<div>
						<p class="font-medium text-yellow-700">Not Connected</p>
						<p class="text-sm text-gray-500">{statusMessage || 'Sign in to connect Google Drive'}</p>
					</div>
				{/if}
			</div>
			
			<!-- Actions -->
			{#if connectionStatus !== 'connected'}
				<div class="flex gap-3 pt-2">
					{#if !$user}
						<a href="/api/auth/login" class="btn btn-primary">
							<svg class="w-4 h-4" viewBox="0 0 24 24">
								<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
								<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
								<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
								<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
							</svg>
							Sign in with Google
						</a>
					{:else}
						<button class="btn btn-secondary" on:click={checkDriveConnection} disabled={checkingConnection}>
							Try Again
						</button>
					{/if}
				</div>
			{/if}
			
			<!-- Error details -->
			{#if $driveError}
				<div class="bg-red-50 border border-red-200 rounded-lg p-3">
					<p class="text-sm text-red-700">{$driveError}</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.card {
		background: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
		text-decoration: none;
	}
	
	.btn-primary {
		background: #2f5233;
		color: white;
	}
	
	.btn-primary:hover {
		background: #234026;
	}
	
	.btn-secondary {
		background: #6b7280;
		color: white;
	}
	
	.btn-secondary:hover {
		background: #4b5563;
	}
	
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
