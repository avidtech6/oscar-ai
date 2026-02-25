/**
 * Memory System Integration Test
 * 
 * Tests the complete memory system integration including:
 * - Memory engine operations
 * - Style learning engine
 * - Client profile engine
 * - Thread memory engine
 * - Document memory engine
 * - UI hooks integration
 */

import { MemoryEngine } from './memoryEngine';
import { MemorySelectors } from './memorySelectors';
import { StyleEngine } from './styleEngine';
import { ClientEngine } from './clientEngine';
import { ThreadEngine } from './threadEngine';
import { DocumentEngine } from './documentEngine';
import { memoryUI, clientProfileStore, styleProfileStore, threadMemoryStore, documentMemoryStore } from './memoryUI';

/**
 * Integration Test Suite
 */
async function runIntegrationTests() {
	console.log('=== Memory System Integration Tests ===\n');
	
	let passed = 0;
	let failed = 0;
	
	// Test 1: Memory Engine Basic Operations
	console.log('Test 1: Memory Engine Basic Operations');
	try {
		const memoryEngine = new MemoryEngine();
		
		// Write a memory
		const memoryItem = await memoryEngine.writeMemory(
			'email',
			'user-action',
			{ subject: 'Test Email', body: 'This is a test email content.' },
			'Test email memory',
			{
				tags: ['test', 'email', 'integration'],
				importance: 50,
				confidence: 80
			}
		);
		
		console.log(`✓ Memory written with ID: ${memoryItem.id}`);
		
		// Read the memory
		const memory = await memoryEngine.readMemory(memoryItem.id);
		if (!memory) {
			throw new Error('Memory not found after writing');
		}
		
		console.log(`✓ Memory read successfully: ${memory.summary}`);
		
		// Query memories
		const queryResult = await memoryEngine.queryMemories({
			category: ['email'],
			limit: 10
		});
		
		console.log(`✓ Query returned ${queryResult.items.length} memories`);
		
		// Delete the memory
		await memoryEngine.deleteMemory(memoryItem.id);
		console.log('✓ Memory deleted successfully');
		
		passed++;
	} catch (error) {
		console.error(`✗ Test 1 failed: ${error}`);
		failed++;
	}
	
	// Test 2: Style Learning Engine
	console.log('\nTest 2: Style Learning Engine');
	try {
		const styleEngine = new StyleEngine();
		
		// Analyze text
		const analysis = styleEngine.analyzeText(
			'Dear Team, I hope this email finds you well. I wanted to discuss the project timeline and budget requirements. Please let me know your availability for a meeting next week. Best regards, John',
			'client-communication'
		);
		
		console.log(`✓ Text analyzed: ${analysis.tone} tone, ${analysis.toneConfidence}% confidence`);
		
		// Update style profile
		const profile = await styleEngine.updateStyleProfile(
			'test-user',
			'Hello team, great work on the project! The implementation looks solid and the architecture is well-designed. Looking forward to the next phase.',
			'internal'
		);
		
		console.log(`✓ Style profile updated: ${profile.learning.samplesAnalyzed} samples analyzed`);
		
		// Get style profile
		const retrievedProfile = await styleEngine.getStyleProfile('test-user');
		if (!retrievedProfile) {
			throw new Error('Style profile not found after update');
		}
		
		console.log(`✓ Style profile retrieved: ${retrievedProfile.tone.overall} tone`);
		
		passed++;
	} catch (error) {
		console.error(`✗ Test 2 failed: ${error}`);
		failed++;
	}
	
	// Test 3: Client Profile Engine
	console.log('\nTest 3: Client Profile Engine');
	try {
		const clientEngine = new ClientEngine();
		
		// Update client profile with interaction
		const clientProfile = await clientEngine.updateClientProfile(
			'test-client-123',
			{
				type: 'email',
				content: {
					subject: 'Project Update',
					body: 'The project is progressing well. We have completed phase 1 and are moving to phase 2.',
					sentiment: 'positive'
				},
				summary: 'Positive project update email',
				sentiment: 'positive'
			}
		);
		
		console.log(`✓ Client profile updated for: ${clientProfile.clientId}`);
		
		// Get client profile
		const retrievedClient = await clientEngine.getClientProfile('test-client-123');
		if (!retrievedClient) {
			throw new Error('Client profile not found after update');
		}
		
		console.log(`✓ Client profile retrieved: ${retrievedClient.clientId}`);
		
		// Get communication suggestions
		const suggestions = await clientEngine.suggestCommunicationApproach('test-client-123', 'email');
		console.log(`✓ Communication suggestions: ${suggestions.length} suggestions generated`);
		
		passed++;
	} catch (error) {
		console.error(`✗ Test 3 failed: ${error}`);
		failed++;
	}
	
	// Test 4: Thread Memory Engine
	console.log('\nTest 4: Thread Memory Engine');
	try {
		const threadEngine = new ThreadEngine();
		
		// Update thread with message
		const threadSummary = await threadEngine.updateThread(
			'test-thread-456',
			{
				type: 'email',
				content: {
					subject: 'Meeting Follow-up',
					body: 'Following up on our meeting yesterday. Here are the action items we discussed.',
					actionItems: ['Complete design mockups', 'Schedule technical review']
				},
				summary: 'Meeting follow-up email with action items',
				sender: 'john@example.com',
				recipients: ['team@example.com'],
				sentiment: 'positive'
			}
		);
		
		console.log(`✓ Thread updated: ${threadSummary.title}`);
		
		// Get thread summary
		const retrievedThread = await threadEngine.getThreadSummary('test-thread-456');
		if (!retrievedThread) {
			throw new Error('Thread summary not found after update');
		}
		
		console.log(`✓ Thread summary retrieved: ${retrievedThread.threadId}`);
		
		// Get thread suggestions
		const threadSuggestions = await threadEngine.suggestThreadContinuation('test-thread-456', 'email');
		console.log(`✓ Thread suggestions: ${threadSuggestions.length} suggestions generated`);
		
		passed++;
	} catch (error) {
		console.error(`✗ Test 4 failed: ${error}`);
		failed++;
	}
	
	// Test 5: Document Memory Engine
	console.log('\nTest 5: Document Memory Engine');
	try {
		const documentEngine = new DocumentEngine();
		
		// Update document
		const documentSummary = await documentEngine.updateDocument(
			'test-doc-789',
			{
				type: 'report',
				title: 'Q1 Project Report',
				content: {
					body: 'This report summarizes the Q1 project progress. Key findings include successful completion of phase 1 and positive client feedback. Recommendations for Q2 include expanding the team and increasing budget allocation.',
					sections: ['Executive Summary', 'Key Findings', 'Recommendations']
				},
				summary: 'Q1 project report with findings and recommendations',
				author: 'Jane Smith',
				version: 1.0
			}
		);
		
		console.log(`✓ Document updated: ${documentSummary.title}`);
		
		// Get document summary
		const retrievedDoc = await documentEngine.getDocumentSummary('test-doc-789');
		if (!retrievedDoc) {
			throw new Error('Document summary not found after update');
		}
		
		console.log(`✓ Document summary retrieved: ${retrievedDoc.documentId}`);
		
		// Get document suggestions
		const docSuggestions = await documentEngine.suggestDocumentImprovements('test-doc-789', 'all');
		console.log(`✓ Document suggestions: ${docSuggestions.length} suggestions generated`);
		
		passed++;
	} catch (error) {
		console.error(`✗ Test 5 failed: ${error}`);
		failed++;
	}
	
	// Test 6: UI Hooks Integration
	console.log('\nTest 6: UI Hooks Integration');
	try {
		// Test memory UI store
		await memoryUI.loadRecentMemories(5);
		console.log('✓ Memory UI store loaded recent memories');
		
		// Test client profile store
		await clientProfileStore.getClientProfile('test-client-123');
		console.log('✓ Client profile store accessed');
		
		// Test style profile store
		await styleProfileStore.loadStyleProfile('test-user');
		console.log('✓ Style profile store loaded');
		
		// Test thread memory store
		await threadMemoryStore.getThreadSummary('test-thread-456');
		console.log('✓ Thread memory store accessed');
		
		// Test document memory store
		await documentMemoryStore.getDocumentSummary('test-doc-789');
		console.log('✓ Document memory store accessed');
		
		// Test memory statistics
		console.log('✓ All UI hooks integrated successfully');
		
		passed++;
	} catch (error) {
		console.error(`✗ Test 6 failed: ${error}`);
		failed++;
	}
	
	// Test 7: Memory Selectors
	console.log('\nTest 7: Memory Selectors');
	try {
		const memoryEngine = new MemoryEngine();
		const memorySelectors = new MemorySelectors({ memoryEngine });
		
		// Write some test memories
		await memoryEngine.writeMemory(
			'email',
			'user-action',
			{ subject: 'Test Selector 1', body: 'Content for selector test 1' },
			'Test memory for selectors 1',
			{ tags: ['test', 'selector'], importance: 60 }
		);
		
		await memoryEngine.writeMemory(
			'client',
			'user-action',
			{ clientId: 'test-client-selector', interaction: 'initial contact' },
			'Client interaction for selector test',
			{ tags: ['test', 'client'], importance: 70 }
		);
		
		// Test getRecentMemories
		const recentMemories = await memorySelectors.getRecentMemories(5);
		console.log(`✓ Recent memories retrieved: ${recentMemories.length} memories`);
		
		// Test searchMemory
		const searchResults = await memorySelectors.searchMemory('test', 5);
		console.log(`✓ Memory search results: ${searchResults.length} matches`);
		
		// Test getClientProfile (should return null for non-existent client)
		const nonExistentProfile = await memorySelectors.getClientProfile('non-existent-client');
		if (nonExistentProfile !== null) {
			throw new Error('Expected null for non-existent client profile');
		}
		console.log('✓ Client profile selector works correctly');
		
		passed++;
	} catch (error) {
		console.error(`✗ Test 7 failed: ${error}`);
		failed++;
	}
	
	// Test 8: Cross-Engine Integration
	console.log('\nTest 8: Cross-Engine Integration');
	try {
		// Create engines with shared memory engine
		const memoryEngine = new MemoryEngine();
		const styleEngine = new StyleEngine({ memoryEngine });
		const clientEngine = new ClientEngine({ memoryEngine });
		
		// Write a memory that should be accessible by multiple engines
		const crossEngineMemory = await memoryEngine.writeMemory(
			'email',
			'user-action',
			{
				subject: 'Cross-engine Test',
				body: 'This email tests cross-engine integration.',
				clientId: 'cross-engine-client',
				sender: 'test@example.com'
			},
			'Cross-engine integration test email',
			{
				tags: ['integration', 'cross-engine', 'test'],
				importance: 80,
				confidence: 90
			}
		);
		
		console.log(`✓ Cross-engine memory written: ${crossEngineMemory.id}`);
		
		// Style engine should be able to analyze this
		const memory = await memoryEngine.readMemory(crossEngineMemory.id);
		if (memory) {
			const styleAnalysis = styleEngine.analyzeText(memory.summary + ' ' + JSON.stringify(memory.content));
			console.log(`✓ Style engine analyzed cross-engine memory: ${styleAnalysis.tone} tone`);
		}
		
		// Client engine should be able to process this
		await clientEngine.updateClientProfile(
			'cross-engine-client',
			{
				type: 'email',
				content: { subject: 'Cross-engine', body: 'Test content' },
				summary: 'Cross-engine test interaction'
			}
		);
		
		console.log('✓ Client engine processed cross-engine memory');
		
		// Clean up
		await memoryEngine.deleteMemory(crossEngineMemory.id);
		console.log('✓ Cross-engine memory cleaned up');
		
		passed++;
	} catch (error) {
		console.error(`✗ Test 8 failed: ${error}`);
		failed++;
	}
	
	// Summary
	console.log('\n=== Test Summary ===');
	console.log(`Total Tests: ${passed + failed}`);
	console.log(`Passed: ${passed}`);
	console.log(`Failed: ${failed}`);
	
	if (failed === 0) {
		console.log('\n✅ All integration tests passed!');
	} else {
		console.log(`\n❌ ${failed} test(s) failed.`);
	}
	
	return failed === 0;
}

/**
 * Run cleanup after tests
 */
async function cleanupTestData() {
	console.log('\n=== Cleaning up test data ===');
	
	try {
		const memoryEngine = new MemoryEngine();
		
		// Query and delete test memories
		const testMemories = await memoryEngine.queryMemories({
			tags: ['test', 'integration', 'cross-engine', 'selector'],
			limit: 100
		});
		
		for (const memory of testMemories.items) {
			await memoryEngine.deleteMemory(memory.id);
		}
		
		console.log(`✓ Cleaned up ${testMemories.items.length} test memories`);
	} catch (error) {
		console.error(`✗ Cleanup failed: ${error}`);
	}
}

/**
 * Main test runner
 */
async function main() {
	console.log('Starting Memory System Integration Tests...\n');
	
	try {
		const success = await runIntegrationTests();
		
		// Always run cleanup
		await cleanupTestData();
		
		if (success) {
			console.log('\n🎉 Memory system integration tests completed successfully!');
			process.exit(0);
		} else {
			console.log('\n⚠️  Memory system integration tests completed with failures.');
			process.exit(1);
		}
	} catch (error) {
		console.error('\n❌ Test runner error:', error);
		await cleanupTestData();
		process.exit(1);
	}
}

// Run tests if this file is executed directly
if (require.main === module) {
	main().catch(error => {
		console.error('Unhandled error in test runner:', error);
		process.exit(1);
	});
}

export { runIntegrationTests, cleanupTestData };