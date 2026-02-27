<script lang="ts">
  import { addCaptureCard } from '$lib/stores/capture';
  import { copilotState } from '$lib/stores/copilot';
  import { transcribeAudio } from '$lib/services/ai';

  let title = '';
  let summary = '';
  let tags = '';
  let isSubmitting = false;
  let isTranscribing = false;
  let audioFile: File | null = null;

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    
    const file = target.files[0];
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file');
      return;
    }
    
    audioFile = file;
    isTranscribing = true;
    
    try {
      const transcription = await transcribeAudio(file);
      summary = transcription;
    } catch (error) {
      console.error('Transcription failed:', error);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      isTranscribing = false;
      // Reset file input
      target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !summary.trim()) {
      return;
    }

    isSubmitting = true;

    // Add the capture card
    addCaptureCard({
      title: title.trim(),
      summary: summary.trim(),
      tags: tags.trim() ? tags.trim().split(',').map(t => t.trim()) : []
    });

    // Simulate AI processing
    copilotState.update(state => ({
      ...state,
      isThinking: true,
      lastUserInput: `Captured: ${title.trim()}`
    }));

    // Reset form
    title = '';
    summary = '';
    tags = '';
    isSubmitting = false;

    // Simulate AI response after a delay
    setTimeout(() => {
      copilotState.update(state => ({
        ...state,
        isThinking: false,
        response: `I've captured "${title}" and added it to your workspace. Would you like me to expand on this idea or connect it with related cards?`
      }));
    }, 800);
  };
</script>

<div class="space-y-6">
  <div>
    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
      Title
    </label>
    <input
      id="title"
      type="text"
      bind:value={title}
      placeholder="What are you capturing?"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  <div>
    <label for="summary" class="block text-sm font-medium text-gray-700 mb-1">
      Details
    </label>
    <textarea
      id="summary"
      bind:value={summary}
      rows={4}
      placeholder="Add more context, notes, or references..."
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  <div>
    <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">
      Tags (comma-separated)
    </label>
    <input
      id="tags"
      type="text"
      bind:value={tags}
      placeholder="mobile, ui, feature-request"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Audio Transcription (Optional)
    </label>
    <div class="flex items-center gap-2">
      <input
        type="file"
        accept="audio/*"
        on:change={handleFileSelect}
        disabled={isTranscribing}
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
      />
      {#if isTranscribing}
        <div class="text-sm text-blue-600">
          Transcribing...
        </div>
      {/if}
    </div>
    <p class="text-xs text-gray-500 mt-1">
      Upload an audio file to automatically transcribe it into the details field.
    </p>
  </div>

  <div class="pt-4">
    <button
      on:click={handleSubmit}
      disabled={!title.trim() || !summary.trim() || isSubmitting}
      class="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isSubmitting ? 'Capturing...' : 'Capture'}
    </button>
    <p class="text-sm text-gray-500 mt-2 text-center">
      This will create a new card in your workspace and notify Copilot.
    </p>
  </div>

  <div class="border-t border-gray-200 pt-6">
    <h3 class="text-sm font-medium text-gray-900 mb-2">Quick capture tips</h3>
    <ul class="text-sm text-gray-600 space-y-1">
      <li>• Keep titles concise and descriptive</li>
      <li>• Use tags to organize related captures</li>
      <li>• Everything you capture becomes searchable</li>
      <li>• Copilot can help expand on your ideas</li>
    </ul>
  </div>
</div>