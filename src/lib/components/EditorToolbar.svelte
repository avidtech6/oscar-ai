<script lang="ts">
  export let language: string = 'javascript'
  export let languages: Array<{ value: string, label: string }> = []
  export let showLineNumbers: boolean = true
  export let getLanguageIcon: (lang: string) => string = () => '📄'
  export let insertSnippet: (snippet: string) => void = () => {}
  export let formatCode: () => void = () => {}
  export let toggleLineNumbers: () => void = () => {}
</script>

<div class="editor-toolbar">
  <div class="toolbar-group">
    <select bind:value={language} class="language-select">
      {#each languages as lang}
        <option value={lang.value}>
          {getLanguageIcon(lang.value)} {lang.label}
        </option>
      {/each}
    </select>
  </div>
  
  <div class="toolbar-group">
    <button type="button" class="toolbar-button" on:click={() => insertSnippet('function example() {\n  // TODO: implement\n}')} title="Insert Function">
      ƒ()
    </button>
    <button type="button" class="toolbar-button" on:click={() => insertSnippet('if (condition) {\n  // code\n}')} title="Insert If Statement">
      if
    </button>
    <button type="button" class="toolbar-button" on:click={() => insertSnippet('for (let i = 0; i < length; i++) {\n  // code\n}')} title="Insert For Loop">
      for
    </button>
  </div>
  
  <div class="toolbar-group">
    <button type="button" class="toolbar-button" on:click={() => insertSnippet('// TODO: ')} title="Insert TODO">
      ✅ TODO
    </button>
    <button type="button" class="toolbar-button" on:click={() => insertSnippet('// FIXME: ')} title="Insert FIXME">
      🔧 FIXME
    </button>
    <button type="button" class="toolbar-button" on:click={() => insertSnippet('console.log();')} title="Insert Console Log">
      log()
    </button>
  </div>
  
  <div class="toolbar-group">
    <button 
      type="button" 
      class="toolbar-button {showLineNumbers ? 'active' : ''}" 
      on:click={toggleLineNumbers}
      title="Toggle Line Numbers"
    >
      {showLineNumbers ? '1️⃣ Hide' : '1️⃣ Show'}
    </button>
    <button type="button" class="toolbar-button" on:click={formatCode} title="Format Code">
      ✨ Format
    </button>
  </div>
</div>

<style>
  .editor-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border);
    background: var(--background);
    border-radius: 0 0 8px 8px;
  }
  
  .toolbar-group {
    display: flex;
    gap: 0.25rem;
    padding-right: 0.75rem;
    border-right: 1px solid var(--border);
  }
  
  .toolbar-group:last-child {
    border-right: none;
  }
  
  .toolbar-button {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
    color: var(--text);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
  
  .toolbar-button:hover {
    background: var(--background-hover);
    border-color: var(--primary);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);
  }
  
  .toolbar-button.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
  }
  
  .toolbar-button:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(79, 70, 229, 0.2);
  }
  
  .language-select {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
    color: var(--text);
    cursor: pointer;
    min-width: 140px;
    font-family: inherit;
    transition: all 0.2s ease;
  }
  
  .language-select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  }
  
  @media (max-width: 768px) {
    .editor-toolbar {
      padding: 0.5rem;
      gap: 0.25rem;
    }
    
    .toolbar-group {
      padding-right: 0.5rem;
    }
    
    .toolbar-button {
      padding: 0.25rem 0.375rem;
      font-size: 0.625rem;
    }
    
    .language-select {
      min-width: 100px;
      font-size: 0.625rem;
    }
  }
</style>