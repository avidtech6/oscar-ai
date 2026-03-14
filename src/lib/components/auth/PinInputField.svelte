<script lang="ts">
  export let id: string
  export let label: string
  export let value: string = ''
  export let placeholder: string = '••••'
  export let loading: boolean = false
  export let maxLength: number = 6
  export let onInput: (value: string) => void
  
  function handleInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement
    onInput(target.value)
  }
</script>

<div class="mb-4">
  <label for={id} class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    {label}
  </label>
  <div class="relative">
    <input
      {id}
      type="password"
      bind:value
      on:input={handleInput}
      maxlength={maxLength}
      {placeholder}
      class="w-full px-4 py-3 text-2xl text-center tracking-widest font-mono bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
      disabled={loading}
    />
    <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {value.length}/{maxLength}
      </span>
    </div>
  </div>
  <slot />
</div>