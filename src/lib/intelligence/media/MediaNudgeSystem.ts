/**
 * Media Nudge System – manages AI nudges for media actions.
 */
import { mediaEventBus } from './MediaEventBus';
import type { MediaEvent, MediaNudge, MediaItem, MediaType } from './MediaTypes';

export interface NudgeRule {
  id: string;
  condition: (media: MediaItem, context: any) => boolean;
  nudge: Omit<MediaNudge, 'mediaId'>;
  priority: 'low' | 'medium' | 'high';
  cooldownMs: number; // minimum time between nudges of this rule
}

export class MediaNudgeSystem {
  private static rules: NudgeRule[] = [];
  private static lastTriggered: Map<string, number> = new Map(); // ruleId -> timestamp
  private static activeNudges: MediaNudge[] = [];

  static init() {
    this.registerDefaultRules();
    this.setupEventListeners();
  }

  private static registerDefaultRules() {
    this.rules = [
      {
        id: 'insert_image',
        condition: (media) => media.type === 'photo' || media.type === 'diagram' || media.type === 'screenshot',
        nudge: {
          type: 'insert',
          message: 'Insert this image into the document?',
          priority: 'medium',
        },
        priority: 'medium',
        cooldownMs: 30000,
      },
      {
        id: 'transcribe_audio',
        condition: (media) => media.type === 'audio',
        nudge: {
          type: 'transcribe',
          message: 'Transcribe this voice note?',
          priority: 'medium',
        },
        priority: 'medium',
        cooldownMs: 30000,
      },
      {
        id: 'label_diagram',
        condition: (media) => media.type === 'diagram',
        nudge: {
          type: 'label',
          message: 'Label this diagram?',
          priority: 'low',
        },
        priority: 'low',
        cooldownMs: 60000,
      },
      {
        id: 'place_side_by_side',
        condition: (media, context) => {
          // If there are at least two images in the same page
          return media.type === 'photo' || media.type === 'diagram';
        },
        nudge: {
          type: 'place',
          message: 'Place this image next to the previous one?',
          priority: 'low',
        },
        priority: 'low',
        cooldownMs: 45000,
      },
    ];
  }

  private static setupEventListeners() {
    mediaEventBus.on('mediaAdded', (event) => {
      this.evaluateRules(event.media, event.context);
    });

    mediaEventBus.on('voiceNoteAdded', (event) => {
      this.evaluateRules(event.audio, event.context);
    });
  }

  private static evaluateRules(media: MediaItem, context: any) {
    for (const rule of this.rules) {
      if (!rule.condition(media, context)) continue;

      const last = this.lastTriggered.get(rule.id);
      if (last && Date.now() - last < rule.cooldownMs) continue;

      const nudge: MediaNudge = {
        ...rule.nudge,
        mediaId: media.id,
      };
      this.triggerNudge(nudge);
      this.lastTriggered.set(rule.id, Date.now());
      break; // Only trigger one nudge per media addition
    }
  }

  private static triggerNudge(nudge: MediaNudge) {
    this.activeNudges.push(nudge);
    mediaEventBus.emit('nudgeSuggested', { nudge });
    // Auto‑dismiss after 30 seconds
    setTimeout(() => {
      this.dismissNudge(nudge.mediaId, nudge.type);
    }, 30000);
  }

  static dismissNudge(mediaId: string, type: MediaNudge['type']) {
    this.activeNudges = this.activeNudges.filter(
      n => !(n.mediaId === mediaId && n.type === type)
    );
  }

  static getActiveNudges(): MediaNudge[] {
    return [...this.activeNudges];
  }

  static clearAll() {
    this.activeNudges = [];
  }

  static addRule(rule: NudgeRule) {
    this.rules.push(rule);
  }

  static removeRule(ruleId: string) {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  static resetCooldown(ruleId: string) {
    this.lastTriggered.delete(ruleId);
  }
}

// Initialize on import
MediaNudgeSystem.init();