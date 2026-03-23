<script lang="ts">
	import { page } from '$app/stores';
	import { intelligenceLayer } from '$lib/intelligence';

	export let collapsed = false;
	
	// Main navigation sections based on Phase Compliance requirements
	const reportIntelligenceItems = [
		{ label: 'Report Types', href: '/intelligence/reports', icon: '📋', description: 'PHASE_1: Report Type Registry' },
		{ label: 'Report Decompiler', href: '/intelligence/decompiler', icon: '🔍', description: 'PHASE_2: Report Decompiler Engine' },
		{ label: 'Schema Mapper', href: '/intelligence/schema', icon: '🗺️', description: 'PHASE_3: Report Schema Mapper' },
		{ label: 'Style Learner', href: '/intelligence/style', icon: '🎨', description: 'PHASE_5: Report Style Learner' },
		{ label: 'Compliance Validator', href: '/intelligence/compliance', icon: '✅', description: 'PHASE_9: Report Compliance Validator' },
		{ label: 'Template Generator', href: '/intelligence/templates', icon: '📑', description: 'PHASE_8: Report Template Generator' },
		{ label: 'Self-Healing', href: '/intelligence/healing', icon: '🔧', description: 'PHASE_7: Report Self-Healing Engine' }
	];
	
	const contentIntelligenceItems = [
		{ label: 'Blog Engine', href: '/intelligence/blog', icon: '📝', description: 'PHASE_17: Content Intelligence & Blog Engine' },
		{ label: 'Content Analyzer', href: '/intelligence/analyze', icon: '🔍', description: 'PHASE_17: Content Analysis' },
		{ label: 'SEO Optimizer', href: '/intelligence/seo', icon: '🔍', description: 'PHASE_17: SEO Optimization' }
	];
	
	const editorItems = [
		{ label: 'Unified Editor', href: '/editor', icon: '✏️', description: 'PHASE_18: Multi-Device Editor' },
		{ label: 'Real-time Collaboration', href: '/collaboration', icon: '👥', description: 'PHASE_19: Real-Time Collaboration' },
		{ label: 'Supabase Integration', href: '/integration/supabase', icon: '☁️', description: 'PHASE_18: Supabase Integration' }
	];
	
	const intelligenceSystemsItems = [
		{ label: 'Global Assistant', href: '/intelligence/assistant', icon: '🤖', description: 'PHASE_21: Global Assistant Intelligence' },
		{ label: 'Media Intelligence', href: '/intelligence/media', icon: '🎬', description: 'PHASE_22: Media Intelligence Layer' },
		{ label: 'Layout Intelligence', href: '/intelligence/layout', icon: '📐', description: 'PHASE_23: AI Layout Engine' },
		{ label: 'Document Intelligence', href: '/intelligence/document', icon: '📄', description: 'PHASE_24: Document Intelligence Layer' },
		{ label: 'Workflow Intelligence', href: '/intelligence/workflow', icon: '🔄', description: 'PHASE_25: Workflow Intelligence Layer' }
	];
	
	const extendedIntelligenceItems = [
		{ label: 'Map Intelligence', href: '/intelligence/maps', icon: '🗺️', description: 'PHASE_27.5: Map Intelligence Layer' },
		{ label: 'Diagram Intelligence', href: '/intelligence/diagrams', icon: '📊', description: 'PHASE_28.5: AI Diagram Generator' },
		{ label: 'OCR Intelligence', href: '/intelligence/ocr', icon: '👁️', description: 'PHASE_29.5: OCR & Table Extraction' },
		{ label: 'Semantic Search', href: '/intelligence/search', icon: '🔍', description: 'PHASE_31.5: Semantic Search Layer' },
		{ label: 'Knowledge Graph', href: '/intelligence/knowledge', icon: '🕸️', description: 'PHASE_32.5: Knowledge Graph' },
		{ label: 'Voice Interaction', href: '/intelligence/voice', icon: '🎤', description: 'PHASE_34.5: Voice Interaction' }
	];
	
	const systemManagementItems = [
		{ label: 'System Testing', href: '/testing', icon: '🧪', description: 'PHASE_20: Full System Testing' },
		{ label: 'Performance Monitoring', href: '/monitoring', icon: '📊', description: 'System Performance' },
		{ label: 'Integration Management', href: '/integration', icon: '🔗', description: 'PHASE_26: Final Integration' }
	];
	
	// Quick access items
	const quickAccessItems = [
		{ label: 'Dashboard', href: '/dashboard', icon: '📊' },
		{ label: 'Documents', href: '/documents', icon: '📁' },
		{ label: 'Projects', href: '/projects', icon: '🗂️' },
		{ label: 'Settings', href: '/settings', icon: '⚙️' }
	];
</script>

<aside class="sidebar" class:collapsed>
	<div class="sidebar-header">
		{#if !collapsed}
			<h2>Oscar AI</h2>
			<p class="subtitle">Arboricultural Assistant</p>
		{:else}
			<h2>OA</h2>
		{/if}
	</div>
	
	<nav class="sidebar-nav">
		<!-- Quick Access Section -->
		<div class="nav-section">
			<h3 class:collapsed>Quick Access</h3>
			<ul>
				{#each quickAccessItems as item}
					<li>
						<a
							href={item.href}
							class:active={$page.url.pathname === item.href}
							aria-label={item.label}
						>
							<span class="icon">{item.icon}</span>
							{#if !collapsed}
								<span class="label">{item.label}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
		
		<!-- Report Intelligence Section -->
		<div class="nav-section">
			<h3 class:collapsed>Report Intelligence</h3>
			<ul>
				{#each reportIntelligenceItems as item}
					<li>
						<a
							href={item.href}
							class:active={$page.url.pathname === item.href}
							aria-label={item.label}
						>
							<span class="icon">{item.icon}</span>
							{#if !collapsed}
								<div class="item-content">
									<span class="label">{item.label}</span>
									<span class="description">{item.description}</span>
								</div>
							{:else}
								<span class="label">{item.label}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
		
		<!-- Content Intelligence Section -->
		<div class="nav-section">
			<h3 class:collapsed>Content Intelligence</h3>
			<ul>
				{#each contentIntelligenceItems as item}
					<li>
						<a
							href={item.href}
							class:active={$page.url.pathname === item.href}
							aria-label={item.label}
						>
							<span class="icon">{item.icon}</span>
							{#if !collapsed}
								<div class="item-content">
									<span class="label">{item.label}</span>
									<span class="description">{item.description}</span>
								</div>
							{:else}
								<span class="label">{item.label}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
		
		<!-- Editor Section -->
		<div class="nav-section">
			<h3 class:collapsed>Unified Editor</h3>
			<ul>
				{#each editorItems as item}
					<li>
						<a
							href={item.href}
							class:active={$page.url.pathname === item.href}
							aria-label={item.label}
						>
							<span class="icon">{item.icon}</span>
							{#if !collapsed}
								<div class="item-content">
									<span class="label">{item.label}</span>
									<span class="description">{item.description}</span>
								</div>
							{:else}
								<span class="label">{item.label}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
		
		<!-- Intelligence Systems Section -->
		<div class="nav-section">
			<h3 class:collapsed>Intelligence Systems</h3>
			<ul>
				{#each intelligenceSystemsItems as item}
					<li>
						<a
							href={item.href}
							class:active={$page.url.pathname === item.href}
							aria-label={item.label}
						>
							<span class="icon">{item.icon}</span>
							{#if !collapsed}
								<div class="item-content">
									<span class="label">{item.label}</span>
									<span class="description">{item.description}</span>
								</div>
							{:else}
								<span class="label">{item.label}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
		
		<!-- Extended Intelligence Section -->
		<div class="nav-section">
			<h3 class:collapsed>Extended Intelligence</h3>
			<ul>
				{#each extendedIntelligenceItems as item}
					<li>
						<a
							href={item.href}
							class:active={$page.url.pathname === item.href}
							aria-label={item.label}
						>
							<span class="icon">{item.icon}</span>
							{#if !collapsed}
								<div class="item-content">
									<span class="label">{item.label}</span>
									<span class="description">{item.description}</span>
								</div>
							{:else}
								<span class="label">{item.label}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
		
		<!-- System Management Section -->
		<div class="nav-section">
			<h3 class:collapsed>System Management</h3>
			<ul>
				{#each systemManagementItems as item}
					<li>
						<a
							href={item.href}
							class:active={$page.url.pathname === item.href}
							aria-label={item.label}
						>
							<span class="icon">{item.icon}</span>
							{#if !collapsed}
								<div class="item-content">
									<span class="label">{item.label}</span>
									<span class="description">{item.description}</span>
								</div>
							{:else}
								<span class="label">{item.label}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
		
		<!-- Phase Files Status -->
		<div class="nav-section">
			<h3 class:collapsed>System Status</h3>
			<div class="phase-info">
				{#if !collapsed}
					<p>Version: {intelligenceLayer.version}</p>
					<p>{intelligenceLayer.phaseFiles.length} phase files loaded</p>
					<div class="system-status">
						<span class="status-indicator active"></span>
						<span>All systems operational</span>
					</div>
				{:else}
					<p>PF</p>
				{/if}
			</div>
		</div>
	</nav>
	
	<div class="sidebar-footer">
		<button on:click={() => collapsed = !collapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
			{#if collapsed}
				→
			{:else}
				←
			{/if}
		</button>
	</div>
</aside>

<style>
	.sidebar {
		background: linear-gradient(180deg, #1a1f2e 0%, #0f1524 100%);
		color: white;
		height: 100vh;
		width: 280px;
		display: flex;
		flex-direction: column;
		transition: width 0.3s ease;
		position: sticky;
		top: 0;
		overflow-y: auto;
		/* Hide scrollbar while preserving functionality */
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	
	.sidebar::-webkit-scrollbar {
		display: none;
	}
	
	.sidebar.collapsed {
		width: 80px;
	}
	
	.sidebar-header {
		padding: 2rem 1.5rem 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.sidebar-header h2 {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 0.25rem;
		font-family: 'Merriweather', serif;
	}
	
	.subtitle {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
	}
	
	.sidebar-nav {
		flex: 1;
		padding: 1.5rem 0;
	}
	
	.nav-section {
		margin-bottom: 2rem;
	}
	
	.nav-section h3 {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: rgba(255, 255, 255, 0.5);
		margin: 0 1.5rem 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.nav-section h3.collapsed {
		text-align: center;
		font-size: 0.6rem;
	}
	
	.nav-section ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	.nav-section li {
		margin: 0.25rem 0;
	}
	
	.nav-section a {
		display: flex;
		align-items: flex-start;
		padding: 0.75rem 1.5rem;
		color: rgba(255, 255, 255, 0.8);
		text-decoration: none;
		transition: all 0.2s ease;
		border-left: 3px solid transparent;
		min-height: 3rem;
		position: relative;
	}
	
	.nav-section a:hover {
		background: rgba(255, 255, 255, 0.05);
		color: white;
	}
	
	.nav-section a.active {
		background: rgba(59, 130, 246, 0.1);
		color: white;
		border-left-color: #3b82f6;
	}
	
	.icon {
		font-size: 1.25rem;
		margin-right: 1rem;
		width: 24px;
		text-align: center;
		margin-top: 0.25rem;
	}
	
	.collapsed .icon {
		margin-right: 0;
	}
	
	.label {
		font-size: 0.9375rem;
		font-weight: 500;
		line-height: 1.2;
	}
	
	.item-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}
		
	.description {
		font-size: 0.75rem;
		color: var(--text-secondary);
		font-weight: 400;
	}
		
	.nav-section a.active .description {
		color: var(--primary);
	}
		
	.system-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
		
	.status-indicator {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background-color: #10b981;
	}
		
	.status-indicator.active {
		background-color: #10b981;
		box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
	}
		
	.status-indicator.warning {
		background-color: #f59e0b;
		box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3);
	}
		
	.status-indicator.error {
		background-color: #ef4444;
		box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
	}
		
	.phase-info {
		padding: 0 1.5rem;
		font-size: 0.75rem;
		color: var(--text-secondary);
	}
		
	.phase-info p {
		margin: 0.25rem 0;
	}
		
	.sidebar-footer {
		padding: 1rem;
		border-top: 1px solid var(--border);
		text-align: center;
	}
		
	.sidebar-footer button {
		background: var(--background-hover);
		color: var(--text);
		border: none;
		border-radius: 4px;
		width: 40px;
		height: 40px;
		cursor: pointer;
		font-size: 1.25rem;
		transition: all 0.2s ease;
	}
		
	.sidebar-footer button:hover {
		background: var(--primary);
		color: white;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
	}
		
		/* Enhanced Mobile responsiveness */
		@media (max-width: 1280px) {
			.sidebar {
				width: 260px;
			}
			
			.sidebar.collapsed {
				width: 70px;
			}
		}
		
		@media (max-width: 1024px) {
			.sidebar {
				width: 240px;
			}
			
			.sidebar.collapsed {
				width: 60px;
			}
		}
		
		@media (max-width: 768px) {
			.sidebar {
				position: fixed;
				left: 0;
				top: 0;
				transform: translateX(-100%);
				height: 100vh;
				z-index: 1000;
				width: 280px;
			}
			
			.sidebar:not(.collapsed) {
				transform: translateX(0);
				box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
			}
			
			.sidebar.collapsed {
				transform: translateX(-100%);
			}
			
			.sidebar-header {
				padding: 1rem;
			}
			
			.sidebar-header h2 {
				font-size: 1.25rem;
			}
			
			.nav-section h3 {
				padding: 0 1rem;
			}
			
			.nav-section a {
				padding: 0.5rem 1rem;
			}
			
			.icon {
				font-size: 1.125rem;
			}
			
			.label {
				font-size: 0.8rem;
			}
			
			.description {
				display: none;
			}
		}
		
		@media (max-width: 480px) {
			.sidebar {
				width: 260px;
			}
			
			.sidebar-header {
				padding: 0.75rem;
			}
			
			.sidebar-header h2 {
				font-size: 1.125rem;
			}
			
			.nav-section a {
				padding: 0.375rem 0.75rem;
			}
			
			.icon {
				font-size: 1rem;
				margin-right: 0.5rem;
			}
			
			.label {
				font-size: 0.75rem;
			}
		}
	</style>