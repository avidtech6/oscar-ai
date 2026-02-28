<script lang="ts">
	import { onMount } from 'svelte';
	import { settings, type Settings, dummyDataEnabled } from '$lib/stores/settings';
	import { initializeBackend, configurePocketBase, getBackendType, getPocketBaseUrl } from '$lib/services/backend';
	import { db, countDummyItems, deleteAllDummyData } from '$lib/db';
	import { insertDummyData, removeDummyData } from '$lib/dummy/dummyData';
	import { getVersionInfo } from '../../version';
	import { credentialManager } from '$lib/system/CredentialManager';

	let pbUrl = '';
	let saving = false;
	let saved = false;
	let backendType: 'pocketbase' | 'local' = 'local';
	let testingConnection = false;
	let connectionStatus = '';
	let exporting = false;
	let importing = false;
	let dummyDataToggle = false;
	let dummyCount = 0; // countDummyItems returns a number, not an object
	let clearing = false;
	
	// Credential manager state
	let credentialStatus = 'Loading...';
	let groqKey = '';
	let openaiKey = '';
	let anthropicKey = '';
	let supabaseUrl = '';
	let supabaseAnonKey = '';
	let credentialSaving = false;
	let credentialSaved = false;

	onMount(() => {
		// Load current settings using store subscription
		const unsubscribe = settings.subscribe((currentSettings) => {
			dummyDataToggle = currentSettings.dummyDataEnabled || false;
		});
		
		// Initialize backend and get current config
		initializeBackend().then((result) => {
			backendType = result.backend as 'pocketbase' | 'local';
			pbUrl = getPocketBaseUrl() || '';
			
			// Load dummy count
			countDummyItems().then((count) => {
				dummyCount = count;
			});
			
			// Load credentials from CredentialManager
			loadCredentials();
		});
		
		// Cleanup subscription
		return unsubscribe;
	});
	
	async function loadCredentials() {
		try {
			// Wait for credential manager to be ready
			if (!credentialManager.isReady()) {
				await credentialManager.initialize();
			}
			
			credentialStatus = credentialManager.isReady() ? 'Ready' : 'Not ready';
			
			// Load current values
			groqKey = credentialManager.getGroqKey() || '';
			openaiKey = credentialManager.getOpenAIKey() || '';
			anthropicKey = credentialManager.getAnthropicKey() || '';
			supabaseUrl = credentialManager.getSupabaseUrl() || '';
			supabaseAnonKey = credentialManager.getSupabaseAnonKey() || '';
		} catch (error) {
			console.error('Failed to load credentials:', error);
			credentialStatus = 'Error loading credentials';
		}
	}
	
	async function saveCredentials() {
		credentialSaving = true;
		credentialSaved = false;
		
		try {
			// Save credentials to CredentialManager
			if (groqKey.trim()) await credentialManager.updateKey('groq_api_key', groqKey.trim());
			if (openaiKey.trim()) await credentialManager.updateKey('openai_api_key', openaiKey.trim());
			if (anthropicKey.trim()) await credentialManager.updateKey('anthropic_api_key', anthropicKey.trim());
			if (supabaseUrl.trim()) await credentialManager.updateKey('supabase_url', supabaseUrl.trim());
			if (supabaseAnonKey.trim()) await credentialManager.updateKey('supabase_anon_key', supabaseAnonKey.trim());
			
			credentialSaved = true;
			setTimeout(() => {
				credentialSaved = false;
			}, 2000);
			
			// Reload to see updated status
			await loadCredentials();
		} catch (error) {
			console.error('Failed to save credentials:', error);
			alert('Failed to save credentials: ' + (error instanceof Error ? error.message : 'Unknown error'));
		} finally {
			credentialSaving = false;
		}
	}
	
	function clearCredentials() {
		groqKey = '';
		openaiKey = '';
		anthropicKey = '';
		supabaseUrl = '';
		supabaseAnonKey = '';
	}

	async function toggleDummyData(event: Event) {
		const target = event.target as HTMLInputElement;
		const newValue = target.checked;
		
		console.log('toggleDummyData called, new:', newValue);
		
		// Update the store first
		dummyDataEnabled.set(newValue);
		
		try {
			if (newValue) {
				console.log('Inserting dummy data...');
				// Insert static dummy dataset
				await insertDummyData();
				console.log('Dummy data inserted');
			} else {
				console.log('Removing dummy data...');
				// Remove all dummy data when turning OFF
				await removeDummyData();
				console.log('Dummy data removed');
			}
			
			dummyCount = await countDummyItems();
			console.log('Updated dummy count:', dummyCount);
		} catch (error) {
			console.error('Error in toggleDummyData:', error);
			alert('Failed to toggle dummy data: ' + (error instanceof Error ? error.message : 'Unknown error'));
			// Revert the toggle on error
			dummyDataToggle = !newValue;
			dummyDataEnabled.set(!newValue);
			return;
		}
		
		// Update the local variable to match the new state
		dummyDataToggle = newValue;
		
		// Refresh the page to show/hide dummy data
		console.log('Refreshing page...');
		window.location.reload();
	}
	
	async function clearDummyData() {
		if (!confirm('Are you sure you want to delete all dummy data? This cannot be undone.')) return;
		
		clearing = true;
		try {
			await removeDummyData();
			dummyDataToggle = false;
			dummyDataEnabled.set(false);
			dummyCount = 0;
		} catch (e) {
			alert('Failed to clear dummy data: ' + (e instanceof Error ? e.message : 'Unknown error'));
		} finally {
			clearing = false;
		}
	}

	async function saveSettings() {
		saving = true;
		saved = false;
		connectionStatus = '';
		
		try {
			// Configure PocketBase if URL provided
			if (pbUrl.trim()) {
				configurePocketBase(pbUrl.trim());
				testingConnection = true;
				connectionStatus = 'Testing connection...';
				
				try {
					const result = await initializeBackend();
					backendType = result.backend as 'pocketbase' | 'local';
					connectionStatus = result.backend === 'pocketbase'
						? 'Connected to PocketBase!'
						: 'Connection failed. Using local storage.';
				} catch (e) {
					connectionStatus = 'Failed to connect. Using local storage.';
					backendType = 'local';
				}
				testingConnection = false;
			}
			
			saved = true;
			setTimeout(() => {
				saved = false;
			}, 2000);
		} catch (e) {
			console.error('Failed to save settings:', e);
		} finally {
			saving = false;
		}
	}

	// Export/Import functions
	async function exportAllData() {
		exporting = true;
		try {
			const projects = await db.projects.toArray();
			const allData = {
				version: '1.0',
				exportedAt: new Date().toISOString(),
				projects: await Promise.all(projects.map(async p => {
					const trees = await db.trees.where('projectId').equals(p.id!).toArray();
					const notes = await db.notes.where('projectId').equals(p.id!).toArray();
					const photos = await db.photos.where('projectId').equals(p.id!).toArray();
					const reports = await db.reports.where('projectId').equals(p.id!).toArray();
					
					const photosData = await Promise.all(photos.map(async (photo) => ({
						info: { ...photo, blob: undefined },
						data: await blobToBase64(photo.blob)
					})));
					
					const reportsData = await Promise.all(reports.map(async (report) => ({
						info: { ...report, pdfBlob: undefined },
						data: await blobToBase64(report.pdfBlob)
					})));
					
					return { ...p, trees, notes, photos: photosData, reports: reportsData };
				}))
			};
			
			const json = JSON.stringify(allData, null, 2);
			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `oscar-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (e) {
			alert('Failed to export data: ' + (e instanceof Error ? e.message : 'Unknown error'));
		} finally {
			exporting = false;
		}
	}

	async function importData(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;
		
		const file = input.files[0];
		importing = true;
		try {
			const text = await file.text();
			const data = JSON.parse(text);
			
			if (!data.version || !data.projects) {
				throw new Error('Invalid backup file format');
			}
			
			for (const proj of data.projects) {
				const newProjectId = crypto.randomUUID();
				const now = new Date();
				
				await db.projects.add({
					name: proj.name,
					description: proj.description || '',
					location: proj.location || '',
					client: proj.client || '',
					createdAt: now,
					updatedAt: now
				});
				
				if (proj.trees) {
					for (const tree of proj.trees) {
						await db.trees.add({
							...tree,
							id: crypto.randomUUID(),
							projectId: newProjectId,
							createdAt: now.toISOString(),
							updatedAt: now.toISOString()
						});
					}
				}
				
				if (proj.notes) {
					for (const note of proj.notes) {
						await db.notes.add({
							...note,
							id: crypto.randomUUID(),
							projectId: newProjectId,
							createdAt: now.toISOString(),
							updatedAt: now.toISOString()
						});
					}
				}
				
				if (proj.photos) {
					for (const photo of proj.photos) {
						const blob = base64ToBlob(photo.data, photo.info.mimeType);
						await db.photos.add({
							...photo.info,
							id: crypto.randomUUID(),
							projectId: newProjectId,
							blob,
							createdAt: now.toISOString()
						});
					}
				}
				
				if (proj.reports) {
					for (const report of proj.reports) {
						const blob = base64ToBlob(report.data, 'application/pdf');
						await db.reports.add({
							...report.info,
							id: crypto.randomUUID(),
							projectId: newProjectId,
							pdfBlob: blob,
							generatedAt: now.toISOString()
						});
					}
				}
			}
			
			alert('Data imported successfully! Please refresh the page.');
			input.value = '';
		} catch (e) {
			alert('Failed to import data: ' + (e instanceof Error ? e.message : 'Unknown error'));
		} finally {
			importing = false;
		}
	}

	function blobToBase64(blob: Blob): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				resolve(result.split(',')[1]);
			};
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	}

	function base64ToBlob(base64: string, mimeType: string): Blob {
		const byteCharacters = atob(base64);
		const byteNumbers = new Array(byteCharacters.length);
		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i);
		}
		const byteArray = new Uint8Array(byteNumbers);
		return new Blob([byteArray], { type: mimeType });
	}
</script>

<svelte:head>
	<title>Settings - Oscar AI</title>
</svelte:head>

<div class="max-w-2xl mx-auto">
	<h1 class="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

	<!-- Credential Management -->
	<div class="card p-6 mb-6">
		<h2 class="text-lg font-semibold mb-4">Credential Management</h2>
		<p class="text-sm text-gray-600 mb-4">
			Centralized credential system. Credentials are loaded from multiple sources with priority: Local overrides > Supabase settings > Environment defaults.
		</p>
		
		<div class="mb-4 p-3 bg-gray-50 rounded-lg">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium">Credential Status:</span>
				<span class="px-2 py-1 text-xs rounded-full {credentialStatus === 'Ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
					{credentialStatus}
				</span>
			</div>
		</div>
		
		<div class="space-y-6">
			<div>
				<h3 class="text-md font-medium mb-3">AI API Keys</h3>
				<div class="space-y-4">
					<div>
						<label for="groqKey" class="block text-sm font-medium text-gray-700 mb-1">
							Groq API Key
						</label>
						<input
							id="groqKey"
							type="password"
							bind:value={groqKey}
							placeholder="gsk_..."
							class="input w-full"
						/>
						<p class="text-xs text-gray-500 mt-1">
							For chat and transcription (Groq Whisper)
						</p>
					</div>
					
					<div>
						<label for="openaiKey" class="block text-sm font-medium text-gray-700 mb-1">
							OpenAI API Key
						</label>
						<input
							id="openaiKey"
							type="password"
							bind:value={openaiKey}
							placeholder="sk-..."
							class="input w-full"
						/>
						<p class="text-xs text-gray-500 mt-1">
							Optional: For OpenAI models
						</p>
					</div>
					
					<div>
						<label for="anthropicKey" class="block text-sm font-medium text-gray-700 mb-1">
							Anthropic API Key
						</label>
						<input
							id="anthropicKey"
							type="password"
							bind:value={anthropicKey}
							placeholder="sk-ant-..."
							class="input w-full"
						/>
						<p class="text-xs text-gray-500 mt-1">
							Optional: For Claude models
						</p>
					</div>
				</div>
			</div>
			
			<div>
				<h3 class="text-md font-medium mb-3">Supabase Configuration</h3>
				<div class="space-y-4">
					<div>
						<label for="supabaseUrl" class="block text-sm font-medium text-gray-700 mb-1">
							Supabase URL
						</label>
						<input
							id="supabaseUrl"
							type="url"
							bind:value={supabaseUrl}
							placeholder="https://your-project.supabase.co"
							class="input w-full"
						/>
					</div>
					
					<div>
						<label for="supabaseAnonKey" class="block text-sm font-medium text-gray-700 mb-1">
							Supabase Anon Key
						</label>
						<input
							id="supabaseAnonKey"
							type="password"
							bind:value={supabaseAnonKey}
							placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
							class="input w-full"
						/>
					</div>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<button
					on:click={saveCredentials}
					disabled={credentialSaving}
					class="btn btn-primary"
				>
					{credentialSaving ? 'Saving...' : credentialSaved ? 'Saved!' : 'Save Credentials'}
				</button>
				
				<button
					on:click={clearCredentials}
					class="btn btn-secondary"
				>
					Clear All
				</button>
			</div>
		</div>
	</div>


	<!-- Data Storage -->
	<div class="card p-6 mb-6">
		<h2 class="text-lg font-semibold mb-4">Data Storage</h2>
		
		<!-- Current Backend Status -->
		<div class="mb-4 p-3 bg-gray-50 rounded-lg">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium">Current Backend:</span>
				<span class="px-2 py-1 text-xs rounded-full {backendType === 'pocketbase' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
					{backendType === 'pocketbase' ? 'PocketBase (Cloud)' : 'Local (Browser)'}
				</span>
			</div>
		</div>
		
		<div class="space-y-4">
			<div class="flex items-start gap-3">
				<span class="text-2xl">💾</span>
				<div>
					<h3 class="font-medium">Local Browser Storage</h3>
					<p class="text-sm text-gray-600">
						All your project data, notes, and reports are stored locally in your browser using IndexedDB.
						Data never leaves your device.
					</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<span class="text-2xl">📤</span>
				<div class="flex-1">
					<h3 class="font-medium">Export & Import</h3>
					<p class="text-sm text-gray-600 mb-3">
						Export your projects as JSON files for backup or sharing. Import previously exported projects to restore your data.
					</p>
					<div class="flex gap-3">
						<button
							on:click={exportAllData}
							disabled={exporting}
							class="btn btn-primary text-sm"
						>
							{exporting ? 'Exporting...' : 'Export All Data'}
						</button>
						<label class="btn btn-secondary text-sm cursor-pointer">
							{importing ? 'Importing...' : 'Import Data'}
							<input
								type="file"
								accept=".json"
								on:change={importData}
								class="hidden"
								disabled={importing}
							/>
						</label>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- PocketBase Configuration -->
	<div class="card p-6 mb-6">
		<h2 class="text-lg font-semibold mb-4">Cloud Backend (Optional)</h2>
		<p class="text-sm text-gray-600 mb-4">
			Connect to a PocketBase backend to sync your data across devices and enable user accounts.
		</p>
		
		<div class="space-y-4">
			<div>
				<label for="pbUrl" class="block text-sm font-medium text-gray-700 mb-1">
					PocketBase URL
				</label>
				<input
					id="pbUrl"
					type="url"
					bind:value={pbUrl}
					placeholder="https://your-backend.railway.app"
					class="input w-full"
				/>
				<p class="text-xs text-gray-500 mt-1">
					Enter your PocketBase backend URL (e.g., from Railway deployment)
				</p>
			</div>
			
			{#if connectionStatus}
				<div class="p-3 rounded-lg {connectionStatus.includes('Connected') ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}">
					{connectionStatus}
				</div>
			{/if}
			
			<button
				on:click={saveSettings}
				disabled={saving || testingConnection}
				class="btn btn-secondary"
			>
				{testingConnection ? 'Testing...' : 'Connect Backend'}
			</button>
		</div>
	</div>

	<!-- Connected Services -->
	<div class="card p-6 mb-6">
		<h2 class="text-lg font-semibold mb-4">AI Services</h2>
		<div class="space-y-3">
			<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
				<div class="flex items-center gap-3">
					<span class="text-xl">🤖</span>
					<span>Groq AI (Chat)</span>
				</div>
				<span class="text-sm text-gray-600">{groqKey ? 'Configured' : 'Not configured'}</span>
			</div>
			<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
				<div class="flex items-center gap-3">
					<span class="text-xl">🎙️</span>
					<span>Groq Whisper (Transcription)</span>
				</div>
				<span class="text-sm text-gray-600">{groqKey ? 'Configured' : 'Not configured'}</span>
			</div>
		</div>
	</div>

	<!-- Development & Testing -->
	<div class="card p-6 mb-6">
		<h2 class="text-lg font-semibold mb-4">Development & Testing</h2>
		<p class="text-sm text-gray-600 mb-4">
			Enable dummy data for development and testing purposes. Dummy items are fully functional and can be used to test all features.
		</p>
		
		<div class="space-y-4">
			<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
				<div>
					<h3 class="font-medium">Enable Dummy Data</h3>
					<p class="text-sm text-gray-600">Show dummy data in the app for testing</p>
				</div>
				<label class="relative inline-flex items-center cursor-pointer">
					<input
						type="checkbox"
						checked={dummyDataToggle}
						on:change={toggleDummyData}
						class="sr-only peer"
					>
					<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-600"></div>
				</label>
			</div>
			
			{#if dummyCount > 0}
				<div class="p-4 bg-blue-50 rounded-lg">
					<h3 class="font-medium text-blue-900 mb-2">Current Dummy Data</h3>
					<div class="text-center p-4 bg-white rounded">
						<div class="font-bold text-3xl mb-2">{dummyCount}</div>
						<div class="text-gray-600">Total dummy items</div>
					</div>
				</div>
				
				<button
					on:click={clearDummyData}
					disabled={clearing}
					class="btn bg-red-600 text-white hover:bg-red-700"
				>
					{clearing ? 'Clearing...' : 'Clear All Dummy Data'}
				</button>
			{/if}
		</div>
	</div>

	<!-- App Info -->
	<div class="card p-6 mb-6">
		<h2 class="text-lg font-semibold mb-4">About Oscar AI</h2>
		<div class="space-y-2 text-sm text-gray-600">
			<p><strong>Version:</strong> {getVersionInfo().full}</p>
			<p><strong>Commit:</strong> {getVersionInfo().commit}</p>
			<p><strong>Built:</strong> {new Date(getVersionInfo().timestamp).toLocaleString()}</p>
			<p><strong>Platform:</strong> Cloudflare Pages (Static)</p>
			<p><strong>Storage:</strong> IndexedDB (Browser Local)</p>
			<p class="pt-2">
				Oscar AI is a personal arboricultural notebook and assistant for UK tree surveyors
				and arboricultural consultants. This is the development version with local-only data storage.
			</p>
		</div>
	</div>
</div>
