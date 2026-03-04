import type { LayoutEvent, LayoutCommand } from './LayoutTypes';

/**
 * Layout event model – centralizes event emission and subscription for layout changes.
 */
export class LayoutEventModel {
  private listeners: Map<string, Array<(event: LayoutEvent) => void>> = new Map();
  private commandListeners: Array<(command: LayoutCommand) => void> = [];

  /**
   * Subscribe to a specific event type.
   */
  on(eventType: LayoutEvent['type'], callback: (event: LayoutEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  /**
   * Unsubscribe from an event type.
   */
  off(eventType: LayoutEvent['type'], callback: (event: LayoutEvent) => void): void {
    const callbacks = this.listeners.get(eventType);
    if (!callbacks) return;
    const index = callbacks.indexOf(callback);
    if (index >= 0) callbacks.splice(index, 1);
  }

  /**
   * Subscribe to all layout commands.
   */
  onCommand(callback: (command: LayoutCommand) => void): void {
    this.commandListeners.push(callback);
  }

  /**
   * Unsubscribe from commands.
   */
  offCommand(callback: (command: LayoutCommand) => void): void {
    const index = this.commandListeners.indexOf(callback);
    if (index >= 0) this.commandListeners.splice(index, 1);
  }

  /**
   * Emit an event to all listeners of that type.
   */
  emit(event: LayoutEvent): void {
    const callbacks = this.listeners.get(event.type) || [];
    callbacks.forEach(cb => {
      try {
        cb(event);
      } catch (err) {
        console.error('Error in layout event listener', err);
      }
    });
  }

  /**
   * Emit a command to command listeners.
   */
  emitCommand(command: LayoutCommand): void {
    this.commandListeners.forEach(cb => {
      try {
        cb(command);
      } catch (err) {
        console.error('Error in layout command listener', err);
      }
    });
  }

  /**
   * Clear all listeners.
   */
  clear(): void {
    this.listeners.clear();
    this.commandListeners = [];
  }

  /**
   * Helper to emit block added event.
   */
  blockAdded(block: any): void {
    this.emit({ type: 'blockAdded', block });
  }

  /**
   * Helper to emit block moved event.
   */
  blockMoved(blockId: string, newIndex: number): void {
    this.emit({ type: 'blockMoved', blockId, newIndex });
  }

  /**
   * Helper to emit block deleted event.
   */
  blockDeleted(blockId: string): void {
    this.emit({ type: 'blockDeleted', blockId });
  }

  /**
   * Helper to emit layout changed event.
   */
  layoutChanged(blockId: string, layout: any): void {
    this.emit({ type: 'layoutChanged', blockId, layout });
  }

  /**
   * Helper to emit media added event.
   */
  mediaAdded(media: any): void {
    this.emit({ type: 'mediaAdded', media });
  }
}