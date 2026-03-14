<script lang="ts">
  export let engine: any = null
</script>

<div class="overview-section">
  <h4>Intelligence Layer Status</h4>
  {#if engine}
    <div class="status-grid">
      <div class="status-item success">
        <div class="status-icon">✅</div>
        <div class="status-content">
          <h5>Engine Active</h5>
          <p>Intelligence engine initialized</p>
        </div>
      </div>
      
      <div class="status-item info">
        <div class="status-icon">📚</div>
        <div class="status-content">
          <h5>Phase Files</h5>
          <p>{engine.getAllMetadata().length} phase files loaded</p>
        </div>
      </div>
      
      <div class="status-item info">
        <div class="status-icon">📊</div>
        <div class="status-content">
          <h5>Report Types</h5>
          <p>{engine.getReportTypes().length} report types available</p>
        </div>
      </div>
      
      <div class="status-item info">
        <div class="status-icon">🔄</div>
        <div class="status-content">
          <h5>Workflows</h5>
          <p>{engine.getWorkflowDefinitions().length} workflows defined</p>
        </div>
      </div>
    </div>
  {:else}
    <div class="loading">Loading engine status...</div>
  {/if}
  
  <div class="architecture-rules">
    <h4>Architecture Rules</h4>
    <ul>
      <li>Phase Files are authoritative blueprint</li>
      <li>HAR provides UI only (no logic)</li>
      <li>Phase Files take priority over HAR contradictions</li>
      <li>No legacy logic import from HAR</li>
    </ul>
  </div>
</div>

<style>
  .overview-section h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }
  
  .overview-section h5 {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }
  
  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .status-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 6px;
    background: #f9fafb;
  }
  
  .status-item.success {
    border-left: 4px solid #10b981;
  }
  
  .status-item.info {
    border-left: 4px solid #3b82f6;
  }
  
  .status-icon {
    font-size: 1.25rem;
  }
  
  .status-content h5 {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
  }
  
  .status-content p {
    margin: 0;
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .architecture-rules ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.875rem;
    color: #374151;
  }
  
  .architecture-rules li {
    margin-bottom: 0.25rem;
  }
  
  .loading {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    font-size: 0.875rem;
  }
</style>