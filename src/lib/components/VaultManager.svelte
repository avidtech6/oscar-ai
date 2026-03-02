<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { vaultManager } from '$lib/vault/vaultManager'
  import type { APIKey, SyncStatus, VaultStats } from '$lib/vault/types'

  // State
  let keys: APIKey[] = []
  let stats: VaultStats | null = null
  let syncStatus: SyncStatus | null = null
  let isLoading = false
  let error: string | null = null
  let showAddKeyForm = false
  let newKey = {
    keyName: '',
    plaintextKey: '',
    provider: 'openai' as const,
    modelFamily: ''
  }

  // Sync listeners
  const handleSyncStatus = (status: SyncStatus) => {
    syncStatus = status
    if (status.status === 'success') {
      loadKeys()
      loadStats()
    }
  }

  // Initialize
  onMount(async () => {
    try {
      await vaultManager.initialize()
      vaultManager.addSyncListener(handleSyncStatus)
      await loadKeys()
      await loadStats()
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to initialize vault'
    }
  })

  // Cleanup
  onDestroy(() => {
    vaultManager.removeSyncListener(handleSyncStatus)
    vaultManager.cleanup()
  })

  // Load keys
  async function loadKeys() {
    isLoading = true
    try {
      keys = await vaultManager.getAllKeys()
      error = null
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load keys'
    } finally {
      isLoading = false
    }
  }

  // Load stats
  async function loadStats() {
    try {
      stats = await vaultManager.getStats()
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  // Add new key
  async function addKey() {
    if (!newKey.keyName || !newKey.plaintextKey) {
      error = 'Key name and API key are required'
      return
    }

    isLoading = true
    try {
      await vaultManager.addKey(newKey)
      newKey = { keyName: '', plaintextKey: '', provider: 'openai', modelFamily: '' }
      showAddKeyForm = false
      error = null
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to add key'
    } finally {
      isLoading = false
    }
  }

  // Delete key
  async function deleteKey(id: string) {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return
    }

    isLoading = true
    try {
      await vaultManager.deleteKey(id)
      error = null
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete key'
    } finally {
      isLoading = false
    }
  }

  // Toggle key active state
  async function toggleKeyActive(key: APIKey) {
    isLoading = true
    try {
      await vaultManager.updateKey(key.id, { isActive: !key.isActive })
      error = null
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update key'
    } finally {
      isLoading = false
    }
  }

  // Manual sync
  async function manualSync() {
    isLoading = true
    try {
      syncStatus = await vaultManager.sync()
      error = null
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to sync'
    } finally {
      isLoading = false
    }
  }

  // Export vault
  async function exportVault() {
    try {
      const data = await vaultManager.exportVault()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vault-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to export vault'
    }
  }

  // Format date
  function formatDate(timestamp?: number): string {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleDateString()
  }

  // Get provider icon
  function getProviderIcon(provider: string): string {
    const icons: Record<string, string> = {
      openai: '🤖',
      anthropic: '🧠',
      google: '🔍',
      azure: '☁️',
      grok: '⚡',
      custom: '🔑'
    }
    return icons[provider] || '🔑'
  }

  // Get sync status color
  function getSyncStatusColor(status: string): string {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'offline': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
</script>

<div class="vault-manager p-6 max-w-6xl mx-auto">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">API Key Vault</h1>
    <p class="text-gray-600">Securely manage your AI API keys with local encryption and cloud sync</p>
  </div>

  <!-- Error Display -->
  {#if error}
    <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Stats Cards -->
  {#if stats}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div class="text-sm font-medium text-gray-500">Total Keys</div>
        <div class="text-2xl font-bold text-gray-900">{stats.totalKeys}</div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div class="text-sm font-medium text-gray-500">Synced</div>
        <div class="text-2xl font-bold text-gray-900">{stats.syncedKeys}</div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div class="text-sm font-medium text-gray-500">Cloud Status</div>
        <div class="text-2xl font-bold {stats.cloudAvailable ? 'text-green-600' : 'text-yellow-600'}">
          {stats.cloudAvailable ? 'Online' : 'Offline'}
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div class="text-sm font-medium text-gray-500">Last Sync</div>
        <div class="text-2xl font-bold text-gray-900">
          {stats.lastSync ? formatDate(stats.lastSync.getTime()) : 'Never'}
        </div>
      </div>
    </div>
  {/if}

  <!-- Sync Status -->
  {#if syncStatus}
    <div class="mb-6 p-4 rounded-lg border {getSyncStatusColor(syncStatus.status)}">
      <div class="flex items-center justify-between">
        <div>
          <span class="font-medium">Sync Status:</span> {syncStatus.message}
        </div>
        <div class="text-sm opacity-75">
          {syncStatus.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  {/if}

  <!-- Action Bar -->
  <div class="flex flex-wrap gap-3 mb-8">
    <button
      on:click={() => showAddKeyForm = !showAddKeyForm}
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {showAddKeyForm ? 'Cancel' : 'Add API Key'}
    </button>
    
    <button
      on:click={manualSync}
      disabled={isLoading}
      class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Syncing...' : 'Sync Now'}
    </button>
    
    <button
      on:click={exportVault}
      class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
    >
      Export Backup
    </button>
  </div>

  <!-- Add Key Form -->
  {#if showAddKeyForm}
    <div class="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Add New API Key</h2>
      
      <form on:submit|preventDefault={addKey} class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="keyName" class="block text-sm font-medium text-gray-700 mb-1">
              Key Name *
            </label>
            <input
              id="keyName"
              type="text"
              bind:value={newKey.keyName}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., OpenAI Production Key"
              required
            />
          </div>
          
          <div>
            <label for="provider" class="block text-sm font-medium text-gray-700 mb-1">
              Provider *
            </label>
            <select
              id="provider"
              bind:value={newKey.provider}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google AI</option>
              <option value="azure">Azure OpenAI</option>
              <option value="grok">Grok</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
        
        <div>
          <label for="modelFamily" class="block text-sm font-medium text-gray-700 mb-1">
            Model Family (Optional)
          </label>
          <input
            id="modelFamily"
            type="text"
            bind:value={newKey.modelFamily}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., gpt-4, claude-3"
          />
        </div>
        
        <div>
          <label for="plaintextKey" class="block text-sm font-medium text-gray-700 mb-1">
            API Key *
          </label>
          <input
            id="plaintextKey"
            type="password"
            bind:value={newKey.plaintextKey}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="sk-..."
            required
          />
          <p class="mt-1 text-sm text-gray-500">
            Your API key is encrypted locally before storage and never sent to our servers in plaintext.
          </p>
        </div>
        
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            on:click={() => showAddKeyForm = false}
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add Key'}
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Keys List -->
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900">API Keys ({keys.length})</h2>
    </div>
    
    {#if isLoading && keys.length === 0}
      <div class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-500">Loading keys...</p>
      </div>
    {:else if keys.length === 0}
      <div class="p-8 text-center">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No API Keys Yet</h3>
        <p class="text-gray-500 mb-4">Add your first API key to get started with secure key management.</p>
        <button
          on:click={() => showAddKeyForm = true}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Your First Key
        </button>
      </div>
    {:else}
      <div class="divide-y divide-gray-200">
        {#each keys as key (key.id)}
          <div class="px-6 py-4 hover:bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="text-2xl">
                  {getProviderIcon(key.provider)}
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <h3 class="text-lg font-medium text-gray-900">{key.keyName}</h3>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {key.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                      {key.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div class="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span class="capitalize">{key.provider}</span>
                    {#if key.modelFamily}
                      <span>• {key.modelFamily}</span>
                    {/if}
                    <span>• Version {key.keyVersion}</span>
                    <span>• Used {key.usageCount} times</span>
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    Last used: {formatDate(key.lastUsedAt)} • Created: {formatDate(key.createdAt)}
                    {#if key.lastSyncedAt}
                      <span> • Synced: {formatDate(key.lastSyncedAt)}</span>
                    {/if}
                  </div>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <button
                  on:click={() => toggleKeyActive(key)}
                  disabled={isLoading}
                  class="px-3 py-1 text-sm {key.isActive ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                >
                  {key.isActive ? 'Deactivate' : 'Activate'}
                </button>
                
                <button
                  on:click={() => deleteKey(key.id)}
                  disabled={isLoading}
                  class="px-3 py-1 text-sm bg-red-100 text-red-800 hover:bg-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Security Notice -->
  <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-blue-800">Security Information</h3>
        <div class="mt-2 text-sm text-blue-700">
          <p>• All API keys are encrypted locally using AES-GCM before storage</p>
          <p>• Plaintext keys are never sent to our servers</p>
          <p>• Cloud sync uses end-to-end encryption with your Supabase account</p>
          <p>• Keys automatically rotate every 90 days for enhanced security</p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .vault-manager {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
</style>
