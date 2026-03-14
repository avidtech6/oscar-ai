<script lang="ts">
  export let value: string = ''
  export let placeholder: string = '// Write your code here...'
  export let disabled: boolean = false
  export let showLineNumbers: boolean = true
  export let language: string = 'javascript'
  export let handleInput: (e: Event) => void = () => {}
  export let onFocus: () => void = () => {}
  export let onBlur: () => void = () => {}
</script>

<div class="editor-content">
  {#if showLineNumbers}
    <div class="line-numbers">
      {#each Array.from({ length: value.split('\n').length }) as _, i}
        <div class="line-number">{i + 1}</div>
      {/each}
    </div>
  {/if}
  
  <textarea 
    class="code-textarea"
    bind:value
    on:input={handleInput}
    on:focus={onFocus}
    on:blur={onBlur}
    {placeholder}
    {disabled}
    spellcheck="false"
    data-language={language}
  />
</div>

<style>
  .editor-content {
    display: flex;
    min-height: 200px;
    position: relative;
  }
  
  .line-numbers {
    background: #2d2d2d;
    color: #6b7280;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.75rem;
    line-height: 1.5;
    padding: 1rem 0.5rem;
    text-align: right;
    user-select: none;
    border-right: 1px solid #374151;
    min-width: 40px;
  }
  
  .line-number {
    padding: 0 0.25rem;
  }
  
  .code-textarea {
    flex: 1;
    min-height: 200px;
    padding: 1rem;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #d1d5db;
    background: transparent;
    border: none;
    outline: none;
    resize: vertical;
    tab-size: 2;
    white-space: pre;
    overflow-wrap: normal;
    overflow-x: auto;
  }
  
  .code-textarea:focus {
    outline: none;
  }
  
  .code-textarea::placeholder {
    color: #6b7280;
  }
</style>