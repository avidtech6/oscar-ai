<script lang="ts">
  import { assistantStore, assistantActions, currentHint } from './AssistantStore';
  import { assistantModeManager } from './AssistantModeManager';
  import { multiSelectAIActions } from './MultiSelectAIActions';
  import SmartHints from './SmartHints.svelte';
  import AssistantPanelHeader from './AssistantPanelHeader.svelte';
  import AssistantConversationArea from './AssistantConversationArea.svelte';
  import AssistantQuickActions from './AssistantQuickActions.svelte';
  import AssistantPromptBox from './AssistantPromptBox.svelte';
  import AssistantModeIndicator from './AssistantModeIndicator.svelte';

  // Local state
  let userInput = '';
  let isProcessing = false;
  let showContextPanel = false;

  // Derived from store
  $: panelExpanded = $assistantStore.panelExpanded;
  $: mode = $assistantStore.mode;
  $: contextChips = $assistantStore.contextChips;
  $: smartHints = $assistantStore.smartHints;
  $: isAttachedToModal = $assistantStore.isAttachedToModal;
  $: systemStatus = $assistantStore.systemStatus;
  $: currentPage = $assistantStore.currentPage;
  $: currentContext = $assistantStore.currentContext;

  // Available multi‑select actions
  $: availableActions = multiSelectAIActions.getAvailableActions();

  // Handle user input submission
  async function handleSubmit() {
    if (!userInput.trim()) return;
    isProcessing = true;

    // Determine mode based on input and context
    const context = $assistantStore.pageContext;
    const selectedMode = assistantModeManager.handleUserMessage(userInput, context);

    // Update system status to processing
    assistantActions.setSystemStatus('processing');

    // Simulate AI response with better context integration
    setTimeout(() => {
      const response = generateContextualResponse(userInput, context, selectedMode);
      
      // If in context mode, apply content directly
      if (selectedMode === 'context' && context?.itemId) {
        assistantModeManager.applyChatResultToItem(context.itemId, response);
      } else {
        // In chat mode, just show response
        console.log('[Assistant]', response);
      }
      
      userInput = '';
      isProcessing = false;
      assistantActions.setSystemStatus('active');
    }, 800);
  }

  // Generate contextual response based on current page and mode
  function generateContextualResponse(input: string, context: any, mode: string): string {
    const pageContext = currentPage || 'general';
    const contextualPrefix = getPageContextualPrefix(pageContext);
    
    if (mode === 'analyze') {
      return `${contextualPrefix} Analyzing your request: "${input}". I'll help you analyze this content with the appropriate intelligence system for ${pageContext}.`;
    } else if (mode === 'rewrite') {
      return `${contextualPrefix} I'll help you rewrite this content. Let me provide suggestions for improvement based on ${pageContext} context.`;
    } else if (mode === 'explain') {
      return `${contextualPrefix} I'll explain this concept in the context of ${pageContext}. Let me break it down for you.`;
    } else if (mode === 'optimize') {
      return `${contextualPrefix} Optimizing your content for ${pageContext}. I'll provide recommendations to improve effectiveness.`;
    } else {
      return `I understand you're asking about: "${input}". This is in the context of ${pageContext}. I'm here to help with your ${mode} needs.`;
    }
  }

  // Get contextual prefix based on current page
  function getPageContextualPrefix(page: string): string {
    switch (page) {
      case 'reports':
        return '📊 In the Reports Intelligence context,';
      case 'content':
        return '🎯 In the Content Intelligence context,';
      case 'editor':
        return '✏️ In the Editor context,';
      case 'intelligence':
        return '🧠 In the Intelligence Systems context,';
      case 'extended':
        return '🚀 In the Extended Intelligence context,';
      case 'system':
        return '⚙️ In the System Management context,';
      default:
        return '🤖 In the current context,';
    }
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
      assistantActions.setSystemStatus('active');
    } else {
      console.error(`Action failed: ${result.message}`);
      assistantActions.setSystemStatus('error');
    }
  }

  // Rotate smart hint
  function rotateHint() {
    assistantActions.rotateHint();
  }

  // Switch mode
  function switchMode() {
    assistantActions.setMode(mode === 'chat' ? 'context' : 'chat');
  }

  // Toggle context panel
  function toggleContextPanel() {
    showContextPanel = !showContextPanel;
  }

  // Add context chip
  function addContextChip(chip: string) {
    assistantActions.addContextChip(chip);
  }

  // Remove context chip
  function removeContextChip(chip: string) {
    assistantActions.removeContextChip(chip);
  }
</script>

<!-- Assistant Panel (expanded state) -->
{#if panelExpanded}
  <div class="assistant-panel" class:attached={isAttachedToModal}>
    <AssistantPanelHeader
      {contextChips}
      {togglePanel}
      {systemStatus}
      {currentPage}
      {toggleContextPanel}
    />

    <!-- Context Intelligence Panel -->
    {#if showContextPanel}
      <div class="context-intelligence-panel">
        <div class="context-header">
          <h4>Context Intelligence</h4>
          <button class="close-context" on:click={toggleContextPanel}>✕</button>
        </div>
        
        <div class="context-section">
          <h5>Current Environment</h5>
          <div class="context-info">
            <p><strong>Page:</strong> <span class="context-value">{currentPage || 'Unknown'}</span></p>
            <p><strong>Mode:</strong> <span class="context-value capitalize">{mode}</span></p>
            <p><strong>Status:</strong>
              <span class="context-value" style="color: {getStatusColor(systemStatus)}">
                {systemStatus}
              </span>
            </p>
          </div>
        </div>

        {#if currentContext}
          <div class="context-section">
            <h5>Current Context</h5>
            <div class="context-preview">
              {currentContext}
            </div>
          </div>
        {/if}

        <div class="context-section">
          <h5>Quick Context Actions</h5>
          <div class="context-actions">
            <button class="context-action" on:click={() => addContextChip('analysis')}>
              🔍 Add Analysis Context
            </button>
            <button class="context-action" on:click={() => addContextChip('rewrite')}>
              ✏️ Add Rewrite Context
            </button>
            <button class="context-action" on:click={() => addContextChip('optimize')}>
              ⚡ Add Optimization Context
            </button>
          </div>
        </div>
      </div>
    {/if}

    <AssistantConversationArea />

    <!-- Smart hints line -->
    <SmartHints smartHints={smartHints} currentHint={$currentHint} on:rotate={rotateHint} />

    <AssistantQuickActions {availableActions} {executeAction} />

    <AssistantPromptBox {userInput} {isProcessing} {handleSubmit} {handleKeyPress} />

    <AssistantModeIndicator {mode} {switchMode} />
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

  /* Context Intelligence Panel */
  .context-intelligence-panel {
    background: var(--background);
    border-radius: 12px;
    padding: 16px;
    margin: 12px;
    border: 1px solid var(--border);
  }

  .context-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .context-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
  }

  .close-context {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .close-context:hover {
    background-color: var(--background-hover);
  }

  .context-section {
    margin-bottom: 16px;
  }

  .context-section h5 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }

  .context-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .context-info p {
    margin: 0;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .context-value {
    font-weight: 500;
    color: var(--text);
  }

  .context-preview {
    background: var(--background-hover);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px;
    font-size: 13px;
    color: var(--text);
    max-height: 100px;
    overflow-y: auto;
  }

  .context-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .context-action {
    background: var(--background-hover);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: var(--text);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .context-action:hover {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
  }

  /* Enhanced Mobile adjustments */
  @media (max-width: 1024px) {
    .context-intelligence-panel {
      padding: 12px;
    }
    
    .context-header h4 {
      font-size: 14px;
    }
    
    .context-section h5 {
      font-size: 13px;
    }
  }
  
  @media (max-width: 768px) {
    .assistant-panel {
      left: 10px;
      right: 10px;
      bottom: 50px;
      max-height: 80vh;
    }

    .context-intelligence-panel {
      margin: 8px;
      padding: 12px;
    }
    
    .context-actions {
      flex-direction: row;
      flex-wrap: wrap;
    }
    
    .context-action {
      flex: 1;
      min-width: 120px;
    }
  }
  
  @media (max-width: 480px) {
    .assistant-panel {
      left: 5px;
      right: 5px;
      bottom: 40px;
      max-height: 75vh;
    }

    .context-intelligence-panel {
      padding: 8px;
      margin: 6px;
    }
    
    .context-header h4 {
      font-size: 13px;
    }
    
    .context-section h5 {
      font-size: 12px;
    }
    
    .context-info p {
      font-size: 11px;
    }
    
    .context-value {
      font-size: 11px;
    }
    
    .context-preview {
      font-size: 11px;
      padding: 8px;
    }
    
    .context-action {
      padding: 6px 8px;
      font-size: 11px;
    }
  }
</style>