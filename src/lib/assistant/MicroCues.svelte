<script lang="ts">
  import { assistantStore } from './AssistantStore';

  $: microCue = $assistantStore.microCue;
</script>

{#if microCue?.visible}
  <div class="micro-cue-indicator {microCue.type}">
    {#if microCue.type === 'nudge'}
      <span class="icon">❗</span>
      <span class="message">{microCue.message || 'Nudge available'}</span>
    {:else if microCue.type === 'clarification'}
      <span class="icon">❓</span>
      <span class="message">{microCue.message || 'Clarification needed'}</span>
    {:else if microCue.type === 'glow'}
      <span class="icon">✨</span>
      <span class="message">New context</span>
    {:else if microCue.type === 'pulse'}
      <span class="icon">💡</span>
      <span class="message">Strong suggestion</span>
    {/if}
  </div>
{/if}

<style>
  .micro-cue-indicator {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    animation: pulse 2s infinite;
  }
  .micro-cue-indicator.type-nudge {
    background: #ff6b6b;
    color: white;
  }
  .micro-cue-indicator.type-clarification {
    background: #4ecdc4;
    color: white;
  }
  .micro-cue-indicator.type-glow {
    background: #ffe66d;
    color: #333;
  }
  .micro-cue-indicator.type-pulse {
    background: #9d4edd;
    color: white;
  }
  .micro-cue-indicator .icon {
    font-size: 14px;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
</style>