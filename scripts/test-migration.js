/**
 * Test script for Storage Migration Service (Phase 5)
 * 
 * This script tests the migration scenarios for localStorage to IndexedDB migration.
 * It simulates different migration scenarios and validates the results.
 */

import { storageMigrationService } from '../src/lib/services/unified/StorageMigrationService.js';
import { db } from '../src/lib/db/index.js';

async function testMigrationScenarios() {
	console.log('=== Testing Storage Migration Scenarios ===\n');

	// Scenario 1: Clean migration (no localStorage data)
	console.log('Scenario 1: Clean migration (no localStorage data)');
	await clearTestData();
	const result1 = await storageMigrationService.migrate();
	console.log(`Result: ${result1.success ? 'SUCCESS' : 'FAILED'}`);
	console.log(`Migrated items:`, result1.migratedItems);
	console.log(`Errors:`, result1.errors);
	console.log(`Warnings:`, result1.warnings);
	console.log();

	// Scenario 2: Migration with dummy data
	console.log('Scenario 2: Migration with dummy data');
	await setupDummyData();
	const result2 = await storageMigrationService.migrate();
	console.log(`Result: ${result2.success ? 'SUCCESS' : 'FAILED'}`);
	console.log(`Migrated items:`, result2.migratedItems);
	console.log(`Errors:`, result2.errors);
	console.log(`Warnings:`, result2.warnings);
	console.log();

	// Scenario 3: Migration validation
	console.log('Scenario 3: Migration validation');
	await validateMigrationResults();
	console.log();

	// Scenario 4: Backup and restore
	console.log('Scenario 4: Backup and restore test');
	await testBackupRestore();
	console.log();

	console.log('=== Migration Testing Complete ===');
}

async function clearTestData() {
	console.log('  Clearing test data...');
	// Clear localStorage test data
	const keys = [
		'oscar_blog_posts',
		'oscar_diagrams',
		'oscar_reports',
		'oscar_chat_context',
		'oscar_migration_completed',
		'oscar_migration_backup',
		'oscar_groq_api_key',
		'oscar_theme',
		'oscar_sidebar_collapsed',
		'oscar_dummy_data_enabled',
		'oscar_current_project_id'
	];
	
	keys.forEach(key => localStorage.removeItem(key));
	
	// Clear IndexedDB test data
	try {
		await db.blogPosts.clear();
		await db.diagrams.clear();
		await db.reports.clear();
		await db.settings.clear();
	} catch (error) {
		console.log(`  Warning: Could not clear IndexedDB: ${error.message}`);
	}
	
	console.log('  Test data cleared.');
}

async function setupDummyData() {
	console.log('  Setting up dummy data...');
	
	// Create dummy blog posts
	const dummyBlogs = [
		{
			projectId: 'test-project-1',
			title: 'Test Blog Post 1',
			subtitle: 'A test blog post',
			bodyHTML: '<p>Test content</p>',
			bodyContent: 'Test content',
			tags: ['test', 'migration'],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			projectId: 'test-project-2',
			title: 'Test Blog Post 2',
			subtitle: 'Another test blog post',
			bodyHTML: '<p>More test content</p>',
			bodyContent: 'More test content',
			tags: ['test'],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}
	];
	localStorage.setItem('oscar_blog_posts', JSON.stringify(dummyBlogs));
	
	// Create dummy diagrams
	const dummyDiagrams = [
		{
			projectId: 'test-project-1',
			title: 'Test Diagram 1',
			type: 'flowchart',
			content: 'graph TD; A-->B;',
			createdAt: new Date().toISOString()
		}
	];
	localStorage.setItem('oscar_diagrams', JSON.stringify(dummyDiagrams));
	
	// Create dummy reports
	const dummyReports = [
		{
			id: 'test-report-1',
			projectId: 'test-project-1',
			type: 'bs5837',
			title: 'Test Report 1',
			content: '<h1>Test Report</h1><p>Test content</p>',
			generatedAt: new Date().toISOString()
		}
	];
	localStorage.setItem('oscar_reports', JSON.stringify(dummyReports));
	
	// Create dummy settings
	localStorage.setItem('oscar_groq_api_key', 'test-api-key-123');
	localStorage.setItem('oscar_theme', 'dark');
	localStorage.setItem('oscar_sidebar_collapsed', 'true');
	localStorage.setItem('oscar_dummy_data_enabled', 'true');
	localStorage.setItem('oscar_current_project_id', 'test-project-1');
	
	console.log('  Dummy data setup complete.');
}

async function validateMigrationResults() {
	console.log('  Validating migration results...');
	
	try {
		// Check if data was migrated to IndexedDB
		const blogCount = await db.blogPosts.count();
		const diagramCount = await db.diagrams.count();
		const reportCount = await db.reports.count();
		const settingsCount = await db.settings.count();
		
		console.log(`  IndexedDB counts:`);
		console.log(`    Blog posts: ${blogCount}`);
		console.log(`    Diagrams: ${diagramCount}`);
		console.log(`    Reports: ${reportCount}`);
		console.log(`    Settings: ${settingsCount}`);
		
		// Check if localStorage was cleaned up
		const hasBlogs = localStorage.getItem('oscar_blog_posts') !== null;
		const hasDiagrams = localStorage.getItem('oscar_diagrams') !== null;
		const hasReports = localStorage.getItem('oscar_reports') !== null;
		
		console.log(`  localStorage cleanup:`);
		console.log(`    Blogs remaining: ${hasBlogs ? 'YES' : 'NO'}`);
		console.log(`    Diagrams remaining: ${hasDiagrams ? 'YES' : 'NO'}`);
		console.log(`    Reports remaining: ${hasReports ? 'YES' : 'NO'}`);
		
		// Check migration marker
		const migrationCompleted = localStorage.getItem('oscar_migration_completed') === 'true';
		console.log(`  Migration marker: ${migrationCompleted ? 'SET' : 'NOT SET'}`);
		
	} catch (error) {
		console.log(`  Validation error: ${error.message}`);
	}
}

async function testBackupRestore() {
	console.log('  Testing backup and restore...');
	
	// Create some test data
	const testData = {
		blogs: [{ title: 'Backup Test Blog' }],
		diagrams: [{ title: 'Backup Test Diagram' }],
		reports: [{ title: 'Backup Test Report' }],
		chatContext: { test: 'data' },
		settings: { testSetting: 'value' }
	};
	
	// Manually create a backup
	localStorage.setItem('oscar_migration_backup', JSON.stringify({
		version: '1.0',
		timestamp: new Date().toISOString(),
		...testData
	}));
	
	console.log('  Backup created.');
	
	// Clear current data
	await clearTestData();
	
	// Restore from backup using the service's restore method
	// Note: This would require exposing the restoreFromBackup method as public
	// For now, we'll just verify the backup exists
	const backupExists = localStorage.getItem('oscar_migration_backup') !== null;
	console.log(`  Backup exists after clear: ${backupExists ? 'YES' : 'NO'}`);
	
	// Clean up
	localStorage.removeItem('oscar_migration_backup');
}

// Run tests if this script is executed directly
if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
	// Browser environment
	window.addEventListener('DOMContentLoaded', () => {
		testMigrationScenarios().catch(console.error);
	});
} else {
	// Node.js or other environment
	console.log('This test script is designed to run in a browser environment.');
	console.log('Please run it in a browser console or adapt it for your environment.');
}

export { testMigrationScenarios };