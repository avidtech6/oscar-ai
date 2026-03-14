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

  // Switch mode
  function switchMode() {
    assistantActions.setMode(mode === 'chat' ? 'context' : 'chat');
  }
</script>

<!-- Assistant Panel (expanded state) -->
{#if panelExpanded}
  <div class="assistant-panel" class:attached={isAttachedToModal}>
    <AssistantPanelHeader {contextChips} {togglePanel} />

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

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .assistant-panel {
      left: 10px;
      right: 10px;
      bottom: 50px;
      max-height: 80vh;
    }
  }
</style>