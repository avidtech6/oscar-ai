<script lang="ts">
  export let query: string = ''
  export let queryResults: any = null
  export let isLoading: boolean = false
  export let handleQuery: () => void = () => {}
  export let formatDate: (date: Date) => string = () => ''
</script>

<div class="query-section">
  <h4>Query Intelligence Layer</h4>
  <div class="query-input">
    <input 
      type="text" 
      bind:value={query}
      placeholder="Ask about phases, workflows, or reports..."
      class="query-text"
      on:keydown={(e) => e.key === 'Enter' && handleQuery()}
    />
    <button class="query-button" on:click={handleQuery} disabled={isLoading}>
      {#if isLoading}
        <span class="loading-spinner-small"></span>
      {:else}
        Search
      {/if}
    </button>
  </div>
  
  {#if queryResults}
    <div class="query-results">
      <h5>Results ({queryResults.results?.length || 0})</h5>
      
      {#if queryResults.error}
        <div class="error-message">
          Error: {queryResults.error}
        </div>
      {:else if queryResults.results && queryResults.results.length > 0}
        <div class="results-list">
          {#each queryResults.results as result, i}
            <div class="result-item">
              <div class="result-type">{result.type}</div>
              <div class="result-content">
                <strong>
                  {#if result.type === 'phase'}
                    Phase {result.phase}: {result.title}
                  {:else if result.type === 'phase_metadata'}
                    Phase {result.phaseNumber}: {result.title}
                  {:else if result.type === 'workflow'}
                    Workflow: {result.name}
                  {:else if result.type === 'report'}
                    Report Type: {result.name}
                  {:else}
                    {result.name || result.title}
                  {/if}
                </strong>
                <p>{result.summary || result.description || 'No description available'}</p>
                <div class="result-meta">
                  <span class="confidence">Confidence: {(result.matchScore * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          {/each}
        </div>
        
        <div class="query-meta">
          <p><strong>Explanation:</strong> {queryResults.explanation}</p>
          <p><strong>Confidence:</strong> {(queryResults.confidence * 100).toFixed(0)}%</p>
          <p><strong>Timestamp:</strong> {formatDate(queryResults.timestamp)}</p>
        </div>
      {:else}
        <div class="no-results">
          No results found. Try different keywords.
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .query-section h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }
  
  .query-section h5 {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }
  
  .query-input {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .query-text {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
  }
  
  .query-button {
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }
  
  .query-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .loading-spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    display: inline-block;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .query-results {
    margin-top: 1rem;
  }
  
  .results-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 1rem;
  }
  
  .result-item {
    background: #f9fafb;
    border-radius: 6px;
    padding: 0.75rem;
    border-left: 3px solid #3b82f6;
  }
  
  .result-type {
    font-size: 0.625rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }
  
  .result-content strong {
    font-size: 0.875rem;
    color: #111827;
    display: block;
    margin-bottom: 0.25rem;
  }
  
  .result-content p {
    font-size: 0.75rem;
    color: #4b5563;
    margin: 0 0 0.5rem 0;
  }
  
  .result-meta {
    font-size: 0.625rem;
    color: #9ca3af;
  }
  
  .query-meta {
    background: #f0f9ff;
    border-radius: 6px;
    padding: 0.75rem;
    font-size: 0.75rem;
    color: #374151;
  }
  
  .query-meta p {
    margin: 0 0 0.25rem 0;
  }
  
  .no-results {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .error-message {
    background: #fef2f2;
    color: #dc2626;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
  }
</style>