<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { contextPanelStore, filteredHints, executeHintAction, getContextDisplayName } from './contextPanelStore';
	import ContextPanelSection from './ContextPanelSection.svelte';
	import ContextPanelHint from './ContextPanelHint.svelte';
	
	// Reactive stores
	let isOpen = false;
	let isMobile = false;
	let currentContext = 'global';
	let hasNewHints = false;
	let filteredHintsList: any[] = [];
	let panelWidth = 320;
	let animationDuration = 300;
	
	// Subscribe to stores
	const unsubscribe = contextPanelStore.subscribe(state => {
		isOpen = state.isOpen;
		isMobile = state.isMobile;
		currentContext = state.currentContext;
		hasNewHints = state.hasNewHints;
		panelWidth = state.panelWidth;
		animationDuration = state.animationDuration;
	});
	
	const unsubscribeFiltered = filteredHints.subscribe(hints => {
		filteredHintsList = hints;
	});
	
	// Close panel on Escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			contextPanelStore.closePanel();
		}
	}
	
	// Close panel when clicking outside (desktop only)
	function handleBackdropClick(event: MouseEvent) {
		if (!isMobile && isOpen && event.target === event.currentTarget) {
			contextPanelStore.closePanel();
		}
	}
	
	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		
		// Detect mobile on mount
		const checkMobile = () => {
			contextPanelStore.setMobile(window.innerWidth < 768);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		return () => {
			window.removeEventListener('keydown', handleKeydown);
			window.removeEventListener('resize', checkMobile);
		};
	});
	
	onDestroy(() => {
		unsubscribe();
		unsubscribeFiltered();
	});
	
	// Animation styles
	const panelStyle = `
		width: ${panelWidth}px;
		transition: transform ${animationDuration}ms ease-in-out;
		transform: translateX(${isOpen ? '0' : '100%'});
	`;
	
	const backdropStyle = `
		opacity: ${isOpen ? '1' : '0'};
		pointer-events: ${isOpen ? 'auto' : 'none'};
		transition: opacity ${animationDuration}ms ease-in-out;
	`;
	
	// Mobile vs desktop behavior
	// Note: isAssistLayer variable was unused and has been removed
</script>

<!-- Desktop Backdrop -->
{#if !isMobile && isOpen}
	<div
		class="context-panel-backdrop"
		style={backdropStyle}
		on:click={handleBackdropClick}
		aria-hidden="true"
	/>
{/if}

<!-- Context Panel -->
<aside
	class="context-panel"
	class:open={isOpen}
	class:mobile={isMobile}
	class:desktop={!isMobile}
	style={panelStyle}
	role="complementary"
	aria-label="Context Panel"
	aria-hidden={!isOpen}
>
	<!-- Header -->
	<header class="context-panel-header">
		<div class="context-panel-header-content">
			<h2 class="context-panel-title">
				{getContextDisplayName(currentContext)} Hints
				{#if hasNewHints}
					<span class="new-badge" aria-label="New hints available">New</span>
				{/if}
			</h2>
			<button
				class="context-panel-close"
				on:click={() => contextPanelStore.closePanel()}
				aria-label="Close context panel"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			</button>
		</div>
		
		{#if currentContext !== 'global'}
			<div class="context-panel-context">
				<span class="context-panel-context-label">Context:</span>
				<span class="context-panel-context-value">{getContextDisplayName(currentContext)}</span>
			</div>
		{/if}
	</header>
	
	<!-- Content -->
	<div class="context-panel-content">
		{#if filteredHintsList.length === 0}
			<div class="context-panel-empty">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
					<path d="M12 16v-4M12 8h.01" />
				</svg>
				<h3>No hints available</h3>
				<p>No context-specific hints are available for this screen.</p>
			</div>
		{:else}
			<!-- Static Documentation Section -->
			<ContextPanelSection title="Documentation" icon="book-open">
				<div class="documentation-links">
					<a href="/docs/getting-started" class="doc-link" target="_blank" rel="noopener">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
						</svg>
						Getting Started Guide
					</a>
					<a href="/docs/email-setup" class="doc-link" target="_blank" rel="noopener">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
							<path d="M22 6l-10 7L2 6" />
						</svg>
						Email Setup Documentation
					</a>
					<a href="/docs/api" class="doc-link" target="_blank" rel="noopener">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
						</svg>
						API Reference
					</a>
				</div>
			</ContextPanelSection>
			
			<!-- Dynamic Hints Section -->
			<ContextPanelSection title="AI Hints" icon="lightbulb">
				<div class="hints-list">
					{#each filteredHintsList as hint (hint.id)}
						<ContextPanelHint
							{hint}
							on:action={() => executeHintAction(hint)}
						/>
					{/each}
				</div>
			</ContextPanelSection>
			
			<!-- Actions Section -->
			<ContextPanelSection title="Actions" icon="zap">
				<div class="action-buttons">
					<button
						class="action-button"
						on:click={() => {
							contextPanelStore.markAllHintsAsSeen();
						}}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
							<path d="M22 4L12 14.01l-3-3" />
						</svg>
						Mark all as read
					</button>
					<button
						class="action-button secondary"
						on:click={() => {
							window.dispatchEvent(new CustomEvent('open-feedback'));
						}}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
						</svg>
						Send feedback
					</button>
				</div>
			</ContextPanelSection>
		{/if}
	</div>
	
	<!-- Footer -->
	<footer class="context-panel-footer">
		<div class="context-panel-footer-content">
			<p class="context-panel-footer-text">
				Hints are context-aware and update based on what you're doing.
			</p>
			<button
				class="context-panel-footer-button"
				on:click={() => contextPanelStore.setContext('global')}
			>
				Reset to general hints
			</button>
		</div>
	</footer>
</aside>

<style>
	/* Backdrop */
	.context-panel-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.3);
		z-index: 9998;
	}
	
	/* Panel Container */
	.context-panel {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		background-color: white;
		box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);
		z-index: 9999;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	
	.context-panel.mobile {
		width: 100%;
		max-width: 400px;
	}
	
	.context-panel.desktop {
		border-left: 1px solid #e5e7eb;
	}
	
	/* Header */
	.context-panel-header {
		padding: 1.5rem 1.5rem 0.75rem;
		border-bottom: 1px solid #e5e7eb;
		background-color: #f9fafb;
	}
	
	.context-panel-header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.75rem;
	}
	
	.context-panel-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.new-badge {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.125rem 0.5rem;
		background-color: #3b82f6;
		color: white;
		border-radius: 9999px;
	}
	
	.context-panel-close {
		background: none;
		border: none;
		padding: 0.5rem;
		cursor: pointer;
		color: #6b7280;
		border-radius: 0.375rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.context-panel-close:hover {
		background-color: #f3f4f6;
		color: #374151;
	}
	
	.context-panel-context {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #6b7280;
	}
	
	.context-panel-context-label {
		font-weight: 500;
	}
	
	.context-panel-context-value {
		font-weight: 600;
		color: #374151;
	}
	
	/* Content */
	.context-panel-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}
	
	.context-panel-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 3rem 1rem;
		color: #6b7280;
	}
	
	.context-panel-empty svg {
		color: #9ca3af;
		margin-bottom: 1rem;
	}
	
	.context-panel-empty h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 0.5rem;
	}
	
	.context-panel-empty p {
		font-size: 0.875rem;
		margin: 0;
	}
	
	/* Documentation Links */
	.documentation-links {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.doc-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background-color: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		color: #374151;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s;
	}
	
	.doc-link:hover {
		background-color: #f3f4f6;
		border-color: #d1d5db;
		color: #111827;
	}
	
	.doc-link svg {
		flex-shrink: 0;
	}
	
	/* Hints List */
	.hints-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	/* Action Buttons */
	.action-buttons {
		display: flex;
		gap: 0.75rem;
	}
	
	.action-button {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background-color: #3b82f6;
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	
	.action-button:hover {
		background-color: #2563eb;
	}
	
	.action-button.secondary {
		background-color: #6b7280;
	}
	
	.action-button.secondary:hover {
		background-color: #4b5563;
	}
	
	.action-button svg {
		flex-shrink: 0;
	}
	
	/* Footer */
	.context-panel-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid #e5e7eb;
		background-color: #f9fafb;
	}
	
	.context-panel-footer-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.context-panel-footer-text {
		font-size: 0.75rem;
		color: #6b7280;
		margin: 0;
		text-align: center;
	}
	
	.context-panel-footer-button {
		padding: 0.5rem 1rem;
		background-color: white;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.context-panel-footer-button:hover {
		background-color: #f3f4f6;
		border-color: #9ca3af;
	}
	
	/* Responsive adjustments */
	@media (max-width: 640px) {
		.context-panel {
			width: 100%;
			max-width: none;
		}
		
		.context-panel-header {
			padding: 1rem 1rem 0.5rem;
		}
		
		.context-panel-content {
			padding: 1rem;
		}
		
		.context-panel-footer {
			padding: 0.75rem 1rem;
		}
		
		.action-buttons {
			flex-direction: column;
		}
	}
	
	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.context-panel {
			background-color: #1f2937;
			border-left-color: #374151;
		}
		
		.context-panel-header {
			background-color: #111827;
			border-bottom-color: #374151;
		}
		
		.context-panel-title {
			color: #f9fafb;
		}
		
		.context-panel-close {
			color: #9ca3af;
		}
		
		.context-panel-close:hover {
			background-color: #374151;
			color: #d1d5db;
		}
		
		.context-panel-context-label {
			color: #9ca3af;
		}
		
		.context-panel-context-value {
			color: #e5e7eb;
		}
		
		.context-panel-empty {
			color: #9ca3af;
		}
		
		.context-panel-empty h3 {
			color: #e5e7eb;
		}
		
		.doc-link {
			background-color: #111827;
			border-color: #374151;
			color: #e5e7eb;
		}
		
		.doc-link:hover {
			background-color: #374151;
			border-color: #4b5563;
			color: #f9fafb;
		}
		
		.action-button.secondary {
			background-color: #4b5563;
		}
		
		.action-button.secondary:hover {
			background-color: #6b7280;
		}
		
		.context-panel-footer {
			background-color: #111827;
			border-top-color: #374151;
		}
		
		.context-panel-footer-text {
			color: #9ca3af;
		}
		
		.context-panel-footer-button {
			background-color: #374151;
			color: #e5e7eb;
			border-color: #4b5563;
		}
		
		.context-panel-footer-button:hover {
			background-color: #4b5563;
			border-color: #6b7280;
		}
	}
</style>