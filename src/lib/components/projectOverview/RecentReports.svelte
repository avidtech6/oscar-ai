<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Report } from '$lib/db';

	export let reports: Report[] = [];
	export let projectId: string = '';
	export let limit: number = 3;

	// Get recent reports (sorted by date, newest first)
	$: recentReports = reports
		.slice()
		.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
		.slice(0, limit);

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	}

	function getReportTypeLabel(type: string): string {
		switch (type) {
			case 'bs5837': return 'BS5837';
			case 'impact': return 'Impact';
			case 'method': return 'Method';
			default: return type;
		}
	}

	function getReportTypeColor(type: string): string {
		switch (type) {
			case 'bs5837': return 'bg-blue-100 text-blue-800';
			case 'impact': return 'bg-green-100 text-green-800';
			case 'method': return 'bg-purple-100 text-purple-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function handleViewAll() {
		goto(`/reports?project=${projectId}`);
	}

	function handleViewReport(reportId: string | undefined) {
		if (!reportId) return;
		goto(`/reports?report=${reportId}`);
	}
</script>

<div class="border border-gray-200 rounded-lg p-4 h-full flex flex-col">
	<div class="flex justify-between items-center mb-4">
		<h3 class="font-medium text-gray-700">Recent Reports</h3>
		<button
			on:click={handleViewAll}
			class="text-sm text-blue-500 hover:text-blue-700 font-medium"
		>
			View All
		</button>
	</div>

	{#if recentReports.length === 0}
		<div class="flex-1 flex items-center justify-center text-gray-400 text-sm">
			<p>No reports yet</p>
		</div>
	{:else}
		<div class="space-y-3 flex-1">
			{#each recentReports as report (report.id)}
				<div
					on:click={() => handleViewReport(report.id)}
					class="border border-gray-100 rounded p-3 hover:bg-gray-50 cursor-pointer transition-colors"
				>
					<div class="flex justify-between items-start mb-1">
						<h4 class="font-medium text-gray-800 text-sm truncate">{report.title}</h4>
						<span class="text-xs text-gray-500 whitespace-nowrap ml-2">
							{formatDate(report.generatedAt)}
						</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-xs px-2 py-1 rounded {getReportTypeColor(report.type)}">
							{getReportTypeLabel(report.type)}
						</span>
						{#if report.isDummy}
							<span class="text-xs text-gray-500">Draft</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mt-4 pt-3 border-t border-gray-100">
		<button
			on:click={() => goto(`/reports?project=${projectId}&action=create`)}
			class="w-full btn btn-outline btn-sm"
		>
			+ Create Report
		</button>
	</div>
</div>