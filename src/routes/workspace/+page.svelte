<script lang="ts">
  import WorkspaceShell from '$lib/components/Workspace/WorkspaceShell.svelte';
  import CopilotBar from '$lib/components/CopilotBar/CopilotBar.svelte';
</script>

<div class="page-container">
  <div class="workspace-container">
    <WorkspaceShell />
  </div>
  <CopilotBar />
</div>

<style>
  :global(body) {
    margin: 0;
    height: 100vh;
    overflow: hidden;
  }
  
  :global(#svelte) {
    height: 100%;
  }
  
  .page-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .workspace-container {
    flex: 1;
    overflow: hidden;
  }
</style>
