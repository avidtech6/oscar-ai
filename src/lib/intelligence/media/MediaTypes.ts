/**
 * Media Intelligence Layer – TypeScript definitions
 */

export type MediaType = 'photo' | 'diagram' | 'screenshot' | 'audio' | 'video';

export interface MediaContext {
  page: string;
  itemId?: string;
  timestamp: number;
  tags: string[];
}

export interface MediaItem {
  id: string;
  type: MediaType;
  blob: Blob;
  thumbnail?: string; // data URL
  metadata: {
    width?: number;
    height?: number;
    duration?: number; // for audio/video
    mimeType: string;
    size: number;
    transcription?: string;
    transcriptionStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  };
  context: MediaContext;
  createdAt: number;
  updatedAt: number;
}

export interface VoiceNote extends MediaItem {
  type: 'audio';
  transcription?: string;
  transcriptionStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface DiagramLabel {
  x: number;
  y: number;
  text: string;
  color?: string;
}

export interface DiagramMetadata {
  labels: DiagramLabel[];
  detectedObjects?: string[];
  caption?: string;
}

export interface GalleryQuery {
  tags?: string[];
  type?: MediaType;
  page?: string;
  itemId?: string;
  fromDate?: number;
  toDate?: number;
  limit?: number;
  offset?: number;
}

export interface MediaIngestionResult {
  success: boolean;
  mediaId?: string;
  error?: string;
  nudge?: {
    type: 'insert' | 'transcribe' | 'label' | 'place';
    message: string;
  };
}

export interface MediaNudge {
  type: 'insert' | 'transcribe' | 'label' | 'place' | 'replace';
  mediaId: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface MediaPlacement {
  itemId: string;
  mediaId: string;
  position: 'before' | 'after' | 'replace' | 'side-by-side';
  targetMediaId?: string;
}

export interface TranscriptionRequest {
  audioId: string;
  language?: string;
  priority?: 'realtime' | 'background';
}

export interface TranscriptionResult {
  success: boolean;
  text?: string;
  error?: string;
}

// Events
export type MediaEvent =
  | { type: 'mediaAdded'; media: MediaItem; context: MediaContext }
  | { type: 'voiceNoteAdded'; audio: VoiceNote; context: MediaContext }
  | { type: 'mediaDeleted'; mediaId: string }
  | { type: 'galleryUpdated' }
  | { type: 'nudgeSuggested'; nudge: MediaNudge }
  | { type: 'transcriptionCompleted'; audioId: string; text: string }
  | { type: 'mediaInserted'; placement: MediaPlacement }
  | { type: 'mediaReplaced'; oldId: string; newId: string }
  | { type: 'diagramLabeled'; mediaId: string; labels: DiagramLabel[] };

export interface MediaIngestionOptions {
  autoTag?: boolean;
  emitNudge?: boolean;
  storeInGallery?: boolean;
  generateThumbnail?: boolean;
}