<script lang="ts">
  export let mode: string;
  export let switchMode: () => void;
</script>

<div class="mode-indicator">
  Mode: <strong>{mode === 'chat' ? 'Chat' : 'Context'}</strong>
  <button on:click={switchMode}>
    Switch to {mode === 'chat' ? 'Context' : 'Chat'}
  </button>
</div>

<style>
  .mode-indicator {
    padding: 12px 20px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    color: #555;
  }
  .mode-indicator button {
    background: #666;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
    cursor: pointer;
  }
  .mode-indicator button:hover {
    background: #555;
  }
</style>