<script lang="ts">
	import type { IntelligenceSystem, SystemStatus } from '$lib/types';

	let systemStatus = $state<Record<string, SystemStatus>>({
		'report-intelligence': { status: 'active', health: 'healthy', lastUpdated: new Date() },
		'content-intelligence': { status: 'active', health: 'healthy', lastUpdated: new Date() },
		'unified-editor': { status: 'active', health: 'healthy', lastUpdated: new Date() },
		'global-assistant': { status: 'active', health: 'healthy', lastUpdated: new Date() },
		'extended-intelligence': { status: 'active', health: 'healthy', lastUpdated: new Date() },
		'system-management': { status: 'active', health: 'healthy', lastUpdated: new Date() },
		'navigation': { status: 'active', health: 'healthy', lastUpdated: new Date() },
		'copilot': { status: 'active', health: 'healthy', lastUpdated: new Date() },
		'ask-oscar': { status: 'active', health: 'healthy', lastUpdated: new Date() },
		'document-explorer': { status: 'active', health: 'healthy', lastUpdated: new Date() },
		'project-navigator': { status: 'active', health: 'healthy', lastUpdated: new Date() },
		'unified-search': { status: 'inactive', health: 'unknown', lastUpdated: new Date() },
		'collaboration': { status: 'inactive', health: 'unknown', lastUpdated: new Date() },
		'validation': { status: 'active', health: 'warning', lastUpdated: new Date() }
	});

	let selectedSystem = $state<string | null>(null);
	let showDetails = $state(false);

	function getStatusColor(status: string): string {
		switch (status) {
			case 'active': return 'bg-green-100 text-green-800';
			case 'inactive': return 'bg-gray-100 text-gray-800';
			case 'error': return 'bg-red-100 text-red-800';
			case 'warning': return 'bg-yellow-100 text-yellow-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function getHealthColor(health: string): string {
		switch (health) {
			case 'healthy': return 'text-green-600';
			case 'warning': return 'text-yellow-600';
			case 'critical': return 'text-red-600';
			case 'unknown': return 'text-gray-600';
			default: return 'text-gray-600';
		}
	}

	function getHealthIcon(health: string): string {
		switch (health) {
			case 'healthy': return '✓';
			case 'warning': return '⚠';
			case 'critical': return '✗';
			case 'unknown': return '?';
			default: return '?';
		}
	}

	function formatTime(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		
		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
		return `${Math.floor(diffMins / 1440)}d ago`;
	}

	function toggleSystemDetails(systemName: string) {
		if (selectedSystem === systemName) {
			selectedSystem = null;
			showDetails = false;
		} else {
			selectedSystem = systemName;
			showDetails = true;
		}
	}

	function getSystemDescription(systemName: string): string {
		const descriptions: Record<string, string> = {
			'report-intelligence': 'Processes and analyzes arboricultural reports using AI-powered intelligence',
			'content-intelligence': 'Manages content intelligence and document processing',
			'unified-editor': 'Provides unified editing experience across all document types',
			'global-assistant': 'AI-powered assistant for all system interactions',
			'extended-intelligence': 'Extended intelligence capabilities for advanced analysis',
			'system-management': 'Manages system configuration and health monitoring',
			'navigation': 'Handles application navigation and routing',
			'copilot': 'Real-time assistance and guidance features',
			'ask-oscar': 'Natural language interface for system interactions',
			'document-explorer': 'Hierarchical document management and exploration',
			'project-navigator': 'Project management and navigation interface',
			'unified-search': 'Comprehensive search across all system content',
			'collaboration': 'Real-time collaboration and team features',
			'validation': 'Data validation and error handling systems'
		};
		return descriptions[systemName] || 'System component';
	}

	function getSystemMetrics(systemName: string): Record<string, any> {
		const metrics: Record<string, Record<string, any>> = {
			'report-intelligence': {
				'reportsProcessed': 1247,
				'accuracy': '94.2%',
				'avgProcessing': '2.3s'
			},
			'content-intelligence': {
				'documentsProcessed': 3421,
				'contentScore': '87.5%',
				'processingRate': '1.8s'
			},
			'unified-editor': {
				'activeUsers': 23,
				'documentsEdited': 892,
				'collaborationScore': '92.1%'
			},
			'global-assistant': {
				'queriesAnswered': 5678,
				'satisfaction': '96.3%',
				'responseTime': '1.2s'
			},
			'extended-intelligence': {
				'analyticalTasks': 432,
				'insightsGenerated': 2156,
				'accuracy': '89.7%'
			},
			'system-management': {
				'uptime': '99.9%',
				'alerts': 2,
				'recoveryTime': '5.2s'
			},
			'navigation': {
				'routesAccessed': 8923,
				'avgLoadTime': '0.8s',
				'errorRate': '0.1%'
			},
			'copilot': {
				'suggestionsMade': 1234,
				'acceptanceRate': '78.9%',
				'efficiency': '85.2%'
			},
			'ask-oscar': {
				'questionsAnswered': 2341,
				'understanding': '94.7%',
				'responseTime': '1.5s'
			},
			'document-explorer': {
				'documentsIndexed': 5678,
				'searchSpeed': '0.3s',
				'accuracy': '98.2%'
			},
			'project-navigator': {
				'projectsTracked': 145,
				'activeUsers': 34,
				'completionRate': '76.8%'
			},
			'unified-search': {
				'queries': 0,
				'results': 0,
				'coverage': '0%'
			},
			'collaboration': {
				'activeSessions': 0,
				'participants': 0,
				'features': 'Disabled'
			},
			'validation': {
				'errorsDetected': 23,
				'validationRate': '99.8%',
				'recoveryRate': '87.3%'
			}
		};
		return metrics[systemName] || {};
	}
</script>

<div class="system-status-indicator">
	<div class="status-header">
		<h3>🔧 System Status</h3>
		<div class="system-overview">
			<div class="overview-item">
				<span class="overview-label">Active:</span>
				<span class="overview-value active">{Object.values(systemStatus).filter(s => s.status === 'active').length}</span>
			</div>
			<div class="overview-item">
				<span class="overview-label">Inactive:</span>
				<span class="overview-value inactive">{Object.values(systemStatus).filter(s => s.status === 'inactive').length}</span>
			</div>
			<div class="overview-item">
				<span class="overview-label">Warnings:</span>
				<span class="overview-value warning">{Object.values(systemStatus).filter(s => s.status === 'warning').length}</span>
			</div>
			<div class="overview-item">
				<span class="overview-label">Errors:</span>
				<span class="overview-value error">{Object.values(systemStatus).filter(s => s.status === 'error').length}</span>
			</div>
		</div>
	</div>

	<div class="systems-grid">
		{#each Object.entries(systemStatus) as [systemName, status]}
			<div class="system-card" 
				onclick={() => toggleSystemDetails(systemName)}
				class:selected={selectedSystem === systemName}>
				<div class="system-header">
					<div class="system-name">{systemName.replace(/-/g, ' ')}</div>
					<div class="system-status">
						<span class={`status-badge ${getStatusColor(status.status)}`}>
							{status.status}
						</span>
					</div>
				</div>
				
				<div class="system-health">
					<span class={`health-indicator ${getHealthColor(status.health)}`}>
						{getHealthIcon(status.health)} {status.health}
					</span>
					<span class="last-updated">
						{formatTime(status.lastUpdated)}
					</span>
				</div>
			</div>
		{/each}
	</div>

	{#if selectedSystem && showDetails}
		<div class="system-details" class:expanded>
			<div class="details-header">
				<h4>{selectedSystem.replace(/-/g, ' ')}</h4>
				<button class="close-btn" onclick={() => { selectedSystem = null; showDetails = false; }}>✕</button>
			</div>
			
			<div class="details-content">
				<div class="details-section">
					<h5>Description</h5>
					<p>{getSystemDescription(selectedSystem)}</p>
				</div>
				
				<div class="details-section">
					<h5>Current Status</h5>
					<div class="status-details">
						<div class="status-item">
							<span class="status-label">Status:</span>
							<span class={`status-value ${getStatusColor(systemStatus[selectedSystem].status)}`}>
								{systemStatus[selectedSystem].status}
							</span>
						</div>
						<div class="status-item">
							<span class="status-label">Health:</span>
							<span class={`status-value ${getHealthColor(systemStatus[selectedSystem].health)}`}>
								{getHealthIcon(systemStatus[selectedSystem].health)} {systemStatus[selectedSystem].health}
							</span>
						</div>
						<div class="status-item">
							<span class="status-label">Last Updated:</span>
							<span class="status-value">
								{formatTime(systemStatus[selectedSystem].lastUpdated)}
							</span>
						</div>
					</div>
				</div>
				
				<div class="details-section">
					<h5>System Metrics</h5>
					<div class="metrics-grid">
						{#each Object.entries(getSystemMetrics(selectedSystem)) as [key, value]}
							<div class="metric-item">
								<span class="metric-label">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
								<span class="metric-value">{value}</span>
							</div>
						{/each}
					</div>
				</div>
				
				<div class="details-actions">
					<button class="btn-primary">View Logs</button>
					<button class="btn-secondary">Refresh Status</button>
					<button class="btn-secondary">System Settings</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
.system-status-indicator {
	background: white;
	border-radius: 0.75rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	border: 1px solid #e5e7eb;
	overflow: hidden;
}

.status-header {
	padding: 1rem;
	border-bottom: 1px solid #e5e7eb;
	background: #f9fafb;
}

.status-header h3 {
	margin: 0;
	font-size: 1rem;
	font-weight: 600;
	color: #111827;
}

.system-overview {
	display: flex;
	gap: 1rem;
	margin-top: 0.75rem;
	flex-wrap: wrap;
}

.overview-item {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	font-size: 0.875rem;
}

.overview-label {
	color: #6b7280;
}

.overview-value {
	font-weight: 500;
	padding: 0.125rem 0.375rem;
	border-radius: 0.125rem;
	font-size: 0.75rem;
}

.overview-value.active {
	background: #dcfce7;
	color: #166534;
}

.overview-value.inactive {
	background: #f3f4f6;
	color: #374151;
}

.overview-value.warning {
	background: #fef3c7;
	color: #92400e;
}

.overview-value.error {
	background: #fee2e2;
	color: #991b1b;
}

.systems-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 0.75rem;
	padding: 1rem;
}

.system-card {
	background: white;
	border: 1px solid #e5e7eb;
	border-radius: 0.5rem;
	padding: 0.75rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.system-card:hover {
	border-color: #3b82f6;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.system-card.selected {
	border-color: #3b82f6;
	background: #eff6ff;
}

.system-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 0.5rem;
}

.system-name {
	font-size: 0.875rem;
	font-weight: 600;
	color: #111827;
	flex: 1;
	margin-right: 0.5rem;
}

.system-status {
	flex-shrink: 0;
}

.status-badge {
	padding: 0.125rem 0.25rem;
	border-radius: 0.125rem;
	font-size: 0.625rem;
	font-weight: 500;
}

.system-health {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 0.75rem;
	color: #6b7280;
}

.health-indicator {
	font-weight: 500;
}

.last-updated {
	font-size: 0.625rem;
}

.system-details {
	margin-top: 1rem;
	padding: 1rem;
	border: 1px solid #e5e7eb;
	border-radius: 0.5rem;
	background: #f9fafb;
}

.system-details.expanded {
	border: 2px solid #3b82f6;
	background: white;
}

.details-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

.details-header h4 {
	margin: 0;
	font-size: 1rem;
	font-weight: 600;
	color: #111827;
}

.close-btn {
	background: none;
	border: none;
	font-size: 1rem;
	cursor: pointer;
	color: #6b7280;
	padding: 0.25rem;
	border-radius: 0.25rem;
	transition: background-color 0.2s ease;
}

.close-btn:hover {
	background: #e5e7eb;
}

.details-section {
	margin-bottom: 1rem;
}

.details-section h5 {
	margin: 0 0 0.5rem 0;
	font-size: 0.875rem;
	font-weight: 600;
	color: #374151;
}

.details-section p {
	margin: 0;
	font-size: 0.875rem;
	color: #374151;
	line-height: 1.4;
}

.status-details {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.status-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.status-label {
	font-size: 0.75rem;
	color: #6b7280;
}

.status-value {
	font-size: 0.75rem;
	font-weight: 500;
}

.metrics-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 0.5rem;
}

.metric-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 0.75rem;
}

.metric-label {
	color: #6b7280;
}

.metric-value {
	font-weight: 500;
	color: #111827;
}

.details-actions {
	display: flex;
	gap: 0.5rem;
	margin-top: 1rem;
}

.btn-primary, .btn-secondary {
	padding: 0.5rem 1rem;
	border-radius: 0.375rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	border: none;
	font-size: 0.75rem;
}

.btn-primary {
	background: #3b82f6;
	color: white;
}

.btn-primary:hover {
	background: #2563eb;
}

.btn-secondary {
	background: #f3f4f6;
	color: #374151;
	border: 1px solid #d1d5db;
}

.btn-secondary:hover {
	background: #e5e7eb;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
	.system-overview {
		flex-direction: column;
		gap: 0.5rem;
	}

	.systems-grid {
		grid-template-columns: 1fr;
		gap: 0.5rem;
		padding: 0.75rem;
	}

	.system-card {
		padding: 0.5rem;
	}

	.metrics-grid {
		grid-template-columns: 1fr;
	}

	.details-actions {
		flex-direction: column;
	}

	.btn-primary, .btn-secondary {
		width: 100%;
	}
}
</style>