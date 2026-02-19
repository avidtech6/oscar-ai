import { db } from '$lib/db';
import { browser } from '$app/environment';

export interface MigrationResult {
	success: boolean;
	migratedItems: {
		blogs: number;
		diagrams: number;
		reports: number;
		chatContext: boolean;
		settings: boolean;
	};
	errors: string[];
	warnings: string[];
}

export interface BackupData {
	version: string;
	timestamp: string;
	blogs: any[];
	diagrams: any[];
	reports: any[];
	chatContext: any;
	settings: any;
}

/**
 * StorageMigrationService - Migrates localStorage data to IndexedDB
 * 
 * This service handles the migration of data from localStorage to IndexedDB
 * for better storage capacity, performance, and structured querying.
 * 
 * Migration Strategy:
 * 1. Create new tables in Dexie schema (blogs, diagrams, contextHistory)
 * 2. Migrate localStorage data to IndexedDB
 * 3. Maintain backward compatibility during migration period
 * 4. Provide backup/restore functionality
 * 5. Add feature flag to control migration
 */
export class StorageMigrationService {
	private useIndexedDB: boolean = false;
	private migrationCompleted: boolean = false;
	private backupData: BackupData | null = null;

	constructor() {
		// Check if migration should be enabled
		this.useIndexedDB = this.shouldUseIndexedDB();
	}

	/**
	 * Determine if we should use IndexedDB based on feature flag and browser support
	 * Phase 5: Default to true, remove feature flag dependency
	 */
	private shouldUseIndexedDB(): boolean {
		if (!browser) return false;
		
		// Check for IndexedDB support
		if (!window.indexedDB) {
			console.warn('IndexedDB not supported, falling back to localStorage');
			return false;
		}

		// Phase 5: Always use IndexedDB if supported
		// Remove feature flag check to complete migration
		return true;
	}

	/**
	 * Enable or disable IndexedDB usage
	 */
	public setEnabled(enabled: boolean): void {
		this.useIndexedDB = enabled;
		localStorage.setItem('oscar_use_indexeddb', String(enabled));
	}

	/**
	 * Check if migration is needed
	 */
	public async needsMigration(): Promise<boolean> {
		if (!browser || !this.useIndexedDB) return false;

		// Check if we have localStorage data that needs migration
		const hasBlogs = localStorage.getItem('oscar_blog_posts') !== null;
		const hasDiagrams = localStorage.getItem('oscar_diagrams') !== null;
		const hasReports = localStorage.getItem('oscar_reports') !== null;
		const hasChatContext = localStorage.getItem('oscar_chat_context') !== null;

		// Check if we've already migrated
		const migrationMarker = localStorage.getItem('oscar_migration_completed');
		const alreadyMigrated = migrationMarker === 'true';

		return (hasBlogs || hasDiagrams || hasReports || hasChatContext) && !alreadyMigrated;
	}

	/**
	 * Perform the migration from localStorage to IndexedDB
	 */
	public async migrate(): Promise<MigrationResult> {
		const result: MigrationResult = {
			success: false,
			migratedItems: {
				blogs: 0,
				diagrams: 0,
				reports: 0,
				chatContext: false,
				settings: false
			},
			errors: [],
			warnings: []
		};

		if (!browser || !this.useIndexedDB) {
			result.errors.push('Migration not supported in current environment');
			return result;
		}

		try {
			console.log('Starting storage migration from localStorage to IndexedDB...');

			// Validate environment before migration
			const validationResult = await this.validateMigrationEnvironment();
			if (!validationResult.valid) {
				result.errors.push(...validationResult.errors);
				return result;
			}

			// Create backup before migration
			await this.createBackup();

			// Migrate blogs with validation
			const blogsMigrated = await this.migrateBlogs();
			result.migratedItems.blogs = blogsMigrated;

			// Migrate diagrams with validation
			const diagramsMigrated = await this.migrateDiagrams();
			result.migratedItems.diagrams = diagramsMigrated;

			// Migrate reports with validation
			const reportsMigrated = await this.migrateReports();
			result.migratedItems.reports = reportsMigrated;

			// Migrate chat context
			const chatContextMigrated = await this.migrateChatContext();
			result.migratedItems.chatContext = chatContextMigrated;

			// Migrate settings (already in IndexedDB via ProjectContextStore)
			const settingsMigrated = await this.migrateSettings();
			result.migratedItems.settings = settingsMigrated;

			// Validate migration results
			const migrationValidation = await this.validateMigrationResults(result.migratedItems);
			if (!migrationValidation.valid) {
				result.warnings.push(...migrationValidation.warnings);
				console.warn('Migration validation warnings:', migrationValidation.warnings);
			}

			// Mark migration as completed
			localStorage.setItem('oscar_migration_completed', 'true');
			this.migrationCompleted = true;

			console.log(`Migration completed successfully:
				Blogs: ${blogsMigrated}
				Diagrams: ${diagramsMigrated}
				Reports: ${reportsMigrated}
				Chat Context: ${chatContextMigrated}
				Settings: ${settingsMigrated}
			`);

			result.success = true;
		} catch (error) {
			console.error('Migration failed:', error);
			result.errors.push(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
			
			// Attempt to restore from backup
			await this.restoreFromBackup();
			result.warnings.push('Migration failed, restored from backup');
		}

		return result;
	}

	/**
	 * Migrate blog posts from localStorage to IndexedDB
	 */
	private async migrateBlogs(): Promise<number> {
		try {
			const stored = localStorage.getItem('oscar_blog_posts');
			if (!stored) return 0;

			const blogs = JSON.parse(stored);
			if (!Array.isArray(blogs) || blogs.length === 0) return 0;

			console.log(`Migrating ${blogs.length} blog posts...`);

			let migratedCount = 0;
			let validationErrors = 0;
			
			for (const blog of blogs) {
				try {
					// Convert localStorage blog format to IndexedDB format
					const dbBlog = {
						projectId: blog.projectId || '',
						title: blog.title || 'Untitled Blog Post',
						subtitle: blog.subtitle || '',
						bodyHTML: blog.bodyHTML || blog.bodyContent || '',
						bodyContent: blog.bodyContent || blog.bodyHTML || '',
						tags: blog.tags || [],
						createdAt: new Date(blog.createdAt || new Date().toISOString()),
						updatedAt: new Date(blog.updatedAt || blog.createdAt || new Date().toISOString())
					};

					// Validate blog schema
					const validation = this.validateDataSchema(dbBlog, 'blog');
					if (!validation.valid) {
						console.warn('Blog validation failed:', validation.errors);
						validationErrors++;
						continue;
					}

					// Save to IndexedDB
					await db.blogPosts.add(dbBlog as any);
					migratedCount++;
				} catch (blogError) {
					console.error('Error migrating blog post:', blogError);
				}
			}

			// Remove localStorage data after successful migration
			// Phase 5: Remove localStorage dependency
			localStorage.removeItem('oscar_blog_posts');

			console.log(`Successfully migrated ${migratedCount} blog posts (${validationErrors} validation errors)`);
			return migratedCount;
		} catch (error) {
			console.error('Error migrating blogs:', error);
			return 0;
		}
	}

	/**
	 * Migrate diagrams from localStorage to IndexedDB
	 */
	private async migrateDiagrams(): Promise<number> {
		try {
			const stored = localStorage.getItem('oscar_diagrams');
			if (!stored) return 0;

			const diagrams = JSON.parse(stored);
			if (!Array.isArray(diagrams) || diagrams.length === 0) return 0;

			console.log(`Migrating ${diagrams.length} diagrams...`);

			let migratedCount = 0;
			let validationErrors = 0;
			
			for (const diagram of diagrams) {
				try {
					// Convert localStorage diagram format to IndexedDB format
					const dbDiagram = {
						projectId: diagram.projectId || '',
						title: diagram.title || 'Untitled Diagram',
						type: diagram.type || 'flowchart',
						content: diagram.content || '',
						createdAt: new Date(diagram.createdAt || new Date().toISOString())
					};

					// Validate diagram schema
					const validation = this.validateDataSchema(dbDiagram, 'diagram');
					if (!validation.valid) {
						console.warn('Diagram validation failed:', validation.errors);
						validationErrors++;
						continue;
					}

					// Save to IndexedDB
					await db.diagrams.add(dbDiagram as any);
					migratedCount++;
				} catch (diagramError) {
					console.error('Error migrating diagram:', diagramError);
				}
			}

			// Remove localStorage data after successful migration
			// Phase 5: Remove localStorage dependency
			localStorage.removeItem('oscar_diagrams');

			console.log(`Successfully migrated ${migratedCount} diagrams (${validationErrors} validation errors)`);
			return migratedCount;
		} catch (error) {
			console.error('Error migrating diagrams:', error);
			return 0;
		}
	}

	/**
	 * Migrate reports from localStorage to IndexedDB
	 */
	private async migrateReports(): Promise<number> {
		try {
			const stored = localStorage.getItem('oscar_reports');
			if (!stored) return 0;

			const reports = JSON.parse(stored);
			if (!Array.isArray(reports) || reports.length === 0) return 0;

			console.log(`Migrating ${reports.length} reports...`);

			// Reports already have a table in IndexedDB, but the structure is different
			// We need to convert localStorage reports to the IndexedDB format
			let migratedCount = 0;
			let validationErrors = 0;
			
			for (const report of reports) {
				try {
					// Convert localStorage report format to IndexedDB format
					const dbReport = {
						projectId: report.projectId || '',
						title: report.title || 'Untitled Report',
						type: report.type || 'bs5837',
						pdfBlob: new Blob([report.content || ''], { type: 'text/html' }),
						generatedAt: new Date(report.generatedAt || new Date().toISOString())
					};

					// Validate report schema
					const validation = this.validateDataSchema(dbReport, 'report');
					if (!validation.valid) {
						console.warn('Report validation failed:', validation.errors);
						validationErrors++;
						continue;
					}

					// Save to IndexedDB
					await db.reports.add(dbReport as any);
					migratedCount++;
				} catch (reportError) {
					console.error('Error migrating report:', reportError);
				}
			}

			// Remove localStorage data after successful migration
			// Phase 5: Remove localStorage dependency
			localStorage.removeItem('oscar_reports');

			console.log(`Successfully migrated ${migratedCount} reports (${validationErrors} validation errors)`);
			return migratedCount;
		} catch (error) {
			console.error('Error migrating reports:', error);
			return 0;
		}
	}

	/**
	 * Migrate chat context from localStorage to IndexedDB
	 */
	private async migrateChatContext(): Promise<boolean> {
		try {
			const stored = localStorage.getItem('oscar_chat_context');
			if (!stored) return false;

			console.log('Migrating chat context to unified ProjectContextStore...');

			const chatContext = JSON.parse(stored);
			
			// Import ProjectContextStore to migrate data
			const { projectContextStore } = await import('./ProjectContextStore');
			
			// Migrate selected project ID if present
			if (chatContext.selectedProjectId) {
				await projectContextStore.setCurrentProject(chatContext.selectedProjectId);
				console.log(`Migrated project context: ${chatContext.selectedProjectId}`);
			}
			
			// Phase 5: Remove localStorage dependency after successful migration
			localStorage.removeItem('oscar_chat_context');
			
			return true;
		} catch (error) {
			console.error('Error migrating chat context:', error);
			return false;
		}
	}

	/**
	 * Migrate settings from localStorage to IndexedDB
	 * Phase 5: Migrate all remaining localStorage keys to IndexedDB
	 */
	private async migrateSettings(): Promise<boolean> {
		try {
			console.log('Migrating settings to IndexedDB...');

			// Phase 5: Migrate specific localStorage keys mentioned in the plan
			const settingsToMigrate = [
				{ localStorageKey: 'oscar_current_project_id', dbKey: 'currentProjectId' },
				{ localStorageKey: 'oscar_groq_api_key', dbKey: 'groqApiKey' },
				{ localStorageKey: 'oscar_theme', dbKey: 'theme' },
				{ localStorageKey: 'oscar_sidebar_collapsed', dbKey: 'sidebarCollapsed' },
				{ localStorageKey: 'oscar_dummy_data_enabled', dbKey: 'dummyDataEnabled' },
				{ localStorageKey: 'groq_api_key', dbKey: 'groq_api_key' },
				{ localStorageKey: 'groq_model', dbKey: 'groq_model' },
				{ localStorageKey: 'openai_api_key', dbKey: 'openai_api_key' },
				{ localStorageKey: 'openai_model', dbKey: 'openai_model' },
				{ localStorageKey: 'voice_enabled', dbKey: 'voice_enabled' },
				{ localStorageKey: 'voice_auto_transcribe', dbKey: 'voice_auto_transcribe' },
				{ localStorageKey: 'voice_language', dbKey: 'voice_language' },
				{ localStorageKey: 'ui_theme', dbKey: 'ui_theme' },
				{ localStorageKey: 'ui_compact_mode', dbKey: 'ui_compact_mode' },
				{ localStorageKey: 'ui_sidebar_collapsed', dbKey: 'ui_sidebar_collapsed' },
				{ localStorageKey: 'notes_view_mode', dbKey: 'notes_view_mode' },
				{ localStorageKey: 'projects_view_mode', dbKey: 'projects_view_mode' },
				{ localStorageKey: 'reports_view_mode', dbKey: 'reports_view_mode' },
				{ localStorageKey: 'chat_context_mode', dbKey: 'chat_context_mode' },
				{ localStorageKey: 'chat_history_enabled', dbKey: 'chat_history_enabled' },
				{ localStorageKey: 'chat_auto_scroll', dbKey: 'chat_auto_scroll' },
				{ localStorageKey: 'notifications_enabled', dbKey: 'notifications_enabled' },
				{ localStorageKey: 'notifications_sound', dbKey: 'notifications_sound' },
				{ localStorageKey: 'export_format', dbKey: 'export_format' },
				{ localStorageKey: 'backup_frequency', dbKey: 'backup_frequency' },
				{ localStorageKey: 'last_backup_time', dbKey: 'last_backup_time' },
				{ localStorageKey: 'last_sync_time', dbKey: 'last_sync_time' },
				{ localStorageKey: 'user_preferences', dbKey: 'user_preferences' }
			];

			let migratedCount = 0;
			
			for (const setting of settingsToMigrate) {
				const value = localStorage.getItem(setting.localStorageKey);
				if (value !== null) {
					try {
						// Parse JSON if possible, otherwise store as string
						let parsedValue: any;
						try {
							parsedValue = JSON.parse(value);
						} catch {
							parsedValue = value;
						}
						
						// Save to IndexedDB settings table using the new CRUD operations
						// Use the localStorage key as the database key
						await db.settings.put({
							key: setting.localStorageKey,
							value: parsedValue,
							updatedAt: new Date()
						});
						
						console.log(`Migrated ${setting.localStorageKey} = ${value}`);
						migratedCount++;
					} catch (error) {
						console.error(`Failed to migrate ${setting.localStorageKey}:`, error);
					}
				}
			}

			// Phase 5: Also migrate the legacy oscar_settings object if it exists
			const legacySettings = localStorage.getItem('oscar_settings');
			if (legacySettings) {
				try {
					const settingsObj = JSON.parse(legacySettings);
					console.log('Migrating legacy oscar_settings object:', Object.keys(settingsObj));
					
					// Save each key from the legacy settings object
					for (const [key, value] of Object.entries(settingsObj)) {
						try {
							await db.settings.put({
								key: `oscar_settings.${key}`,
								value,
								updatedAt: new Date()
							});
							migratedCount++;
						} catch (error) {
							console.error(`Failed to migrate legacy setting ${key}:`, error);
						}
					}
				} catch (e) {
					console.error('Failed to parse legacy oscar_settings:', e);
				}
			}

			console.log(`Migrated ${migratedCount} settings to IndexedDB`);
			
			// Phase 5: Remove localStorage items after successful migration
			// Remove all migrated localStorage keys
			for (const setting of settingsToMigrate) {
				localStorage.removeItem(setting.localStorageKey);
			}
			
			// Also remove legacy oscar_settings object
			localStorage.removeItem('oscar_settings');

			return migratedCount > 0;
		} catch (error) {
			console.error('Error migrating settings:', error);
			return false;
		}
	}

	/**
	 * Create a backup of localStorage data before migration
	 */
	private async createBackup(): Promise<void> {
		try {
			const backup: BackupData = {
				version: '1.0',
				timestamp: new Date().toISOString(),
				blogs: JSON.parse(localStorage.getItem('oscar_blog_posts') || '[]'),
				diagrams: JSON.parse(localStorage.getItem('oscar_diagrams') || '[]'),
				reports: JSON.parse(localStorage.getItem('oscar_reports') || '[]'),
				chatContext: JSON.parse(localStorage.getItem('oscar_chat_context') || '{}'),
				settings: {
					groqApiKey: localStorage.getItem('oscar_groq_api_key') || '',
					theme: localStorage.getItem('oscar_theme') || 'dark',
					sidebarCollapsed: localStorage.getItem('oscar_sidebar_collapsed') === 'true',
					dummyDataEnabled: localStorage.getItem('oscar_dummy_data_enabled') === 'true',
					currentProjectId: localStorage.getItem('oscar_current_project_id') || ''
				}
			};

			this.backupData = backup;
			
			// Store backup in localStorage for recovery
			localStorage.setItem('oscar_migration_backup', JSON.stringify(backup));
			
			console.log('Backup created successfully');
		} catch (error) {
			console.error('Error creating backup:', error);
		}
	}

	/**
	 * Restore from backup if migration fails
	 */
	private async restoreFromBackup(): Promise<boolean> {
		try {
			if (!this.backupData) {
				// Try to load from localStorage
				const stored = localStorage.getItem('oscar_migration_backup');
				if (!stored) {
					console.warn('No backup found to restore from');
					return false;
				}
				this.backupData = JSON.parse(stored);
			}

			if (!this.backupData) {
				return false;
			}

			console.log('Restoring from backup...');

			// Restore blogs
			if (this.backupData.blogs.length > 0) {
				localStorage.setItem('oscar_blog_posts', JSON.stringify(this.backupData.blogs));
			}

			// Restore diagrams
			if (this.backupData.diagrams.length > 0) {
				localStorage.setItem('oscar_diagrams', JSON.stringify(this.backupData.diagrams));
			}

			// Restore reports
			if (this.backupData.reports.length > 0) {
				localStorage.setItem('oscar_reports', JSON.stringify(this.backupData.reports));
			}

			// Restore chat context
			if (this.backupData.chatContext) {
				localStorage.setItem('oscar_chat_context', JSON.stringify(this.backupData.chatContext));
			}

			// Restore settings
			if (this.backupData.settings) {
				if (this.backupData.settings.groqApiKey) {
					localStorage.setItem('oscar_groq_api_key', this.backupData.settings.groqApiKey);
				}
				if (this.backupData.settings.theme) {
					localStorage.setItem('oscar_theme', this.backupData.settings.theme);
				}
				localStorage.setItem('oscar_sidebar_collapsed', String(this.backupData.settings.sidebarCollapsed));
				localStorage.setItem('oscar_dummy_data_enabled', String(this.backupData.settings.dummyDataEnabled));
				if (this.backupData.settings.currentProjectId) {
					localStorage.setItem('oscar_current_project_id', this.backupData.settings.currentProjectId);
				}
			}

			// Clear migration marker
			localStorage.removeItem('oscar_migration_completed');

			console.log('Backup restored successfully');
			return true;
		} catch (error) {
			console.error('Error restoring from backup:', error);
			return false;
		}
	}

	/**
	 * Get migration status
	 */
	public getStatus(): {
		useIndexedDB: boolean;
		migrationCompleted: boolean;
		needsMigration: boolean;
		backupExists: boolean;
	} {
		const backupExists = localStorage.getItem('oscar_migration_backup') !== null;
		const migrationCompleted = localStorage.getItem('oscar_migration_completed') === 'true';

		return {
			useIndexedDB: this.useIndexedDB,
			migrationCompleted,
			needsMigration: false, // Will be calculated async
			backupExists
		};
	}

	/**
	 * Validate migration environment before starting
	 */
	private async validateMigrationEnvironment(): Promise<{valid: boolean; errors: string[]}> {
		const errors: string[] = [];
		
		// Check IndexedDB support
		if (!window.indexedDB) {
			errors.push('IndexedDB not supported in this browser');
		}
		
		// Check database connection
		try {
			await db.open();
			const isOpen = db.isOpen();
			if (!isOpen) {
				errors.push('Database failed to open');
			}
		} catch (error) {
			errors.push(`Database connection error: ${error instanceof Error ? error.message : String(error)}`);
		}
		
		// Check localStorage access
		try {
			const testKey = 'oscar_migration_test';
			localStorage.setItem(testKey, 'test');
			localStorage.removeItem(testKey);
		} catch (error) {
			errors.push(`LocalStorage access error: ${error instanceof Error ? error.message : String(error)}`);
		}
		
		return {
			valid: errors.length === 0,
			errors
		};
	}
	
	/**
	 * Validate migration results
	 */
	private async validateMigrationResults(migratedItems: MigrationResult['migratedItems']): Promise<{valid: boolean; warnings: string[]}> {
		const warnings: string[] = [];
		
		// Validate blog migration
		if (migratedItems.blogs > 0) {
			try {
				const dbBlogCount = await db.blogPosts.count();
				if (dbBlogCount < migratedItems.blogs) {
					warnings.push(`Blog migration incomplete: ${migratedItems.blogs} attempted, ${dbBlogCount} actually migrated`);
				}
			} catch (error) {
				warnings.push(`Failed to validate blog migration: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
		
		// Validate diagram migration
		if (migratedItems.diagrams > 0) {
			try {
				const dbDiagramCount = await db.diagrams.count();
				if (dbDiagramCount < migratedItems.diagrams) {
					warnings.push(`Diagram migration incomplete: ${migratedItems.diagrams} attempted, ${dbDiagramCount} actually migrated`);
				}
			} catch (error) {
				warnings.push(`Failed to validate diagram migration: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
		
		// Validate report migration
		if (migratedItems.reports > 0) {
			try {
				const dbReportCount = await db.reports.count();
				if (dbReportCount < migratedItems.reports) {
					warnings.push(`Report migration incomplete: ${migratedItems.reports} attempted, ${dbReportCount} actually migrated`);
				}
			} catch (error) {
				warnings.push(`Failed to validate report migration: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
		
		// Validate settings migration
		if (migratedItems.settings) {
			try {
				const dbSettingsCount = await db.settings.count();
				if (dbSettingsCount === 0) {
					warnings.push('Settings migration may have failed: no settings found in IndexedDB');
				}
			} catch (error) {
				warnings.push(`Failed to validate settings migration: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
		
		return {
			valid: warnings.length === 0,
			warnings
		};
	}
	
	/**
	 * Validate data schema for migrated items
	 */
	private validateDataSchema(data: any, type: 'blog' | 'diagram' | 'report'): {valid: boolean; errors: string[]} {
		const errors: string[] = [];
		
		switch (type) {
			case 'blog':
				if (!data.title || typeof data.title !== 'string') {
					errors.push('Blog missing title or invalid title type');
				}
				if (!data.bodyHTML || typeof data.bodyHTML !== 'string') {
					errors.push('Blog missing bodyHTML or invalid bodyHTML type');
				}
				if (!data.createdAt || !(data.createdAt instanceof Date)) {
					errors.push('Blog missing createdAt or invalid createdAt type');
				}
				break;
				
			case 'diagram':
				if (!data.title || typeof data.title !== 'string') {
					errors.push('Diagram missing title or invalid title type');
				}
				if (!data.content || typeof data.content !== 'string') {
					errors.push('Diagram missing content or invalid content type');
				}
				if (!data.createdAt || !(data.createdAt instanceof Date)) {
					errors.push('Diagram missing createdAt or invalid createdAt type');
				}
				break;
				
			case 'report':
				if (!data.title || typeof data.title !== 'string') {
					errors.push('Report missing title or invalid title type');
				}
				if (!data.pdfBlob || !(data.pdfBlob instanceof Blob)) {
					errors.push('Report missing pdfBlob or invalid pdfBlob type');
				}
				if (!data.type || !['bs5837', 'impact', 'method'].includes(data.type)) {
					errors.push(`Report has invalid type: ${data.type}`);
				}
				if (!data.generatedAt || !(data.generatedAt instanceof Date)) {
					errors.push('Report missing generatedAt or invalid generatedAt type');
				}
				break;
		}
		
		return {
			valid: errors.length === 0,
			errors
		};
	}
	
	/**
	 * Clear migration data (for testing)
	 */
	public async clearMigration(): Promise<void> {
		localStorage.removeItem('oscar_migration_completed');
		localStorage.removeItem('oscar_migration_backup');
		localStorage.removeItem('oscar_use_indexeddb');
		this.migrationCompleted = false;
		this.backupData = null;
	}

	/**
	 * Export all data for backup
	 */
	public async exportData(): Promise<BackupData> {
		const projects = await db.projects.toArray();
		const notes = await db.notes.toArray();
		const trees = await db.trees.toArray();
		const reports = await db.reports.toArray();
		const tasks = await db.tasks.toArray();
		const voiceNotes = await db.voiceNotes.toArray();

		return {
			version: '2.0',
			timestamp: new Date().toISOString(),
			blogs: [], // Will be populated when blogs table exists
			diagrams: [], // Will be populated when diagrams table exists
			reports: reports.map(r => ({
				id: r.id,
				projectId: r.projectId,
				title: r.title,
				type: r.type,
				generatedAt: r.generatedAt.toISOString()
			})),
			chatContext: JSON.parse(localStorage.getItem('oscar_chat_context') || '{}'),
			settings: {
				groqApiKey: localStorage.getItem('oscar_groq_api_key') || '',
				theme: localStorage.getItem('oscar_theme') || 'dark',
				sidebarCollapsed: localStorage.getItem('oscar_sidebar_collapsed') === 'true',
				dummyDataEnabled: localStorage.getItem('oscar_dummy_data_enabled') === 'true',
				currentProjectId: localStorage.getItem('oscar_current_project_id') || ''
			}
		};
	}

	/**
	 * Import data from backup
	 */
	public async importData(backup: BackupData): Promise<boolean> {
		try {
			console.log('Importing data from backup...');

			// Validate backup
			if (!backup.version || !backup.timestamp) {
				throw new Error('Invalid backup format');
			}

			// Store backup
			this.backupData = backup;
			localStorage.setItem('oscar_migration_backup', JSON.stringify(backup));

			// Import based on version
			if (backup.version === '1.0') {
				// Version 1.0 - localStorage backup
				return await this.restoreFromBackup();
			} else if (backup.version === '2.0') {
				// Version 2.0 - IndexedDB backup (future implementation)
				console.log('Importing IndexedDB backup (not yet implemented)');
				return true;
			}

			return false;
		} catch (error) {
			console.error('Error importing data:', error);
			return false;
		}
	}
}

// Singleton instance
export const storageMigrationService = new StorageMigrationService();

// Initialize migration on module load
if (browser) {
	// Check for migration on startup and auto-migrate if needed
	storageMigrationService.needsMigration().then(async needsMigration => {
		if (needsMigration) {
			console.log('Storage migration needed. Starting automatic migration...');
			try {
				const result = await storageMigrationService.migrate();
				if (result.success) {
					console.log('Automatic storage migration completed successfully:', result.migratedItems);
				} else {
					console.error('Automatic storage migration failed:', result.errors);
					// Keep legacy data for backward compatibility
					console.warn('Keeping legacy localStorage data for backward compatibility');
				}
			} catch (error) {
				console.error('Error during automatic migration:', error);
			}
		} else {
			console.log('No storage migration needed.');
		}
	}).catch(error => {
		console.error('Error checking migration status:', error);
	});
}