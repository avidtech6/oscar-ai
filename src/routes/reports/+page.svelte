<script lang="ts">
	import { getIntelligenceLayer } from '$lib/intelligence';
	import ReportsFilters from '$lib/components/ReportsFilters.svelte';
	import ReportsStats from '$lib/components/ReportsStats.svelte';
	import ReportCard from '$lib/components/ReportCard.svelte';
	import ExportMenu from '$lib/components/export/ExportMenu.svelte';
	import DocumentExplorer from '$lib/components/DocumentExplorer.svelte';
	import { exportManager } from '$lib/export/exportManager';
	import './reports.css';

	const intelligence = getIntelligenceLayer();

	let searchQuery = $state('');
	let selectedType = $state('all');
	let selectedStatus = $state('all');
	let showDocumentExplorer = $state(false);

	let reports = [
		{ 
			id: 1, 
			title: 'Tree Risk Assessment - Oak Park', 
			type: 'risk', 
			typeLabel: 'Risk Assessment',
			status: 'draft',
			date: '2024-03-15',
			client: 'City Council',
			location: 'Oak Park, London',
			tags: ['high-priority', 'oak', 'public-space'],
			description: 'Comprehensive risk assessment for mature oak trees in public park.'
		},
		{ 
			id: 2, 
			title: 'Arboricultural Method Statement - Construction Site', 
			type: 'method', 
			typeLabel: 'Method Statement',
			status: 'published',
			date: '2024-03-10',
			client: 'BuildRight Ltd',
			location: 'Construction Site A',
			tags: ['construction', 'protection', 'bs5837'],
			description: 'Method statement for tree protection during construction works.'
		},
		{ 
			id: 3, 
			title: 'Tree Preservation Order Survey', 
			type: 'survey', 
			typeLabel: 'Survey Report',
			status: 'review',
			date: '2024-03-05',
			client: 'Heritage Trust',
			location: 'Historic Estate',
			tags: ['tpo', 'historic', 'survey'],
			description: 'Detailed survey of trees subject to Tree Preservation Orders.'
		},
		{ 
			id: 4, 
			title: 'Woodland Management Plan 2024-2029', 
			type: 'management', 
			typeLabel: 'Management Plan',
			status: 'published',
			date: '2024-02-28',
			client: 'National Trust',
			location: 'Ancient Woodland',
			tags: ['management', '5-year', 'biodiversity'],
			description: 'Five-year management plan for ancient woodland conservation.'
		},
		{ 
			id: 5, 
			title: 'Emergency Tree Inspection - Storm Damage', 
			type: 'inspection', 
			typeLabel: 'Inspection Report',
			status: 'published',
			date: '2024-02-20',
			client: 'Emergency Services',
			location: 'Residential Area',
			tags: ['emergency', 'storm', 'safety'],
			description: 'Post-storm inspection of damaged trees for public safety.'
		},
		{ 
			id: 6, 
			title: 'Tree Works Specification - Highway Maintenance', 
			type: 'method', 
			typeLabel: 'Method Statement',
			status: 'draft',
			date: '2024-02-15',
			client: 'Highways Agency',
			location: 'A-Road Network',
			tags: ['highway', 'maintenance', 'specification'],
			description: 'Specification for tree works along highway network.'
		}
	];
	
	let filteredReports = $derived(
		reports.filter(report => {
			const matchesSearch = searchQuery === '' || 
				report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				report.client.toLowerCase().includes(searchQuery.toLowerCase());
			
			const matchesType = selectedType === 'all' || report.type === selectedType;
			const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
			
			return matchesSearch && matchesType && matchesStatus;
		})
	);
	
	function createNewReport() {
		console.log('Creating new report');
	}
	
	function exportReports() {
		console.log('Exporting reports');
		// Export all filtered reports as a summary
		const items = filteredReports.map(report => ({
			id: report.id.toString(),
			title: report.title,
			content: report.description
		}));
		exportManager.exportSummary(items, 'pdf');
	}
	
	function handleExport(id: number) {
		console.log('Export report', id);
		exportManager.exportReport(id.toString(), 'pdf');
	}
	
	function handleEdit(id: number) {
		console.log('Edit report', id);
	}
	
	function handleView(id: number) {
		console.log('View report', id);
	}
	
	function handleShare(id: number) {
		console.log('Share report', id);
	}
</script>

<main class="reports-page">
	<div class="page-header">
		<div>
			<h1>Reports</h1>
			<p class="subtitle">Manage your arboricultural reports and documentation</p>
		</div>
		<div class="header-actions">
			<button class="btn-secondary" onclick={exportReports}>
				📤 Export
			</button>
			<button class="btn-primary" onclick={createNewReport}>
				➕ New Report
			</button>
		</div>
	</div>
	
	<ReportsFilters 
		bind:searchQuery 
		bind:selectedType 
		bind:selectedStatus 
	/>
	
	<ReportsStats 
		{reports} 
		intelligencePhaseCount={intelligence.phaseCount} 
	/>
	
	{#if filteredReports.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📄</div>
			<h3>No reports found</h3>
			<p>Try adjusting your search or filters, or create a new report.</p>
			<button class="btn-primary" onclick={() => {
				searchQuery = '';
				selectedType = 'all';
				selectedStatus = 'all';
			}}>Clear filters</button>
		</div>
	{:else}
		<div class="reports-grid">
			{#each filteredReports as report}
				<ReportCard
					{report}
					onEdit={handleEdit}
					onView={handleView}
					onShare={handleShare}
					onExport={handleExport}
				/>
			{/each}
		</div>
	{/if}
	
	<div class="intelligence-section">
		<h2>Report Intelligence</h2>
		<p>The following intelligence layers are available for report processing:</p>
		
		<div class="intelligence-cards">
			{#each intelligence.phases.filter(p => p.name.includes('Report')) as phase}
				<div class="intelligence-card">
					<div class="intelligence-icon">🧠</div>
					<div class="intelligence-content">
						<h4>{phase.name}</h4>
						<p>{phase.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</main>
