<script lang="ts">
  import { pdfEditorState, setHtmlContent, setSelectedSection } from '$lib/stores/pdfEditor';
  import { generatePdfOutline, rewritePdfSection, summarisePdf } from '$lib/services/ai';
  
  let isGeneratingOutline = false;
  let isRewriting = false;
  let isSummarising = false;
  let selectedText = '';
  
  // Handle text selection
  function handleTextSelection() {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      selectedText = selection.toString();
    } else {
      selectedText = '';
    }
  }
  
  // Generate outline using AI
  async function handleGenerateOutline() {
    const { htmlContent } = $pdfEditorState;
    if (!htmlContent) return;
    
    isGeneratingOutline = true;
    try {
      const outline = await generatePdfOutline(htmlContent);
      // Update outline in store (simplified)
      console.log('Generated outline:', outline);
      alert('Outline generated successfully!');
    } catch (error) {
      console.error('Failed to generate outline:', error);
      alert('Failed to generate outline. Please try again.');
    } finally {
      isGeneratingOutline = false;
    }
  }
  
  // Rewrite selected section
  async function handleRewriteSection() {
    if (!selectedText) {
      alert('Please select some text to rewrite.');
      return;
    }
    
    const { htmlContent } = $pdfEditorState;
    isRewriting = true;
    
    try {
      const rewritten = await rewritePdfSection(selectedText, htmlContent);
      
      // Replace selected text in HTML (simplified)
      const newHtml = htmlContent.replace(selectedText, rewritten);
      setHtmlContent(newHtml);
      
      alert('Section rewritten successfully!');
    } catch (error) {
      console.error('Failed to rewrite section:', error);
      alert('Failed to rewrite section. Please try again.');
    } finally {
      isRewriting = false;
    }
  }
  
  // Summarise entire document
  async function handleSummariseDocument() {
    const { htmlContent } = $pdfEditorState;
    if (!htmlContent) return;
    
    isSummarising = true;
    try {
      const summary = await summarisePdf(htmlContent);
      
      // Add summary as a new section at the end
      const summaryHtml = `<div class="ai-summary">
        <h2>AI Summary</h2>
        <p>${summary}</p>
      </div>`;
      
      const newHtml = htmlContent + summaryHtml;
      setHtmlContent(newHtml);
      
      alert('Document summarised successfully!');
    } catch (error) {
      console.error('Failed to summarise document:', error);
      alert('Failed to summarise document. Please try again.');
    } finally {
      isSummarising = false;
    }
  }
  
  // Handle inline editing
  function handleContentChange(event: Event) {
    const target = event.target as HTMLElement;
    if (target.isContentEditable) {
      setHtmlContent(target.innerHTML);
    }
  }
</script>

<div class="pdf-editor-container">
  <!-- Toolbar -->
  <div class="toolbar">
    <div class="toolbar-group">
      <button
        on:click={handleGenerateOutline}
        disabled={isGeneratingOutline || !$pdfEditorState.htmlContent}
        class="toolbar-button"
        title="Generate AI Outline"
      >
        {isGeneratingOutline ? 'Generating...' : 'Generate Outline'}
      </button>
      
      <button
        on:click={handleRewriteSection}
        disabled={isRewriting || !selectedText}
        class="toolbar-button"
        title="Rewrite Selected Text"
      >
        {isRewriting ? 'Rewriting...' : 'Rewrite Selected'}
      </button>
      
      <button
        on:click={handleSummariseDocument}
        disabled={isSummarising || !$pdfEditorState.htmlContent}
        class="toolbar-button"
        title="Summarise Document"
      >
        {isSummarising ? 'Summarising...' : 'Summarise Document'}
      </button>
    </div>
    
    <div class="toolbar-info">
      {#if selectedText}
        <span class="selection-info">Selected: {selectedText.substring(0, 50)}...</span>
      {:else}
        <span class="hint">Select text to rewrite</span>
      {/if}
    </div>
  </div>
  
  <!-- Editable Content -->
  <div class="editor-content">
    {#if $pdfEditorState.htmlContent}
      <div
        class="editable-html"
        contenteditable={$pdfEditorState.isEditing}
        on:input={handleContentChange}
        on:mouseup={handleTextSelection}
      >
        {@html $pdfEditorState.htmlContent}
      </div>
    {:else}
      <div class="empty-state">
        <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
        <h3>No PDF content loaded</h3>
        <p>Upload a PDF file to start editing</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .pdf-editor-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    margin-bottom: 20px;
  }
  
  .toolbar-group {
    display: flex;
    gap: 8px;
  }
  
  .toolbar-button {
    padding: 8px 16px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .toolbar-button:hover:not(:disabled) {
    background: #2563eb;
  }
  
  .toolbar-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
  
  .toolbar-info {
    font-size: 14px;
    color: #6b7280;
  }
  
  .selection-info {
    background: #e0f2fe;
    padding: 4px 8px;
    border-radius: 4px;
    color: #0369a1;
  }
  
  .hint {
    font-style: italic;
  }
  
  .editor-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px;
  }
  
  .editable-html {
    min-height: 500px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .editable-html:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #6b7280;
    text-align: center;
  }
  
  .empty-icon {
    width: 64px;
    height: 64px;
    color: #d1d5db;
    margin-bottom: 16px;
  }
  
  .empty-state h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #374151;
  }
  
  .empty-state p {
    font-size: 14px;
  }
  
  .ai-summary {
    margin-top: 40px;
    padding: 20px;
    background: #f0f9ff;
    border-left: 4px solid #3b82f6;
    border-radius: 4px;
  }
  
  .ai-summary h2 {
    color: #1e40af;
    margin-top: 0;
  }
</style>