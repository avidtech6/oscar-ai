<script lang="ts">
  import { exportManager } from '$lib/export/exportManager'
  import type { ExportFormat } from '$lib/export/types'
  import { onMount, onDestroy } from 'svelte'

  export let targetId: string
  export let targetType: 'report' | 'note' | 'summary' = 'report'
  export let buttonLabel: string = 'Export'
  export let showFormatLabels: boolean = true
  export let includeAllFormats: boolean = true

  let isOpen = false
  let isExporting = false
  let selectedFormat: ExportFormat | null = null

  const formats: Array<{ value: ExportFormat; label: string; icon: string }> = [
    { value: 'pdf', label: 'PDF Document', icon: '📄' },
    { value: 'docx', label: 'Word Document', icon: '📝' },
    { value: 'html', label: 'HTML Page', icon: '🌐' },
    { value: 'markdown', label: 'Markdown', icon: '📋' }
  ]

  function toggleMenu() {
    isOpen = !isOpen
  }

  function closeMenu() {
    isOpen = false
  }

  async function exportAs(format: ExportFormat) {
    if (isExporting) return

    selectedFormat = format
    isExporting = true
    isOpen = false

    try {
      let job
      if (targetType === 'report') {
        job = await exportManager.exportReport(targetId, format)
      } else if (targetType === 'note') {
        job = await exportManager.exportNote(targetId, format)
      } else {
        job = await exportManager.exportSummary([], format)
      }
      console.log(`Export job started: ${job.id}`)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      isExporting = false
      selectedFormat = null
    }
  }

  // Close menu when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.closest('.export-menu-container')) {
      closeMenu()
    }
  }

  onMount(() => {
    // Cleanup function
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  })

  $: {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
  }
</script>

<div class="export-menu-container relative inline-block">
  <button
    type="button"
    class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
    on:click={toggleMenu}
    disabled={isExporting}
    aria-expanded={isOpen}
    aria-haspopup="true"
  >
    {#if isExporting}
      <svg
        class="mr-2 h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Exporting...
    {:else}
      <svg
        class="mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {buttonLabel}
      <svg
        class="-mr-1 ml-2 h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    {/if}
  </button>

  {#if isOpen && !isExporting}
    <div
      class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      role="menu"
      aria-orientation="vertical"
      tabindex="-1"
    >
      <div class="py-1" role="none">
        <div class="px-4 py-2 text-xs font-semibold text-gray-500">
          Export as
        </div>
        {#each formats as formatItem}
          <button
            type="button"
            class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 {selectedFormat === formatItem.value ? 'bg-blue-50' : ''}"
            role="menuitem"
            tabindex="-1"
            on:click={() => exportAs(formatItem.value)}
            on:keydown={(e) => e.key === 'Enter' && exportAs(formatItem.value)}
          >
            <span class="mr-3 text-lg">{formatItem.icon}</span>
            <span class="flex-1 text-left">
              {showFormatLabels ? formatItem.label : formatItem.value.toUpperCase()}
            </span>
            {#if selectedFormat === formatItem.value}
              <svg
                class="h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            {/if}
          </button>
        {/each}
        {#if includeAllFormats}
          <div class="border-t border-gray-100"></div>
          <button
            type="button"
            class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            role="menuitem"
            tabindex="-1"
            on:click={() => {
              // Export all formats sequentially
              formats.forEach((f) => exportAs(f.value))
            }}
          >
            <span class="mr-3 text-lg">📦</span>
            <span class="flex-1 text-left">Export All Formats</span>
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>