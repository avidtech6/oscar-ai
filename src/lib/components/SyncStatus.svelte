<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { syncEngine, type SyncStatus } from '$lib/storage/syncEngine'
  import { triggerSync } from '$lib/storage/syncEngine'

  let syncStatus: SyncStatus | null = null
  let isSyncing = false
  let lastSyncTime: string | null = null
  let showDetails = false

  // Format time
  function formatTime(timestamp: number | null): string {
    if (!timestamp) return 'Never'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  // Format latency
  function formatLatency(latency: number | null): string {
    if (!latency) return 'N/A'
    return `${Math.round(latency)}ms`
  }

  // Get sync status color
  function getStatusColor(status: SyncStatus): string {
    if (status.isSyncing) return 'bg-blue-100 text-blue-800'
    if (!status.connectivity.connected) return 'bg-red-100 text-red-800'
    if (!status.connectivity.authenticated) return 'bg-yellow-100 text-yellow-800'
    if (status.queueStats.pending > 0) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  // Get sync status text
  function getStatusText(status: SyncStatus): string {
    if (status.isSyncing) return 'Syncing...'
    if (!status.connectivity.connected) return 'Offline'
    if (!status.connectivity.authenticated) return 'Auth Required'
    if (status.queueStats.pending > 0) return `${status.queueStats.pending} pending`
    return 'Synced'
  }

  // Get sync icon
  function getStatusIcon(status: SyncStatus): string {
    if (status.isSyncing) return '🔄'
    if (!status.connectivity.connected) return '🌐'
    if (!status.connectivity.authenticated) return '🔒'
    if (status.queueStats.pending > 0) return '⏳'
    return '✅'
  }

  // Manual sync
  async function handleSync() {
    if (isSyncing) return
    
    isSyncing = true
    try {
      await triggerSync()
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      isSyncing = false
    }
  }

  // Update status
  function updateStatus(status: SyncStatus) {
    syncStatus = status
    isSyncing = status.isSyncing
    lastSyncTime = formatTime(status.lastSyncTime)
  }

  // Initialize
  onMount(async () => {
    // Get initial status
    const status = await syncEngine.getStatus()
    updateStatus(status)
    
    // Subscribe to status updates
    syncEngine.addListener(updateStatus)
  })

  // Cleanup
  onDestroy(() => {
    syncEngine.removeListener(updateStatus)
  })
</script>

<div class="sync-status-container">
  <button
    class="sync-button"
    class:syncing={isSyncing}
    on:click={handleSync}
    title={isSyncing ? 'Syncing...' : 'Sync now'}
    aria-label={isSyncing ? 'Syncing...' : 'Sync now'}
    disabled={isSyncing}
  >
    <span class="sync-icon">{syncStatus ? getStatusIcon(syncStatus) : '🌐'}</span>
    {#if syncStatus}
      <span class="sync-text">{getStatusText(syncStatus)}</span>
    {/if}
    {#if isSyncing}
      <span class="sync-spinner">↻</span>
    {/if}
  </button>

  {#if showDetails && syncStatus}
    <div class="sync-details">
      <div class="sync-details-header">
        <h3>Sync Status</h3>
        <button on:click={() => showDetails = false} class="close-button" aria-label="Close">×</button>
      </div>
      
      <div class="sync-details-content">
        <div class="sync-section">
          <h4>Connectivity</h4>
          <div class="sync-info">
            <span class="label">Status:</span>
            <span class:connected={syncStatus.connectivity.connected} class:authenticated={syncStatus.connectivity.authenticated}>
              {syncStatus.connectivity.connected ? 'Connected' : 'Disconnected'}
              {syncStatus.connectivity.authenticated ? ' (Authenticated)' : ' (Not authenticated)'}
            </span>
          </div>
          <div class="sync-info">
            <span class="label">Latency:</span>
            <span>{formatLatency(syncStatus.connectivity.latency)}</span>
          </div>
        </div>

        <div class="sync-section">
          <h4>Queue</h4>
          <div class="sync-info">
            <span class="label">Pending:</span>
            <span>{syncStatus.queueStats.pending}</span>
          </div>
          <div class="sync-info">
            <span class="label">Failed:</span>
            <span>{syncStatus.queueStats.failed}</span>
          </div>
          <div class="sync-info">
            <span class="label">Completed:</span>
            <span>{syncStatus.queueStats.completed}</span>
          </div>
        </div>

        <div class="sync-section">
          <h4>Storage</h4>
          <div class="sync-info">
            <span class="label">Local Records:</span>
            <span>{syncStatus.localStats.totalRecords}</span>
          </div>
          <div class="sync-info">
            <span class="label">Cloud Records:</span>
            <span>{syncStatus.cloudStats.totalRecords}</span>
          </div>
          <div class="sync-info">
            <span class="label">Last Sync:</span>
            <span>{lastSyncTime}</span>
          </div>
        </div>

        <div class="sync-actions">
          <button on:click={handleSync} disabled={isSyncing} class="sync-action-button">
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
          <button on:click={() => showDetails = false} class="sync-action-button secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  {:else if syncStatus}
    <button
      class="sync-details-button"
      on:click={() => showDetails = true}
      title="Show sync details"
      aria-label="Show sync details"
    >
      ⓘ
    </button>
  {/if}
</div>

<style>
  .sync-status-container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .sync-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .sync-button:hover:not(:disabled) {
    background: #e5e7eb;
    border-color: #9ca3af;
  }

  .sync-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .sync-button.syncing {
    background: #dbeafe;
    border-color: #93c5fd;
    color: #1e40af;
  }

  .sync-icon {
    font-size: 1rem;
  }

  .sync-text {
    font-weight: 500;
  }

  .sync-spinner {
    animation: spin 1s linear infinite;
    font-size: 0.875rem;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .sync-details-button {
    background: none;
    border: none;
    font-size: 0.875rem;
    color: #6b7280;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: color 0.2s ease;
  }

  .sync-details-button:hover {
    color: #374151;
    background: #f3f4f6;
  }

  .sync-details {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    width: 320px;
    z-index: 100;
    overflow: hidden;
  }

  .sync-details-header {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sync-details-header h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: #111827;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s ease;
  }

  .close-button:hover {
    background: #f3f4f6;
  }

  .sync-details-content {
    padding: 1rem;
    max-height: 400px;
    overflow-y: auto;
  }

  .sync-section {
    margin-bottom: 1.5rem;
  }

  .sync-section:last-child {
    margin-bottom: 0;
  }

  .sync-section h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.75rem 0;
  }

  .sync-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .sync-info:last-child {
    margin-bottom: 0;
  }

  .sync-info .label {
    color: #6b7280;
  }

  .sync-info .connected {
    color: #059669;
    font-weight: 500;
  }

  .sync-info .authenticated {
    color: #d97706;
  }

  .sync-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .sync-action-button {
    flex: 1;
    padding: 0.5rem 1rem;
    border: 1px solid #3b82f6;
    border-radius: 6px;
    background: #3b82f6;
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sync-action-button:hover:not(:disabled) {
    background: #2563eb;
    border-color: #2563eb;
  }

  .sync-action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .sync-action-button.secondary {
    background: white;
    color: #374151;
    border-color: #d1d5db;
  }

  .sync-action-button.secondary:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
</style>