// Session change callbacks management

import type { Session } from '@supabase/supabase-js'
import type { SessionChangeCallback } from './sessionTypes'

export class SessionCallbackManager {
  private sessionChangeCallbacks: SessionChangeCallback[] = []

  // Add session change callback
  addCallback(callback: SessionChangeCallback): () => void {
    this.sessionChangeCallbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.sessionChangeCallbacks.indexOf(callback)
      if (index > -1) {
        this.sessionChangeCallbacks.splice(index, 1)
      }
    }
  }

  // Remove session change callback
  removeCallback(callback: SessionChangeCallback): void {
    const index = this.sessionChangeCallbacks.indexOf(callback)
    if (index > -1) {
      this.sessionChangeCallbacks.splice(index, 1)
    }
  }

  // Notify all callbacks of session change
  notifySessionChange(session: Session | null): void {
    this.sessionChangeCallbacks.forEach(callback => {
      try {
        callback(session)
      } catch (error) {
        console.error('Error in session change callback:', error)
      }
    })
  }

  // Get number of active callbacks
  getCallbackCount(): number {
    return this.sessionChangeCallbacks.length
  }

  // Clear all callbacks
  clearAllCallbacks(): void {
    this.sessionChangeCallbacks = []
  }
}