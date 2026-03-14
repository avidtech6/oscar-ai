<script lang="ts">
  export let recoveryToken: string = ''
  export let recoveryLoading: boolean = false
  export let isLocked: boolean = false
</script>

<!-- Recovery token input -->
<div class="recovery-input mb-6">
  <label for="recovery-token-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Recovery Token
  </label>
  <input
    id="recovery-token-input"
    type="text"
    bind:value={recoveryToken}
    placeholder="Enter your recovery token"
    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 font-mono text-sm"
    disabled={recoveryLoading || isLocked}
  />
  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
    Use the recovery token you saved when setting up your PIN.
  </p>
</div>