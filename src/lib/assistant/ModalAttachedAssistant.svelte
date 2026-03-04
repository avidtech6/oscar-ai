<script lang="ts">
  import { assistantStore, assistantActions } from './AssistantStore';
  import ContextChips from './ContextChips.svelte';
  import SmartHints from './SmartHints.svelte';
  import MicroCues from './MicroCues.svelte';

  // Local state
  let userInput = '';

  // Derived from store
  $: isAttached = $assistantStore.isAttachedToModal;
  $: modalItemId = $assistantStore.modalItemId;
  $: contextChips = $assistantStore.contextChips;
  $: smartHints = $assistantStore.smartHints;

  // Handle input submission
  function handleSubmit() {
    if (!userInput.trim()) return;
    console.log(`[Modal Assistant] Processing: ${userInput}`);
    // Simulate AI action
    setTimeout(() => {
      alert(`Assistant applied to modal item ${modalItemId}: ${userInput}`);
      userInput = '';
    }, 300);
  }

  // Close modal attachment
  function detach() {
    assistantActions.detachFromModal();
  }
</script>

{#if isAttached}
  <div class="modal-attached-assistant">
    <div class="modal-header">
      <div class="title">
        <span class="icon">🤖</span>
        <span>Assistant in Modal</span>
      </div>
      <button class="close-button" on:click={detach}>×</button>
    </div>
    <div class="modal-body">
      <ContextChips chips={contextChips} />
      <div class="hint-section">
        <SmartHints {smartHints} currentHint={smartHints[0] || null} />
        <MicroCues />
      </div>
      <div class="input-section">
        <textarea
          bind:value={userInput}
          placeholder="Ask assistant about this item..."
          rows="2"
        />
        <button on:click={handleSubmit} disabled={!userInput.trim()}>
          Apply
        </button>
      </div>
      <div class="note">
        <small>Assistant actions will apply only to this modal item.</small>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-attached-assistant {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #ddd;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }
  .modal-header .title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 15px;
  }
  .modal-header .icon {
    font-size: 18px;
  }
  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .close-button:hover {
    background: #eee;
  }
  .modal-body {
    padding: 16px;
  }
  .hint-section {
    margin: 12px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .input-section {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }
  .input-section textarea {
    flex: 1;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    font-family: inherit;
    font-size: 14px;
    resize: none;
  }
  .input-section button {
    background: #1a73e8;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  .input-section button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  .input-section button:hover:not(:disabled) {
    background: #0d62d9;
  }
  .note {
    margin-top: 12px;
    color: #666;
    font-size: 12px;
    text-align: center;
  }
</style>