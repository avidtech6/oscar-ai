<script lang="ts">
  import type { Card } from '$lib/models/Card';

  export let card: Card;
  export let onRemove: () => void;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
</script>

<div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
  <div class="flex justify-between items-start">
    <div class="flex-1">
      <h3 class="font-medium text-gray-900">{card.title}</h3>
      <p class="text-gray-600 text-sm mt-1">{card.summary}</p>
      
      <div class="flex items-center gap-2 mt-3">
        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {card.type}
        </span>
        {#each card.tags as tag}
          <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {tag}
          </span>
        {/each}
        <span class="text-xs text-gray-500 ml-auto">
          {formatDate(card.createdAt)}
        </span>
      </div>
    </div>
    
    <button
      on:click={onRemove}
      class="ml-4 text-gray-400 hover:text-red-500 transition-colors"
      title="Remove capture"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</div>