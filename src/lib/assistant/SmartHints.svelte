<script lang="ts">
  import type { SmartHint } from './AssistantTypes';

  export let smartHints: SmartHint[] = [];
  export let currentHint: SmartHint | null = null;

  // Emit event when hint is clicked
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function rotateHint() {
    dispatch('rotate');
  }
</script>

<div class="smart-hints">
  {#if currentHint}
    <div class="hint-line" on:click={rotateHint} title="Click to see next hint">
      <span class="icon">💡</span>
      <span class="text">{currentHint.text}</span>
      <span class="next-indicator">↻</span>
    </div>
  {:else}
    <div class="hint-line placeholder">
      <span class="icon">💡</span>
      <span class="text">No hints available</span>
    </div>
  {/if}
</div>

<style>
  .smart-hints {
    padding: 12px 20px;
    border-bottom: 1px solid #eee;
  }
  .hint-line {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f9f9f9;
    padding: 10px 16px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .hint-line:hover {
    background: #f0f0f0;
  }
  .hint-line .icon {
    font-size: 18px;
  }
  .hint-line .text {
    flex: 1;
    font-size: 14px;
    color: #333;
  }
  .hint-line .next-indicator {
    opacity: 0.5;
    font-size: 14px;
  }
  .placeholder {
    opacity: 0.6;
    cursor: default;
  }
  .placeholder:hover {
    background: #f9f9f9;
  }
</style>