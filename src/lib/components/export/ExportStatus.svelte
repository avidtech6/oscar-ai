<script lang="ts">
  import { exportManager } from '$lib/export/exportManager'
  import { onMount, onDestroy } from 'svelte'
  import type { ExportJob, ExportStats, ExportFormat } from '$lib/export/types'

  export let showQueue: boolean = true
  export let showStats: boolean = true
  export let refreshInterval: number = 5000

  let jobs: ExportJob[] = []
  let stats: ExportStats | null = null
  let lastUpdated: Date | null = null
  let intervalId: number | null = null

  async function loadData() {
    try {
      jobs = exportManager.getAllJobs()
      stats = exportManager.getStats()
      lastUpdated = new Date()
    } catch (error) {
      console.error('Failed to load export status:', error)
    }
  }

  function formatDate(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'queued-offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function getFormatIcon(format: ExportFormat): string {
    switch (format) {
      case 'pdf': return '📄'
      case 'docx': return '📝'
      case 'html': return '🌐'
      case 'markdown': return '📋'
      default: return '📎'
    }
  }

  onMount(() => {
    loadData()
    if (refreshInterval > 0) {
      intervalId = window.setInterval(loadData, refreshInterval)
    }
  })

  onDestroy(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
  })
</script>

<div class="export-status-panel border border-gray-200 rounded-lg bg-white p-4">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-gray-900">Export Status</h3>
    {#if lastUpdated}
      <div class="text-sm text-gray-500">
        Updated {formatDate(lastUpdated)}
      </div>
    {/if}
  </div>

  {#if showStats && stats}
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Export Statistics</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-gray-50 rounded p-3">
          <div class="text-2xl font-bold text-gray-900">{stats.totalExports}</div>
          <div class="text-xs text-gray-500">Total Exports</div>
        </div>
        <div class="bg-green-50 rounded p-3">
          <div class="text-2xl font-bold text-green-700">{stats.successfulExports}</div>
          <div class="text-xs text-green-600">Successful</div>
        </div>
        <div class="bg-red-50 rounded p-3">
          <div class="text-2xl font-bold text-red-700">{stats.failedExports}</div>
          <div class="text-xs text-red-600">Failed</div>
        </div>
        <div class="bg-blue-50 rounded p-3">
          <div class="text-2xl font-bold text-blue-700">{stats.pendingExports}</div>
          <div class="text-xs text-blue-600">Pending</div>
        </div>
      </div>
      <div class="mt-3 grid grid-cols-4 gap-2">
        {#each Object.entries(stats.formats) as [format, count]}
          {#if Number(count) > 0}
            <div class="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2">
              <span class="text-lg">{getFormatIcon(format as ExportFormat)}</span>
              <span class="text-sm font-medium text-gray-700">{format.toUpperCase()}</span>
              <span class="text-sm text-gray-500">{count}</span>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}

  {#if showQueue && jobs.length > 0}
    <div>
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-medium text-gray-700">Recent Jobs ({jobs.length})</h4>
        <button
          class="text-xs text-blue-600 hover:text-blue-800"
          on:click={loadData}
        >
          Refresh
        </button>
      </div>
      <div class="space-y-2 max-h-64 overflow-y-auto">
        {#each jobs as job (job.id)}
          <div class="border border-gray-200 rounded p-3 hover:bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="text-lg">{getFormatIcon(job.request.documentType)}</span>
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {job.request.content.title || 'Untitled'}
                  </div>
                  <div class="text-xs text-gray-500">
                    {job.request.documentType.toUpperCase()} • {formatDate(job.createdAt)}
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                  {job.status.replace('-', ' ')}
                </span>
                {#if job.result?.fileSize}
                  <span class="text-xs text-gray-500">
                    {formatFileSize(job.result.fileSize)}
                  </span>
                {/if}
              </div>
            </div>
            {#if job.error}
              <div class="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                ❌ {job.error}
              </div>
            {/if}
            {#if job.status === 'failed' && job.retryCount < job.maxRetries}
              <div class="mt-2">
                <button
                  class="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-2 py-1 rounded"
                  on:click={() => exportManager.retryJob(job.id)}
                >
                  Retry ({job.retryCount}/{job.maxRetries})
                </button>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {:else if showQueue}
    <div class="text-center py-8 text-gray-500">
      <div class="text-4xl mb-2">📤</div>
      <div class="text-sm">No export jobs yet</div>
      <div class="text-xs mt-1">Start exporting reports or notes to see status here</div>
    </div>
  {/if}

  <div class="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
    <div class="flex justify-between">
      <span>Offline queue: {stats?.offlineQueueSize || 0} jobs</span>
      <span>Last export: {stats?.lastExport ? formatDate(stats.lastExport) : 'Never'}</span>
    </div>
  </div>
</div>

<style>
  .export-status-panel {
    min-width: 320px;
  }
</style>