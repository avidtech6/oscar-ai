<script lang="ts">
  export let error: string = ''
  export let remainingAttempts: number = 0
  export let isLocked: boolean = false
  export let lockoutRemaining: number = 0
  export let showRecoveryInput: boolean = false
  
  export function formatLockoutTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }
</script>

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