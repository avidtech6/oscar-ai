/**
 * Media‑focused Event Bus
 */
import type { MediaEvent } from './MediaTypes';

type EventCallback<T extends MediaEvent['type']> = (payload: Extract<MediaEvent, { type: T }>) => void;

class MediaEventBusInternal {
  private listeners: Map<string, Set<Function>> = new Map();

  on<T extends MediaEvent['type']>(eventType: T, callback: EventCallback<T>) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  off<T extends MediaEvent['type']>(eventType: T, callback: EventCallback<T>) {
    const set = this.listeners.get(eventType);
    if (set) {
      set.delete(callback);
    }
  }

  emit<T extends MediaEvent['type']>(eventType: T, payload: Omit<Extract<MediaEvent, { type: T }>, 'type'>) {
    const set = this.listeners.get(eventType);
    if (set) {
      const event = { type: eventType, ...payload } as Extract<MediaEvent, { type: T }>;
      set.forEach(cb => cb(event));
    }
  }

  clear() {
    this.listeners.clear();
  }
}

export const mediaEventBus = new MediaEventBusInternal();