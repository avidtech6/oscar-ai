/**
 * DiagramGenerator.svelte
 * 
 * A component for generating diagrams using Gemini AI.
 * Generates direct SVG files that can be embedded in reports.
 * 
 * Features:
 * - Text-to-diagram conversion using Gemini 1.5 Flash
 * - SVG output for scalable, high-quality diagrams
 * - Automatic upload to Google Drive project folder
 * - Updates components.json manifest
 * - Preview before insertion
 */

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  
  export let projectId: string = '';
  export let projectName: string = '';
  export let activeProject: any = null;
  
  const dispatch = createEventDispatcher();
  
  let diagramType: string = 'flowchart';
  let diagramDescription: string = '';
  let isGenerating: boolean = false;
  let generatedSvg: string = '';
  let error: string = '';
  let diagramTitle: string = '';
  
  // Diagram type options
  const diagramTypes = [
    { value: 'flowchart', label: 'Flowchart', icon: '⬡' },
    { value: 'process', label: 'Process Diagram', icon: '◐' },
    { value: 'hierarchy', label: 'Hierarchy Chart', icon: '⊟' },
    { value: 'network', label: 'Network Diagram', icon: '⬢' },
    { value: 'timeline', label: 'Timeline', icon: '━' },
    { value: 'comparison', label: 'Comparison Chart', icon: '⇄' },
    { value: 'cycle', label: 'Cycle Diagram', icon: '↻' },
    { value: 'custom', label: 'Custom Diagram', icon: '▢' }
  ];
  
  /**
   * Generate diagram using Gemini API
   */
  async function generateDiagram() {
    if (!diagramDescription.trim()) {
      error = 'Please describe the diagram you want to create.';
      return;
    }
    
    if (!projectId || !projectName) {
      error = 'No active project. Please create or select a project first.';
      return;
    }
    
    isGenerating = true;
    error = '';
    generatedSvg = '';
    
    try {
      // Call the API to generate the diagram
      const response = await fetch('/api/project/diagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          projectName,
          diagramType,
          diagramDescription,
          diagramTitle: diagramTitle || 'Diagram'
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate diagram');
      }
      
      const data = await response.json();
      
      if (data.svg) {
        generatedSvg = data.svg;
        
        // Dispatch success event
        dispatch('diagramGenerated', {
          svg: data.svg,
          componentId: data.componentId,
          fileName: data.fileName,
          path: data.path
        });
      } else {
        throw new Error('No SVG returned from generation');
      }
    } catch (err: any) {
      console.error('Diagram generation error:', err);
      error = err.message || 'An error occurred while generating the diagram';
    } finally {
      isGenerating = false;
    }
  }
  
  /**
   * Insert the generated diagram into the document
   */
  function insertDiagram() {
    if (!generatedSvg) return;
    
    dispatch('insert', {
      svg: generatedSvg,
      diagramType,
      title: diagramTitle || 'Diagram'
    });
    
    // Reset form
    resetForm();
  }
  
  /**
   * Reset the form
   */
  function resetForm() {
    diagramType = 'flowchart';
    diagramDescription = '';
    diagramTitle = '';
    generatedSvg = '';
    error = '';
  }
  
  /**
   * Cancel and close
   */
  function cancel() {
    dispatch('cancel');
    resetForm();
  }
  
  /**
   * Get the diagram type icon
   */
  function getTypeIcon(type: string): string {
    const found = diagramTypes.find(t => t.value === type);
    return found ? found.icon : '▢';
  }
</script>

<div class="diagram-generator">
  <div class="generator-header">
    <h3>
      <span class="icon">◇</span>
      Generate Diagram
    </h3>
    <button class="close-btn" on:click={cancel} aria-label="Close">
      ✕
    </button>
  </div>
  
  <div class="generator-content">
    {#if !generatedSvg}
      <!-- Input Form -->
      <div class="form-section">
        <div class="form-group">
          <label for="diagram-type">Diagram Type</label>
          <div class="type-selector">
            {#each diagramTypes as type}
              <button
                class="type-btn"
                class:active={diagramType === type.value}
                on:click={() => diagramType = type.value}
                title={type.label}
              >
                <span class="type-icon">{type.icon}</span>
                <span class="type-label">{type.label}</span>
              </button>
            {/each}
          </div>
        </div>
        
        <div class="form-group">
          <label for="diagram-title">Title (Optional)</label>
          <input
            id="diagram-title"
            type="text"
            bind:value={diagramTitle}
            placeholder="Enter a title for your diagram"
            class="input-field"
          />
        </div>
        
        <div class="form-group">
          <label for="diagram-description">
            Describe the Diagram
            <span class="required">*</span>
          </label>
          <textarea
            id="diagram-description"
            bind:value={diagramDescription}
            placeholder="Describe what you want the diagram to show. For example: 'A flowchart showing the decision process for a tree survey, with boxes for each step and arrows indicating the flow'"
            class="textarea-field"
            rows="6"
          ></textarea>
          <p class="help-text">
            Be as specific as possible about the structure, elements, and relationships you want to show.
          </p>
        </div>
        
        {#if error}
          <div class="error-message">
            <span class="error-icon">⚠</span>
            {error}
          </div>
        {/if}
        
        <div class="form-actions">
          <button 
            class="btn btn-secondary" 
            on:click={cancel}
          >
            Cancel
          </button>
          <button 
            class="btn btn-primary"
            on:click={generateDiagram}
            disabled={isGenerating || !diagramDescription.trim()}
          >
            {#if isGenerating}
              <span class="spinner"></span>
              Generating...
            {:else}
              <span class="btn-icon">✦</span>
              Generate Diagram
            {/if}
          </button>
        </div>
      </div>
    {:else}
      <!-- Preview -->
      <div class="preview-section">
        <h4>Diagram Preview</h4>
        
        <div class="svg-preview">
          {@html generatedSvg}
        </div>
        
        <div class="preview-info">
          <div class="info-row">
            <span class="info-label">Type:</span>
            <span class="info-value">{diagramTypes.find(t => t.value === diagramType)?.label || diagramType}</span>
          </div>
          {#if diagramTitle}
            <div class="info-row">
              <span class="info-label">Title:</span>
              <span class="info-value">{diagramTitle}</span>
            </div>
          {/if}
        </div>
        
        <div class="preview-actions">
          <button 
            class="btn btn-secondary" 
            on:click={() => generatedSvg = ''}
          >
            ← Modify
          </button>
          <button 
            class="btn btn-primary"
            on:click={insertDiagram}
          >
            <span class="btn-icon">+</span>
            Insert into Report
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .diagram-generator {
    background: var(--bg-primary, #ffffff);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .generator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .generator-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .generator-header .icon {
    font-size: 22px;
  }
  
  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  .generator-content {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }
  
  .form-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .form-group label {
    font-weight: 600;
    font-size: 14px;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .required {
    color: #ef4444;
  }
  
  .type-selector {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .type-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
    color: #374151;
  }
  
  .type-btn:hover {
    border-color: #667eea;
    background: #f5f3ff;
  }
  
  .type-btn.active {
    border-color: #667eea;
    background: #ede9fe;
    color: #5b21b6;
  }
  
  .type-icon {
    font-size: 18px;
    width: 24px;
    text-align: center;
  }
  
  .type-label {
    flex: 1;
    text-align: left;
  }
  
  .input-field,
  .textarea-field {
    padding: 10px 14px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;
    font-family: inherit;
  }
  
  .input-field:focus,
  .textarea-field:focus {
    outline: none;
    border-color: #667eea;
  }
  
  .textarea-field {
    resize: vertical;
    min-height: 120px;
  }
  
  .help-text {
    margin: 0;
    font-size: 12px;
    color: #6b7280;
  }
  
  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 14px;
  }
  
  .error-icon {
    font-size: 16px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .btn-secondary {
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
  }
  
  .btn-secondary:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  
  .btn-icon {
    font-size: 16px;
  }
  
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .preview-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .preview-section h4 {
    margin: 0;
    font-size: 16px;
    color: #374151;
  }
  
  .svg-preview {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    max-height: 400px;
    overflow: auto;
  }
  
  .svg-preview :global(svg) {
    max-width: 100%;
    height: auto;
  }
  
  .preview-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
  }
  
  .info-row {
    display: flex;
    gap: 8px;
    font-size: 13px;
  }
  
  .info-label {
    font-weight: 600;
    color: #6b7280;
  }
  
  .info-value {
    color: #374151;
  }
  
  .preview-actions {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
  }
  
  .preview-actions .btn {
    flex: 1;
  }
</style>
