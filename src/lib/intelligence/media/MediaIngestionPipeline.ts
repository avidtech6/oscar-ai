/**
 * Media Ingestion Pipeline – handles paste, drag‑and‑drop, file upload, camera, etc.
 */
import type { MediaItem, MediaContext, MediaIngestionResult, MediaIngestionOptions, MediaType } from './MediaTypes';
import { galleryDB } from './GalleryDB';
import { mediaEventBus } from './MediaEventBus';

export class MediaIngestionPipeline {
  private static generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `media_${timestamp}_${random}`;
  }

  private static async createThumbnail(blob: Blob, type: MediaType): Promise<string | undefined> {
    if (type === 'audio' || type === 'video') return undefined;
    if (!blob.type.startsWith('image/')) return undefined;

    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 120;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(undefined);
      img.src = url;
    });
  }

  static async ingest(
    blob: Blob,
    context: MediaContext,
    options: MediaIngestionOptions = {}
  ): Promise<MediaIngestionResult> {
    const {
      autoTag = true,
      emitNudge = true,
      storeInGallery = true,
      generateThumbnail = true,
    } = options;

    // Determine media type from blob
    const type = this.detectMediaType(blob);
    if (!type) {
      return { success: false, error: 'Unsupported media type' };
    }

    const id = this.generateId();
    const now = Date.now();

    // Auto‑tagging
    const tags = autoTag ? this.autoTag(type, context) : context.tags || [];

    // Generate thumbnail if needed
    const thumbnail = generateThumbnail ? await this.createThumbnail(blob, type) : undefined;

    const media: MediaItem = {
      id,
      type,
      blob,
      thumbnail,
      metadata: {
        mimeType: blob.type,
        size: blob.size,
      },
      context: {
        ...context,
        tags,
        timestamp: now,
      },
      createdAt: now,
      updatedAt: now,
    };

    // Store in gallery
    if (storeInGallery) {
      try {
        await galleryDB.addMedia(media);
      } catch (err) {
        console.error('Failed to store media in gallery:', err);
        return { success: false, error: 'Gallery storage failed' };
      }
    }

    // Emit event
    mediaEventBus.emit('mediaAdded', { media, context });

    // Generate nudge
    let nudge;
    if (emitNudge) {
      nudge = this.generateNudge(type, media);
      if (nudge) {
        mediaEventBus.emit('nudgeSuggested', { nudge });
      }
    }

    return {
      success: true,
      mediaId: id,
      nudge,
    };
  }

  private static detectMediaType(blob: Blob): MediaType | null {
    const mime = blob.type;
    if (mime.startsWith('image/')) {
      // Could be photo, diagram, screenshot – we'll guess based on context later
      return 'photo';
    }
    if (mime.startsWith('audio/')) return 'audio';
    if (mime.startsWith('video/')) return 'video';
    return null;
  }

  private static autoTag(type: MediaType, context: MediaContext): string[] {
    const tags: string[] = [];
    tags.push(type);
    if (context.page) tags.push(`page:${context.page}`);
    if (context.itemId) tags.push(`item:${context.itemId}`);
    tags.push(`timestamp:${Date.now()}`);
    return tags;
  }

  private static generateNudge(type: MediaType, media: MediaItem) {
    switch (type) {
      case 'photo':
      case 'diagram':
      case 'screenshot':
        return {
          type: 'insert' as const,
          message: 'Insert this image into the document?',
        };
      case 'audio':
        return {
          type: 'transcribe' as const,
          message: 'Transcribe this voice note?',
        };
      default:
        return undefined;
    }
  }

  // Convenience methods for common ingestion sources

  static async ingestFile(file: File, context: MediaContext, options?: MediaIngestionOptions) {
    return this.ingest(file, context, options);
  }

  static async ingestDataURL(dataURL: string, context: MediaContext, options?: MediaIngestionOptions) {
    const blob = await (await fetch(dataURL)).blob();
    return this.ingest(blob, context, options);
  }

  static async ingestBlobURL(blobURL: string, context: MediaContext, options?: MediaIngestionOptions) {
    const blob = await (await fetch(blobURL)).blob();
    return this.ingest(blob, context, options);
  }

  static async ingestCameraStream(stream: MediaStream, context: MediaContext, options?: MediaIngestionOptions) {
    const track = stream.getVideoTracks()[0];
    if (!track) {
      throw new Error('No video track in stream');
    }
    // Fallback for browsers that don't support ImageCapture.grabFrame
    const video = document.createElement('video');
    video.srcObject = stream;
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve(null);
      };
    });
    await new Promise(resolve => setTimeout(resolve, 100)); // small delay for frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');
    ctx.drawImage(video, 0, 0);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg'));
    // Stop tracks
    stream.getTracks().forEach(t => t.stop());
    return this.ingest(blob, { ...context, tags: [...(context.tags || []), 'camera'] }, options);
  }

  static async ingestAudioStream(stream: MediaStream, context: MediaContext, options?: MediaIngestionOptions) {
    const recorder = new MediaRecorder(stream);
    return new Promise<MediaIngestionResult>((resolve, reject) => {
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const result = await this.ingest(blob, { ...context, tags: [...(context.tags || []), 'voice-note'] }, options);
        resolve(result);
      };
      recorder.onerror = (e) => reject(e);
      recorder.start();
      setTimeout(() => recorder.stop(), 5000); // record for 5 seconds for demo
    });
  }
}