<script lang="ts">
  import { assistantStore, assistantActions, currentHint } from './AssistantStore';
  import { assistantModeManager } from './AssistantModeManager';
  import { multiSelectAIActions } from './MultiSelectAIActions';
  import ContextChips from './ContextChips.svelte';
  import SmartHints from './SmartHints.svelte';
  import OneBubbleConfirmation from './OneBubbleConfirmation.svelte';

  // Local state
  let userInput = '';
  let isProcessing = false;

  // Derived from store
  $: panelExpanded = $assistantStore.panelExpanded;
  $: mode = $assistantStore.mode;
  $: contextChips = $assistantStore.contextChips;
  $: smartHints = $assistantStore.smartHints;
  $: isAttachedToModal = $assistantStore.isAttachedToModal;

  // Available multi‑select actions
  $: availableActions = multiSelectAIActions.getAvailableActions();

  // Handle user input submission
  async function handleSubmit() {
    if (!userInput.trim()) return;
    isProcessing = true;

    // Determine mode based on input and context
    const context = $assistantStore.pageContext;
    const selectedMode = assistantModeManager.handleUserMessage(userInput, context);

    // Simulate AI response
    setTimeout(() => {
      const response = `I understand you said: "${userInput}". This is a placeholder response.`;
      // If in context mode, apply content directly
      if (selectedMode === 'context' && context?.itemId) {
        assistantModeManager.applyChatResultToItem(context.itemId, response);
      } else {
        // In chat mode, just show response
        console.log('[Assistant]', response);
      }
      userInput = '';
      isProcessing = false;
    }, 500);
  }

  // Handle key press (Enter to submit)
  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  // Toggle panel expansion
  function togglePanel() {
    assistantActions.setPanelExpanded(!panelExpanded);
  }

  // Execute a multi‑select action
  async function executeAction(actionId: string) {
    const result = await multiSelectAIActions.executeAction(actionId);
    if (result.success) {
      console.log(`Action ${actionId} executed`);
    } else {
      console.error(`Action failed: ${result.message}`);
    }
  }

  // Rotate smart hint
  function rotateHint() {
    assistantActions.rotateHint();
  }
</script>

<!-- Assistant Panel (expanded state) -->
{#if panelExpanded}
  <div class="assistant-panel" class:attached={isAttachedToModal}>
    <!-- Header with context chips and close button -->
    <div class="panel-header">
      <ContextChips chips={contextChips} />
      <button class="close-button" on:click={togglePanel}>×</button>
    </div>

    <!-- Conversation area (simplified) -->
    <div class="conversation-area">
      <div class="message assistant">
        <div class="avatar">🤖</div>
        <div class="content">
          <strong>Oscar AI</strong>
          <p>Hello! I'm your global assistant. I can help you with notes, reports, tasks, and more.</p>
        </div>
      </div>
      <!-- One‑bubble confirmation (if any) -->
      <OneBubbleConfirmation />
    </div>

    <!-- Smart hints line -->
    <SmartHints smartHints={smartHints} currentHint={$currentHint} on:rotate={rotateHint} />

    <!-- Quick actions (multi‑select) -->
    {#if availableActions.length > 0}
      <div class="quick-actions">
        <h4>Quick Actions</h4>
        <div class="action-buttons">
          {#each availableActions as action}
            <button
              class="action-button"
              on:click={() => executeAction(action.id)}
              title={action.description}
            >
              <span class="icon">{action.icon}</span>
              <span class="label">{action.label}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Prompt box -->
    <div class="prompt-box">
      <textarea
        bind:value={userInput}
        on:keydown={handleKeyPress}
        placeholder="Ask Oscar AI anything..."
        rows="2"
        disabled={isProcessing}
      ></textarea>
      <button on:click={handleSubmit} disabled={isProcessing || !userInput.trim()}>
        {isProcessing ? 'Thinking...' : 'Send'}
      </button>
    </div>

    <!-- Mode indicator -->
    <div class="mode-indicator">
      Mode: <strong>{mode === 'chat' ? 'Chat' : 'Context'}</strong>
      <button on:click={() => assistantActions.setMode(mode === 'chat' ? 'context' : 'chat')}>
        Switch to {mode === 'chat' ? 'Context' : 'Chat'}
      </button>
    </div>
  </div>
{/if}

<style>
  .assistant-panel {
    position: fixed;
    bottom: 60px;
    left: 20px;
    right: 20px;
    max-height: 70vh;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    z-index: 9998;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #e0e0e0;
  }
  .assistant-panel.attached {
    position: absolute;
    bottom: 10px;
    left: 10px;
    right: 10px;
    max-height: 50vh;
  }
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
    background: #f9f9f9;
  }
  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .close-button:hover {
    background: #eee;
  }
  .conversation-area {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    max-height: 300px;
  }
  .message {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
  .message.assistant .avatar {
    font-size: 24px;
  }
  .message .content {
    background: #f1f8ff;
    padding: 12px 16px;
    border-radius: 12px;
    max-width: 80%;
  }
  .message.assistant .content {
    background: #f1f8ff;
  }
  .quick-actions {
    padding: 0 20px 16px;
    border-bottom: 1px solid #eee;
  }
  .quick-actions h4 {
    margin: 0 0 12px;
    font-size: 14px;
    color: #666;
  }
  .action-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .action-button {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #e3f2fd;
    border: 1px solid #bbdefb;
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .action-button:hover {
    background: #bbdefb;
  }
  .action-button .icon {
    font-size: 14px;
  }
  .prompt-box {
    padding: 20px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 12px;
  }
  .prompt-box textarea {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px;
    font-family: inherit;
    font-size: 15px;
    resize: none;
  }
  .prompt-box button {
    background: #1a73e8;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0 20px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  .prompt-box button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  .prompt-box button:hover:not(:disabled) {
    background: #0d62d9;
  }
  .mode-indicator {
    padding: 12px 20px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    color: #555;
  }
  .mode-indicator button {
    background: #666;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
    cursor: pointer;
  }
  .mode-indicator button:hover {
    background: #555;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .assistant-panel {
      left: 10px;
      right: 10px;
      bottom: 50px;
      max-height: 80vh;
    }
    .action-buttons {
      overflow-x: auto;
      padding-bottom: 8px;
    }
  }
</style>