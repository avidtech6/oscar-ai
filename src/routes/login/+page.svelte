<script lang="ts">
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  
  // Redirect to dashboard immediately (only in browser)
  if (browser) {
    goto('/dashboard')
  }
</script>

<div class="login-page">
  <div class="login-container">
    <div class="brand-header">
      <h1>Oscar AI</h1>
      <p class="subtitle">Redirecting to dashboard...</p>
    </div>
    
    <div class="login-card">
      <h2>Development Mode</h2>
      <p class="instruction">Authentication bypassed for development</p>
      
      <div class="success-message">
        <div class="success-icon">✓</div>
        <h3>Redirecting to Dashboard</h3>
        <p>You're being redirected to the main dashboard.</p>
      </div>
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
</style>