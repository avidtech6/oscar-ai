/**
 * Media‑Assistant Bridge – connects media events to the global assistant.
 * Listens to media events (nudgeSuggested, mediaAdded) and forwards them as assistant events.
 */
import { mediaEventBus } from './MediaEventBus';
import { assistantEventBus } from '$lib/assistant/AssistantEventBus';
import type { MediaEvent, MediaNudge } from './MediaTypes';

class MediaAssistantBridge {
  static init() {
    // When a media nudge is suggested, forward it as an assistant nudge
    mediaEventBus.on('nudgeSuggested', (event: MediaEvent) => {
      if (event.type === 'nudgeSuggested') {
        assistantEventBus.emit({
          type: 'nudge',
          nudgeType: event.nudge.type,
          message: event.nudge.message,
        });
      }
    });

    // When media is added, we could also update assistant context
    mediaEventBus.on('mediaAdded', (event: MediaEvent) => {
      if (event.type === 'mediaAdded') {
        // Optionally set a micro‑cue that media is ready
        assistantEventBus.emit({
          type: 'nudge',
          nudgeType: 'media',
          message: `New ${event.media.type} added`,
        });
      }
    });

    // When voice note is transcribed, notify assistant
    mediaEventBus.on('transcriptionCompleted', (event: MediaEvent) => {
      if (event.type === 'transcriptionCompleted') {
        assistantEventBus.emit({
          type: 'nudge',
          nudgeType: 'transcription',
          message: 'Voice note transcribed',
        });
      }
    });

    console.log('[MediaAssistantBridge] initialized');
  }
}

// Initialize on import
MediaAssistantBridge.init();

export default MediaAssistantBridge;