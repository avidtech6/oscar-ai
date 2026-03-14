<script lang="ts">
  import { MediaIngestionPipeline } from './MediaIngestionPipeline';
  import { VoiceNotePipeline } from './VoiceNotePipeline';
  import { mediaEventBus } from './MediaEventBus';
  import type { MediaContext } from './MediaTypes';

  const { context = {
    page: 'prompt',
    itemId: undefined,
    timestamp: Date.now(),
    tags: ['prompt-box'],
  } } = $props<{
    context?: MediaContext;
  }>();

  let isRecording = $state(false);
  let isCameraActive = $state(false);
  let selectedFile = $state<File | null>(null);

  async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    selectedFile = file;
    try {
      await MediaIngestionPipeline.ingestFile(file, context);
      // Reset input
      input.value = '';
    } catch (err) {
      console.error('File ingestion failed:', err);
    }
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      isCameraActive = true;
      // In a real implementation, we'd show a preview and capture button
      // For simplicity, we'll capture a frame after 1 second
      setTimeout(async () => {
        try {
          await MediaIngestionPipeline.ingestCameraStream(stream, {
            ...context,
            tags: [...context.tags, 'camera'],
          });
        } catch (err) {
          console.error('Camera capture failed:', err);
        } finally {
          stream.getTracks().forEach(track => track.stop());
          isCameraActive = false;
        }
      }, 1000);
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  }

  function toggleVoiceNote() {
    if (isRecording) {
      VoiceNotePipeline.stopRecording();
      isRecording = false;
    } else {
      VoiceNotePipeline.startRecording(context).then(success => {
        isRecording = success;
      }).catch(err => {
        console.error('Voice recording failed:', err);
        isRecording = false;
      });
    }
  }

  function triggerFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,audio/*,video/*';
    input.onchange = handleFileUpload;
    input.click();
  }

  function pasteFromClipboard() {
    navigator.clipboard.read().then(items => {
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            item.getType(type).then(blob => {
              MediaIngestionPipeline.ingest(blob, context);
            });
            break;
          }
        }
      }
    }).catch(err => console.error('Clipboard read failed:', err));
  }
</script>

<div class="media-controls">
  <div class="controls-row">
    <button
      class="control-button {isCameraActive ? 'active' : ''}"
      on:click={startCamera}
      title="Take a photo"
      disabled={isCameraActive}
    >
      {#if isCameraActive}
        <span class="icon">📸</span> Capturing...
      {:else}
        <span class="icon">📷</span> Camera
      {/if}
    </button>

    <button
      class="control-button {isRecording ? 'active' : ''}"
      on:click={toggleVoiceNote}
      title="Record a voice note"
    >
      {#if isRecording}
        <span class="icon">🔴</span> Recording...
      {:else}
        <span class="icon">🎤</span> Voice Note
      {/if}
    </button>

    <button
      class="control-button"
      on:click={triggerFileInput}
      title="Upload a file"
    >
      <span class="icon">📎</span> Upload
    </button>

    <button
      class="control-button"
      on:click={pasteFromClipboard}
      title="Paste image from clipboard"
    >
      <span class="icon">📋</span> Paste
    </button>
  </div>

  {#if selectedFile}
    <div class="file-info">
      <span class="file-name">{selectedFile.name}</span>
      <span class="file-size">({Math.round(selectedFile.size / 1024)} KB)</span>
    </div>
  {/if}

  <div class="hints">
    <span class="hint">Tip: Drag & drop images, paste screenshots, or use camera.</span>
  </div>
</div>

<style>
  .media-controls {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.75rem;
    margin-top: 0.5rem;
  }

  .controls-row {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .control-button {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    justify-content: center;
    min-width: 100px;
  }

  .control-button:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  .control-button.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .control-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .icon {
    font-size: 1rem;
  }

  .file-info {
    margin-top: 0.75rem;
    padding: 0.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-size: 0.75rem;
    color: #6b7280;
    display: flex;
    justify-content: space-between;
  }

  .hints {
    margin-top: 0.75rem;
    font-size: 0.75rem;
    color: #6b7280;
    text-align: center;
    font-style: italic;
  }
</style>