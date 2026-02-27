<script lang="ts">
  import { onMount } from 'svelte';
  import PdfEditor from './PdfEditor/PdfEditor.svelte';
  import { pdfEditorState } from '$lib/stores/pdfEditor';
  import { downloadHtmlAsPdf } from '$lib/services/pdfExport';
  import { downloadHtmlAsDocx } from '$lib/services/docxExport';
  import { generatePdfOutline, rewritePdfSection, summarisePdf } from '$lib/services/ai';
  
  let isLoading = false;
  let activeTab: 'editor' | 'preview' | 'outline' = 'editor';
  let showExportMenu = false;
  
  const { currentDocument, htmlContent, metadata } = $pdfEditorState;
  const title = metadata?.title || 'Untitled Document';
  // Use empty array for pages since PdfDocument doesn't have pages property
  const pages: Array<{ text?: string }> = [];
  
  // Handle PDF export
  async function handleExportPdf() {
    if (!htmlContent) return;
    
    try {
      isLoading = true;
      await downloadHtmlAsPdf(htmlContent, `${title || 'document'}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      isLoading = false;
      showExportMenu = false;
    }
  }
  
  // Handle DOCX export
  async function handleExportDocx() {
    if (!htmlContent) return;
    
    try {
      isLoading = true;
      await downloadHtmlAsDocx(htmlContent, `${title || 'document'}.docx`);
    } catch (error) {
      console.error('Failed to export DOCX:', error);
      alert('Failed to export DOCX. Please try again.');
    } finally {
      isLoading = false;
      showExportMenu = false;
    }
  }
  
  // Generate outline using AI
  async function handleGenerateOutline() {
    if (!htmlContent) return;
    
    try {
      isLoading = true;
      const outline = await generatePdfOutline(htmlContent);
      // TODO: Display outline in a dedicated panel
      console.log('Generated outline:', outline);
      alert('Outline generated successfully. Check console for details.');
    } catch (error) {
      console.error('Failed to generate outline:', error);
      alert('Failed to generate outline. Please try again.');
    } finally {
      isLoading = false;
    }
  }
  
  // Summarise PDF using AI
  async function handleSummarisePdf() {
    if (!htmlContent) return;
    
    try {
      isLoading = true;
      const summary = await summarisePdf(htmlContent);
      // TODO: Display summary in a dedicated panel
      console.log('Generated summary:', summary);
      alert('Summary generated successfully. Check console for details.');
    } catch (error) {
      console.error('Failed to summarise PDF:', error);
      alert('Failed to summarise PDF. Please try again.');
    } finally {
      isLoading = false;
    }
  }
  
  // Handle tab switching
  function switchTab(tab: 'editor' | 'preview' | 'outline') {
    activeTab = tab;
  }
</script>

<div class="pdf-shell min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <h1 class="text-2xl font-bold text-gray-800">PDF Editor</h1>
        {#if title}
          <span class="text-gray-600">•</span>
          <span class="text-gray-700 font-medium">{title}</span>
        {/if}
      </div>
      
      <div class="flex items-center space-x-3">
        <!-- AI Actions -->
        <div class="relative">
          <button
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !htmlContent}
            on:click={handleGenerateOutline}
          >
            {isLoading ? 'Processing...' : 'Generate Outline'}
          </button>
        </div>
        
        <!-- Export Menu -->
        <div class="relative">
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !htmlContent}
            on:click={() => showExportMenu = !showExportMenu}
          >
            Export
          </button>
          
          {#if showExportMenu}
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div class="py-1">
                <button
                  class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  on:click={handleExportPdf}
                >
                  Export as PDF
                </button>
                <button
                  class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  on:click={handleExportDocx}
                >
                  Export as DOCX
                </button>
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Summarise Button -->
        <button
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !htmlContent}
          on:click={handleSummarisePdf}
        >
          Summarise
        </button>
      </div>
    </div>
    
    <!-- Tabs -->
    <div class="mt-4 flex space-x-1 border-b border-gray-200">
      <button
        class={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'editor' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
        on:click={() => switchTab('editor')}
      >
        Editor
      </button>
      <button
        class={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'preview' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
        on:click={() => switchTab('preview')}
      >
        Preview
      </button>
      <button
        class={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'outline' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
        on:click={() => switchTab('outline')}
      >
        Outline
      </button>
    </div>
  </header>
  
  <!-- Main Content -->
  <main class="p-6">
    {#if activeTab === 'editor'}
      <!-- Editor View -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
        <PdfEditor />
      </div>
      
    {:else if activeTab === 'preview'}
      <!-- Preview View -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Preview</h2>
        {#if htmlContent}
          <div class="prose max-w-none">
            <div class="border border-gray-300 rounded-lg p-6 bg-gray-50">
              {@html htmlContent}
            </div>
          </div>
        {:else}
          <div class="text-center py-12 text-gray-500">
            <p class="text-lg">No content to preview</p>
            <p class="text-sm mt-2">Upload a PDF or start editing to see preview</p>
          </div>
        {/if}
      </div>
      
    {:else if activeTab === 'outline'}
      <!-- Outline View -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800">Document Outline</h2>
          <button
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            on:click={handleGenerateOutline}
          >
            Regenerate Outline
          </button>
        </div>
        
        {#if pages && pages.length > 0}
          <div class="space-y-4">
            {#each pages as page, i}
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-bold text-gray-800">Page {i + 1}</h3>
                  <span class="text-sm text-gray-500">{page.text?.length || 0} characters</span>
                </div>
                {#if page.text}
                  <p class="text-gray-700 mt-2 line-clamp-3">{page.text.substring(0, 200)}...</p>
                {/if}
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-12 text-gray-500">
            <p class="text-lg">No outline available</p>
            <p class="text-sm mt-2">Generate an outline or upload a PDF to see structure</p>
          </div>
        {/if}
      </div>
    {/if}
  </main>
  
  <!-- Loading Overlay -->
  {#if isLoading}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 flex flex-col items-center">
        <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-700">Processing...</p>
      </div>
    </div>
  {/if}
</div>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .prose {
    color: #374151;
  }
  
  .prose h1 {
    font-size: 2.25em;
    font-weight: bold;
    margin-top: 0;
    margin-bottom: 0.5em;
  }
  
  .prose h2 {
    font-size: 1.875em;
    font-weight: bold;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }
  
  .prose p {
    margin-top: 1em;
    margin-bottom: 1em;
  }
</style>