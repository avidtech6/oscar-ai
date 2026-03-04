<script lang="ts">
  import { assistantStore } from './AssistantStore';

  // Local state for showing a temporary bubble
  let showBubble = false;
  let bubbleMessage = '';

  // Listen for store changes that indicate a confirmation
  $: {
    // In a real implementation, you'd listen for specific actions
    // For now, we'll just show a dummy bubble when microCue appears
    const microCue = $assistantStore.microCue;
    if (microCue?.type === 'nudge') {
      showBubble = true;
      bubbleMessage = microCue.message || 'Nudge received';
      setTimeout(() => (showBubble = false), 3000);
    }
  }
</script>

{#if showBubble}
  <div class="one-bubble-confirmation">
    <div class="bubble">
      <span class="icon">✅</span>
      <span class="message">{bubbleMessage}</span>
    </div>
  </div>
{/if}

<style>
  .one-bubble-confirmation {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 10px;
    z-index: 10000;
  }
  .bubble {
    background: #4caf50;
    color: white;
    padding: 10px 16px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    animation: fadeInUp 0.3s ease;
  }
  .bubble .icon {
    font-size: 16px;
  }
  .bubble .message {
    font-size: 14px;
    font-weight: 500;
  }
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>