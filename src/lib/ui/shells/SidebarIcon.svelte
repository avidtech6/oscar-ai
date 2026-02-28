<script lang="ts">
	export let icon: string;
	export let icons: Record<string, string>;
</script>

<span class="flex-shrink-0 w-5 h-5">{@html icons[icon] || ''}</span>