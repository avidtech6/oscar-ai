<script lang="ts">
  export let loading: boolean = false
  export let isLocked: boolean = false
  export let handleNumberClick: (num: number) => void
  export let handleClear: () => void
  export let handleBackspace: () => void
</script>

<div class="number-pad mb-6">
  <div class="grid grid-cols-3 gap-3">
    {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as num}
      <button
        type="button"
        on:click={() => handleNumberClick(num)}
        disabled={loading || isLocked}
        class="aspect-square flex items-center justify-center text-2xl font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {num}
      </button>
    {/each}
    
    <button
      type="button"
      on:click={handleClear}
      disabled={loading || isLocked}
      class="aspect-square flex items-center justify-center text-sm font-medium bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Clear
    </button>
    
    <button
      type="button"
      on:click={() => handleNumberClick(0)}
      disabled={loading || isLocked}
      class="aspect-square flex items-center justify-center text-2xl font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      0
    </button>
    
    <button
      type="button"
      on:click={handleBackspace}
      disabled={loading || isLocked}
      class="aspect-square flex items-center justify-center text-sm font-medium bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      ⌫
    </button>
  </div>
</div>