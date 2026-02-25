<script lang="ts">
	// Empty UI shell - no logic
</script>

<div class="email-viewer flex-1 p-4">
	<!-- Email Header -->
	<div class="mb-6">
		<div class="flex items-start justify-between mb-4">
			<div>
				<h2 class="text-xl font-bold text-gray-900 mb-2">Project Proposal Review</h2>
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
						<span class="text-sm font-medium text-blue-600">J</span>
					</div>
					<div>
						<p class="text-sm font-medium text-gray-800">John Smith</p>
						<p class="text-xs text-gray-500">john.smith@example.com</p>
					</div>
				</div>
			</div>
			<div class="text-sm text-gray-500">10:30 AM, Today</div>
		</div>
		
		<!-- Recipients -->
		<div class="text-sm text-gray-600 mb-4">
			<span class="font-medium">To:</span> you@example.com
		</div>
	</div>
	
	<!-- Email Body -->
	<div class="email-body mb-8">
		<div class="prose max-w-none">
			<p class="mb-4">Hi there,</p>
			
			<p class="mb-4">I've reviewed the project proposal you sent over and have some feedback to share.</p>
			
			<div class="bg-gray-50 border-l-4 border-blue-500 p-4 my-4">
				<p class="text-gray-700"><strong>Key Points:</strong></p>
				<ul class="list-disc pl-5 mt-2 space-y-1">
					<li>The timeline looks realistic and well-structured</li>
					<li>Budget breakdown is comprehensive</li>
					<li>Risk assessment section could be expanded</li>
					<li>Consider adding more detail to the implementation plan</li>
				</ul>
			</div>
			
			<p class="mb-4">Overall, this is a solid proposal. I'd like to schedule a brief call to discuss the risk assessment section and implementation details.</p>
			
			<p class="mb-4">Please let me know what time works for you next week.</p>
			
			<p>Best regards,<br>
			John</p>
		</div>
	</div>
	
	<!-- Attachments -->
	<div class="mb-8">
		<h3 class="text-sm font-semibold text-gray-700 mb-3">Attachments (2)</h3>
		<div class="space-y-2">
			<div class="flex items-center gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50">
				<div class="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
					<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
					</svg>
				</div>
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-800">proposal_feedback.pdf</p>
					<p class="text-xs text-gray-500">2.4 MB</p>
				</div>
				<button class="text-sm text-blue-600 hover:text-blue-800">Download</button>
			</div>
			
			<div class="flex items-center gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50">
				<div class="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
					<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
					</svg>
				</div>
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-800">timeline_chart.xlsx</p>
					<p class="text-xs text-gray-500">1.8 MB</p>
				</div>
				<button class="text-sm text-blue-600 hover:text-blue-800">Download</button>
			</div>
		</div>
	</div>
	
	<!-- Action Buttons -->
	<div class="flex items-center gap-2">
		<button class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700">
			Reply
		</button>
		<button class="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200">
			Reply All
		</button>
		<button class="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200">
			Forward
		</button>
		<button class="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 ml-auto">
			Archive
		</button>
		<button class="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200">
			Delete
		</button>
	</div>
</div>

<style>
	.email-viewer {
		/* Component styles */
	}
	
	.prose {
		color: #374151;
	}
	
	.prose p {
		margin-bottom: 1rem;
	}
</style>