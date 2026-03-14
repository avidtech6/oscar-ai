<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="breadcrumb">
	{#if $page.url.pathname === '/dashboard'}
		<span class="current">Dashboard</span>
	{:else if $page.url.pathname.startsWith('/reports')}
		<a href="/dashboard">Dashboard</a> / <span class="current">Reports</span>
	{:else if $page.url.pathname.startsWith('/notes')}
		<a href="/dashboard">Dashboard</a> / <span class="current">Notes</span>
	{:else}
		<a href="/dashboard">Dashboard</a> / <span class="current">{$page.url.pathname.split('/')[1] || 'Page'}</span>
	{/if}
</div>

<style>
	.breadcrumb {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.breadcrumb a {
		color: #3b82f6;
		text-decoration: none;
	}

	.breadcrumb a:hover {
		text-decoration: underline;
	}

	.breadcrumb .current {
		color: #111827;
		font-weight: 500;
	}
</style>