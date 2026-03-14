// Sync queue manager class
import { browser } from '$app/environment'
import { SYNC_CONFIG } from './syncMetadata'
import { processPendingItems, getQueueStats, checkQueueHealth } from './syncQueueProcessor'

// Queue manager
export class SyncQueueManager {
  private isProcessing = false
  private intervalId: number | null = null
  
  // Start automatic processing
  startAutoProcessing(interval: number = SYNC_CONFIG.AUTO_SYNC_INTERVAL): void {
    if (!browser || this.intervalId) {
      return
    }
    
    this.intervalId = window.setInterval(() => {
      this.processQueue()
    }, interval)
    
    // Also process immediately
    this.processQueue()
  }
  
  // Stop automatic processing
  stopAutoProcessing(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
  
  // Process queue (with concurrency control)
  async processQueue(): Promise<void> {
    if (!browser || this.isProcessing) {
      return
    }
    
    this.isProcessing = true
    
    try {
      const result = await processPendingItems()
      
      if (result.failed > 0) {
        console.warn(`Queue processing: ${result.succeeded} succeeded, ${result.failed} failed`)
      }
    } catch (error) {
      console.error('Queue processing failed:', error)
    } finally {
      this.isProcessing = false
    }
  }
  
  // Manual sync trigger
  async manualSync(): Promise<{
    processed: number
    succeeded: number
    failed: number
  }> {
    return processPendingItems()
  }
  
  // Get current status
  async getStatus(): Promise<{
    isProcessing: boolean
    stats: Awaited<ReturnType<typeof getQueueStats>>
    health: Awaited<ReturnType<typeof checkQueueHealth>>
  }> {
    const [stats, health] = await Promise.all([
      getQueueStats(),
      checkQueueHealth()
    ])
    
    return {
      isProcessing: this.isProcessing,
      stats,
      health
    }
  }
}

// Singleton instance
export const syncQueueManager = new SyncQueueManager()