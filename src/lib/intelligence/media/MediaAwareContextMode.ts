/**
 * Media‑Aware Context Mode – switches assistant behavior based on active media.
 */
import { mediaEventBus } from './MediaEventBus';
import type { MediaEvent, MediaType, MediaItem } from './MediaTypes';

export type MediaContextMode = 'default' | 'photo' | 'diagram' | 'screenshot' | 'audio' | 'video';

export interface MediaContextState {
  mode: MediaContextMode;
  activeMedia: MediaItem | null;
  lastMediaAddedAt: number;
  pendingNudges: Array<{
    type: 'insert' | 'transcribe' | 'label' | 'place';
    message: string;
    mediaId: string;
  }>;
}

class MediaAwareContextModeManager {
  private state: MediaContextState = {
    mode: 'default',
    activeMedia: null,
    lastMediaAddedAt: 0,
    pendingNudges: [],
  };

  private listeners: Set<(state: MediaContextState) => void> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    mediaEventBus.on('mediaAdded', (event) => {
      this.handleMediaAdded(event.media);
    });

    mediaEventBus.on('voiceNoteAdded', (event) => {
      this.handleVoiceNoteAdded(event.audio);
    });

    mediaEventBus.on('nudgeSuggested', (event) => {
      this.handleNudgeSuggested(event.nudge);
    });

    mediaEventBus.on('mediaInserted', () => {
      this.clearPendingNudges();
    });
  }

  private handleMediaAdded(media: MediaItem) {
    const mode = this.mapMediaTypeToMode(media.type);
    this.state = {
      ...this.state,
      mode,
      activeMedia: media,
      lastMediaAddedAt: Date.now(),
    };
    this.notifyListeners();
    // Auto‑switch to media‑aware chat mode for a short period
    setTimeout(() => {
      if (this.state.mode === mode && this.state.lastMediaAddedAt === this.state.lastMediaAddedAt) {
        // If still in same mode after 30 seconds, revert to default
        this.state.mode = 'default';
        this.notifyListeners();
      }
    }, 30000);
  }

  private handleVoiceNoteAdded(audio: MediaItem) {
    this.state = {
      ...this.state,
      mode: 'audio',
      activeMedia: audio,
      lastMediaAddedAt: Date.now(),
    };
    this.notifyListeners();
  }

  private handleNudgeSuggested(nudge: { type: 'insert' | 'transcribe' | 'label' | 'place' | 'replace'; mediaId: string; message: string; priority: 'low' | 'medium' | 'high' }) {
    // Convert 'replace' to 'insert' for pending nudges
    const mappedType = nudge.type === 'replace' ? 'insert' : nudge.type;
    this.state.pendingNudges.push({
      type: mappedType,
      message: nudge.message,
      mediaId: nudge.mediaId,
    });
    this.notifyListeners();
  }

  private clearPendingNudges() {
    this.state.pendingNudges = [];
    this.notifyListeners();
  }

  private mapMediaTypeToMode(type: MediaType): MediaContextMode {
    switch (type) {
      case 'photo':
        return 'photo';
      case 'diagram':
        return 'diagram';
      case 'screenshot':
        return 'screenshot';
      case 'audio':
        return 'audio';
      case 'video':
        return 'video';
      default:
        return 'default';
    }
  }

  getState(): MediaContextState {
    return { ...this.state };
  }

  setMode(mode: MediaContextMode) {
    this.state.mode = mode;
    this.notifyListeners();
  }

  subscribe(listener: (state: MediaContextState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  // Helper for assistant to decide which actions to show
  getSuggestedActions(): string[] {
    const { mode, activeMedia } = this.state;
    const actions: string[] = [];
    if (mode === 'photo' || mode === 'diagram' || mode === 'screenshot') {
      actions.push('insert', 'place', 'label', 'resize', 'caption');
    }
    if (mode === 'audio') {
      actions.push('transcribe', 'play', 'trim');
    }
    if (activeMedia) {
      actions.push('describe', 'explain', 'relate');
    }
    return actions;
  }

  // Called when user selects an action
  executeAction(action: string, options?: any) {
    // In a real implementation, this would emit events or call other modules
    console.log(`MediaAwareContextMode: execute ${action}`, options);
    if (action === 'insert' && this.state.activeMedia) {
      mediaEventBus.emit('mediaInserted', {
        placement: {
          itemId: 'current',
          mediaId: this.state.activeMedia.id,
          position: 'after',
        },
      });
    }
    // Clear pending nudges after action
    this.clearPendingNudges();
  }
}

export const mediaAwareContextMode = new MediaAwareContextModeManager();