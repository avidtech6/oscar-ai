<script lang="ts">
  import { PinManager } from '$lib/auth/pin'
  import { pinStore } from '$lib/stores/auth/pin'
  import PinInputField from './PinInputField.svelte'
  import PinStrengthIndicator from './PinStrengthIndicator.svelte'
  import PinNumberPad from './PinNumberPad.svelte'
  
  export let onComplete: (pin: string) => void = () => {}
  export let onCancel: () => void = () => {}
  
  let pin = ''
  let confirmPin = ''
  let error = ''
  let loading = false
  let strength = 0
  let strengthCategory: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
  
  // Update strength as user types
  $: if (pin) {
    strength = PinManager.getPinStrength(pin)
    strengthCategory = PinManager.getPinStrengthCategory(pin)
  } else {
    strength = 0
    strengthCategory = 'weak'
  }
  
  // Handle PIN input
  function handlePinInput(value: string) {
    // Only allow digits
    if (!/^\d*$/.test(value)) return
    
    // Limit to 6 digits
    if (value.length > 6) return
    
    pin = value
    error = ''
  }
  
  // Handle confirm PIN input
  function handleConfirmPinInput(value: string) {
    // Only allow digits
    if (!/^\d*$/.test(value)) return
    
    // Limit to 6 digits
    if (value.length > 6) return
    
    confirmPin = value
    error = ''
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
    handleConfirmPinInput('')
  }
  
  // Handle submit
  async function handleSubmit() {
    // Validate PIN
    if (!PinManager.isValidPin(pin)) {
      error = 'PIN must be 4-6 digits'
      return
    }
    
    if (PinManager.isWeakPin(pin)) {
      error = 'This PIN is too weak. Please choose a stronger PIN.'
      return
    }
    
    if (pin !== confirmPin) {
      error = 'PINs do not match'
      return
    }
    
    loading = true
    error = ''
    
    try {
      await pinStore.setupPin(pin)
      onComplete(pin)
    } catch (err: any) {
      error = err.message || 'Failed to setup PIN'
    } finally {
      loading = false
    }
  }
</script>

<div class="pin-setup">
  <div class="header">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      Setup PIN Security
    </h2>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      Create a 4-6 digit PIN to secure your data locally.
    </p>
  </div>
  
  {#if error}
    <div class="error-message mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-red-700 dark:text-red-400 text-sm">{error}</p>
    </div>
  {/if}
  
  <div class="pin-inputs mb-6">
    <PinInputField
      id="pin-input"
      label="Enter PIN"
      bind:value={pin}
      onInput={handlePinInput}
      {loading}
      maxLength={6}
      placeholder="••••"
    >
      <PinStrengthIndicator {pin} {strength} {strengthCategory} />
    </PinInputField>
    
    <PinInputField
      id="confirm-pin-input"
      label="Confirm PIN"
      bind:value={confirmPin}
      onInput={handleConfirmPinInput}
      {loading}
      maxLength={6}
      placeholder="••••"
    >
      {#if confirmPin && pin !== confirmPin}
        <p class="text-xs text-red-600 dark:text-red-400 mt-1">
          PINs do not match
        </p>
      {/if}
    </PinInputField>
  </div>
  
  <!-- Number pad -->
  <PinNumberPad
    {loading}
    isLocked={false}
    {handleNumberClick}
    {handleClear}
    {handleBackspace}
  />
  
  <!-- PIN guidelines -->
  <div class="guidelines mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
    <h3 class="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
      PIN Guidelines
    </h3>
    <ul class="text-xs text-blue-700 dark:text-blue-400 space-y-1">
      <li>• Use 4-6 digits (numbers only)</li>
      <li>• Avoid common patterns like 1234 or 0000</li>
      <li>• Don't use sequential numbers (1234, 5678)</li>
      <li>• Don't use repeated digits (1111, 2222)</li>
      <li>• Choose something memorable but not obvious</li>
    </ul>
  </div>
  
  <!-- Actions -->
  <div class="actions flex gap-3">
    <button
      type="button"
      on:click={onCancel}
      disabled={loading}
      class="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Cancel
    </button>
    
    <button
      type="button"
      on:click={handleSubmit}
      disabled={loading || !pin || !confirmPin || pin !== confirmPin || !PinManager.isValidPin(pin)}
      class="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {#if loading}
        <span class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Setting up...
        </span>
      {:else}
        Setup PIN
      {/if}
    </button>
  </div>
</div>

<style>
  .pin-setup {
    max-width: 400px;
    margin: 0 auto;
  }
  
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  input[type="password"] {
    -webkit-text-security: disc;
  }
</style>