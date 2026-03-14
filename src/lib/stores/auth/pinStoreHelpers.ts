// Helper functions for PIN store
import { browser } from '$app/environment'
import { PIN_STORAGE_KEYS } from '$lib/auth/pin'
import type { PinState } from './pinStoreTypes'

export function loadPinFromStorage(set: (state: PinState) => void): void {
  if (!browser) return

  try {
    const isSet = localStorage.getItem(PIN_STORAGE_KEYS.IS_SET) === 'true'
    const attempts = parseInt(localStorage.getItem(PIN_STORAGE_KEYS.ATTEMPTS) || '0')
    const lockedUntil = localStorage.getItem(PIN_STORAGE_KEYS.LOCKED_UNTIL)
    const lastValidated = localStorage.getItem(PIN_STORAGE_KEYS.LAST_VALIDATED)
    
    const now = Date.now()
    const isLocked = lockedUntil ? parseInt(lockedUntil) > now : false

    set({
      isSet,
      isLocked,
      attempts,
      lockedUntil: lockedUntil ? parseInt(lockedUntil) : null,
      lastValidated: lastValidated ? parseInt(lastValidated) : null,
      requiresSetup: !isSet
    })
  } catch (error) {
    console.error('Failed to load PIN state from storage:', error)
  }
}

export function savePinToStorage(state: PinState): void {
  if (!browser) return

  try {
    localStorage.setItem(PIN_STORAGE_KEYS.IS_SET, state.isSet.toString())
    localStorage.setItem(PIN_STORAGE_KEYS.ATTEMPTS, state.attempts.toString())
    
    if (state.lockedUntil) {
      localStorage.setItem(PIN_STORAGE_KEYS.LOCKED_UNTIL, state.lockedUntil.toString())
    } else {
      localStorage.removeItem(PIN_STORAGE_KEYS.LOCKED_UNTIL)
    }
    
    if (state.lastValidated) {
      localStorage.setItem(PIN_STORAGE_KEYS.LAST_VALIDATED, state.lastValidated.toString())
    } else {
      localStorage.removeItem(PIN_STORAGE_KEYS.LAST_VALIDATED)
    }
  } catch (error) {
    console.error('Failed to save PIN state to storage:', error)
  }
}