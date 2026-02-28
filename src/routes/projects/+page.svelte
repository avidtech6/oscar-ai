<script lang="ts">
  import ProjectsShell from '$lib/components/project/ProjectsShell.svelte';
</script>

<div class="page-container">
  <div class="projects-container">
    <ProjectsShell />
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
  
  .projects-container {
    flex: 1;
    overflow: hidden;
  }
</style>