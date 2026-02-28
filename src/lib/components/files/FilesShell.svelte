<script lang="ts">
  import ContextPills from '$lib/components/layout/ContextPills.svelte';
  import { rightPanelStore } from '$lib/stores/rightPanelStore';
  
  // Sample files data
  const files = [
    { id: '1', name: 'Project Report.pdf', type: 'pdf', size: '2.4 MB', date: '2024-03-15', tags: ['report', 'project'] },
    { id: '2', name: 'Meeting Notes.md', type: 'markdown', size: '45 KB', date: '2024-03-14', tags: ['notes', 'meeting'] },
    { id: '3', name: 'Site Photos.jpg', type: 'image', size: '4.2 MB', date: '2024-03-13', tags: ['photos', 'site'] },
    { id: '4', name: 'Budget Spreadsheet.xlsx', type: 'spreadsheet', size: '1.8 MB', date: '2024-03-12', tags: ['budget', 'finance'] },
    { id: '5', name: 'Research Paper.pdf', type: 'pdf', size: '3.1 MB', date: '2024-03-11', tags: ['research', 'academic'] },
    { id: '6', name: 'Audio Recording.mp3', type: 'audio', size: '15.2 MB', date: '2024-03-10', tags: ['audio', 'meeting'] },
    { id: '7', name: 'Video Presentation.mp4', type: 'video', size: '42.5 MB', date: '2024-03-09', tags: ['video', 'presentation'] },
    { id: '8', name: 'Code Repository.zip', type: 'archive', size: '8.7 MB', date: '2024-03-08', tags: ['code', 'development'] }
  ];
  
  let selectedFile = $state<typeof files[0] | null>(null);
  let viewMode = $state<'grid' | 'list' | 'gallery'>('grid');
  let filterTags = $state<string[]>([]);
  
  // Filter files based on selected tags
  const filteredFiles = $derived(() => {
    if (filterTags.length === 0) return files;
    return files.filter(file =>
      filterTags.some(tag => file.tags.includes(tag))
    );
  });
  
  function handleFileClick(file: typeof files[0]) {
    selectedFile = file;
    rightPanelStore.open({
      title: file.name,
      content: `Preview of ${file.name} (${file.type}, ${file.size})`
    });
  }
  
  function handleTagClick(tag: string) {
    if (filterTags.includes(tag)) {
      filterTags = filterTags.filter(t => t !== tag);
    } else {
      filterTags = [...filterTags, tag];
    }
  }
  
  function clearSelection() {
    selectedFile = null;
    rightPanelStore.close();
  }
</script>

<div class="files-shell">
  <div class="files-layout">
    <!-- Left: File filters and controls -->
    <div class="files-left">
      <div class="files-controls">
        <h3 class="text-lg font-semibold mb-4">Files</h3>
        
        <div class="view-mode-selector mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">View Mode</div>
          <div class="flex gap-2">
            <button
              class:active={viewMode === 'grid'}
              on:click={() => viewMode = 'grid'}
              class="px-3 py-2 rounded-lg text-sm transition-colors"
            >
              Grid
            </button>
            <button
              class:active={viewMode === 'list'}
              on:click={() => viewMode = 'list'}
              class="px-3 py-2 rounded-lg text-sm transition-colors"
            >
              List
            </button>
            <button
              class:active={viewMode === 'gallery'}
              on:click={() => viewMode = 'gallery'}
              class="px-3 py-2 rounded-lg text-sm transition-colors"
            >
              Gallery
            </button>
          </div>
        </div>
        
        <div class="tags-filter mb-6">
          <div class="text-sm font-medium text-gray-700 mb-2">Filter by Tags</div>
          <div class="flex flex-wrap gap-2">
            {#each ['report', 'notes', 'photos', 'budget', 'research', 'audio', 'video', 'code'] as tag}
              <button
                class:active={filterTags.includes(tag)}
                on:click={() => handleTagClick(tag)}
                class="px-3 py-1.5 rounded-full text-sm transition-colors"
              >
                {tag}
              </button>
            {/each}
          </div>
        </div>
        
        <div class="stats">
          <div class="text-sm text-gray-600">
            {files.length} files total
            {#if filterTags.length > 0}
              <span class="ml-2">({filteredFiles().length} filtered)</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Middle: Files content (becomes navigation rail when file is selected) -->
    <div class="files-middle" class:navigation-rail={selectedFile !== null}>
      {#if selectedFile}
        <div class="navigation-rail-header">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Navigation Rail</h3>
            <button
              on:click={clearSelection}
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div class="text-sm text-gray-500 mt-1">
            Showing files in same context
          </div>
        </div>
        <div class="navigation-rail-content">
          <!-- Show sibling files -->
          {#each filteredFiles().filter((f: any) => f.id !== selectedFile?.id).slice(0, 5) as file}
            <div
              class="rail-item p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
              on:click={() => handleFileClick(file)}
            >
              <div class="font-medium text-gray-900">{file.name}</div>
              <div class="text-sm text-gray-500">{file.type} · {file.size}</div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- Normal files view -->
        <div class="files-content">
          <div class="files-header mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Files</h2>
            <p class="text-gray-600 mt-2">Universal content explorer with metadata-rich cards</p>
          </div>
          
          {#if viewMode === 'grid'}
            <div class="files-grid">
              {#each filteredFiles() as file}
                <div
                  class="file-card p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
                  on:click={() => handleFileClick(file)}
                >
                  <div class="file-icon mb-3">
                    {#if file.type === 'pdf'}
                      <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <span class="text-red-600 font-bold">PDF</span>
                      </div>
                    {:else if file.type === 'image'}
                      <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span class="text-blue-600 font-bold">IMG</span>
                      </div>
                    {:else if file.type === 'markdown'}
                      <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span class="text-green-600 font-bold">MD</span>
                      </div>
                    {:else}
                      <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span class="text-gray-600 font-bold">{file.type.slice(0, 3).toUpperCase()}</span>
                      </div>
                    {/if}
                  </div>
                  <div class="file-name font-medium text-gray-900 truncate">{file.name}</div>
                  <div class="file-meta text-sm text-gray-500 mt-1">{file.size} · {file.date}</div>
                  <div class="file-tags flex flex-wrap gap-1 mt-2">
                    {#each file.tags.slice(0, 2) as tag}
                      <span class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {tag}
                      </span>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          {:else if viewMode === 'list'}
            <div class="files-list">
              {#each filteredFiles() as file}
                <div
                  class="file-list-item p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                  on:click={() => handleFileClick(file)}
                >
                  <div class="flex items-center gap-4">
                    <div class="file-icon">
                      {#if file.type === 'pdf'}
                        <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <span class="text-red-600 font-bold text-sm">PDF</span>
                        </div>
                      {:else if file.type === 'image'}
                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span class="text-blue-600 font-bold text-sm">IMG</span>
                        </div>
                      {:else}
                        <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span class="text-gray-600 font-bold text-sm">{file.type.slice(0, 3).toUpperCase()}</span>
                        </div>
                      {/if}
                    </div>
                    <div class="flex-1">
                      <div class="font-medium text-gray-900">{file.name}</div>
                      <div class="text-sm text-gray-500">{file.type} · {file.size} · {file.date}</div>
                    </div>
                    <div class="file-tags">
                      {#each file.tags.slice(0, 3) as tag}
                        <span class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full mr-1">
                          {tag}
                        </span>
                      {/each}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <!-- Gallery view -->
            <div class="files-gallery">
              {#each filteredFiles().filter((f: any) => f.type === 'image') as file}
                <div
                  class="gallery-item aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90"
                  on:click={() => handleFileClick(file)}
                >
                  <div class="w-full h-full flex items-center justify-center">
                    <div class="text-center">
                      <div class="text-2xl mb-2">🖼️</div>
                      <div class="text-sm font-medium text-gray-700">{file.name}</div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
    
    <!-- Right: Context Pills for domain switching -->
    <div class="files-right-pills">
      <ContextPills />
    </div>
  </div>
</div>

<style>
  .files-shell {
    height: 100%;
    width: 100%;
  }
  
  .files-layout {
    display: flex;
    height: 100%;
    gap: 1rem;
    padding: 1rem;
  }
  
  .files-left {
    flex: 0 0 250px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
  }
  
  .files-middle {
    flex: 1;
    min-width: 300px;
    border-right: 1px solid #e5e7eb;
    padding-right: 1rem;
    overflow-y: auto;
    transition: all 0.3s ease;
  }
  
  .files-middle.navigation-rail {
    flex: 0 0 350px;
    min-width: 350px;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    padding: 1rem;
  }
  
  .navigation-rail-header {
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .navigation-rail-content {
    height: calc(100% - 4rem);
    overflow-y: auto;
  }
  
  .rail-item {
    transition: all 0.2s ease;
  }
  
  .rail-item:hover {
    transform: translateX(2px);
  }
  
  .files-right-pills {
    flex: 0 0 300px;
    min-width: 300px;
    overflow-y: auto;
  }
  
  .files-content {
    height: 100%;
  }
  
  .files-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .file-card {
    transition: all 0.2s ease;
  }
  
  .file-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .files-list {
    display: flex;
    flex-direction: column;
  }
  
  .files-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .gallery-item {
    transition: all 0.2s ease;
  }
  
  .gallery-item:hover {
    transform: scale(1.02);
  }
  
  button.active {
    background-color: #3b82f6;
    color: white;
  }
  
  button:not(.active) {
    background-color: #f3f4f6;
    color: #374151;
  }
  
  button.active[class*="tag"] {
    background-color: #3b82f6;
    color: white;
  }
  
  /* Responsive: stack on smaller screens */
  @media (max-width: 1024px) {
    .files-layout {
      flex-direction: column;
    }
    
    .files-left,
    .files-middle,
    .files-right-pills {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
      padding-right: 0;
      padding-bottom: 1rem;
      flex: none;
      width: 100%;
    }
    
    .files-left {
      order: 1;
    }
    
    .files-middle {
      order: 2;
    }
    
    .files-right-pills {
      order: 3;
    }
    
    .files-middle.navigation-rail {
      flex: none;
      width: 100%;
    }
  }
</style>