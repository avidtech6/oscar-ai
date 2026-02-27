<script lang="ts">
  import PdfShell from '$lib/components/PdfShell.svelte';
  import CopilotBar from '$lib/components/CopilotBar/CopilotBar.svelte';
</script>

<div class="flex flex-col h-screen">
  <main class="flex-1 overflow-hidden">
    <PdfShell />
  </main>
  <CopilotBar />
</div>

<style>
  .h-screen {
    height: 100vh;
  }
  .flex-1 {
    flex: 1 1 0%;
  }
  .overflow-hidden {
    overflow: hidden;
  }
</style>