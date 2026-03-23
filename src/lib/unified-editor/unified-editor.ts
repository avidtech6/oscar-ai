/**
 * Unified Multi-Device Editor for Oscar AI Phase Compliance Package
 * 
 * This file implements the UnifiedEditor class for Phase 18: Unified Multi-Device Editor & Supabase Integration.
 * It provides a consistent editing experience across devices with cloud synchronization.
 * 
 * File: src/lib/unified-editor/unified-editor.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

export interface EditorContent {
  id: string;
  version: number;
  content: string;
  metadata: {
    lastModified: Date;
    modifiedBy: string;
    device: string;
    offline: boolean;
  };
}

export interface EditorConfig {
  autoSave: boolean;
  saveInterval: number;
  enableOffline: boolean;
  maxVersions: number;
  defaultDevice: string;
}

export interface SyncStatus {
  connected: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  conflictCount: number;
}

/**
 * Unified Editor for cross-device editing experience
 */
export class UnifiedEditor {
  private config: EditorConfig;
  private currentContent: EditorContent;
  private syncStatus: SyncStatus;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private changeCallbacks: Array<(content: EditorContent) => void> = [];
  
  /**
   * Initialize the unified editor
   */
  constructor(config: Partial<EditorConfig> = {}) {
    this.config = {
      autoSave: true,
      saveInterval: 30000, // 30 seconds
      enableOffline: true,
      maxVersions: 10,
      defaultDevice: 'desktop',
      ...config
    };
    
    this.currentContent = this.createInitialContent();
    this.syncStatus = {
      connected: false,
      lastSync: null,
      pendingChanges: 0,
      conflictCount: 0
    };
    
    this.initializeAutoSave();
  }
  
  /**
   * Get current editor content
   */
  getContent(): EditorContent {
    return { ...this.currentContent };
  }
  
  /**
   * Update editor content
   */
  updateContent(content: string, userId: string = 'anonymous'): void {
    this.currentContent = {
      ...this.currentContent,
      content,
      version: this.currentContent.version + 1,
      metadata: {
        ...this.currentContent.metadata,
        lastModified: new Date(),
        modifiedBy: userId,
        device: this.config.defaultDevice,
        offline: !this.syncStatus.connected
      }
    };
    
    this.syncStatus.pendingChanges++;
    this.notifyChangeCallbacks();
    
    if (this.config.autoSave) {
      this.scheduleAutoSave();
    }
  }
  
  /**
   * Get synchronization status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }
  
  /**
   * Connect to cloud sync
   */
  async connectToCloud(): Promise<void> {
    // Simulate cloud connection
    this.syncStatus.connected = true;
    this.currentContent.metadata.offline = false;
    
    // Sync pending changes
    await this.syncPendingChanges();
  }
  
  /**
   * Disconnect from cloud sync
   */
  disconnectFromCloud(): void {
    this.syncStatus.connected = false;
    this.currentContent.metadata.offline = true;
  }
  
  /**
   * Force sync with cloud
   */
  async forceSync(): Promise<void> {
    if (!this.syncStatus.connected) {
      throw new Error('Not connected to cloud sync');
    }
    
    await this.syncPendingChanges();
  }
  
  /**
   * Add change callback
   */
  onChange(callback: (content: EditorContent) => void): void {
    this.changeCallbacks.push(callback);
  }
  
  /**
   * Remove change callback
   */
  removeChangeCallback(callback: (content: EditorContent) => void): void {
    const index = this.changeCallbacks.indexOf(callback);
    if (index > -1) {
      this.changeCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Get content history
   */
  getContentHistory(): EditorContent[] {
    // In a real implementation, this would fetch from storage
    return [this.currentContent];
  }
  
  /**
   * Restore content to previous version
   */
  restoreContent(version: number): void {
    // In a real implementation, this would fetch from storage
    if (version < this.currentContent.version) {
      this.currentContent = {
        ...this.currentContent,
        version,
        metadata: {
          ...this.currentContent.metadata,
          lastModified: new Date(),
          modifiedBy: 'system'
        }
      };
      this.notifyChangeCallbacks();
    }
  }
  
  /**
   * Export content in different formats
   */
  exportContent(format: 'html' | 'markdown' | 'plain'): string {
    switch (format) {
      case 'html':
        return this.convertToHTML(this.currentContent.content);
      case 'markdown':
        return this.currentContent.content; // Assuming content is already markdown
      case 'plain':
        return this.stripMarkdown(this.currentContent.content);
      default:
        return this.currentContent.content;
    }
  }
  
  /**
   * Initialize auto-save functionality
   */
  private initializeAutoSave(): void {
    if (this.config.autoSave) {
      this.autoSaveTimer = setInterval(() => {
        this.performAutoSave();
      }, this.config.saveInterval);
    }
  }
  
  /**
   * Schedule auto-save
   */
  private scheduleAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setTimeout(() => {
      this.performAutoSave();
    }, this.config.saveInterval);
  }
  
  /**
   * Perform auto-save operation
   */
  private async performAutoSave(): Promise<void> {
    if (this.syncStatus.connected && this.syncStatus.pendingChanges > 0) {
      await this.syncPendingChanges();
    }
  }
  
  /**
   * Sync pending changes with cloud
   */
  private async syncPendingChanges(): Promise<void> {
    // Simulate cloud sync operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.syncStatus.lastSync = new Date();
    this.syncStatus.pendingChanges = 0;
    this.notifyChangeCallbacks();
  }
  
  /**
   * Notify all change callbacks
   */
  private notifyChangeCallbacks(): void {
    this.changeCallbacks.forEach(callback => {
      try {
        callback(this.currentContent);
      } catch (error) {
        console.error('Error in change callback:', error);
      }
    });
  }
  
  /**
   * Create initial content
   */
  private createInitialContent(): EditorContent {
    return {
      id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      version: 1,
      content: '',
      metadata: {
        lastModified: new Date(),
        modifiedBy: 'system',
        device: this.config.defaultDevice,
        offline: !this.syncStatus.connected
      }
    };
  }
  
  /**
   * Convert markdown to HTML
   */
  private convertToHTML(markdown: string): string {
    // Simple markdown to HTML conversion
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br>');
  }
  
  /**
   * Strip markdown formatting
   */
  private stripMarkdown(markdown: string): string {
    return markdown
      .replace(/^#{1,6} /gim, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/^\* /gm, '') // Remove list items
      .replace(/\n/gim, ' '); // Replace newlines with spaces
  }
}