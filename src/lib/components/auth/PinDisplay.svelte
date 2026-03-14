<script lang="ts">
  export let pin: string = ''
</script>

<div class="pin-display mb-6">
  <div class="flex justify-center gap-2 mb-4">
    {#each Array(6) as _, i}
      <div
        class="w-12 h-12 rounded-lg border-2 flex items-center justify-center {i < pin.length 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
        }"
      >
        {#if i < pin.length}
          <div class="w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400"></div>
        {/if}
      </div>
    {/each}
  </div>
  
  <div class="text-center">
    <p class="text-sm text-gray-600 dark:text-gray-400">
      {pin.length === 0 && 'Enter your PIN'}
      {pin.length > 0 && pin.length < 4 && `${pin.length} digits entered`}
      {pin.length >= 4 && `${pin.length}/6 digits`}
    </p>
  </div>
</div>