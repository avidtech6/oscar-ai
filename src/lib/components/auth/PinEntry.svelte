<script lang="ts">
  import { pinStore } from '$lib/stores/auth/pin'
  
  export let onSuccess: () => void = () => {}
  export let onCancel: () => void = () => {}
  export let showRecovery: boolean = false
  export let onRecovery: () => void = () => {}
  
  let pin = ''
  let error = ''
  let loading = false
  let showRecoveryInput = false
  let recoveryToken = ''
  let recoveryLoading = false
  
  // Handle PIN input
  function handlePinInput(value: string) {
    // Only allow digits
    if (!/^\d*$/.test(value)) return
    
    // Limit to 6 digits
    if (value.length > 6) return
    
    pin = value
    error = ''
    
    // Auto-submit when PIN reaches max length
    if (value.length === 6) {
      handleSubmit()
    }
  }
  
  // Handle number pad input
  function handleNumberClick(num: number) {
    if (pin.length < 6) {
      handlePinInput(pin + num.toString())
    }
  }
  
  // Handle backspace
  function handleBackspace() {
    if (pin.length > 0) {
      handlePinInput(pin.slice(0, -1))
    }
  }
  
  // Handle clear
  function handleClear() {
    handlePinInput('')
  }
  
  // Handle submit
  async function handleSubmit() {
    if (pin.length < 4) {
      error = 'PIN must be at least 4 digits'
      return
    }
    
    loading = true
    error = ''
    
    try {
      const isValid = await pinStore.validatePin(pin)
      if (isValid) {
        onSuccess()
      }
    } catch (err: any) {
      error = err.message || 'Invalid PIN'
      
      // Clear PIN on error for security
      if (err.code === 'INVALID_PIN') {
        setTimeout(() => {
          pin = ''
        }, 300)
      }
    } finally {
      loading = false
    }
  }
  
  // Handle recovery token submit
  async function handleRecoverySubmit() {
    if (!recoveryToken.trim()) {
      error = 'Recovery token is required'
      return
    }
    
    recoveryLoading = true
    error = ''
    
    try {
      const isValid = pinStore.validateRecoveryToken(recoveryToken)
      if (isValid) {
        onSuccess()
      } else {
        error = 'Invalid recovery token'
      }
    } catch (err: any) {
      error = err.message || 'Failed to validate recovery token'
    } finally {
      recoveryLoading = false
    }
  }
  
  // Toggle recovery input
  function toggleRecoveryInput() {
    showRecoveryInput = !showRecoveryInput
    error = ''
    pin = ''
    recoveryToken = ''
  }
  
  // Get remaining attempts
  $: remainingAttempts = pinStore.getRemainingAttempts()
  $: lockoutRemaining = pinStore.getLockoutRemaining()
  $: isLocked = lockoutRemaining > 0
  
  // Format lockout time
  function formatLockoutTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }
</script>

<div class="pin-entry">
  <div class="header">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      {showRecoveryInput ? 'Recovery Access' : 'Enter PIN'}
    </h2>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      {#if showRecoveryInput}
        Enter your recovery token to unlock your account.
      {:else if isLocked}
        Account is locked. Try again in {formatLockoutTime(lockoutRemaining)}.
      {:else}
        Enter your PIN to access your data.
      {/if}
    </p>
  </div>
  
  {#if error}
    <div class="error-message mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-red-700 dark:text-red-400 text-sm">{error}</p>
    </div>
  {/if}
  
  <!-- Attempts warning -->
  {#if !showRecoveryInput && !isLocked && remainingAttempts <= 3 && remainingAttempts > 0}
    <div class="warning-message mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <p class="text-yellow-700 dark:text-yellow-400 text-sm">
        {remainingAttempts === 1 
          ? 'Last attempt before lockout!' 
          : `${remainingAttempts} attempts remaining before lockout.`
        }
      </p>
    </div>
  {/if}
  
  <!-- Lockout message -->
  {#if isLocked}
    <div class="lockout-message mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-red-700 dark:text-red-400 text-sm">
        Too many failed attempts. Account locked for {formatLockoutTime(lockoutRemaining)}.
      </p>
    </div>
  {/if}
  
  {#if showRecoveryInput}
    <!-- Recovery token input -->
    <div class="recovery-input mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Recovery Token
      </label>
      <input
        type="text"
        bind:value={recoveryToken}
        placeholder="Enter your recovery token"
        class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 font-mono text-sm"
        disabled={recoveryLoading}
      />
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Use the recovery token you saved when setting up your PIN.
      </p>
    </div>
  {:else}
    <!-- PIN input -->
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
              <div class="w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400" />
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
    
    <!-- Number pad -->
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
  {/if}
  
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
  
  <!-- Recovery info -->
  {#if showRecovery && !showRecoveryInput}
    <div class="recovery-info mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <h3 class="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
        Forgot your PIN?
      </h3>
      <p class="text-xs text-blue-700 dark:text-blue-400 mb-2">
        If you saved a recovery token when setting up your PIN, you can use it to unlock your account.
      </p>
      <button
        type="button"
        on:click={onRecovery}
        class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        Generate new recovery token →
      </button>
    </div>
  {/if}
</div>

<style>
  .pin-entry {
    max-width: 400px;
    margin: 0 auto;
  }
</style>