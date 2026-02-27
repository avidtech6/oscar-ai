<script lang="ts">
  import { copilotState, setPrompt, submitPrompt } from '$lib/stores/copilot';
  import { selectedCard } from '$lib/stores/cards';
  
  function handleSubmit() {
    const prompt = $copilotState.currentPrompt.trim();
    if (prompt && !$copilotState.isThinking) {
      const context = {
        selectedCardTitle: $selectedCard?.title
      };
      submitPrompt(prompt, context);
    }
  }
  
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }
</script>

<div class="copilot-input">
  <div class="input-wrapper">
    <input
      type="text"
      bind:value={$copilotState.currentPrompt}
      on:keydown={handleKeyDown}
      placeholder="Ask a question or give a command..."
      class="input-field"
      disabled={$copilotState.isThinking}
    />
    
    <button
      on:click={handleSubmit}
      class="send-button"
      disabled={!$copilotState.currentPrompt.trim() || $copilotState.isThinking}
      aria-label="Send message"
    >
      {#if $copilotState.isThinking}
        <div class="thinking-indicator">
          <div class="thinking-dot"></div>
          <div class="thinking-dot"></div>
          <div class="thinking-dot"></div>
        </div>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="send-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      {/if}
    </button>
  </div>
  
  <div class="input-hint">
    Press Enter to send • Shift+Enter for new line
  </div>
</div>

<style>
  .copilot-input {
    width: 100%;
  }
  
  .input-wrapper {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  
  .input-field {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    background-color: white;
    transition: all 0.2s ease;
  }
  
  .input-field:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .input-field:disabled {
    background-color: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }
  
  .send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
  }
  
  .send-button:hover:not(:disabled) {
    background-color: #2563eb;
  }
  
  .send-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  
  .send-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .thinking-indicator {
    display: flex;
    gap: 0.25rem;
  }
  
  .thinking-dot {
    width: 6px;
    height: 6px;
    background-color: white;
    border-radius: 50%;
    animation: pulse 1.4s ease-in-out infinite;
  }
  
  .thinking-dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .thinking-dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes pulse {
    0%, 60%, 100% {
      opacity: 0.4;
      transform: scale(0.8);
    }
    30% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .input-hint {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 0.25rem;
    text-align: center;
  }
</style>