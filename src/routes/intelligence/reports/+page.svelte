<script lang="ts">
	import { onMount } from 'svelte';
	import { reportTypeRegistry } from '$lib/intelligence';
	import type { ReportTypeDefinition } from '$lib/intelligence/types';

	let reportTypes: ReportTypeDefinition[] = [];
	let selectedReport: ReportTypeDefinition | null = null;
	let validationInput: Record<string, any> = {};
	let validationResult: any = null;
	let loading = false;

	onMount(() => {
		loadReportTypes();
	});

	function loadReportTypes() {
		reportTypes = reportTypeRegistry.getAllTypes();
		if (reportTypes.length > 0) {
			selectedReport = reportTypes[0];
		}
	}

	function selectReport(report: ReportTypeDefinition) {
		selectedReport = report;
		validationInput = {};
		validationResult = null;
	}

	function validateStructure() {
		if (!selectedReport) return;
		validationResult = reportTypeRegistry.validateStructure(selectedReport.id, validationInput);
	}

	function addSection() {
		if (!selectedReport) return;
		const sectionName = prompt('Enter section name:');
		if (sectionName) {
			validationInput[sectionName] = 'Sample content';
		}
	}
</script>

<div class="page">
	<h1>Report Intelligence</h1>
	<p class="subtitle">Phase 1 — Report Type Registry</p>

	<div class="registry-status">
		<div class="status-card">
			<h3>Registry Status</h3>
			<p>{reportTypes.length} report types registered</p>
			<p>Built‑in types: BS5837, AIA, AMS, Condition, Safety, Mortgage, Custom</p>
		</div>
	</div>

	<div class="content-grid">
		<div class="report-list">
			<h3>Report Types</h3>
			<ul>
				{#each reportTypes as report}
					<li class:selected={selectedReport?.id === report.id}>
						<button on:click={() => selectReport(report)}>
							<span class="report-name">{report.name}</span>
							<span class="report-version">v{report.version}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>

		<div class="report-details">
			{#if selectedReport}
				<h3>{selectedReport.name}</h3>
				<p>{selectedReport.description}</p>

				<div class="sections">
					<h4>Required Sections</h4>
					<ul>
						{#each selectedReport.requiredSections as section}
							<li>{section}</li>
						{/each}
					</ul>

					{#if selectedReport.optionalSections.length > 0}
						<h4>Optional Sections</h4>
						<ul>
							{#each selectedReport.optionalSections as section}
								<li>{section}</li>
							{/each}
						</ul>
					{/if}

					{#if selectedReport.conditionalSections.length > 0}
						<h4>Conditional Sections</h4>
						<ul>
							{#each selectedReport.conditionalSections as section}
								<li>{section}</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div class="validation">
					<h4>Structure Validation</h4>
					<p>Test validation by adding sections:</p>
					<div class="validation-input">
						{#each Object.entries(validationInput) as [section, content]}
							<div class="input-row">
								<strong>{section}:</strong> <input bind:value={validationInput[section]} />
								<button on:click={() => { delete validationInput[section]; validationInput = {...validationInput}; }}>Remove</button>
							</div>
						{/each}
						<button on:click={addSection}>Add Section</button>
						<button on:click={validateStructure}>Validate</button>
					</div>

					{#if validationResult}
						<div class:valid={validationResult.valid} class:invalid={!validationResult.valid} class="validation-result">
							<h5>Validation Result</h5>
							{#if validationResult.valid}
								<p>✅ Structure is valid</p>
							{:else}
								<p>❌ Structure is invalid</p>
							{/if}
							{#if validationResult.errors.length > 0}
								<ul>
									{#each validationResult.errors as error}
										<li class="error">{error}</li>
									{/each}
								</ul>
							{/if}
							{#if validationResult.warnings.length > 0}
								<ul>
									{#each validationResult.warnings as warning}
										<li class="warning">{warning}</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/if}
				</div>
			{:else}
				<p>Select a report type to view details.</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.page {
		padding: 2rem;
	}
	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 0.5rem;
	}
	.subtitle {
		color: #6b7280;
		font-size: 1.125rem;
		margin-bottom: 2rem;
	}
	.registry-status {
		margin-bottom: 2rem;
	}
	.status-card {
		background: #f9fafb;
		border-radius: 8px;
		padding: 1.5rem;
		border-left: 4px solid #3b82f6;
	}
	.status-card h3 {
		margin-top: 0;
	}
	.content-grid {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: 2rem;
	}
	.report-list {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
	}
	.report-list h3 {
		margin-top: 0;
	}
	.report-list ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.report-list li {
		margin-bottom: 0.5rem;
	}
	.report-list button {
		width: 100%;
		text-align: left;
		padding: 0.75rem 1rem;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.report-list button:hover {
		background: #f3f4f6;
	}
	.report-list li.selected button {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}
	.report-name {
		font-weight: 500;
	}
	.report-version {
		font-size: 0.75rem;
		opacity: 0.7;
	}
	.report-details {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
	}
	.report-details h3 {
		margin-top: 0;
	}
	.sections {
		margin: 1.5rem 0;
	}
	.sections h4 {
		margin-bottom: 0.5rem;
	}
	.sections ul {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem 0;
	}
	.sections li {
		padding: 0.5rem 0;
		border-bottom: 1px solid #f3f4f6;
	}
	.validation {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}
	.validation-input {
		margin: 1rem 0;
	}
	.input-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}
	.input-row input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
	}
	button {
		padding: 0.5rem 1rem;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
	}
	button:hover {
		background: #2563eb;
	}
	.validation-result {
		margin-top: 1rem;
		padding: 1rem;
		border-radius: 6px;
	}
	.validation-result.valid {
		background: #d1fae5;
		border: 1px solid #10b981;
	}
	.validation-result.invalid {
		background: #fee2e2;
		border: 1px solid #dc2626;
	}
	.error {
		color: #dc2626;
	}
	.warning {
		color: #f59e0b;
	}
</style>