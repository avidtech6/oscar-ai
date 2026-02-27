<script lang="ts">
  import { copilotState } from '$lib/stores/copilot';
</script>

<div class="copilot-output">
  {#if $copilotState.isThinking}
    <div class="thinking-state">
      <div class="thinking-text">Thinking...</div>
      <div class="thinking-animation">
        <div class="thinking-dot"></div>
        <div class="thinking-dot"></div>
        <div class="thinking-dot"></div>
      </div>
    </div>
  {:else if $copilotState.lastResponse}
    <div class="response-content">
      <div class="response-header">
        <span class="response-label">Response:</span>
        <button
          on:click={() => copilotState.update(s => ({ ...s, lastResponse: '' }))}
          class="clear-button"
          aria-label="Clear response"
        >
          Clear
        </button>
      </div>
      <div class="response-text">{$copilotState.lastResponse}</div>
    </div>
  {:else}
    <div class="empty-state">
      <div class="empty-icon">💭</div>
      <div class="empty-text">Ask me anything about your workspace</div>
    </div>
  {/if}
</div>

<style>
  .copilot-output {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .thinking-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 1rem;
  }
  
  .thinking-text {
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .thinking-animation {
    display: flex;
    gap: 0.5rem;
  }
  
  .thinking-dot {
    width: 8px;
    height: 8px;
    background-color: #3b82f6;
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite;
  }
  
  .thinking-dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .thinking-dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes bounce {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
  }
  
  .response-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .response-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .response-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }
  
  .clear-button {
    font-size: 0.75rem;
    color: #6b7280;
    background: none;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    padding: 0.125rem 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .clear-button:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }
  
  .response-text {
    flex: 1;
    font-size: 0.875rem;
    color: #4b5563;
    line-height: 1.5;
    overflow-y: auto;
    padding-right: 0.5rem;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 0.5rem;
  }
  
  .empty-icon {
    font-size: 1.5rem;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: 0.875rem;
    color: #9ca3af;
    text-align: center;
  }
</style>