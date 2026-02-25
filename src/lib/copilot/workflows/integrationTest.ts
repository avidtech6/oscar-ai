/**
 * Workflow Integration Test
 * 
 * A simple integration test that demonstrates the workflow system
 * without requiring external test frameworks.
 */

import { WorkflowEngine } from './workflowEngine';
import { WorkflowRegistry } from './workflowRegistry';
import { WorkflowStateManager, InMemoryWorkflowStorage } from './workflowState';
import { CopilotOrchestrator } from '../orchestrator/orchestrator';
import { workflowUI, initializeWorkflowUI } from './uiIntegration';

// Import the actual ScreenType from contextTypes
import type { CopilotContext, ScreenType } from '../context/contextTypes';

// Create proper mock context
const mockContext: CopilotContext = {
	ui: {
		currentScreen: 'settings' as ScreenType,
		contextPanelOpen: false,
		assistLayerOpen: false,
		smartShareActive: false,
		isComposing: false,
		isViewingCampaign: false,
		deliverabilityWarningsVisible: false,
		lastUpdated: new Date()
	},
	navigationHistory: ['settings' as ScreenType],
	hintPreferences: {
		showTechnicalHints: true,
		showSmartSharePrompts: true,
		showDeliverabilityWarnings: true
	}
};

/**
 * Run integration tests
 */
export async function runWorkflowIntegrationTests(): Promise<{
	success: boolean;
	tests: Array<{ name: string; passed: boolean; error?: string }>;
}> {
	const tests: Array<{ name: string; passed: boolean; error?: string }> = [];
	
	try {
		console.log('🚀 Starting Workflow Integration Tests...\n');
		
		// Test 1: Workflow Registry
		console.log('📋 Test 1: Workflow Registry');
		const workflowRegistry = new WorkflowRegistry();
		const allWorkflows = workflowRegistry.getAllWorkflows();
		console.log(`  ✓ Found ${allWorkflows.length} workflows`);
		
		const providerSetupWorkflow = workflowRegistry.getWorkflow('provider_setup');
		if (providerSetupWorkflow) {
			console.log(`  ✓ Found provider_setup workflow with ${providerSetupWorkflow.steps.length} steps`);
			tests.push({ name: 'Workflow Registry - Get workflow by ID', passed: true });
		} else {
			tests.push({ name: 'Workflow Registry - Get workflow by ID', passed: false, error: 'Could not find provider_setup workflow' });
		}
		
		// Test 2: Workflow Engine
		console.log('\n⚙️ Test 2: Workflow Engine');
		const workflowEngine = new WorkflowEngine({
			maxConcurrentWorkflows: 2,
			autoStartMatchingWorkflows: false
		});
		
		const workflowInstance = await workflowEngine.startWorkflow('provider_setup', mockContext);
		console.log(`  ✓ Started workflow: ${workflowInstance.id}`);
		
		const activeWorkflows = workflowEngine.getActiveWorkflows();
		console.log(`  ✓ Active workflows: ${activeWorkflows.length}`);
		
		if (activeWorkflows.length === 1) {
			tests.push({ name: 'Workflow Engine - Start workflow', passed: true });
		} else {
			tests.push({ name: 'Workflow Engine - Start workflow', passed: false, error: `Expected 1 active workflow, got ${activeWorkflows.length}` });
		}
		
		// Test 3: Workflow State Management
		console.log('\n💾 Test 3: Workflow State Management');
		const workflowStateManager = new WorkflowStateManager(new InMemoryWorkflowStorage());
		
		const stateWorkflowInstance = await workflowStateManager.createWorkflowInstance(
			'provider_setup',
			mockContext,
			'test-user'
		);
		console.log(`  ✓ Created workflow instance: ${stateWorkflowInstance.id}`);
		
		await workflowStateManager.startWorkflow(stateWorkflowInstance.id, 'step-1');
		const startedWorkflow = await workflowStateManager.getWorkflow(stateWorkflowInstance.id);
		
		if (startedWorkflow?.status === 'active') {
			console.log(`  ✓ Workflow started successfully`);
			tests.push({ name: 'Workflow State - Start workflow', passed: true });
		} else {
			tests.push({ name: 'Workflow State - Start workflow', passed: false, error: `Workflow status is ${startedWorkflow?.status}, expected active` });
		}
		
		// Test 4: Orchestrator Integration
		console.log('\n🎛️ Test 4: Orchestrator Integration');
		const orchestrator = new CopilotOrchestrator({
			enableWorkflowAutomation: true,
			autoStartMatchingWorkflows: false,
			maxConcurrentWorkflows: 2
		});
		
		const orchestratorWorkflow = await orchestrator.startWorkflow('provider_setup');
		console.log(`  ✓ Orchestrator started workflow: ${orchestratorWorkflow.id}`);
		
		const orchestratorActiveWorkflows = orchestrator.getActiveWorkflows();
		console.log(`  ✓ Orchestrator active workflows: ${orchestratorActiveWorkflows.length}`);
		
		if (orchestratorActiveWorkflows.length === 1) {
			tests.push({ name: 'Orchestrator - Start workflow', passed: true });
		} else {
			tests.push({ name: 'Orchestrator - Start workflow', passed: false, error: `Expected 1 active workflow, got ${orchestratorActiveWorkflows.length}` });
		}
		
		// Test 5: UI Integration
		console.log('\n🎨 Test 5: UI Integration');
		initializeWorkflowUI();
		
		await workflowUI.loadSuggestedWorkflows(mockContext);
		console.log(`  ✓ Loaded suggested workflows`);
		
		const uiWorkflow = await workflowUI.startWorkflow('provider_setup');
		if (uiWorkflow) {
			console.log(`  ✓ UI started workflow: ${uiWorkflow.id}`);
			tests.push({ name: 'UI Integration - Start workflow', passed: true });
		} else {
			tests.push({ name: 'UI Integration - Start workflow', passed: false, error: 'Failed to start workflow via UI' });
		}
		
		// Test 6: Workflow Lifecycle
		console.log('\n🔄 Test 6: Workflow Lifecycle');
		const lifecycleWorkflow = await workflowEngine.startWorkflow('deliverability_repair', mockContext);
		
		// Pause
		workflowEngine.pauseWorkflow(lifecycleWorkflow.id);
		const pausedWorkflows = workflowEngine.getPausedWorkflows();
		console.log(`  ✓ Paused workflow, paused count: ${pausedWorkflows.length}`);
		
		// Resume
		workflowEngine.resumeWorkflow(lifecycleWorkflow.id);
		const resumedActiveWorkflows = workflowEngine.getActiveWorkflows();
		console.log(`  ✓ Resumed workflow, active count: ${resumedActiveWorkflows.length}`);
		
		// Cancel
		workflowEngine.cancelWorkflow(lifecycleWorkflow.id);
		const completedWorkflows = workflowEngine.getCompletedWorkflows();
		console.log(`  ✓ Cancelled workflow, completed count: ${completedWorkflows.length}`);
		
		if (pausedWorkflows.length === 1 && resumedActiveWorkflows.length === 1 && completedWorkflows.length === 1) {
			tests.push({ name: 'Workflow Lifecycle - Pause/Resume/Cancel', passed: true });
		} else {
			tests.push({ 
				name: 'Workflow Lifecycle - Pause/Resume/Cancel', 
				passed: false, 
				error: `Paused: ${pausedWorkflows.length}, Active: ${resumedActiveWorkflows.length}, Completed: ${completedWorkflows.length}` 
			});
		}
		
		// Test 7: Workflow Statistics
		console.log('\n📊 Test 7: Workflow Statistics');
		const registryStats = workflowRegistry.getStatistics();
		console.log(`  ✓ Registry stats: ${registryStats.totalWorkflows} total workflows`);
		
		const stateStats = await workflowStateManager.getStatistics();
		console.log(`  ✓ State stats: ${stateStats.total} total workflows`);
		
		const orchestratorStats = orchestrator.getWorkflowStatistics();
		console.log(`  ✓ Orchestrator stats: ${orchestratorStats.totalWorkflows} total workflows`);
		
		if (registryStats.totalWorkflows > 0 && stateStats.total >= 0 && orchestratorStats.totalWorkflows > 0) {
			tests.push({ name: 'Workflow Statistics', passed: true });
		} else {
			tests.push({ 
				name: 'Workflow Statistics', 
				passed: false, 
				error: `Registry: ${registryStats.totalWorkflows}, State: ${stateStats.total}, Orchestrator: ${orchestratorStats.totalWorkflows}` 
			});
		}
		
		// Summary
		console.log('\n📈 Test Summary:');
		const passedTests = tests.filter(t => t.passed).length;
		const totalTests = tests.length;
		
		tests.forEach(test => {
			const status = test.passed ? '✓' : '✗';
			console.log(`  ${status} ${test.name}`);
			if (!test.passed && test.error) {
				console.log(`    Error: ${test.error}`);
			}
		});
		
		console.log(`\n🎯 Results: ${passedTests}/${totalTests} tests passed`);
		
		return {
			success: passedTests === totalTests,
			tests
		};
		
	} catch (error) {
		console.error('\n❌ Integration test failed:', error);
		
		tests.push({
			name: 'Integration Test Suite',
			passed: false,
			error: error instanceof Error ? error.message : String(error)
		});
		
		return {
			success: false,
			tests
		};
	}
}

// Export for manual testing
export default {
	runWorkflowIntegrationTests,
	mockContext
};