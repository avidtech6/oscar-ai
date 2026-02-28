<script lang="ts">
	import FilesShell from '$lib/components/files/FilesShell.svelte';
</script>

<div class="page-container">
  <div class="files-container">
    <FilesShell />
  </div>
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
  
  .files-container {
    flex: 1;
    overflow: hidden;
  }
</style>