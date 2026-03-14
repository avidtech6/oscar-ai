<script lang="ts">
  import ContextChips from './ContextChips.svelte';

  export let contextChips: any[];
  export let togglePanel: () => void;
</script>

<div class="panel-header">
  <ContextChips chips={contextChips} />
  <button class="close-button" on:click={togglePanel}>×</button>
</div>

<style>
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
    background: #f9f9f9;
  }
  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .close-button:hover {
    background: #eee;
  }
</style>