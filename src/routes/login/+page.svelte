<script lang="ts">
  import { page } from '$app/stores'
  import { browser } from '$app/environment'
  import { authActions } from '$lib/stores/auth/auth'

  let email = ''
  let loading = false
  let error = ''
  let success = false

  // Get redirect URL from query params
  let redirectTo = '/unlock'

  $: {
    if (browser) {
      const params = new URLSearchParams($page.url.search)
      redirectTo = params.get('redirectTo') || '/unlock'
    }
  }
  
  async function handleSubmit(e: Event) {
    e.preventDefault()
    
    if (!email || loading) return
    
    loading = true
    error = ''
    success = false
    
    try {
      const result = await authActions.signIn(email)
      
      if (result.success) {
        success = true
        email = ''
      } else {
        error = result.error || 'Failed to send magic link'
      }
    } catch (err: any) {
      error = err.message || 'An unexpected error occurred'
    } finally {
      loading = false
    }
  }
</script>

<div class="login-page">
  <div class="login-container">
    <div class="brand-header">
      <h1>Oscar AI</h1>
      <p class="subtitle">Intelligent reporting and analysis</p>
    </div>
    
    <div class="login-card">
      <h2>Sign in to your account</h2>
      <p class="instruction">Enter your email to receive a magic link</p>
      
      {#if success}
        <div class="success-message">
          <div class="success-icon">✓</div>
          <h3>Check your email</h3>
          <p>We've sent a magic link to <strong>{email}</strong></p>
          <p>Click the link in the email to sign in.</p>
          <div class="success-actions">
            <button on:click={() => { success = false; email = '' }} class="secondary">
              Send another link
            </button>
          </div>
        </div>
      {:else}
        <form on:submit={handleSubmit} class="login-form">
          <div class="form-group">
            <label for="email">Email address</label>
            <input
              id="email"
              type="email"
              bind:value={email}
              placeholder="you@example.com"
              required
              disabled={loading}
              autocomplete="email"
            />
          </div>
          
          {#if error}
            <div class="error-message">
              <div class="error-icon">!</div>
              <p>{error}</p>
            </div>
          {/if}
          
          <button type="submit" class="submit-button" disabled={loading || !email}>
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      {/if}
      
      <div class="login-footer">
        <p class="security-note">
          <span class="icon">🔒</span>
          Your data is encrypted locally with your PIN
        </p>
        <p class="security-note">
          <span class="icon">📧</span>
          No passwords - magic links only
        </p>
      </div>
    </div>
    
    <div class="back-link">
      <a href="/" class="back-button">← Back to home</a>
    </div>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
  }
  
  .login-container {
    width: 100%;
    max-width: 400px;
  }
  
  .brand-header {
    text-align: center;
    margin-bottom: 2rem;
    color: white;
  }
  
  .brand-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.5px;
  }
  
  .subtitle {
    font-size: 1rem;
    opacity: 0.9;
    margin-top: 0.5rem;
  }
  
  .login-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }
  
  .login-card h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #111827;
  }
  
  .instruction {
    color: #6b7280;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }
  
  .form-group input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .form-group input:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
  
  .error-message {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .error-icon {
    background-color: #dc2626;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
    flex-shrink: 0;
  }
  
  .success-message {
    text-align: center;
    padding: 1.5rem 0;
  }
  
  .success-icon {
    background-color: #10b981;
    color: white;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0 auto 1rem;
  }
  
  .success-message h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #111827;
  }
  
  .success-message p {
    color: #6b7280;
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }
  
  .success-actions {
    margin-top: 1.5rem;
  }
  
  .submit-button {
    width: 100%;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .secondary:hover {
    background-color: #e5e7eb;
  }
  
  .login-footer {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }
  
  .security-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
  
  .security-note .icon {
    font-size: 1rem;
  }
  
  .back-link {
    text-align: center;
    margin-top: 2rem;
  }
  
  .back-button {
    color: white;
    text-decoration: none;
    font-size: 0.875rem;
    opacity: 0.8;
    transition: opacity 0.2s;
  }
  
  .back-button:hover {
    opacity: 1;
  }
</style>