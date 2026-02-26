<script lang="ts">
	import Camera from '$lib/components/camera/Camera.svelte';
	import { toasts } from '$lib/stores/toast';
</script>

<Camera />

<!-- Toast container (global) -->
<div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
	{#each $toasts as toast (toast.id)}
		<div class="toast-{toast.type} animate-fade-in">
			{toast.message}
		</div>
	{/each}
</div>

<style>
	.toast-success {
		background-color: rgb(220 252 231);
		border: 1px solid rgb(74 222 128);
		color: rgb(21 128 61);
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
	}
	.toast-error {
		background-color: rgb(254 226 226);
		border: 1px solid rgb(248 113 113);
		color: rgb(185 28 28);
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
	}
	.toast-info {
		background-color: rgb(219 234 254);
		border: 1px solid rgb(96 165 250);
		color: rgb(29 78 216);
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
	}
	.toast-warning {
		background-color: rgb(254 249 195);
		border: 1px solid rgb(250 204 21);
		color: rgb(161 98 7);
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
	}
	@keyframes fade-in {
		from { opacity: 0; transform: translateY(-10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-fade-in {
		animation: fade-in 0.3s ease-out;
	}
</style>