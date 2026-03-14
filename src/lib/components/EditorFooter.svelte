<script lang="ts">
  export let value: string = ''
  export let language: string = 'javascript'
  export let getLanguageIcon: (lang: string) => string = () => '📄'
</script>

<div class="editor-footer">
  <div class="language-info">
    <span class="language-icon">{getLanguageIcon(language)}</span>
    <span class="language-name">{language.toUpperCase()}</span>
  </div>
  
  <div class="character-count">
    {#if value}
      {value.length} characters, {value.split('\n').length} lines
    {:else}
      0 characters, 0 lines
    {/if}
  </div>
  
  <div class="editor-hint">
    Use Ctrl+Space for autocomplete, Ctrl+S to save
  </div>
</div>

<style>
  .editor-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-top: 1px solid #374151;
    background: #2d2d2d;
    font-size: 0.75rem;
    color: #9ca3af;
  }
  
  .language-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .language-icon {
    font-size: 1rem;
  }
  
  .language-name {
    font-weight: 500;
    color: #d1d5db;
  }
  
  .character-count {
    font-weight: 500;
  }
  
  .editor-hint {
    font-style: italic;
  }
</style>