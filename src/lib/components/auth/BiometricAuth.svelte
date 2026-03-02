<script lang="ts">
  import { biometricStore, biometricIcon, biometricLabel } from '$lib/stores/auth/biometric'
  
  export let onSuccess: () => void = () => {}
  export let onCancel: () => void = () => {}
  export let mode: 'enroll' | 'authenticate' = 'authenticate'
  
  let loading = false
  let error = ''
  let success = false
  
  // Handle biometric authentication
  async function handleBiometricAuth() {
    loading = true
    error = ''
    
    try {
      if (mode === 'enroll') {
        await biometricStore.enroll()
        success = true
        setTimeout(() => {
          onSuccess()
        }, 1500)
      } else {
        const authenticated = await biometricStore.authenticate()
        if (authenticated) {
          success = true
          setTimeout(() => {
            onSuccess()
          }, 1000)
        }
      }
    } catch (err: any) {
      error = err.message || 'Biometric authentication failed'
    } finally {
      loading = false
    }
  }
  
  // Get button text based on mode
  function getButtonText(): string {
    if (mode === 'enroll') {
      return 'Enroll Biometrics'
    }
    return 'Authenticate with Biometrics'
  }
  
  // Get description based on mode
  function getDescription(): string {
    if (mode === 'enroll') {
      return 'Set up biometric authentication for faster, more secure access to your data.'
    }
    return 'Use your biometrics to securely access your data.'
  }
</script>

<div class="biometric-auth">
  <div class="header text-center mb-6">
    <div class="icon text-6xl mb-4">
      {$biometricIcon}
    </div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      {$biometricLabel}
    </h2>
    <p class="text-gray-600 dark:text-gray-400">
      {getDescription()}
    </p>
  </div>
  
  {#if error}
    <div class="error-message mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-red-700 dark:text-red-400 text-sm">{error}</p>
    </div>
  {/if}
  
  {#if success}
    <div class="success-message mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <p class="text-green-700 dark:text-green-400 text-sm">
        {mode === 'enroll' ? 'Biometrics enrolled successfully!' : 'Authentication successful!'}
      </p>
    </div>
  {/if}
  
  <!-- Biometric info -->
  <div class="biometric-info mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
    <h3 class="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
      How it works
    </h3>
    <ul class="text-xs text-blue-700 dark:text-blue-400 space-y-1">
      <li>• Uses WebAuthn standard for secure authentication</li>
      <li>• Your biometric data never leaves your device</li>
      <li>• Works with Touch ID, Face ID, Windows Hello, and more</li>
      <li>• No passwords to remember or type</li>
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
      on:click={handleBiometricAuth}
      disabled={loading || success}
      class="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {#if loading}
        <span class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {mode === 'enroll' ? 'Enrolling...' : 'Authenticating...'}
        </span>
      {:else if success}
        <span class="flex items-center justify-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Success!
        </span>
      {:else}
        {getButtonText()}
      {/if}
    </button>
  </div>
  
  <!-- Security note -->
  <div class="security-note mt-6 text-center">
    <p class="text-xs text-gray-500 dark:text-gray-400">
      Your biometric data is stored securely on your device and is never transmitted to our servers.
    </p>
  </div>
</div>

<style>
  .biometric-auth {
    max-width: 400px;
    margin: 0 auto;
  }
</style>