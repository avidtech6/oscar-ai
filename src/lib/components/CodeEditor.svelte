<script lang="ts">
  import EditorToolbar from './EditorToolbar.svelte'
  import EditorContent from './EditorContent.svelte'
  import EditorFooter from './EditorFooter.svelte'
  
  export let value = ''
  export let language = 'javascript'
  export let placeholder = '// Write your code here...'
  export let label = ''
  export let disabled = false
  export let showLineNumbers = true
  
  let isFocused = false
  
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
  ]
  
  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement
    value = target.value
  }
  
  function insertSnippet(snippet: string) {
    const textarea = document.querySelector('.code-textarea') as HTMLTextAreaElement
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    const before = value.substring(0, start)
    const after = value.substring(end)
    value = before + snippet + after
    
    textarea.focus()
    setTimeout(() => {
      textarea.selectionStart = start + snippet.length
      textarea.selectionEnd = start + snippet.length
    }, 0)
  }
  
  function formatCode() {
    // Simple formatting based on language
    if (language === 'json') {
      try {
        const parsed = JSON.parse(value)
        value = JSON.stringify(parsed, null, 2)
      } catch {
        // Invalid JSON, do nothing
      }
    }
  }
  
  function getLanguageIcon(lang: string): string {
    const icons: Record<string, string> = {
      javascript: '🟨',
      typescript: '🔷',
      python: '🐍',
      html: '🌐',
      css: '🎨',
      json: '📋',
      markdown: '📝',
      sql: '🗄️',
      bash: '💻',
    }
    return icons[lang] || '📄'
  }
  
  function toggleLineNumbers() {
    showLineNumbers = !showLineNumbers
  }
  
  function handleFocus() {
    isFocused = true
  }
  
  function handleBlur() {
    isFocused = false
  }
</script>

<div class="code-editor" class:focused={isFocused} class:disabled={disabled}>
  {#if label}
    <label class="editor-label">{label}</label>
  {/if}
  
  <EditorToolbar
    bind:language
    {languages}
    {showLineNumbers}
    {getLanguageIcon}
    {insertSnippet}
    {formatCode}
    {toggleLineNumbers}
  />
  
  <EditorContent
    bind:value
    {placeholder}
    {disabled}
    {showLineNumbers}
    {language}
    {handleInput}
    onFocus={handleFocus}
    onBlur={handleBlur}
  />
  
  <EditorFooter
    {value}
    {language}
    {getLanguageIcon}
  />
</div>

<style>
  .code-editor {
    background: #1e1e1e;
    border: 1px solid #374151;
    border-radius: 8px;
    overflow: hidden;
    transition: border-color 0.2s ease;
  }
  
  .code-editor.focused {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .code-editor.disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .editor-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #d1d5db;
    padding: 0.75rem 1rem 0.5rem;
    border-bottom: 1px solid #374151;
    background: #2d2d2d;
  }
</style>