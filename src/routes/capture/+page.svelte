<script lang="ts">
  import CaptureShell from '$lib/components/capture/CaptureShell.svelte';
  import CopilotBar from '$lib/components/CopilotBar/CopilotBar.svelte';
</script>

<div class="flex flex-col h-screen">
  <main class="flex-1 overflow-hidden">
    <CaptureShell />
  </main>
  <CopilotBar />
</div>
