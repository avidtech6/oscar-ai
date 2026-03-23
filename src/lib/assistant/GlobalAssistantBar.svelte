<script lang="ts">
  import { assistantStore, assistantActions } from './AssistantStore';
  import { assistantModeManager } from './AssistantModeManager';
  import { emitPageChange } from './AssistantEventBus';
  import type { PageContext } from './AssistantTypes';

  // Local state
  let isHovered = false;
  let showQuickActions = false;

  // Derived from store
  $: barVisible = $assistantStore.barVisible;
  $: panelExpanded = $assistantStore.panelExpanded;
  $: mode = $assistantStore.mode;
  $: microCue = $assistantStore.microCue;
  $: systemStatus = $assistantStore.systemStatus;

  // Context information
  $: currentPage = $assistantStore.currentPage;
  $: currentContext = $assistantStore.currentContext;

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

  // Quick action handlers
  function handleQuickAction(action: string) {
    switch (action) {
      case 'analyze':
        assistantActions.setMode('analyze');
        assistantActions.setPanelExpanded(true);
        break;
      case 'rewrite':
        assistantActions.setMode('rewrite');
        assistantActions.setPanelExpanded(true);
        break;
      case 'explain':
        assistantActions.setMode('explain');
        assistantActions.setPanelExpanded(true);
        break;
      case 'optimize':
        assistantActions.setMode('optimize');
        assistantActions.setPanelExpanded(true);
        break;
    }
  }

  // Get system status color
  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return '#10b981';
      case 'processing': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'idle': return '#6b7280';
      default: return '#6b7280';
    }
  }
</script>

<!-- Desktop: always visible bottom bar -->
{#if barVisible}
  <div
    class="global-assistant-bar desktop"
    class:expanded={panelExpanded}
    class:show-quick-actions={showQuickActions}
    on:click={handleBarClick}
    on:mouseenter={() => (isHovered = true)}
    on:mouseleave={() => (isHovered = false)}
  >
    <!-- Left side: Oscar AI icon and label -->
    <div class="bar-left">
      <div class="oscar-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <div class="assistant-info">
        <span class="label">Ask Oscar AI</span>
        <div class="context-info">
          {#if currentPage}
            <span class="current-page">{currentPage}</span>
          {/if}
          {#if systemStatus}
            <span class="status-dot" style="background-color: {getStatusColor(systemStatus)}"></span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Center: micro‑cue indicator and quick actions -->
    <div class="bar-center">
      {#if microCue?.visible}
        <div class="micro-cue {microCue.type}" on:click|stopPropagation={() => showQuickActions = !showQuickActions}>
          {microCue.type === 'nudge' ? '!' : '?'}
        </div>
      {/if}
      
      {#if showQuickActions && !microCue?.visible}
        <div class="quick-actions-menu" on:click|stopPropagation={(e) => e.stopPropagation()}>
          <button class="quick-action" on:click|stopPropagation={() => handleQuickAction('analyze')}>
            <span class="action-icon">🔍</span>
            <span class="action-text">Analyze</span>
          </button>
          <button class="quick-action" on:click|stopPropagation={() => handleQuickAction('rewrite')}>
            <span class="action-icon">✏️</span>
            <span class="action-text">Rewrite</span>
          </button>
          <button class="quick-action" on:click|stopPropagation={() => handleQuickAction('explain')}>
            <span class="action-icon">📝</span>
            <span class="action-text">Explain</span>
          </button>
          <button class="quick-action" on:click|stopPropagation={() => handleQuickAction('optimize')}>
            <span class="action-icon">⚡</span>
            <span class="action-text">Optimize</span>
          </button>
        </div>
      {/if}
    </div>

    <!-- Right side: mode indicator and controls -->
    <div class="bar-right">
      {#if currentContext}
        <div class="context-preview" title="{currentContext}">
          {currentContext.length > 20 ? currentContext.substring(0, 20) + '...' : currentContext}
        </div>
      {/if}
      
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
    background: linear-gradient(135deg, var(--background), var(--background-hover));
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-top: 1px solid var(--border);
    z-index: 9999;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
  }
  
  .global-assistant-bar.expanded {
    height: 60px;
    background: linear-gradient(135deg, var(--primary), var(--background));
  }
  
  .global-assistant-bar.show-quick-actions {
    height: 120px;
    background: linear-gradient(135deg, var(--primary), var(--background-hover));
  }
  
  .global-assistant-bar:hover {
    background: linear-gradient(135deg, var(--primary), var(--background));
  }
  
  .bar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  
  .oscar-icon {
    width: 32px;
    height: 32px;
    background: var(--background-hover);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .oscar-icon:hover {
    background: var(--primary);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
  }
  
  .assistant-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .label {
    font-weight: 600;
    font-size: 14px;
    color: var(--text);
    letter-spacing: 0.02em;
  }
  
  .context-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-secondary);
  }
  
  .current-page {
    background: var(--background-hover);
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
  }
  
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
  }
  
  .bar-center {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  
  .micro-cue {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
    animation: pulse 1.5s infinite;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  .micro-cue:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .micro-cue.type-nudge {
    background: linear-gradient(135deg, #ff6b6b, #ff5252);
    color: white;
  }
  
  .micro-cue.type-clarification {
    background: linear-gradient(135deg, #4ecdc4, #26a69a);
    color: white;
  }
  
  .micro-cue.type-glow {
    background: linear-gradient(135deg, #ffe66d, #ffd54f);
    color: #333;
  }
  
  .micro-cue.type-pulse {
    background: linear-gradient(135deg, #9d4edd, #7c4dff);
    color: white;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }
  
  .quick-actions-menu {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    margin-bottom: 8px;
  }
  
  .quick-action {
    background: var(--background-hover);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: var(--text);
  }
  
  .quick-action:hover {
    background: var(--primary);
    border-color: var(--primary);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
  }
  
  .action-icon {
    font-size: 18px;
  }
  
  .action-text {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  
  .bar-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  
  .context-preview {
    background: var(--background-hover);
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-secondary);
  }
  
  .mode-indicator {
    font-size: 18px;
    background: var(--background-hover);
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .mode-indicator:hover {
    background: var(--primary);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
  }
  
  .expand-button {
    background: var(--background-hover);
    border: none;
    color: var(--text);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
  }
  
  .expand-button:hover {
    background: var(--primary);
    color: white;
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
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
    background: var(--background-hover);
    color: var(--text);
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .demo-controls button:hover {
    background: var(--primary);
    color: white;
    opacity: 1;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
  }

  /* Enhanced Mobile styles */
  @media (max-width: 1024px) {
    .global-assistant-bar {
      padding: 0 16px;
    }
    
    .bar-left {
      gap: 10px;
    }
    
    .oscar-icon {
      width: 28px;
      height: 28px;
    }
    
    .label {
      font-size: 12px;
    }
  }
  
  @media (max-width: 768px) {
    .global-assistant-bar {
      height: 44px;
      padding: 0 12px;
    }
    
    .global-assistant-bar.expanded {
      height: 56px;
    }
    
    .global-assistant-bar.show-quick-actions {
      height: 140px;
    }
    
    .label {
      display: none;
    }
    
    .context-preview {
      display: none;
    }
    
    .demo-controls {
      display: none;
    }
    
    .quick-actions-menu {
      grid-template-columns: 1fr 1fr 1fr;
      padding: 8px;
      gap: 6px;
    }
    
    .quick-action {
      padding: 6px;
    }
    
    .action-text {
      font-size: 10px;
    }
    
    .bar-left {
      gap: 8px;
    }
    
    .oscar-icon {
      width: 24px;
      height: 24px;
    }
  }
  
  @media (max-width: 480px) {
    .global-assistant-bar {
      padding: 0 10px;
    }
    
    .quick-actions-menu {
      grid-template-columns: 1fr 1fr;
      padding: 6px;
      gap: 4px;
    }
    
    .quick-action {
      padding: 4px;
    }
    
    .action-icon {
      font-size: 16px;
    }
    
    .action-text {
      font-size: 9px;
    }
    
    .bar-left {
      gap: 6px;
    }
    
    .oscar-icon {
      width: 20px;
      height: 20px;
    }
  }
</style>