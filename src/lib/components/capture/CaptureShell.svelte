<script lang="ts">
  import CaptureForm from './CaptureForm.svelte';
  import CaptureList from './CaptureList.svelte';
  import { captureCards } from '$lib/stores/capture';
</script>

<div class="flex flex-col h-full">
  <header class="p-6 border-b border-gray-200">
    <h1 class="text-2xl font-bold text-gray-900">Capture</h1>
    <p class="text-gray-600 mt-1">
      Quickly capture ideas, notes, and references. Everything you capture becomes a card in your workspace.
    </p>
  </header>

  <div class="flex flex-1 overflow-hidden">
    <!-- Left panel: Capture form -->
    <div class="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
      <CaptureForm />
    </div>

    <!-- Right panel: Recent captures -->
    <div class="w-2/3 p-6 overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900">Recent Captures</h2>
        <div class="text-sm text-gray-500">
          {$captureCards.length} capture{$captureCards.length === 1 ? '' : 's'}
        </div>
      </div>
      <CaptureList />
    </div>
  </div>
</div>

<style>
  .flex-1 {
    flex: 1 1 0%;
  }
  .overflow-y-auto {
    overflow-y: auto;
  }
</style>