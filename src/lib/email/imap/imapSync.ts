/**
 * IMAP Sync Engine
 * Handles initial sync, delta sync, message state updates, and unseen count tracking
 */

import { ImapClient } from './imapClient';
import type { 
  ImapSyncState, 
  ImapSyncOptions, 
  ImapSyncResult, 
  ImapMessage,
  FolderSyncState,
  ImapConnectionConfig 
} from './imapTypes';

export class ImapSyncEngine {
  private syncState: ImapSyncState = {
    lastSyncUid: 0,
    lastSyncDate: new Date(0),
    folderStates: {},
    totalMessages: 0,
    unseenCount: 0
  };

  private client: ImapClient | null = null;
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(private config: ImapConnectionConfig) {}

  /**
   * Initialize sync engine and connect to IMAP server
   */
  async initialize(): Promise<void> {
    this.client = new ImapClient(this.config);
    await this.client.connect();
    
    // Load previous sync state from storage (placeholder)
    await this.loadSyncState();
  }

  /**
   * Perform initial full sync
   */
  async performInitialSync(options: ImapSyncOptions = { incremental: false }): Promise<ImapSyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        messages: [],
        newMessages: 0,
        updatedMessages: 0,
        deletedMessages: 0,
        syncState: this.syncState,
        error: 'Sync already in progress'
      };
    }

    this.isSyncing = true;

    try {
      const result = await this.syncAllFolders(options);
      await this.saveSyncState();
      return result;
    } catch (error) {
      return {
        success: false,
        messages: [],
        newMessages: 0,
        updatedMessages: 0,
        deletedMessages: 0,
        syncState: this.syncState,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Perform incremental sync (only new/changed messages since last sync)
   */
  async performIncrementalSync(options: ImapSyncOptions = { incremental: true }): Promise<ImapSyncResult> {
    if (!this.syncState.lastSyncDate || this.syncState.lastSyncDate.getTime() === 0) {
      // No previous sync, perform full sync
      return this.performInitialSync({ ...options, incremental: false });
    }

    return this.performInitialSync(options);
  }

  /**
   * Start automatic periodic sync
   */
  startAutoSync(intervalMs: number = 5 * 60 * 1000): void { // Default: 5 minutes
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.performIncrementalSync();
      } catch (error) {
        console.error('Auto sync failed:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Get current sync state
   */
  getSyncState(): ImapSyncState {
    return { ...this.syncState };
  }

  /**
   * Update message flags (read/unread, starred, etc.)
   */
  async updateMessageFlags(folderPath: string, messageUid: number, flags: string[]): Promise<boolean> {
    if (!this.client) {
      throw new Error('IMAP client not initialized');
    }

    try {
      await this.client.selectFolder(folderPath);
      // In a real implementation, we would call IMAP STORE command
      // For now, just update local state
      this.updateLocalMessageFlags(folderPath, messageUid, flags);
      return true;
    } catch (error) {
      console.error('Failed to update message flags:', error);
      return false;
    }
  }

  /**
   * Get unseen message count for a folder or all folders
   */
  getUnseenCount(folderPath?: string): number {
    if (folderPath) {
      return this.syncState.folderStates[folderPath]?.unseenCount || 0;
    }
    return this.syncState.unseenCount;
  }

  /**
   * Mark messages as seen
   */
  async markAsSeen(folderPath: string, messageUids: number[]): Promise<boolean> {
    return this.updateMessageFlags(folderPath, messageUids[0], ['\\Seen']);
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    this.stopAutoSync();
    
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
    
    await this.saveSyncState();
  }

  // Private methods

  private async syncAllFolders(options: ImapSyncOptions): Promise<ImapSyncResult> {
    if (!this.client) {
      throw new Error('IMAP client not initialized');
    }

    const allMessages: ImapMessage[] = [];
    let totalNew = 0;
    let totalUpdated = 0;
    let totalDeleted = 0;

    // Get all folders
    const folders = await this.client.listFolders();
    
    for (const folder of folders) {
      if (folder.specialUse === 'junk' || folder.specialUse === 'spam') {
        // Skip spam folders in initial sync
        continue;
      }

      const folderResult = await this.syncFolder(folder.path, options);
      
      allMessages.push(...folderResult.messages);
      totalNew += folderResult.newMessages;
      totalUpdated += folderResult.updatedMessages;
      totalDeleted += folderResult.deletedMessages;
      
      // Update folder state
      this.syncState.folderStates[folder.path] = {
        folderPath: folder.path,
        highestUid: folderResult.highestUid || 0,
        uidValidity: Date.now(), // Placeholder - should get from IMAP
        messageCount: folder.exists || 0,
        unseenCount: folder.unseen || 0,
        lastSync: new Date()
      };
    }

    // Update overall sync state
    this.syncState.lastSyncDate = new Date();
    this.syncState.totalMessages = allMessages.length;
    this.syncState.unseenCount = Object.values(this.syncState.folderStates)
      .reduce((sum, state) => sum + state.unseenCount, 0);

    // Find highest UID across all folders
    const highestUid = Math.max(...Object.values(this.syncState.folderStates)
      .map(state => state.highestUid));
    this.syncState.lastSyncUid = highestUid;

    return {
      success: true,
      messages: allMessages,
      newMessages: totalNew,
      updatedMessages: totalUpdated,
      deletedMessages: totalDeleted,
      syncState: this.syncState
    };
  }

  private async syncFolder(folderPath: string, options: ImapSyncOptions): Promise<{
    messages: ImapMessage[];
    newMessages: number;
    updatedMessages: number;
    deletedMessages: number;
    highestUid?: number;
  }> {
    if (!this.client) {
      throw new Error('IMAP client not initialized');
    }

    await this.client.selectFolder(folderPath);
    
    const previousState = this.syncState.folderStates[folderPath];
    const messages: ImapMessage[] = [];
    let highestUid = 0;
    let newMessages = 0;

    // Determine sync range based on options
    let fetchRange = '1:*'; // All messages
    if (options.incremental && previousState) {
      // Fetch only messages with UID greater than previous highest
      fetchRange = `${previousState.highestUid + 1}:*`;
    }

    if (options.since) {
      // In a real implementation, we would use SEARCH SINCE
      // For now, we'll fetch all and filter
    }

    // Fetch messages
    const fetchedMessages = await this.client.fetchMessages({
      from: 1,
      to: options.maxMessages || 100,
      includeHeaders: options.includeHeaders !== false,
      includeBody: options.includeBody === true
    });

    // Process messages
    for (const message of fetchedMessages) {
      messages.push(message);
      
      if (message.uid > highestUid) {
        highestUid = message.uid;
      }
      
      // Check if this is a new message
      if (!previousState || message.uid > previousState.highestUid) {
        newMessages++;
      }
    }

    // Calculate updated messages (flags changed)
    const updatedMessages = this.calculateUpdatedMessages(folderPath, messages, previousState);
    
    // Calculate deleted messages (in a real implementation, we would track UIDs)
    const deletedMessages = previousState 
      ? Math.max(0, previousState.messageCount - messages.length)
      : 0;

    return {
      messages,
      newMessages,
      updatedMessages,
      deletedMessages,
      highestUid
    };
  }

  private calculateUpdatedMessages(
    folderPath: string, 
    currentMessages: ImapMessage[], 
    previousState?: FolderSyncState
  ): number {
    if (!previousState) {
      return 0;
    }

    // In a real implementation, we would compare flags with previously stored state
    // For now, return 0 as a placeholder
    return 0;
  }

  private updateLocalMessageFlags(folderPath: string, messageUid: number, flags: string[]): void {
    const folderState = this.syncState.folderStates[folderPath];
    if (!folderState) return;

    // Update unseen count if marking as seen/unseen
    const wasUnseen = flags.includes('\\Seen');
    const isNowUnseen = !flags.includes('\\Seen');
    
    // This is a simplified implementation
    // In reality, we would track individual message states
  }

  private async loadSyncState(): Promise<void> {
    // Placeholder: Load sync state from persistent storage
    // In production, this would load from IndexedDB, localStorage, or backend
    try {
      const saved = localStorage.getItem(`imapSyncState_${this.config.auth.user}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.syncState = {
          ...parsed,
          lastSyncDate: new Date(parsed.lastSyncDate),
          folderStates: Object.fromEntries(
            Object.entries(parsed.folderStates || {}).map(([path, state]: [string, any]) => [
              path,
              { ...state, lastSync: new Date(state.lastSync) }
            ])
          )
        };
      }
    } catch (error) {
      console.warn('Failed to load sync state:', error);
    }
  }

  private async saveSyncState(): Promise<void> {
    // Placeholder: Save sync state to persistent storage
    try {
      const toSave = {
        ...this.syncState,
        lastSyncDate: this.syncState.lastSyncDate.toISOString(),
        folderStates: Object.fromEntries(
          Object.entries(this.syncState.folderStates).map(([path, state]) => [
            path,
            { ...state, lastSync: state.lastSync.toISOString() }
          ])
        )
      };
      localStorage.setItem(`imapSyncState_${this.config.auth.user}`, JSON.stringify(toSave));
    } catch (error) {
      console.warn('Failed to save sync state:', error);
    }
  }
}