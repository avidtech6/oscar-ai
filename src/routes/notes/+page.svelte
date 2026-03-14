<script lang="ts">
	import { getIntelligenceLayer } from '$lib/intelligence';
	import NoteCard from '$lib/components/NoteCard.svelte';
	import { exportManager } from '$lib/export/exportManager';
	import './notes.css';

	const intelligence = getIntelligenceLayer();

	let searchQuery = $state('');
	let selectedCategory = $state('all');

	const categories = [
		{ id: 'all', label: 'All Categories' },
		{ id: 'field', label: 'Field Notes' },
		{ id: 'observation', label: 'Observations' },
		{ id: 'measurement', label: 'Measurements' },
		{ id: 'planning', label: 'Planning' }
	];

	let notes = $state([
		{ 
			id: 1, 
			title: 'Oak Tree Health Assessment', 
			content: 'Noticed some leaf discoloration on the mature oak near the entrance. Possible fungal infection.',
			category: 'observation',
			tags: ['oak', 'health', 'fungus'],
			date: 'Today',
			location: 'Oak Park, North Section',
			treeSpecies: ['Quercus robur'],
			attachments: 2
		},
		{ 
			id: 2, 
			title: 'Tree Girth Measurements', 
			content: 'Measured girth of 15 trees for annual growth tracking. All measurements recorded in spreadsheet.',
			category: 'measurement',
			tags: ['measurement', 'growth', 'data'],
			date: 'Yesterday',
			location: 'Ancient Woodland',
			treeSpecies: ['Oak', 'Beech', 'Ash'],
			attachments: 1
		},
		{ 
			id: 3, 
			title: 'Storm Damage Inspection', 
			content: 'Post-storm inspection revealed minor branch damage on 3 trees. No immediate safety concerns.',
			category: 'field',
			tags: ['storm', 'safety', 'inspection'],
			date: '2 days ago',
			location: 'Residential Area',
			treeSpecies: ['Sycamore', 'Willow'],
			attachments: 3
		},
		{ 
			id: 4, 
			title: 'Pruning Schedule Planning', 
			content: 'Planning winter pruning schedule for the orchard. Need to coordinate with maintenance team.',
			category: 'planning',
			tags: ['pruning', 'schedule', 'winter'],
			date: '1 week ago',
			location: 'Community Orchard',
			treeSpecies: ['Apple', 'Pear', 'Plum'],
			attachments: 0
		},
		{ 
			id: 5, 
			title: 'Bird Nesting Survey', 
			content: 'Documented 7 active bird nests in the woodland. Noted species and locations for protection.',
			category: 'observation',
			tags: ['wildlife', 'birds', 'survey'],
			date: '1 week ago',
			location: 'Protected Woodland',
			treeSpecies: ['Oak', 'Pine'],
			attachments: 4
		},
		{ 
			id: 6, 
			title: 'Soil Sample Results', 
			content: 'Received lab results for soil samples. pH levels optimal, nutrient levels within expected ranges.',
			category: 'field',
			tags: ['soil', 'lab', 'analysis'],
			date: '2 weeks ago',
			location: 'Test Plot A',
			treeSpecies: ['Mixed'],
			attachments: 2
		}
	]);
	
	let filteredNotes = $derived(
		notes.filter(note => {
			const matchesSearch = searchQuery === '' || 
				note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
				note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
			
			const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
			
			return matchesSearch && matchesCategory;
		})
	);
	
	function createNewNote() {
		console.log('Creating new note');
	}
	
	function handleEdit(id: number) {
		console.log('Edit note', id);
	}
	
	function handleDelete(id: number) {
		console.log('Delete note', id);
		notes = notes.filter(note => note.id !== id);
	}
	
	function handleExport(id: number) {
		console.log('Export note', id);
		exportManager.exportNote(id.toString(), 'pdf');
	}

	function exportAllNotes() {
		console.log('Export all notes');
		const items = filteredNotes.map(note => ({
			id: note.id.toString(),
			title: note.title,
			content: note.content
		}));
		exportManager.exportSummary(items, 'pdf');
	}

	function handleExpand(id: number) {
		console.log('Expand note', id);
	}
</script>

<main class="notes-page">
	<div class="page-header">
		<div>
			<h1>Notes</h1>
			<p class="subtitle">Capture and organize your arboricultural observations and field notes</p>
		</div>
		<div class="header-actions">
			<button class="btn-secondary" onclick={exportAllNotes}>
				📤 Export All
			</button>
			<button class="btn-primary" onclick={createNewNote}>
				📝 New Note
			</button>
		</div>
	</div>
	
	<div class="filters-section">
		<div class="search-box">
			🔍
			<input 
				type="search" 
				placeholder="Search notes by title, content, or tags..." 
				bind:value={searchQuery}
			/>
		</div>
		
		<div class="filter-controls">
			<div class="filter-group">
				<label for="category-filter">Category</label>
				<select id="category-filter" bind:value={selectedCategory}>
					{#each categories as category}
						<option value={category.id}>{category.label}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>
	
	<div class="notes-stats">
		<div class="stat">
			<div class="stat-value">{notes.length}</div>
			<div class="stat-label">Total Notes</div>
		</div>
		<div class="stat">
			<div class="stat-value">{notes.filter(n => n.category === 'field').length}</div>
			<div class="stat-label">Field Notes</div>
		</div>
		<div class="stat">
			<div class="stat-value">{notes.filter(n => n.category === 'observation').length}</div>
			<div class="stat-label">Observations</div>
		</div>
		<div class="stat">
			<div class="stat-value">{intelligence.phaseCount}</div>
			<div class="stat-label">Intelligence Layers</div>
		</div>
	</div>
	
	{#if filteredNotes.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📝</div>
			<h3>No notes found</h3>
			<p>Try adjusting your search or filters, or create a new note.</p>
			<button class="btn-primary" onclick={() => {
				searchQuery = '';
				selectedCategory = 'all';
			}}>Clear filters</button>
		</div>
	{:else}
		<div class="notes-grid">
			{#each filteredNotes as note}
				<NoteCard
					{note}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onExpand={handleExpand}
					onExport={handleExport}
				/>
			{/each}
		</div>
	{/if}
	
	<div class="quick-actions">
		<h2>Quick Actions</h2>
		<div class="actions-grid">
			<button class="action-card" onclick={createNewNote}>
				<div class="action-icon">📝</div>
				<div class="action-label">Quick Note</div>
				<div class="action-description">Capture a brief observation</div>
			</button>
			<button class="action-card" onclick={() => console.log('Add photo')}>
				<div class="action-icon">📸</div>
				<div class="action-label">Add Photo</div>
				<div class="action-description">Upload tree photos</div>
			</button>
			<button class="action-card" onclick={() => console.log('Voice note')}>
				<div class="action-icon">🎤</div>
				<div class="action-label">Voice Note</div>
				<div class="action-description">Record field observations</div>
			</button>
			<button class="action-card" onclick={exportAllNotes}>
				<div class="action-icon">📤</div>
				<div class="action-label">Export</div>
				<div class="action-description">Export all notes</div>
			</button>
		</div>
	</div>
</main>