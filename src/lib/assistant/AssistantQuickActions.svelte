<script lang="ts">
  export let availableActions: any[];
  export let executeAction: (actionId: string) => Promise<void>;
</script>

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

<style>
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
</style>