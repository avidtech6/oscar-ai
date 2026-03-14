<script lang="ts">
  import { onMount } from 'svelte'
  import { getIntelligenceEngine } from '$lib/intelligence/engine'
  import { getReasoningStats, processReasoningQuery } from '$lib/intelligence/reasoning'
  import IntrospectionHeader from './IntrospectionHeader.svelte'
  import IntrospectionTabs from './IntrospectionTabs.svelte'
  import IntrospectionOverview from './IntrospectionOverview.svelte'
  import IntrospectionQuery from './IntrospectionQuery.svelte'
  import IntrospectionStats from './IntrospectionStats.svelte'
  import IntrospectionDebug from './IntrospectionDebug.svelte'
  
  export let title = 'Intelligence Introspection'
  export let expanded = false
  
  let engine: any = null
  let stats: any = null
  let query = ''
  let queryResults: any = null
  let isLoading = false
  let activeTab: 'overview' | 'query' | 'stats' | 'debug' = 'overview'
  
  onMount(async () => {
    try {
      engine = await getIntelligenceEngine()
      stats = await getReasoningStats()
    } catch (error) {
      console.error('Failed to load introspection data:', error)
    }
  })
  
  async function handleQuery() {
    if (!query.trim()) return
    
    isLoading = true
    try {
      queryResults = await processReasoningQuery(query)
    } catch (error) {
      console.error('Query failed:', error)
      queryResults = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      isLoading = false
    }
  }
  
  function formatDate(date: Date) {
    return date.toLocaleString()
  }
  
  function toggleExpanded() {
    expanded = !expanded
  }
  
  function setActiveTab(tab: 'overview' | 'query' | 'stats' | 'debug') {
    activeTab = tab
  }
</script>

<div class="introspection-panel">
  <IntrospectionHeader {title} {expanded} toggleExpanded={toggleExpanded} />
  
  {#if expanded}
    <div class="panel-content">
      <IntrospectionTabs {activeTab} {setActiveTab} />
      
      <div class="tab-content">
        {#if activeTab === 'overview'}
          <IntrospectionOverview {engine} />
        {:else if activeTab === 'query'}
          <IntrospectionQuery
            bind:query
            {queryResults}
            {isLoading}
            {handleQuery}
            {formatDate}
          />
        {:else if activeTab === 'stats'}
          <IntrospectionStats {stats} {formatDate} />
        {:else if activeTab === 'debug'}
          <IntrospectionDebug {engine} />
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .introspection-panel {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    margin: 1rem 0;
  }
  
  .panel-content {
    padding: 1rem;
  }
  
  .tab-content {
    margin-top: 1rem;
  }
  
  .tab-content h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }
  
  .tab-content h5 {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }
</style>