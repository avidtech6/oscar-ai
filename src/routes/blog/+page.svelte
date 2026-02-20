<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { db } from '$lib/db';
	import { groqApiKey, settings } from '$lib/stores/settings';
	import type { Project, Tree, Note } from '$lib/db';
	import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
	import MicButton from '$lib/components/MicButton.svelte';

	let apiKey = '';
	groqApiKey.subscribe(value => {
		apiKey = value;
	});

	interface BlogPost {
		id?: string;
		projectId: string;
		title: string;
		subtitle: string;
		bodyHTML: string;
		tags: string[];
		createdAt: string;
		updatedAt: string;
	}

	let projectId = '';
	let project: Project | undefined;
	let trees: Tree[] = [];
	let notes: Note[] = [];
	let blogPosts: BlogPost[] = [];
	let loading = true;
	let generating = false;
	let error = '';
	let success = '';

	// Selected project for blog posts (optional)
	let selectedProjectId = '';
	let showProjectSelector = false;

	// New blog post form
	let newPost = {
		title: '',
		subtitle: '',
		tags: '',
		prompt: '',
		includePhotos: true,
		styleProfile: '',
		attachProject: false
	};

	// Style profiles
	let styleProfiles: any[] = [];

	// View mode
	let viewMode: 'list' | 'create' | 'edit' = 'list';
	let selectedPost: BlogPost | null = null;

	const STORAGE_KEY = 'oscar_style_profiles';

	onMount(async () => {
		// Load style profiles
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			styleProfiles = JSON.parse(stored);
		}

		// Get project ID and post ID from URL
		const urlParams = new URLSearchParams($page.url.search);
		projectId = urlParams.get('project') || '';
		selectedProjectId = projectId;
		
		const postId = urlParams.get('post');
		const mode = urlParams.get('mode');

		// Load projects
		const projects = await db.projects.toArray();
		
		if (selectedProjectId) {
			await loadProjectContext();
		}
		
		// If post ID is provided, load that post for editing
		if (postId && mode === 'edit') {
			const storedPosts = localStorage.getItem('oscar_blog_posts');
			if (storedPosts) {
				const allPosts: BlogPost[] = JSON.parse(storedPosts);
				const post = allPosts.find(p => p.id === postId);
				if (post) {
					selectedPost = post;
					newPost = {
						title: post.title,
						subtitle: post.subtitle || '',
						tags: post.tags ? post.tags.join(', ') : '',
						prompt: post.bodyContent || '',
						includePhotos: true,
						styleProfile: ''
					};
					viewMode = 'edit';
				}
			}
		}
		
		loading = false;
	});

	async function loadProjectContext() {
		try {
			if (selectedProjectId) {
				project = await db.projects.get(selectedProjectId);
				if (project) {
					trees = await db.trees.where('projectId').equals(selectedProjectId).toArray();
					notes = await db.notes.where('projectId').equals(selectedProjectId).toArray();
				}
			} else {
				project = undefined;
				trees = [];
				notes = [];
			}
			blogPosts = await loadBlogPosts();
		} catch (e) {
			error = 'Failed to load project';
			console.error(e);
		}
	}

	async function loadBlogPosts(): Promise<BlogPost[]> {
		const stored = localStorage.getItem('oscar_blog_posts');
		if (stored) {
			const allPosts: BlogPost[] = JSON.parse(stored);
			// If a project is selected, filter by project; otherwise show all posts
			if (selectedProjectId) {
				return allPosts.filter(p => p.projectId === selectedProjectId);
			} else {
				return allPosts.filter(p => !p.projectId || p.projectId === '');
			}
		}
		return [];
	}

	function saveBlogPosts(posts: BlogPost[]) {
		const stored = localStorage.getItem('oscar_blog_posts');
		let allPosts: BlogPost[] = stored ? JSON.parse(stored) : [];
		
		// Remove old posts with matching IDs
		posts.forEach(newPost => {
			allPosts = allPosts.filter(p => p.id !== newPost.id);
		});
		
		// Add new posts
		allPosts = [...allPosts, ...posts];
		
		localStorage.setItem('oscar_blog_posts', JSON.stringify(allPosts));
	}

	async function generateBlogPost() {
		if (!newPost.title.trim()) {
			error = 'Please provide a title for the blog post';
			return;
		}

		const currentSettings = settings.get();
		if (!currentSettings.groqApiKey) {
			error = 'Please configure your Groq API key in Settings first.';
			return;
		}

		generating = true;
		error = '';
		success = '';

		try {
			// Build context from project data (optional)
			let context = '';
			
			if (newPost.attachProject && project) {
				context += `PROJECT: ${project.name}\n`;
				if (project.clientName) context += `Client: ${project.clientName}\n`;
				if (project.siteAddress) context += `Location: ${project.siteAddress}\n\n`;
			}

			if (newPost.attachProject && trees.length > 0 && newPost.includePhotos) {
				context += `TREES SURVEYED:\n`;
				trees.slice(0, 10).forEach(tree => {
					context += `- ${tree.number}: ${tree.species} (${tree.condition || 'Not specified'})\n`;
				});
				context += '\n';
			}

			if (newPost.attachProject && notes.length > 0) {
				context += `FIELD NOTES:\n`;
				notes.slice(0, 5).forEach(note => {
					context += `- ${note.title}: ${note.content.substring(0, 200)}...\n`;
				});
			}

			// If no project context, provide generic context
			if (!context.trim()) {
				context = 'This is a general blog post about tree care and arboriculture.';
			}

			// Get style profile if selected
			let systemPrompt = `You are a professional blog writer specializing in arboriculture and tree care. Write engaging, informative blog posts that are accessible to homeowners and property managers.`;
			
			if (newPost.styleProfile && styleProfiles.length > 0) {
				const profile = styleProfiles.find(p => p.id === newPost.styleProfile);
				if (profile) {
					systemPrompt = `You are writing in the following style:\n\n`;
					systemPrompt += `TONE: ${profile.tone}\n`;
					systemPrompt += `STRUCTURE: ${profile.structure}\n`;
					systemPrompt += `FORMATTING: ${profile.formattingRules}\n`;
					systemPrompt += `VOCABULARY: ${profile.vocabulary}\n`;
				}
			}

			const userPrompt = `Write a blog post with the following details:

Title: ${newPost.title}
Subtitle: ${newPost.subtitle || 'A comprehensive guide'}

Context: ${context}

Additional instructions: ${newPost.prompt || 'Write in an engaging, informative style suitable for property owners.'}

Please write a complete, well-structured blog post with:
- An engaging introduction
- Main body sections
- Practical takeaways
- A conclusion

Use markdown formatting for headings, lists, and emphasis.`;

			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${currentSettings.groqApiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{ role: 'system', content: systemPrompt },
						{ role: 'user', content: userPrompt }
					],
					temperature: 0.7,
					max_tokens: 2048
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error?.message || 'Failed to generate blog post');
			}

			const data = await response.json();
			const generatedContent = data.choices[0].message.content;

			// Save the blog post
			const post: BlogPost = {
				id: crypto.randomUUID(),
				projectId: newPost.attachProject ? selectedProjectId : '',
				title: newPost.title,
				subtitle: newPost.subtitle,
				bodyHTML: generatedContent,
				tags: newPost.tags.split(',').map(t => t.trim()).filter(t => t),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};

			blogPosts = [...blogPosts, post];
			saveBlogPosts(blogPosts);

			success = 'Blog post generated successfully!';
			selectedPost = post;
			viewMode = 'edit';

			// Reset form
			newPost = {
				title: '',
				subtitle: '',
				tags: '',
				prompt: '',
				includePhotos: true,
				styleProfile: '',
				attachProject: false
			};

		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to generate blog post';
			console.error(e);
		} finally {
			generating = false;
		}
	}

	function editPost(post: BlogPost) {
		selectedPost = post;
		viewMode = 'edit';
	}

	async function deletePost(post: BlogPost) {
		if (!confirm('Are you sure you want to delete this blog post?')) return;

		blogPosts = blogPosts.filter(p => p.id !== post.id);
		saveBlogPosts(blogPosts);
		selectedPost = null;
		viewMode = 'list';
	}

	function exportPost(post: BlogPost) {
		const content = `# ${post.title}

${post.subtitle ? `*${post.subtitle}*` : ''}

${post.bodyHTML}

---
Tags: ${post.tags.join(', ')}
Created: ${new Date(post.createdAt).toLocaleString()}
`;

		const blob = new Blob([content], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${post.title.replace(/[^a-z0-9]/gi, '_')}.md`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function onProjectChange() {
		await loadProjectContext();
	}
</script>

<svelte:head>
	<title>Blog Writer - Oscar AI</title>
</svelte:head>

<div class="max-w-6xl mx-auto">
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900 mb-2">Blog Writer</h1>
		<p class="text-gray-600">Generate engaging blog posts from your tree survey data.</p>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}

	{#if success}
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
			{success}
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-12">
			<p class="text-gray-500">Loading...</p>
		</div>
	{:else}
		<!-- Project Selection (Optional) -->
		<div class="card p-6 mb-6">
			<h2 class="text-lg font-semibold mb-4">Project Context (Optional)</h2>
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<input
						id="toggleProjectSelector"
						type="checkbox"
						bind:checked={showProjectSelector}
						class="rounded text-forest-600"
					/>
					<label for="toggleProjectSelector" class="text-sm font-medium text-gray-700">
						Attach to a project for context
					</label>
				</div>
	
				{#if showProjectSelector}
					<div class="border-l-4 border-forest-100 pl-4">
						<label for="project" class="block text-sm font-medium text-gray-700 mb-1">
							Select Project
						</label>
						<select
							id="project"
							bind:value={selectedProjectId}
							on:change={onProjectChange}
							class="input w-full"
						>
							<option value="">No project (general blog post)</option>
							{#await db.projects.toArray() then projects}
								{#each projects as proj}
									<option value={proj.id}>{proj.name}</option>
								{/each}
							{/await}
						</select>
						<p class="text-xs text-gray-500 mt-1">
							Project data will be included as context for AI generation.
						</p>
					</div>
				{/if}
			</div>
		</div>
	
		<!-- Action Buttons -->
		<div class="flex gap-4 mb-6">
			<button
				on:click={() => { viewMode = 'create'; selectedPost = null; }}
				class="btn btn-primary"
			>
				Create New Post
			</button>
			<button
				on:click={() => viewMode = 'list'}
				class="btn btn-secondary"
			>
				View Posts ({blogPosts.length})
			</button>
		</div>

			<!-- Create Mode -->
			{#if viewMode === 'create'}
				<div class="card p-6">
					<h2 class="text-lg font-semibold mb-4">Generate New Blog Post</h2>
					
					<div class="space-y-4">
						<div>
							<label for="title" class="block text-sm font-medium text-gray-700 mb-1">
								Blog Title *
							</label>
							<input
								id="title"
								type="text"
								bind:value={newPost.title}
								placeholder="e.g., 10 Essential Tree Care Tips for Property Owners"
								class="input w-full"
							/>
						</div>

						<div>
							<label for="subtitle" class="block text-sm font-medium text-gray-700 mb-1">
								Subtitle
							</label>
							<input
								id="subtitle"
								type="text"
								bind:value={newPost.subtitle}
								placeholder="e.g., A comprehensive guide to maintaining healthy trees"
								class="input w-full"
							/>
						</div>

						<div>
							<label for="tags" class="block text-sm font-medium text-gray-700 mb-1">
								Tags (comma-separated)
							</label>
							<input
								id="tags"
								type="text"
								bind:value={newPost.tags}
								placeholder="e.g., tree care, arboriculture, property maintenance"
								class="input w-full"
							/>
						</div>

						<div>
							<label for="styleProfile" class="block text-sm font-medium text-gray-700 mb-1">
								Style Profile (Optional)
							</label>
							<select
								id="styleProfile"
								bind:value={newPost.styleProfile}
								class="input w-full"
							>
								<option value="">Default AI Style</option>
								{#each styleProfiles as profile}
									<option value={profile.id}>{profile.name}</option>
								{/each}
							</select>
						</div>

						<div class="flex items-center gap-2">
							<input
								id="attachProject"
								type="checkbox"
								bind:checked={newPost.attachProject}
								class="rounded text-forest-600"
							/>
							<label for="attachProject" class="text-sm font-medium text-gray-700">
								Use project context (if a project is selected above)
							</label>
						</div>

						{#if newPost.attachProject}
							<div class="flex items-center gap-2 pl-4">
								<input
									id="includePhotos"
									type="checkbox"
									bind:checked={newPost.includePhotos}
									class="rounded text-forest-600"
								/>
								<label for="includePhotos" class="text-sm text-gray-700">
									Include tree data in context
								</label>
							</div>
						{/if}

						<div>
							<label for="prompt" class="block text-sm font-medium text-gray-700 mb-1">
								Additional Instructions
							</label>
							<textarea
								id="prompt"
								bind:value={newPost.prompt}
								placeholder="Any specific topics or tone you want..."
								rows="3"
								class="input w-full"
							></textarea>
							<div class="mt-2">
								<MicButton on:transcript={(e) => newPost.prompt += e.detail.text} />
							</div>
						</div>

						<button
							on:click={generateBlogPost}
							disabled={generating || !newPost.title.trim()}
							class="btn btn-primary w-full"
						>
							{generating ? 'Generating Blog Post...' : 'Generate Blog Post with AI'}
						</button>
					</div>
				</div>
			{/if}

			<!-- List Mode -->
			{#if viewMode === 'list'}
				{#if blogPosts.length === 0}
					<div class="card p-6 text-center">
						<p class="text-gray-500 mb-4">No blog posts yet. Create your first one!</p>
						<button
							on:click={() => viewMode = 'create'}
							class="btn btn-primary"
						>
							Create Blog Post
						</button>
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each blogPosts as post}
							<div class="card p-4 hover:shadow-md transition-shadow">
								<h3 class="font-semibold text-gray-900 mb-1">{post.title}</h3>
								{#if post.subtitle}
									<p class="text-sm text-gray-600 mb-2">{post.subtitle}</p>
								{/if}
								<p class="text-xs text-gray-400 mb-3">
									{new Date(post.createdAt).toLocaleDateString()}
									{#if post.tags.length > 0}
										<span class="mx-2">•</span>
										{post.tags.slice(0, 3).join(', ')}
									{/if}
								</p>
								<div class="flex gap-2">
									<button
										on:click={() => editPost(post)}
										class="text-sm text-forest-600 hover:underline"
									>
										View/Edit
									</button>
									<button
										on:click={() => exportPost(post)}
										class="text-sm text-gray-600 hover:underline"
									>
										Export
									</button>
									<button
										on:click={() => deletePost(post)}
										class="text-sm text-red-600 hover:underline"
									>
										Delete
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{/if}

			<!-- Edit/View Mode -->
			{#if viewMode === 'edit' && selectedPost}
				<div class="card p-6">
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-lg font-semibold">{selectedPost.title}</h2>
						<div class="flex gap-2">
							<button
								on:click={() => exportPost(selectedPost)}
								class="btn btn-secondary text-sm"
							>
								Export
							</button>
							<button
								on:click={() => { viewMode = 'list'; selectedPost = null; }}
								class="text-gray-500 hover:text-gray-700"
							>
								Close
							</button>
						</div>
					</div>

					{#if selectedPost.subtitle}
						<p class="text-lg text-gray-600 mb-4 italic">{selectedPost.subtitle}</p>
					{/if}

					{#if selectedPost.tags.length > 0}
						<div class="flex gap-2 mb-4">
							{#each selectedPost.tags as tag}
								<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
									{tag}
								</span>
							{/each}
						</div>
					{/if}

					<hr class="my-4" />

					<div class="prose prose-sm max-w-none">
						<MarkdownRenderer content={selectedPost.bodyHTML} />
					</div>
				</div>
			{/if}
		{/if}
	{/if}
</div>
