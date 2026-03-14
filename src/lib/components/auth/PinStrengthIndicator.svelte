<script lang="ts">
  export let pin: string = ''
  export let strength: number = 0
  export let strengthCategory: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
  
  function getStrengthColor(): string {
    switch (strengthCategory) {
      case 'weak': return 'bg-red-500'
      case 'fair': return 'bg-yellow-500'
      case 'good': return 'bg-blue-500'
      case 'strong': return 'bg-green-500'
      default: return 'bg-gray-300'
    }
  }
  
  function getStrengthLabel(): string {
    switch (strengthCategory) {
      case 'weak': return 'Weak'
      case 'fair': return 'Fair'
      case 'good': return 'Good'
      case 'strong': return 'Strong'
      default: return 'None'
    }
  }
</script>

{#if pin}
  <div class="mt-3">
    <div class="flex items-center justify-between mb-1">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Strength: {getStrengthLabel()}
      </span>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {strength}%
      </span>
    </div>
    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        class="h-full {getStrengthColor()} transition-all duration-300"
        style="width: {strength}%"
      ></div>
    </div>
    {#if strengthCategory === 'weak'}
      <p class="text-xs text-red-600 dark:text-red-400 mt-1">
        Avoid common patterns like 1234 or repeated digits.
      </p>
    {/if}
  </div>
{/if}