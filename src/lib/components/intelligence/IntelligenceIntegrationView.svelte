<script lang="ts">
	export let phaseCount = 0;
</script>

<div class="integration-view">
	<div class="integration-status">
		<div class="status-card connected">
			<div class="status-icon">✅</div>
			<div class="status-info">
				<h4>Phase Files Integrated</h4>
				<p>All {phaseCount} phase files loaded</p>
			</div>
		</div>
		
		<div class="status-card active">
			<div class="status-icon">⚡</div>
			<div class="status-info">
				<h4>Report Engines Active</h4>
				<p>8 of 8 engines running</p>
			</div>
		</div>
		
		<div class="status-card ready">
			<div class="status-icon">🚀</div>
			<div class="status-info">
				<h4>System Ready</h4>
				<p>All intelligence layers operational</p>
			</div>
		</div>
	</div>
	
	<div class="integration-actions">
		<h4>Integration Actions</h4>
		<div class="action-buttons">
			<button class="action-button primary">Validate Integration</button>
			<button class="action-button secondary">Run Full Test Suite</button>
			<button class="action-button tertiary">Export Configuration</button>
		</div>
	</div>
	
	<div class="integration-logs">
		<h4>Recent Integration Logs</h4>
		<div class="log-entries">
			<div class="log-entry success">
				<div class="log-time">19:08:42</div>
				<div class="log-message">Phase files loaded successfully</div>
			</div>
			<div class="log-entry info">
				<div class="log-time">19:08:15</div>
				<div class="log-message">Report decompiler engine initialized</div>
			</div>
			<div class="log-entry success">
				<div class="log-time">19:07:58</div>
				<div class="log-message">Schema mapper connected to database</div>
			</div>
			<div class="log-entry warning">
				<div class="log-time">19:07:23</div>
				<div class="log-message">Style learner cache warming up</div>
			</div>
		</div>
	</div>
</div>

<style>
	.integration-view {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.integration-status {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.status-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.status-card.connected {
		border-left: 4px solid #10b981;
	}

	.status-card.active {
		border-left: 4px solid #3b82f6;
	}

	.status-card.ready {
		border-left: 4px solid #f59e0b;
	}

	.status-icon {
		font-size: 1.5rem;
	}

	.status-info h4 {
		margin: 0 0 0.25rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}

	.status-info p {
		margin: 0;
		font-size: 0.75rem;
		color: #6b7280;
	}

	.integration-actions h4 {
		margin: 0 0 0.75rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}

	.action-buttons {
		display: flex;
		gap: 0.75rem;
	}

	.action-button.primary {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.action-button.secondary {
		background: white;
		color: #374151;
		border-color: #d1d5db;
	}

	.action-button.tertiary {
		background: #f3f4f6;
		color: #374151;
		border-color: #d1d5db;
	}

	.action-button {
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.action-button:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	.integration-logs h4 {
		margin: 0 0 0.75rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}

	.log-entries {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 0.75rem;
		max-height: 200px;
		overflow-y: auto;
	}

	.log-entry {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		border-bottom: 1px solid #f3f4f6;
	}

	.log-entry:last-child {
		border-bottom: none;
	}

	.log-time {
		font-size: 0.75rem;
		color: #6b7280;
		min-width: 60px;
	}

	.log-message {
		font-size: 0.75rem;
		color: #374151;
		flex: 1;
	}

	.log-entry.success .log-message {
		color: #065f46;
	}

	.log-entry.info .log-message {
		color: #1e40af;
	}

	.log-entry.warning .log-message {
		color: #92400e;
	}
</style>