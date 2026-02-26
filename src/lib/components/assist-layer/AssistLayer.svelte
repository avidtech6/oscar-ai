<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import assistLayerStore, {
		closeAssistLayer,
		toggleAssistLayer,
		expandAssistLayer,
		collapseAssistLayer,
		setCurrentTab,
		setSheetHeight,
		executeAction,
		allActions,
		actionsByCategory,
		isMobile,
		updateVoiceTranscript,
		setListening,
		type AssistAction
	} from './assistLayerStore';
	import { filteredHints } from '../context-panel/contextPanelStore';
	import AssistActionButton from './AssistActionButton.svelte';
	import AssistTabBar from './AssistTabBar.svelte';
	import AssistVoiceInput from './AssistVoiceInput.svelte';
	
	// Reactive stores
	let isOpen = false;
	let isExpanded = false;
	let currentTab: 'actions' | 'hints' | 'tools' | 'voice' = 'actions';
	let sheetHeight = 40;
	let animationDuration = 300;
	let quickActions: AssistAction[] = [];
	let aiActions: AssistAction[] = [];
	let navigationActions: AssistAction[] = [];
	let hints: any[] = [];

	// Drag state
	let isDragging = false;
	let dragStartY = 0;
	let dragStartHeight = 0;
	
	// Subscribe to stores
	const unsubscribe = assistLayerStore.subscribe(state => {
		isOpen = state.isOpen;
		isExpanded = state.isExpanded;
		currentTab = state.currentTab;
		sheetHeight = state.sheetHeight;
		animationDuration = state.animationDuration;
	});
	
	const unsubscribeActions = actionsByCategory.subscribe(categories => {
		quickActions = categories.quick;
		aiActions = categories.ai;
		navigationActions = categories.navigation;
	});
	
	const unsubscribeHints = filteredHints.subscribe(h => {
		hints = h;
	});
	
	// Handle drag to resize
	function handleDragStart(event: MouseEvent | TouchEvent) {
		isDragging = true;
		const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
		dragStartY = clientY;
		dragStartHeight = sheetHeight;
		
		document.addEventListener('mousemove', handleDragMove as EventListener);
		document.addEventListener('touchmove', handleDragMove as EventListener);
		document.addEventListener('mouseup', handleDragEnd);
		document.addEventListener('touchend', handleDragEnd);
		
		event.preventDefault();
	}
	
	function handleDragMove(event: MouseEvent | TouchEvent) {
		if (!isDragging) return;
		
		const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
		const deltaY = dragStartY - clientY;
		const windowHeight = window.innerHeight;
		const deltaPercent = (deltaY / windowHeight) * 100;
		
		let newHeight = dragStartHeight + deltaPercent;
		newHeight = Math.max(20, Math.min(95, newHeight));
		
		setSheetHeight(newHeight);
		
		// Auto-expand/collapse based on height
		if (newHeight > 60 && !isExpanded) {
			expandAssistLayer();
		} else if (newHeight <= 60 && isExpanded) {
			collapseAssistLayer();
		}
	}
	
	function handleDragEnd() {
		isDragging = false;
		
		document.removeEventListener('mousemove', handleDragMove as EventListener);
		document.removeEventListener('touchmove', handleDragMove as EventListener);
		document.removeEventListener('mouseup', handleDragEnd);
		document.removeEventListener('touchend', handleDragEnd);
	}
	
	// Close on backdrop click (mobile only)
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget && isMobile()) {
			closeAssistLayer();
		}
	}
	
	// Close on Escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			closeAssistLayer();
		}
	}
	
	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		
		return () => {
			window.removeEventListener('keydown', handleKeydown);
			handleDragEnd(); // Clean up drag listeners
		};
	});
	
	onDestroy(() => {
		unsubscribe();
		unsubscribeActions();
		unsubscribeHints();
	});
	
	// Animation styles
	const sheetStyle = `
		height: ${sheetHeight}vh;
		transition: ${isDragging ? 'none' : `height ${animationDuration}ms ease-in-out`};
	`;
	
	const backdropStyle = `
		opacity: ${isOpen ? '1' : '0'};
		pointer-events: ${isOpen ? 'auto' : 'none'};
		transition: opacity ${animationDuration}ms ease-in-out;
	`;
</script>

<!-- Backdrop (mobile only) -->
{#if isMobile() && isOpen}
	<div
		class="assist-layer-backdrop"
		style={backdropStyle}
		on:click={handleBackdropClick}
		aria-hidden="true"
	/>
{/if}

<!-- Assist Layer Sheet -->
<div
	class="assist-layer"
	class:open={isOpen}
	class:expanded={isExpanded}
	class:dragging={isDragging}
	style={sheetStyle}
	role="dialog"
	aria-label="Assist Layer"
	aria-modal={isMobile() && isOpen}
	aria-hidden={!isOpen}
>
	<!-- Drag Handle -->
	<div
		class="assist-drag-handle"
		on:mousedown={handleDragStart}
		on:touchstart={handleDragStart}
		aria-label="Drag to resize"
	>
		<div class="drag-indicator" />
	</div>
	
	<!-- Header -->
	<header class="assist-header">
		<div class="assist-header-content">
			<h2 class="assist-title">
				{#if currentTab === 'actions'}
					Quick Actions
				{:else if currentTab === 'hints'}
					AI Hints
				{:else if currentTab === 'tools'}
					Tools
				{:else if currentTab === 'voice'}
					Voice Assistant
				{/if}
			</h2>
			<button
				class="assist-close"
				on:click={closeAssistLayer}
				aria-label="Close assist layer"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			</button>
		</div>
		
		<!-- Tab Bar -->
		<AssistTabBar
			currentTab={currentTab}
			onTabChange={setCurrentTab}
		/>
	</header>
	
	<!-- Content -->
	<div class="assist-content">
		{#if currentTab === 'actions'}
			<!-- Quick Actions -->
			<section class="assist-section">
				<h3 class="section-title">Quick Actions</h3>
				<div class="actions-grid">
					{#each quickActions as action (action.id)}
						<AssistActionButton
							{action}
							on:action={() => executeAction(action.id)}
						/>
					{/each}
				</div>
			</section>
			
			<!-- AI Actions -->
			<section class="assist-section">
				<h3 class="section-title">AI Assistant</h3>
				<div class="actions-grid">
					{#each aiActions as action (action.id)}
						<AssistActionButton
							{action}
							on:action={() => executeAction(action.id)}
						/>
					{/each}
				</div>
			</section>
			
			<!-- Navigation -->
			<section class="assist-section">
				<h3 class="section-title">Navigation</h3>
				<div class="actions-grid">
					{#each navigationActions as action (action.id)}
						<AssistActionButton
							{action}
							on:action={() => executeAction(action.id)}
						/>
					{/each}
				</div>
			</section>
		
		{:else if currentTab === 'hints'}
			<!-- AI Hints -->
			<section class="assist-section">
				<h3 class="section-title">Context Hints</h3>
				{#if hints.length === 0}
					<div class="empty-state">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
							<path d="M12 16v-4M12 8h.01" />
						</svg>
						<h4>No hints available</h4>
						<p>No context-specific hints for this screen.</p>
					</div>
				{:else}
					<div class="hints-list">
						{#each hints as hint (hint.id)}
							<div class="hint-item">
								<div class="hint-icon">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
									</svg>
								</div>
								<div class="hint-content">
									<h4 class="hint-title">{hint.title}</h4>
									<p class="hint-description">{hint.description}</p>
								</div>
								{#if hint.actionable}
									<button
										class="hint-action"
										on:click={() => hint.action && hint.action()}
									>
										{hint.actionLabel || 'Action'}
									</button>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</section>
		
		{:else if currentTab === 'tools'}
			<!-- Tools -->
			<section class="assist-section">
				<h3 class="section-title">Tools</h3>
				<div class="tools-grid">
					<div class="tool-card">
						<div class="tool-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
								<polyline points="3.27 6.96 12 12.01 20.73 6.96" />
								<line x1="12" y1="22.08" x2="12" y2="12" />
							</svg>
						</div>
						<h4 class="tool-title">Calculator</h4>
						<p class="tool-description">Quick calculations</p>
					</div>
					<div class="tool-card">
						<div class="tool-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
								<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
							</svg>
						</div>
						<h4 class="tool-title">Converter</h4>
						<p class="tool-description">Unit conversion</p>
					</div>
					<div class="tool-card">
						<div class="tool-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10" />
								<polyline points="12 6 12 12 16 14" />
							</svg>
						</div>
						<h4 class="tool-title">Timer</h4>
						<p class="tool-description">Countdown timer</p>
					</div>
					<div class="tool-card">
						<div class="tool-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
							</svg>
						</div>
						<h4 class="tool-title">Notes</h4>
						<p class="tool-description">Quick notes</p>
					</div>
				</div>
			</section>
		
		{:else if currentTab === 'voice'}
			<!-- Voice Assistant -->
			<AssistVoiceInput />
		{/if}
	</div>
	
	<!-- Footer -->
	<footer class="assist-footer">
		<div class="assist-footer-content">
			<p class="assist-footer-text">
				{#if isMobile()}
					Swipe up/down to resize • Tap backdrop to close
				{:else}
					Drag handle to resize • Press Escape to close
				{/if}
			</p>
		</div>
	</footer>
</div>

<style>
	/* Backdrop */
	.assist-layer-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 9998;
	}
	
	/* Sheet Container */
	.assist-layer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: white;
		border-top-left-radius: 1rem;
		border-top-right-radius: 1rem;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
		z-index: 9999;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transform: translateY(100%);
	}
	
	.assist-layer.open {
		transform: translateY(0);
	}
	
	.assist-layer.expanded {
		border-radius: 0;
	}
	
	.assist-layer.dragging {
		transition: none;
	}
	
	/* Drag Handle */
	.assist-drag-handle {
		padding: 0.75rem;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: grab;
		touch-action: none;
		user-select: none;
	}
	
	.assist-drag-handle:active {
		cursor: grabbing;
	}
	
	.drag-indicator {
		width: 40px;
		height: 4px;
		background-color: #d1d5db;
		border-radius: 2px;
	}
	
	/* Header */
	.assist-header {
		padding: 0 1rem;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.assist-header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 0;
	}
	
	.assist-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
		margin: 0;
	}
	
	.assist-close {
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
	
	.assist-close:hover {
		background-color: #f3f4f6;
		color: #374151;
	}
	
	/* Content */
	.assist-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}
	
	.assist-section {
		margin-bottom: 1.5rem;
	}
	
	.section-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.actions-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin-bottom: 1rem;
	}
	
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 2rem 1rem;
		color: #6b7280;
	}
	
	.empty-state svg {
		color: #9ca3af;
		margin-bottom: 1rem;
	}
	
	.empty-state h4 {
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 0.5rem;
	}
	
	.empty-state p {
		font-size: 0.875rem;
		margin: 0;
	}
	
	.hints-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.hint-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem;
		background-color: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
	}
	
	.hint-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		color: #6b7280;
		flex-shrink: 0;
	}
	
	.hint-content {
		flex: 1;
	}
	
	.hint-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.25rem;
	}
	
	.hint-description {
		font-size: 0.8125rem;
		color: #4b5563;
		margin: 0;
		line-height: 1.4;
	}
	
	.hint-action {
		flex-shrink: 0;
		padding: 0.375rem 0.75rem;
		background-color: #3b82f6;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	
	.hint-action:hover {
		background-color: #2563eb;
	}
	
	.tools-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}
	
	.tool-card {
		padding: 1rem;
		background-color: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		text-align: center;
	}
	
	.tool-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		margin: 0 auto 0.75rem;
		color: #6b7280;
	}
	
	.tool-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.25rem;
	}
	
	.tool-description {
		font-size: 0.75rem;
		color: #6b7280;
		margin: 0;
	}
	
	/* Footer */
	.assist-footer {
		padding: 0.75rem 1rem;
		border-top: 1px solid #e5e7eb;
		background-color: #f9fafb;
	}
	
	.assist-footer-content {
		text-align: center;
	}
	
	.assist-footer-text {
		font-size: 0.6875rem;
		color: #6b7280;
		margin: 0;
	}
	
	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.assist-layer {
			background-color: #1f2937;
		}
		
		.assist-header {
			border-bottom-color: #374151;
		}
		
		.assist-title {
			color: #f9fafb;
		}
		
		.assist-close {
			color: #9ca3af;
		}
		
		.assist-close:hover {
			background-color: #374151;
			color: #d1d5db;
		}
		
		.drag-indicator {
			background-color: #4b5563;
		}
		
		.section-title {
			color: #e5e7eb;
		}
		
		.empty-state {
			color: #9ca3af;
		}
		
		.empty-state h4 {
			color: #e5e7eb;
		}
		
		.hint-item {
			background-color: #111827;
			border-color: #374151;
		}
		
		.hint-icon {
			color: #9ca3af;
		}
		
		.hint-title {
			color: #f9fafb;
		}
		
		.hint-description {
			color: #d1d5db;
		}
		
		.hint-action {
			background-color: #2563eb;
		}
		
		.hint-action:hover {
			background-color: #1d4ed8;
		}
		
		.tool-card {
			background-color: #111827;
			border-color: #374151;
		}
		
		.tool-icon {
			color: #9ca3af;
		}
		
		.tool-title {
			color: #f9fafb;
		}
		
		.tool-description {
			color: #9ca3af;
		}
		
		.assist-footer {
			background-color: #111827;
			border-top-color: #374151;
		}
		
		.assist-footer-text {
			color: #9ca3af;
		}
	}
	
	/* Responsive adjustments */
	@media (min-width: 768px) {
		.assist-layer {
			width: 400px;
			left: auto;
			right: 1rem;
			bottom: 1rem;
			border-radius: 0.75rem;
			height: auto;
			max-height: 80vh;
		}
		
		.assist-layer.open {
			transform: translateY(0);
		}
		
		.assist-layer-backdrop {
			display: none;
		}
		
		.actions-grid {
			grid-template-columns: repeat(3, 1fr);
		}
		
		.tools-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>