// PIN store types and constants
export interface PinState {
  isSet: boolean
  isLocked: boolean
  attempts: number
  lockedUntil: number | null
  lastValidated: number | null
  requiresSetup: boolean
}

// Initial state
export const initialState: PinState = {
  isSet: false,
  isLocked: false,
  attempts: 0,
  lockedUntil: null,
  lastValidated: null,
  requiresSetup: true
}