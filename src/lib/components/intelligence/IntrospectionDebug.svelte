<script lang="ts">
  export let engine: any = null
</script>

<div class="debug-section">
  <h4>Debug Information</h4>
  
  <div class="debug-actions">
    <button class="debug-button" on:click={() => console.log('Engine:', engine)}>
      Log Engine to Console
    </button>
    <button class="debug-button" on:click={() => location.reload()}>
      Reload Page
    </button>
  </div>
  
  <div class="debug-info">
    <h5>Environment</h5>
    <ul>
      <li><strong>Mode:</strong> Development</li>
      <li><strong>Timestamp:</strong> {new Date().toISOString()}</li>
      <li><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side'}</li>
    </ul>
  </div>
  
  <div class="debug-tips">
    <h5>Debug Tips</h5>
    <ol>
      <li>Check browser console for detailed logs</li>
      <li>Verify Phase Files are in correct location</li>
      <li>Ensure intelligence engine is initialized</li>
      <li>Check network requests for API calls</li>
      <li>Validate TypeScript compilation</li>
    </ol>
  </div>
</div>

<style>
  .debug-section h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }
  
  .debug-section h5 {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }
  
  .debug-actions {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  .debug-button {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    cursor: pointer;
  }
  
  .debug-button:hover {
    background: #e5e7eb;
  }
  
  .debug-info ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.75rem;
    color: #374151;
  }
  
  .debug-info li {
    margin-bottom: 0.25rem;
  }
  
  .debug-tips ol {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.75rem;
    color: #374151;
  }
  
  .debug-tips li {
    margin-bottom: 0.5rem;
  }
</style>