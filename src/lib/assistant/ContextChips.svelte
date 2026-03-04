<script lang="ts">
  import type { ContextChip } from './AssistantTypes';

  export let chips: ContextChip[] = [];
</script>

<div class="context-chips">
  {#each chips as chip}
    <div class="chip" style="--chip-color: {chip.color};">
      {#if chip.icon}
        <span class="icon">{chip.icon}</span>
      {/if}
      <span class="label">{chip.label}</span>
      {#if chip.count !== undefined}
        <span class="count">({chip.count})</span>
      {/if}
    </div>
  {/each}
</div>

<style>
  .context-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--chip-color, #e0e0e0);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }
  .chip .icon {
    font-size: 12px;
  }
  .chip .count {
    opacity: 0.9;
    font-size: 12px;
  }
</style>