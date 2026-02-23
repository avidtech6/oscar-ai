<script lang="ts">
	import type { Tree, Note, Report, Task, Photo } from '$lib/db';

	export let trees: Tree[] = [];
	export let notes: Note[] = [];
	export let reports: Report[] = [];
	export let tasks: Task[] = [];
	export let photos: Photo[] = [];
	export let projectId: string = '';

	// Calculate insights based on project data
	$: insights = calculateInsights();

	function calculateInsights() {
		const insightsList = [];

		// Insight 1: Tree count and condition
		if (trees.length > 0) {
			const healthyTrees = trees.filter(t => t.condition?.toLowerCase().includes('good') || t.condition?.toLowerCase().includes('healthy')).length;
			const unhealthyTrees = trees.filter(t => t.condition?.toLowerCase().includes('poor') || t.condition?.toLowerCase().includes('diseased')).length;
			
			if (healthyTrees > 0) {
				insightsList.push({
					type: 'positive',
					icon: '🌳',
					title: 'Healthy Trees',
					message: `${healthyTrees} of ${trees.length} trees are in good condition.`
				});
			}
			
			if (unhealthyTrees > 0) {
				insightsList.push({
					type: 'warning',
					icon: '⚠️',
					title: 'Trees Need Attention',
					message: `${unhealthyTrees} trees may need inspection or treatment.`
				});
			}
		}

		// Insight 2: Task completion
		if (tasks.length > 0) {
			const completedTasks = tasks.filter(t => t.status === 'done').length;
			const completionRate = Math.round((completedTasks / tasks.length) * 100);
			
			if (completionRate >= 75) {
				insightsList.push({
					type: 'positive',
					icon: '✅',
					title: 'High Task Completion',
					message: `${completionRate}% of tasks are completed.`
				});
			} else if (completionRate < 50) {
				insightsList.push({
					type: 'warning',
					icon: '📋',
					title: 'Tasks Pending',
					message: `Only ${completionRate}% of tasks are completed.`
				});
			}
		}

		// Insight 3: Recent activity
		const totalItems = trees.length + notes.length + reports.length + tasks.length + photos.length;
		if (totalItems === 0) {
			insightsList.push({
				type: 'info',
				icon: '📊',
				title: 'New Project',
				message: 'Start by adding trees, notes, or tasks to get insights.'
			});
		} else if (totalItems < 5) {
			insightsList.push({
				type: 'info',
				icon: '🚀',
				title: 'Getting Started',
				message: 'Add more items to unlock detailed project insights.'
			});
		}

		// Insight 4: Photo documentation
		if (photos.length > 0) {
			insightsList.push({
				type: 'positive',
				icon: '📷',
				title: 'Good Documentation',
				message: `${photos.length} photos provide visual documentation.`
			});
		}

		// Insight 5: Report status
		if (reports.length > 0) {
			const draftReports = reports.filter(r => r.isDummy).length;
			const finalReports = reports.length - draftReports;
			
			if (finalReports > 0) {
				insightsList.push({
					type: 'positive',
					icon: '📄',
					title: 'Reports Generated',
					message: `${finalReports} final report${finalReports > 1 ? 's' : ''} created.`
				});
			}
			
			if (draftReports > 0) {
				insightsList.push({
					type: 'info',
					icon: '✏️',
					title: 'Draft Reports',
					message: `${draftReports} draft report${draftReports > 1 ? 's' : ''} pending completion.`
				});
			}
		}

		// Insight 6: Note count
		if (notes.length >= 5) {
			insightsList.push({
				type: 'positive',
				icon: '📝',
				title: 'Well Documented',
				message: `${notes.length} notes provide comprehensive documentation.`
			});
		}

		// Limit to 3 insights
		return insightsList.slice(0, 3);
	}

	function getInsightColor(type: string): string {
		switch (type) {
			case 'positive': return 'bg-green-50 border-green-100';
			case 'warning': return 'bg-yellow-50 border-yellow-100';
			case 'info': return 'bg-blue-50 border-blue-100';
			default: return 'bg-gray-50 border-gray-100';
		}
	}

	function getInsightTextColor(type: string): string {
		switch (type) {
			case 'positive': return 'text-green-700';
			case 'warning': return 'text-yellow-700';
			case 'info': return 'text-blue-700';
			default: return 'text-gray-700';
		}
	}
</script>

<div class="border border-gray-200 rounded-lg p-4 h-full flex flex-col">
	<h3 class="font-medium text-gray-700 mb-4">AI Insights</h3>

	{#if insights.length === 0}
		<div class="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm">
			<div class="text-2xl mb-2">🤖</div>
			<p class="text-center">Add more project data to generate insights.</p>
		</div>
	{:else}
		<div class="space-y-3 flex-1">
			{#each insights as insight (insight.title)}
				<div class="border rounded-lg p-3 {getInsightColor(insight.type)}">
					<div class="flex items-start gap-3">
						<div class="text-xl">{insight.icon}</div>
						<div class="flex-1">
							<h4 class="font-medium {getInsightTextColor(insight.type)} mb-1">{insight.title}</h4>
							<p class="text-sm text-gray-600">{insight.message}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mt-4 pt-3 border-t border-gray-100">
		<p class="text-xs text-gray-500 text-center">
			Insights generated from project data
		</p>
	</div>
</div>