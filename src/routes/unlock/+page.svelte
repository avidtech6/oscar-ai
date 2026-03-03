<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { authStore, authActions } from '$lib/stores/auth/auth'
  import { pinStore, pinRequiresSetup, shouldShowPin } from '$lib/stores/auth/pin'
  import PinSetup from '$lib/components/auth/PinSetup.svelte'
  import PinEntry from '$lib/components/auth/PinEntry.svelte'
  
  // State
  let showPinSetup = false
  let showRecoveryToken = false
  let recoveryToken = ''
  let loading = true
  
  onMount(() => {
    // Check if user is authenticated
    const { user } = $authStore
    if (!user) {
      goto('/login')
      return
    }
    
    // Check if PIN is required
    const requiresPin = $shouldShowPin
    const requiresSetup = $pinRequiresSetup
    
    if (!requiresPin && !requiresSetup) {
      // PIN not required, redirect to dashboard
      goto('/dashboard')
      return
    }
    
    if (requiresSetup) {
      showPinSetup = true
    }
    
    loading = false
  })
  
  // Handle PIN setup completion
  function handlePinSetupComplete(pin: string) {
    console.log('PIN setup completed with:', pin)
    // Generate and show recovery token
    recoveryToken = pinStore.generateRecoveryToken()
    showRecoveryToken = true
  }
  
  // Handle PIN setup cancel
  function handlePinSetupCancel() {
    // If user cancels PIN setup, they can still use the app without PIN
    pinStore.removePin()
    goto('/dashboard')
  }
  
  // Handle PIN entry success
  function handlePinEntrySuccess() {
    console.log('PIN entry successful')
    goto('/dashboard')
  }
  
  // Handle PIN entry cancel
  function handlePinEntryCancel() {
    // If user cancels PIN entry, log them out
    authActions.signOut()
    goto('/login')
  }
  
  // Handle recovery token generation
  function handleRecoveryTokenGenerate() {
    recoveryToken = pinStore.generateRecoveryToken()
    showRecoveryToken = true
  }
  
  // Copy recovery token to clipboard
  async function copyRecoveryToken() {
    try {
      await navigator.clipboard.writeText(recoveryToken)
      alert('Recovery token copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  // Continue to dashboard
  function continueToDashboard() {
    goto('/dashboard')
  }
</script>

<svelte:head>
  <title>Unlock - Oscar AI</title>
</svelte:head>

<div class="unlock-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex flex-col items-center justify-center p-4">
  <div class="w-full max-w-md">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Oscar AI
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Secure your data with local encryption
      </p>
    </div>
    
    <!-- Loading state -->
    {#if loading}
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-700 dark:text-gray-300">
          Checking security status...
        </p>
      </div>
    {:else if showRecoveryToken}
      <!-- Recovery token display -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            PIN Setup Complete!
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Save your recovery token in a safe place.
          </p>
        </div>
        
        <div class="mb-6">
          <label for="recovery-token-display" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Recovery Token
          </label>
          <div class="relative">
            <div id="recovery-token-display" class="font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4 break-all">
              {recoveryToken}
            </div>
            <button
              on:click={copyRecoveryToken}
              class="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Copy to clipboard"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            This token is the only way to recover access if you forget your PIN.
            Store it securely and never share it.
          </p>
        </div>
        
        <div class="space-y-3">
          <button
            on:click={continueToDashboard}
            class="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            Continue to Dashboard
          </button>
          
          <button
            on:click={() => showRecoveryToken = false}
            class="w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 transition-colors"
          >
            Back to PIN Entry
          </button>
        </div>
      </div>
    {:else if showPinSetup}
      <!-- PIN Setup -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <PinSetup
          onComplete={handlePinSetupComplete}
          onCancel={handlePinSetupCancel}
        />
      </div>
    {:else}
      <!-- PIN Entry -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <PinEntry
          onSuccess={handlePinEntrySuccess}
          onCancel={handlePinEntryCancel}
          showRecovery={true}
          onRecovery={handleRecoveryTokenGenerate}
        />
      </div>
    {/if}
    
    <!-- Security info -->
    <div class="mt-6 text-center">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        Your PIN is stored locally and never leaves your device.
        <br />
        Data is encrypted using Web Crypto API.
      </p>
    </div>
  </div>
</div>

<style>
  .unlock-page {
    min-height: 100vh;
  }
</style>