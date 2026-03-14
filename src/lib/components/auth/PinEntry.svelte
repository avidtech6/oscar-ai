<script lang="ts">
  import { pinStore } from '$lib/stores/auth/pin'
  import PinDisplay from './PinDisplay.svelte'
  import PinNumberPad from './PinNumberPad.svelte'
  import RecoveryInput from './RecoveryInput.svelte'
  import PinMessages from './PinMessages.svelte'
  import PinActions from './PinActions.svelte'
  
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
  
  <PinMessages
    {error}
    {remainingAttempts}
    {isLocked}
    {lockoutRemaining}
    {showRecoveryInput}
    formatLockoutTime={formatLockoutTime}
  />
  
  {#if showRecoveryInput}
    <RecoveryInput
      bind:recoveryToken
      {recoveryLoading}
      {isLocked}
    />
  {:else}
    <PinDisplay {pin} />
    <PinNumberPad
      {loading}
      {isLocked}
      {handleNumberClick}
      {handleClear}
      {handleBackspace}
    />
  {/if}
  
  <PinActions
    {showRecovery}
    {showRecoveryInput}
    {loading}
    {recoveryLoading}
    {isLocked}
    {pin}
    {recoveryToken}
    {toggleRecoveryInput}
    {onCancel}
    {handleSubmit}
    {handleRecoverySubmit}
  />
  
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