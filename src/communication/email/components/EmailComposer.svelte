<script lang="ts">
	// Empty UI shell - no logic
</script>

<div class="email-composer flex flex-col h-full">
	<!-- Composer Header -->
	<div class="border-b border-gray-200 p-4">
		<h2 class="text-lg font-semibold text-gray-800">New Message</h2>
	</div>
	
	<!-- Form Fields -->
	<div class="flex-1 p-4 space-y-4">
		<!-- To Field -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-1">To</label>
			<input 
				type="text" 
				placeholder="recipient@example.com"
				class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
		</div>
		
		<!-- CC/BCC Toggle -->
		<div class="flex gap-4">
			<button class="text-sm text-blue-600 hover:text-blue-800">CC</button>
			<button class="text-sm text-blue-600 hover:text-blue-800">BCC</button>
		</div>
		
		<!-- Subject Field -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
			<input 
				type="text" 
				placeholder="Enter subject"
				class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
		</div>
		
		<!-- Email Body Editor -->
		<div class="flex-1">
			<label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
			<div class="border border-gray-300 rounded h-64 overflow-hidden">
				<!-- Simple textarea for now (would be replaced with rich editor) -->
				<textarea 
					placeholder="Type your message here..."
					class="w-full h-full p-3 resize-none focus:outline-none"
					rows="10"
				></textarea>
			</div>
		</div>
		
		<!-- Formatting Toolbar -->
		<div class="flex items-center gap-2 p-2 border border-gray-200 rounded">
			<button class="p-1.5 hover:bg-gray-100 rounded">
				<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
				</svg>
			</button>
			<button class="p-1.5 hover:bg-gray-100 rounded">
				<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
				</svg>
			</button>
			<button class="p-1.5 hover:bg-gray-100 rounded">
				<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
				</svg>
			</button>
			<button class="p-1.5 hover:bg-gray-100 rounded">
				<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
				</svg>
			</button>
			<div class="flex-1"></div>
			<button class="text-sm text-gray-600 hover:text-gray-800">Insert Template</button>
		</div>
		
		<!-- Attachments -->
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
			<div class="border border-dashed border-gray-300 rounded p-4 text-center">
				<svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
				</svg>
				<p class="text-sm text-gray-500">Drag files here or click to browse</p>
				<p class="text-xs text-gray-400 mt-1">Maximum file size: 25MB</p>
			</div>
		</div>
	</div>
	
	<!-- Action Buttons -->
	<div class="border-t border-gray-200 p-4 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<button class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700">
				Send
			</button>
			<button class="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200">
				Save Draft
			</button>
			<button class="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200">
				Discard
			</button>
		</div>
		<div class="flex items-center gap-2">
			<button class="text-sm text-gray-600 hover:text-gray-800">Schedule</button>
			<button class="text-sm text-gray-600 hover:text-gray-800">More Options</button>
		</div>
	</div>
</div>

<style>
	.email-composer {
		/* Component styles */
	}
</style>