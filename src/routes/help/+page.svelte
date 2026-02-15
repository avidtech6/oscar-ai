<script lang="ts">
	interface HelpTopic {
		id: string;
		title: string;
		content: string;
		category: string;
	}
	
	const helpTopics: HelpTopic[] = [
		{
			id: 'getting-started',
			title: 'Getting Started',
			category: 'Basics',
			content: `Welcome to Oscar AI! Here's how to get started:

1. **Configure API Key**: Go to Settings and enter your Groq API key to enable AI features.
2. **Create a Project**: Click on "Projects" in the sidebar to create your first tree survey project.
3. **Add Trees**: Navigate to your project and start adding trees with their details.
4. **Use Oscar AI**: Chat with Oscar AI to get help with tree assessments, recommendations, and more.`
		},
		{
			id: 'projects',
			title: 'Managing Projects',
			category: 'Projects',
			content: `Projects help you organize your tree surveys by location or client.

Features:
- Create multiple projects for different sites
- Add trees to each project
- Track project status and notes
- Export project data as PDF reports

To create a new project:
1. Click "Projects" in the sidebar
2. Click "+ New Project"
3. Enter project name and location
4. Start adding trees`
		},
		{
			id: 'trees',
			title: 'Tree Data Entry',
			category: 'Trees',
			content: `When adding trees to a project, you'll need to enter:

- **Tree Number**: Unique identifier for each tree
- **Species**: Common and scientific name
- **DBH**: Diameter at Breast Height (in mm)
- **Height**: Estimated tree height (in meters)
- **Age Class**: Young, Semi-mature, Mature, Over-mature
- **Condition**: Good, Fair, Poor, Dead
- **Photos**: Upload photos of the tree

You can also add notes and recommendations for each tree.`
		},
		{
			id: 'oscar-ai',
			title: 'Using Oscar AI',
			category: 'AI Features',
			content: `Oscar AI is your AI assistant for tree surveys. It can help with:

- **Tree Assessments**: Get expert analysis of tree conditions
- **Recommendations**: Receive management recommendations based on BS5837
- **Report Writing**: Generate professional report sections
- **Species Information**: Learn about tree species characteristics
- **Defect Analysis**: Identify potential hazards and defects

Simply type your question or request in the chat, and Oscar will respond with relevant information.`
		},
		{
			id: 'reports',
			title: 'Generating Reports',
			category: 'Reports',
			content: `Create professional tree survey reports with our built-in report generator.

Features:
- Automatic tree data compilation
- BS5837 compliant format
- Customizable templates
- PDF export with photos
- Include recommendations and constraints

To generate a report:
1. Go to your project
2. Click "Generate Report"
3. Select report options
4. Preview and download PDF`
		},
		{
			id: 'learn-style',
			title: 'Learning Your Style',
			category: 'AI Features',
			content: `Teach Oscar AI your writing style for more personalized outputs.

How it works:
1. Go to "Learn My Style" in the sidebar
2. Create a new style profile
3. Paste examples of your previous reports
4. Or upload PDF/DOCX documents
5. Oscar AI analyzes your style
6. Save the profile for future use

Oscar will then use your style when generating recommendations and reports.`
		},
		{
			id: 'notes',
			title: 'Using Notes',
			category: 'Basics',
			content: `Keep track of important information with Notes.

Features:
- Create and organize notes by category
- Search through all notes
- Edit and delete notes
- Notes sync across devices

Categories include:
- Site Notes
- Client Information
- Meeting Notes
- General Notes`
		},
		{
			id: 'settings',
			title: 'Settings & Configuration',
			category: 'Basics',
			content: `Customize Oscar AI in Settings:

- **API Key**: Enter your Groq API key (required for AI features)
- **Theme**: Switch between light and dark mode
- **Data Management**: Export or import your data
- **Clear Data**: Reset all local data

Your data is stored locally in your browser. Use the export feature to backup important information.`
		}
	];
	
	let selectedTopic: HelpTopic | null = null;
	let searchQuery = '';
	
	$: filteredTopics = searchQuery 
		? helpTopics.filter(topic => 
			topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			topic.content.toLowerCase().includes(searchQuery.toLowerCase())
		)
		: helpTopics;
	
	$: categories = [...new Set(helpTopics.map(t => t.category))];
	
	function selectTopic(topic: HelpTopic) {
		selectedTopic = topic;
	}
</script>

<svelte:head>
	<title>Help - Oscar AI</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-6">
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900 mb-2">Help Center</h1>
		<p class="text-gray-600">Find answers and learn how to use Oscar AI</p>
	</div>
	
	<!-- Search -->
	<div class="mb-6">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search help topics..."
			class="input w-full"
		/>
	</div>
	
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Topics List -->
		<div class="lg:col-span-1">
			<div class="card p-4">
				<h2 class="font-semibold text-gray-900 mb-4">Topics</h2>
				{#if searchQuery}
					<p class="text-sm text-gray-500 mb-4">Found {filteredTopics.length} results</p>
				{/if}
				<div class="space-y-2">
					{#each filteredTopics as topic (topic.id)}
						<button
							on:click={() => selectTopic(topic)}
							class="w-full text-left px-4 py-3 rounded-lg transition-colors {selectedTopic?.id === topic.id ? 'bg-forest-100 text-forest-800' : 'hover:bg-gray-100'}"
						>
							<div class="font-medium">{topic.title}</div>
							<div class="text-xs text-gray-500">{topic.category}</div>
						</button>
					{/each}
				</div>
			</div>
		</div>
		
		<!-- Content Area -->
		<div class="lg:col-span-2">
			{#if selectedTopic}
				<div class="card p-6">
					<div class="flex items-center justify-between mb-4">
						<span class="text-sm px-3 py-1 bg-forest-100 text-forest-800 rounded-full">
							{selectedTopic.category}
						</span>
					</div>
					<h2 class="text-xl font-bold text-gray-900 mb-4">{selectedTopic.title}</h2>
					<div class="prose prose-sm max-w-none">
						{#each selectedTopic.content.split('\n\n') as paragraph}
							{#if paragraph.startsWith('- **') || paragraph.startsWith('1. **') || paragraph.startsWith('To ')}
								<p class="mb-2">{paragraph}</p>
							{:else if paragraph.startsWith('- ') || paragraph.startsWith('1. ')}
								<ul class="list-disc pl-4 mb-2">
									<li>{paragraph.substring(2)}</li>
								</ul>
							{:else}
								<p class="mb-4 text-gray-700">{paragraph}</p>
							{/if}
						{/each}
					</div>
				</div>
			{:else}
				<div class="card p-8 text-center">
					<h2 class="text-xl font-semibold text-gray-900 mb-2">Welcome to Help Center</h2>
					<p class="text-gray-600 mb-4">Select a topic from the list to get started</p>
					<div class="grid grid-cols-2 gap-4 text-left">
						{#each categories.slice(0, 4) as category}
							<div class="p-4 bg-gray-50 rounded-lg">
								<h3 class="font-medium text-gray-900 mb-1">{category}</h3>
								<p class="text-xs text-gray-500">{helpTopics.filter(t => t.category === category).length} topics</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Contact Support -->
	<div class="mt-8 card p-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-2">Need More Help?</h2>
		<p class="text-gray-600 mb-4">Can't find what you're looking for? Contact us for support.</p>
		<div class="flex gap-4">
			<a href="mailto:support@oscar-ai.app" class="btn btn-primary">Contact Support</a>
			<a href="/settings" class="btn btn-secondary">Go to Settings</a>
		</div>
	</div>
</div>
