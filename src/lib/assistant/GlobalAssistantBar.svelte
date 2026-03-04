<script lang="ts">
  import { assistantStore, assistantActions } from './AssistantStore';
  import { assistantModeManager } from './AssistantModeManager';
  import { emitPageChange } from './AssistantEventBus';
  import type { PageContext } from './AssistantTypes';

  // Local state
  let isHovered = false;

  // Derived from store
  $: barVisible = $assistantStore.barVisible;
  $: panelExpanded = $assistantStore.panelExpanded;
  $: mode = $assistantStore.mode;
  $: microCue = $assistantStore.microCue;

  // Toggle panel expansion
  function togglePanel() {
    console.log('[Assistant] togglePanel, current panelExpanded:', panelExpanded);
    assistantActions.setPanelExpanded(!panelExpanded);
  }

  // Handle click on the bar (expand if collapsed)
  function handleBarClick() {
    console.log('[Assistant] handleBarClick, panelExpanded:', panelExpanded);
    if (!panelExpanded) {
      assistantActions.setPanelExpanded(true);
    }
  }

  // Simulate page change for demo
  function simulatePageChange(page: string) {
    const context: PageContext = { page: page as any };
    emitPageChange(context);
  }
</script>

<!-- Desktop: always visible bottom bar -->
{#if barVisible}
  <div
    class="global-assistant-bar desktop"
    class:expanded={panelExpanded}
    on:click={handleBarClick}
    on:mouseenter={() => (isHovered = true)}
    on:mouseleave={() => (isHovered = false)}
  >
    <!-- Left side: Oscar AI icon and label -->
    <div class="bar-left">
      <div class="oscar-icon">🤖</div>
      <span class="label">Ask Oscar AI</span>
    </div>

    <!-- Center: micro‑cue indicator -->
    <div class="bar-center">
      {#if microCue?.visible}
        <div class="micro-cue {microCue.type}">
          {microCue.type === 'nudge' ? '!' : '?'}
        </div>
      {/if}
    </div>

    <!-- Right side: up arrow and mode indicator -->
    <div class="bar-right">
      <div class="mode-indicator">{mode === 'chat' ? '💬' : '📄'}</div>
      <button class="expand-button" on:click|stopPropagation={togglePanel}>
        {panelExpanded ? '▼' : '▲'}
      </button>
    </div>

    <!-- Demo controls (hidden in production) -->
    <div class="demo-controls">
      <button on:click|stopPropagation={() => simulatePageChange('notes')}>Notes</button>
      <button on:click|stopPropagation={() => simulatePageChange('reports')}>Reports</button>
      <button on:click|stopPropagation={() => simulatePageChange('tasks')}>Tasks</button>
      <button on:click|stopPropagation={() => assistantActions.setMicroCue({ type: 'nudge', message: 'Try rewriting this section', visible: true })}>
        Nudge
      </button>
    </div>
  </div>
{/if}

<style>
  .global-assistant-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 48px;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 9999;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  }
  .global-assistant-bar.expanded {
    height: 60px;
    background: linear-gradient(135deg, #0f3460, #1a1a2e);
  }
  .global-assistant-bar:hover {
    background: linear-gradient(135deg, #0f3460, #1a1a2e);
  }
  .bar-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .oscar-icon {
    font-size: 24px;
  }
  .label {
    font-weight: 500;
    font-size: 15px;
    opacity: 0.9;
  }
  .bar-center {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  .micro-cue {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    animation: pulse 1.5s infinite;
  }
  .micro-cue.type-nudge {
    background: #ff6b6b;
    color: white;
  }
  .micro-cue.type-clarification {
    background: #4ecdc4;
    color: white;
  }
  .micro-cue.type-glow {
    background: #ffe66d;
    color: #333;
  }
  .micro-cue.type-pulse {
    background: #9d4edd;
    color: white;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  .bar-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .mode-indicator {
    font-size: 20px;
  }
  .expand-button {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
  }
  .expand-button:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  .demo-controls {
    position: absolute;
    top: -40px;
    right: 20px;
    display: flex;
    gap: 8px;
    opacity: 0.5;
  }
  .demo-controls button {
    background: #333;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }
  .demo-controls button:hover {
    background: #555;
  }

  /* Mobile styles (simplified) */
  @media (max-width: 768px) {
    .global-assistant-bar {
      height: 44px;
      padding: 0 12px;
    }
    .label {
      display: none;
    }
    .demo-controls {
      display: none;
    }
  }
</style>