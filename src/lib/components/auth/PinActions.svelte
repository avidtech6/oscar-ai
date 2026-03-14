<script lang="ts">
  export let showRecovery: boolean = false
  export let showRecoveryInput: boolean = false
  export let loading: boolean = false
  export let recoveryLoading: boolean = false
  export let isLocked: boolean = false
  export let pin: string = ''
  export let recoveryToken: string = ''
  export let toggleRecoveryInput: () => void
  export let onCancel: () => void
  export let handleSubmit: () => void
  export let handleRecoverySubmit: () => void
</script>

<!-- Actions -->
<div class="actions flex gap-3">
  {#if showRecovery}
    <button
      type="button"
      on:click={toggleRecoveryInput}
      disabled={loading || recoveryLoading || isLocked}
      class="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {showRecoveryInput ? 'Back to PIN' : 'Use Recovery Token'}
    </button>
  {:else}
    <button
      type="button"
      on:click={onCancel}
      disabled={loading || recoveryLoading}
      class="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Cancel
    </button>
  {/if}
  
  <button
    type="button"
    on:click={showRecoveryInput ? handleRecoverySubmit : handleSubmit}
    disabled={
      showRecoveryInput 
        ? recoveryLoading || !recoveryToken.trim() || isLocked
        : loading || pin.length < 4 || isLocked
    }
    class="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    {#if showRecoveryInput && recoveryLoading}
      <span class="flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Verifying...
      </span>
    {:else if !showRecoveryInput && loading}
      <span class="flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Verifying...
      </span>
    {:else if showRecoveryInput}
      Unlock with Token
    {:else}
      Unlock
    {/if}
  </button>
</div>