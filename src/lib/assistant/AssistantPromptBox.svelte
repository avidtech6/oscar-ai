<script lang="ts">
  export let userInput: string;
  export let isProcessing: boolean;
  export let handleSubmit: () => void;
  export let handleKeyPress: (e: KeyboardEvent) => void;
</script>

<div class="prompt-box">
  <textarea
    bind:value={userInput}
    on:keydown={handleKeyPress}
    placeholder="Ask Oscar AI anything..."
    rows="2"
    disabled={isProcessing}
  ></textarea>
  <button on:click={handleSubmit} disabled={isProcessing || !userInput.trim()}>
    {isProcessing ? 'Thinking...' : 'Send'}
  </button>
</div>

<style>
  .prompt-box {
    padding: 20px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 12px;
  }
  .prompt-box textarea {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px;
    font-family: inherit;
    font-size: 15px;
    resize: none;
  }
  .prompt-box button {
    background: #1a73e8;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0 20px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  .prompt-box button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  .prompt-box button:hover:not(:disabled) {
    background: #0d62d9;
  }
</style>