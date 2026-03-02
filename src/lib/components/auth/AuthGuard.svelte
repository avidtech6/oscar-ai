<script lang="ts">
  import { authStore } from '$lib/stores/auth/auth'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'

  export let requireAuth = true
  export let requireUnlocked = false
  export let redirectTo = '/login'

  let checkingAuth = true

  onMount(() => {
    // Check auth state on mount
    const unsubscribe = authStore.subscribe(($auth) => {
      checkingAuth = $auth.isLoading

      if (!$auth.isLoading) {
        if (requireAuth && !$auth.isAuthenticated) {
          // Not authenticated, redirect to login
          const currentPath = $page.url.pathname + $page.url.search
          goto(`${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`)
        } else if (requireUnlocked && !$auth.isUnlocked) {
          // Authenticated but not unlocked, redirect to unlock
          goto('/unlock')
        } else if (!requireAuth && $auth.isAuthenticated && $page.url.pathname === '/login') {
          // Already authenticated, redirect from login
          goto('/unlock')
        }
      }
    })

    return () => unsubscribe()
  })
</script>

{#if checkingAuth}
  <div class="auth-loading">
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Checking authentication...</p>
    </div>
  </div>
{:else if requireAuth && !$authStore.isAuthenticated}
  <div class="auth-required">
    <p>Authentication required. Redirecting...</p>
  </div>
{:else if requireUnlocked && !$authStore.isUnlocked}
  <div class="unlock-required">
    <p>Unlock required. Redirecting...</p>
  </div>
{:else}
  <slot />
{/if}

<style>
  .auth-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .loading-spinner {
    text-align: center;
  }

  .spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid rgba(59, 130, 246, 0.3);
    border-radius: 50%;
    border-top-color: #3b82f6;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .auth-required,
  .unlock-required {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
  }
</style>