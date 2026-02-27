<script lang="ts">
  import CopilotContextSummary from './CopilotContextSummary.svelte';
  import CopilotInput from './CopilotInput.svelte';
  import CopilotOutput from './CopilotOutput.svelte';
</script>

<div class="copilot-bar">
  <div class="copilot-section context-section">
    <CopilotContextSummary />
  </div>
  
  <div class="copilot-section input-section">
    <CopilotInput />
  </div>
  
  <div class="copilot-section output-section">
    <CopilotOutput />
  </div>
</div>

<style>
  .copilot-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 120px;
    background-color: white;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    display: flex;
    padding: 1rem;
    gap: 1rem;
    z-index: 100;
  }
  
  .copilot-section {
    display: flex;
    flex-direction: column;
  }
  
  .context-section {
    flex: 0 0 200px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
  }
  
  .input-section {
    flex: 1;
    min-width: 300px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
  }
  
  .output-section {
    flex: 1;
    min-width: 300px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 1024px) {
    .copilot-bar {
      height: 140px;
      flex-wrap: wrap;
    }
    
    .context-section {
      flex: 0 0 100%;
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
      padding-right: 0;
      padding-bottom: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .input-section {
      flex: 1;
      min-width: 200px;
      border-right: 1px solid #e5e7eb;
    }
    
    .output-section {
      flex: 1;
      min-width: 200px;
    }
  }
  
  @media (max-width: 768px) {
    .copilot-bar {
      height: 160px;
      padding: 0.75rem;
    }
    
    .input-section,
    .output-section {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
      padding-right: 0;
      padding-bottom: 0.5rem;
      margin-bottom: 0.5rem;
      min-width: 100%;
    }
    
    .output-section {
      border-bottom: none;
      margin-bottom: 0;
    }
  }
</style>