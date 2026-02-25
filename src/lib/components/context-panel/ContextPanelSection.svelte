<script lang="ts">
	export let title: string = '';
	export let icon: string = '';
</script>

<div class="context-panel-section">
	<div class="section-header">
		{#if icon}
			<div class="section-icon">
				<slot name="icon">
					<!-- Default icon fallback -->
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						{#if icon === 'book-open'}
							<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
							<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
						{:else if icon === 'lightbulb'}
							<path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
						{:else if icon === 'zap'}
							<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
						{:else if icon === 'info'}
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="16" x2="12" y2="12" />
							<line x1="12" y1="8" x2="12.01" y2="8" />
						{:else}
							<circle cx="12" cy="12" r="10" />
						{/if}
					</svg>
				</slot>
			</div>
		{/if}
		<h3 class="section-title">{title}</h3>
	</div>
	
	<div class="section-content">
		<slot />
	</div>
</div>

<style>
	.context-panel-section {
		margin-bottom: 1.5rem;
	}
	
	.section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}
	
	.section-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		color: #6b7280;
	}
	
	.section-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.section-content {
		padding-left: 0.5rem;
		border-left: 2px solid #e5e7eb;
	}
	
	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.section-icon {
			color: #9ca3af;
		}
		
		.section-title {
			color: #e5e7eb;
		}
		
		.section-content {
			border-left-color: #374151;
		}
	}
</style>