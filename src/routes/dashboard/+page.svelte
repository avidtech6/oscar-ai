<script lang="ts">
  import { unifiedCards, contentStats } from '$lib/stores/unifiedContent';
  import CopilotBar from '$lib/components/CopilotBar/CopilotBar.svelte';
  
  // Helper to format numbers
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
</script>

<div class="flex flex-col h-screen">
  <main class="flex-1 overflow-y-auto p-6">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Unified Content Dashboard</h1>
      <p class="text-gray-600 mt-2">
        View all content across Workspace, Capture, and Communication in one place.
      </p>
    </header>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div class="flex items-center">
          <div class="rounded-full bg-blue-100 p-3 mr-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Cards</p>
            <p class="text-2xl font-bold text-gray-900">
              {$contentStats.total ? formatNumber($contentStats.total) : '0'}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div class="flex items-center">
          <div class="rounded-full bg-green-100 p-3 mr-4">
            <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Content Types</p>
            <p class="text-2xl font-bold text-gray-900">
              {$contentStats.byType ? Object.keys($contentStats.byType).length : '0'}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div class="flex items-center">
          <div class="rounded-full bg-purple-100 p-3 mr-4">
            <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Open Status</p>
            <p class="text-2xl font-bold text-gray-900">
              {$contentStats.byStatus?.open ? formatNumber($contentStats.byStatus.open) : '0'}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content by Type -->
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Content by Type</h2>
      <div class="space-y-4">
        {#if $contentStats.byType}
          {#each Object.entries($contentStats.byType) as [type, count]}
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="inline-block w-3 h-3 rounded-full bg-blue-500 mr-3"></span>
                <span class="font-medium text-gray-900 capitalize">{type}</span>
              </div>
              <div class="flex items-center">
                <span class="text-gray-900 font-semibold mr-2">{count}</span>
                <span class="text-gray-500 text-sm">cards</span>
              </div>
            </div>
          {/each}
        {:else}
          <p class="text-gray-500 text-center py-4">No content data available.</p>
        {/if}
      </div>
    </div>

    <!-- Recent Cards -->
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Recent Cards</h2>
        <span class="text-sm text-gray-500">{$unifiedCards.length} total</span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {#each $unifiedCards.slice(0, 5) as card}
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{card.title}</td>
                <td class="px-4 py-3 text-sm">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {card.type}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {card.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    {card.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">
                  {new Date(card.createdAt).toLocaleDateString('en-GB')}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      {#if $unifiedCards.length === 0}
        <p class="text-gray-500 text-center py-8">No cards found across all subsystems.</p>
      {/if}
    </div>
  </main>
  
  <CopilotBar />
</div>

<style>
  .h-screen {
    height: 100vh;
  }
  .flex-1 {
    flex: 1 1 0%;
  }
  .overflow-y-auto {
    overflow-y: auto;
  }
</style>
