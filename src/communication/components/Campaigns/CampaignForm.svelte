<script lang="ts">
	import { onMount } from 'svelte';
	import { campaignStore } from '../../stores/campaignStore';
	import type { Campaign, RecipientList } from '../../types';

	export let campaign: Partial<Campaign> | null = null;
	export let isEditing = false;

	// Form state
	let name = '';
	let description = '';
	let type: Campaign['type'] = 'email';
	let content = '';
	let contentHtml = '';
	let subject = '';
	let recipientListId = '';
	let scheduledFor = '';
	let recipientCount = 100;

	// Available recipient lists
	let recipientLists: RecipientList[] = [];

	// Loading state
	let isLoading = false;
	let isSubmitting = false;

	// Event dispatchers
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// Initialize form with campaign data
	onMount(async () => {
		// Load recipient lists
		await campaignStore.loadRecipientLists();
		recipientLists = $campaignStore.recipientLists;

		// If editing, populate form with campaign data
		if (campaign) {
			name = campaign.name || '';
			description = campaign.description || '';
			type = campaign.type || 'email';
			content = campaign.content || '';
			contentHtml = campaign.contentHtml || '';
			subject = campaign.subject || '';
			recipientListId = campaign.recipientListId || '';
			scheduledFor = campaign.scheduledFor ? new Date(campaign.scheduledFor).toISOString().slice(0, 16) : '';
			recipientCount = campaign.recipientCount || 100;
		}
	});

	// Handle form submission
	async function handleSubmit() {
		if (!name.trim()) {
			dispatch('error', { message: 'Campaign name is required' });
			return;
		}

		if (!content.trim()) {
			dispatch('error', { message: 'Campaign content is required' });
			return;
		}

		isSubmitting = true;

		try {
			const campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'sentCount' | 'openedCount' | 'clickedCount'> = {
				name: name.trim(),
				description: description.trim() || undefined,
				type,
				content: content.trim(),
				contentHtml: contentHtml.trim() || content.trim(),
				subject: subject.trim() || undefined,
				recipientListId: recipientListId || undefined,
				recipientCount,
				status: 'draft'
			};

			// Add scheduled date if provided
			if (scheduledFor) {
				campaignData.scheduledFor = new Date(scheduledFor);
				campaignData.status = 'scheduled';
			}

			if (isEditing && campaign?.id) {
				// Update existing campaign
				await campaignStore.updateCampaign(campaign.id, campaignData);
				dispatch('success', { message: 'Campaign updated successfully' });
			} else {
				// Create new campaign
				const newCampaign = await campaignStore.createCampaign(campaignData);
				dispatch('success', { message: 'Campaign created successfully', campaign: newCampaign });
			}

			// Reset form if not editing
			if (!isEditing) {
				resetForm();
			}
		} catch (error) {
			dispatch('error', { 
				message: error instanceof Error ? error.message : 'Failed to save campaign' 
			});
		} finally {
			isSubmitting = false;
		}
	}

	function resetForm() {
		name = '';
		description = '';
		type = 'email';
		content = '';
		contentHtml = '';
		subject = '';
		recipientListId = '';
		scheduledFor = '';
		recipientCount = 100;
	}

	function handleCancel() {
		dispatch('cancel');
	}

	// Generate HTML from content (simple implementation)
	function generateHtml() {
		contentHtml = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${content.replace(/\n/g, '<br>')}</div>`;
	}
</script>

<div class="campaign-form">
	<h2 class="text-xl font-semibold text-gray-900 mb-6">
		{isEditing ? 'Edit Campaign' : 'Create New Campaign'}
	</h2>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<!-- Campaign Name -->
		<div>
			<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
				Campaign Name *
			</label>
			<input
				id="name"
				type="text"
				bind:value={name}
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
				placeholder="e.g., Spring Newsletter 2026"
			/>
		</div>

		<!-- Description -->
		<div>
			<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
				Description
			</label>
			<textarea
				id="description"
				bind:value={description}
				rows={2}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
				placeholder="Brief description of this campaign"
			/>
		</div>

		<!-- Campaign Type and Recipient Count -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<label for="type" class="block text-sm font-medium text-gray-700 mb-1">
					Campaign Type *
				</label>
				<select
					id="type"
					bind:value={type}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
				>
					<option value="email">Email Campaign</option>
					<option value="newsletter">Newsletter</option>
					<option value="sms">SMS Campaign</option>
					<option value="push">Push Notification</option>
				</select>
			</div>

			<div>
				<label for="recipientCount" class="block text-sm font-medium text-gray-700 mb-1">
					Recipient Count *
				</label>
				<input
					id="recipientCount"
					type="number"
					bind:value={recipientCount}
					min="1"
					max="100000"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
				/>
			</div>
		</div>

		<!-- Recipient List -->
		<div>
			<label for="recipientList" class="block text-sm font-medium text-gray-700 mb-1">
				Recipient List
			</label>
			<select
				id="recipientList"
				bind:value={recipientListId}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
			>
				<option value="">-- Select a recipient list --</option>
				{#each recipientLists as list}
					<option value={list.id}>{list.name} ({list.recipientCount} recipients)</option>
				{/each}
			</select>
			{#if recipientLists.length === 0}
				<p class="text-sm text-gray-500 mt-1">
					No recipient lists found. 
					<button
						type="button"
						on:click={() => dispatch('createRecipientList')}
						class="text-forest-600 hover:text-forest-700 underline"
					>
						Create one first
					</button>
				</p>
			{/if}
		</div>

		<!-- Subject (for email campaigns) -->
		{#if type === 'email' || type === 'newsletter'}
			<div>
				<label for="subject" class="block text-sm font-medium text-gray-700 mb-1">
					Email Subject *
				</label>
				<input
					id="subject"
					type="text"
					bind:value={subject}
					required={type === 'email' || type === 'newsletter'}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
					placeholder="e.g., Important Update About Your Project"
				/>
			</div>
		{/if}

		<!-- Content -->
		<div>
			<label for="content" class="block text-sm font-medium text-gray-700 mb-1">
				Campaign Content *
			</label>
			<textarea
				id="content"
				bind:value={content}
				rows={8}
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 font-mono text-sm"
				placeholder="Enter your campaign content here..."
			/>
			<div class="flex justify-between items-center mt-2">
				<p class="text-sm text-gray-500">
					{content.length} characters
				</p>
				<button
					type="button"
					on:click={generateHtml}
					class="text-sm text-forest-600 hover:text-forest-700"
				>
					Generate HTML
				</button>
			</div>
		</div>

		<!-- Scheduling -->
		<div>
			<label for="scheduledFor" class="block text-sm font-medium text-gray-700 mb-1">
				Schedule Campaign (optional)
			</label>
			<input
				id="scheduledFor"
				type="datetime-local"
				bind:value={scheduledFor}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
			/>
			<p class="text-sm text-gray-500 mt-1">
				Leave empty to save as draft. Scheduled campaigns will be sent automatically.
			</p>
		</div>

		<!-- Form Actions -->
		<div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
			<button
				type="button"
				on:click={handleCancel}
				class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
				disabled={isSubmitting}
			>
				Cancel
			</button>
			<button
				type="submit"
				class="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={isSubmitting}
			>
				{#if isSubmitting}
					<svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<span>Saving...</span>
				{:else}
					<span>{isEditing ? 'Update Campaign' : 'Create Campaign'}</span>
				{/if}
			</button>
		</div>
	</form>
</div>