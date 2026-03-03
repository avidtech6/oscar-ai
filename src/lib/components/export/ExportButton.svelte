<script lang="ts">
  import { exportManager } from '$lib/export/exportManager'
  import type { ExportFormat } from '$lib/export/types'
  import { onMount } from 'svelte'

  export let targetId: string
  export let targetType: 'report' | 'note' | 'summary' = 'report'
  export let format: ExportFormat = 'pdf'
  export let label: string = 'Export'
  export let icon: boolean = true
  export let variant: 'primary' | 'secondary' | 'outline' = 'primary'
  export let size: 'sm' | 'md' | 'lg' = 'md'
  export let disabled: boolean = false

  let isExporting = false
  let lastExportJob: string | null = null

  const buttonClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  async function handleExport() {
    if (isExporting || disabled) return

    isExporting = true
    try {
      let job
      if (targetType === 'report') {
        job = await exportManager.exportReport(targetId, format)
      } else if (targetType === 'note') {
        job = await exportManager.exportNote(targetId, format)
      } else {
        // summary - requires items; for now placeholder
        job = await exportManager.exportSummary([], format)
      }
      lastExportJob = job.id
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      isExporting = false
    }
  }
</script>

<button
  class="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed {buttonClasses[variant]} {sizeClasses[size]}"
  on:click={handleExport}
  disabled={isExporting || disabled}
  aria-label={isExporting ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
>
  {#if icon}
    <svg
      class="mr-2 h-4 w-4 {isExporting ? 'animate-spin' : ''}"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      {#if isExporting}
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      {:else}
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      {/if}
    </svg>
  {/if}
  {isExporting ? 'Exporting...' : label}
</button>

<style>
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>