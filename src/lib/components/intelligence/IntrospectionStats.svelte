<script lang="ts">
  export let stats: any = null
  export let formatDate: (date: Date) => string = () => ''
</script>

<div class="stats-section">
  <h4>Reasoning Statistics</h4>
  {#if stats}
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{stats.totalPhases}</div>
        <div class="stat-label">Phase Files</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">{stats.totalArchitectureSummaries}</div>
        <div class="stat-label">Architecture Summaries</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">{stats.totalReportTypes}</div>
        <div class="stat-label">Report Types</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">{stats.totalWorkflows}</div>
        <div class="stat-label">Workflows</div>
      </div>
    </div>
    
    <div class="coverage-section">
      <h5>Coverage</h5>
      <div class="coverage-item">
        <div class="coverage-label">Phase Files</div>
        <div class="coverage-bar">
          <div class="coverage-fill" style="width: {stats.coverage.phases}%"></div>
        </div>
        <div class="coverage-value">{stats.coverage.phases.toFixed(1)}%</div>
      </div>
      
      <div class="coverage-item">
        <div class="coverage-label">Report Types</div>
        <div class="coverage-bar">
          <div class="coverage-fill" style="width: {stats.coverage.reports}%"></div>
        </div>
        <div class="coverage-value">{stats.coverage.reports.toFixed(1)}%</div>
      </div>
      
      <div class="coverage-item">
        <div class="coverage-label">Workflows</div>
        <div class="coverage-bar">
          <div class="coverage-fill" style="width: {stats.coverage.workflows}%"></div>
        </div>
        <div class="coverage-value">{stats.coverage.workflows.toFixed(1)}%</div>
      </div>
    </div>
    
    <div class="last-updated">
      <strong>Last Updated:</strong> {formatDate(stats.lastUpdated)}
    </div>
  {:else}
    <div class="loading">Loading statistics...</div>
  {/if}
</div>

<style>
  .stats-section h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }
  
  .stats-section h5 {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .stat-card {
    background: #f9fafb;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .coverage-section {
    margin-bottom: 1.5rem;
  }
  
  .coverage-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .coverage-label {
    font-size: 0.75rem;
    color: #374151;
    min-width: 100px;
  }
  
  .coverage-bar {
    flex: 1;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .coverage-fill {
    height: 100%;
    background: #10b981;
    border-radius: 4px;
  }
  
  .coverage-value {
    font-size: 0.75rem;
    font-weight: 600;
    color: #111827;
    min-width: 50px;
    text-align: right;
  }
  
  .last-updated {
    font-size: 0.75rem;
    color: #6b7280;
    text-align: center;
  }
  
  .loading {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    font-size: 0.875rem;
  }
</style>