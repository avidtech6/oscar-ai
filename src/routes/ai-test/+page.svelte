<script lang="ts">
  import { generateLLMResponse } from '$lib/services/ai';
  
  let prompt = 'Hello, who are you?';
  let response = '';
  let isLoading = false;
  let error = '';
  
  async function handleSubmit() {
    if (!prompt.trim()) return;
    
    isLoading = true;
    error = '';
    response = '';
    
    try {
      const result = await generateLLMResponse(prompt, { test: true });
      response = result;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error('AI test error:', err);
    } finally {
      isLoading = false;
    }
  }
</script>

<div>
  <h1>AI Test Page</h1>
  <p>Test the Groq LLM integration.</p>
  
  <div style="margin: 2rem 0;">
    <textarea
      bind:value={prompt}
      rows={4}
      style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;"
      placeholder="Enter your prompt..."
    ></textarea>
  </div>
  
  <button
    on:click={handleSubmit}
    disabled={isLoading || !prompt.trim()}
    style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;"
  >
    {isLoading ? 'Testing...' : 'Test AI'}
  </button>
  
  {#if error}
    <div style="margin-top: 1rem; padding: 1rem; background: #fee; border: 1px solid #f00; border-radius: 4px;">
      <strong>Error:</strong> {error}
    </div>
  {/if}
  
  {#if response}
    <div style="margin-top: 2rem;">
      <h3>Response:</h3>
      <div style="padding: 1rem; background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; white-space: pre-wrap;">
        {response}
      </div>
    </div>
  {/if}
</div>