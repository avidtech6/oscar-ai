/**
 * Voice Note Pipeline – recording, transcription, and voice‑note‑specific AI actions.
 */
import { mediaEventBus } from './MediaEventBus';
import { MediaIngestionPipeline } from './MediaIngestionPipeline';
import type { MediaContext, VoiceNote, TranscriptionRequest, TranscriptionResult } from './MediaTypes';
import { galleryDB } from './GalleryDB';

export class VoiceNotePipeline {
  private static isRecording = false;
  private static mediaRecorder: MediaRecorder | null = null;
  private static audioChunks: Blob[] = [];
  private static currentStream: MediaStream | null = null;

  static async startRecording(context: MediaContext): Promise<boolean> {
    if (this.isRecording) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.currentStream = stream;
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const result = await MediaIngestionPipeline.ingest(audioBlob, {
            ...context,
            tags: [...(context.tags || []), 'voice-note', 'recorded'],
          }, {
            autoTag: true,
            emitNudge: true,
            storeInGallery: true,
            generateThumbnail: false,
          });

          if (result.success && result.mediaId) {
            // Mark as voice note in gallery
            const media = await galleryDB.getMedia(result.mediaId);
            if (media) {
              const voiceNote: VoiceNote = {
                ...media,
                type: 'audio',
                transcription: undefined,
                transcriptionStatus: 'pending',
              };
              // Update gallery with voice note metadata
              await galleryDB.updateMedia(voiceNote.id, {
                metadata: {
                  ...voiceNote.metadata,
                  transcription: voiceNote.transcription,
                  transcriptionStatus: voiceNote.transcriptionStatus,
                },
              });
              mediaEventBus.emit('voiceNoteAdded', { audio: voiceNote, context });
            }
          }
        } catch (err) {
          console.error('Voice note processing failed:', err);
        } finally {
          this.cleanup();
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Failed to start voice note recording:', err);
      this.cleanup();
      return false;
    }
  }

  static stopRecording(): void {
    if (!this.isRecording || !this.mediaRecorder) {
      return;
    }
    this.mediaRecorder.stop();
    this.isRecording = false;
  }

  static cancelRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  private static cleanup() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  static isRecordingActive(): boolean {
    return this.isRecording;
  }

  static async transcribe(request: TranscriptionRequest): Promise<TranscriptionResult> {
    // In a real implementation, this would call a backend transcription service.
    // For now, we simulate a successful transcription with dummy text.
    const media = await galleryDB.getMedia(request.audioId);
    if (!media || media.type !== 'audio') {
      return { success: false, error: 'Audio not found' };
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const dummyText = `Transcription of voice note ${request.audioId.substring(0, 8)} recorded at ${new Date(media.createdAt).toLocaleTimeString()}. This is a placeholder transcription.`;

    // Update the voice note with transcription
    const voiceNote: VoiceNote = {
      ...media,
      type: 'audio',
      transcription: dummyText,
      transcriptionStatus: 'completed',
    };
    await galleryDB.updateMedia(voiceNote.id, {
      metadata: {
        ...voiceNote.metadata,
        transcription: voiceNote.transcription,
        transcriptionStatus: voiceNote.transcriptionStatus,
      },
    });

    mediaEventBus.emit('transcriptionCompleted', { audioId: request.audioId, text: dummyText });

    return { success: true, text: dummyText };
  }

  static async getVoiceNotes(query?: { page?: string; limit?: number }): Promise<VoiceNote[]> {
    const galleryQuery = {
      type: 'audio' as const,
      page: query?.page,
      limit: query?.limit || 50,
    };
    const items = await galleryDB.queryMedia(galleryQuery);
    return items.map(item => ({
      ...item,
      type: 'audio',
      transcription: undefined,
      transcriptionStatus: 'pending',
    }));
  }

  static async getTranscription(audioId: string): Promise<string | null> {
    const media = await galleryDB.getMedia(audioId);
    if (!media || media.type !== 'audio') return null;
    const voiceNote = media as VoiceNote;
    return voiceNote.transcription || null;
  }

  static async deleteVoiceNote(audioId: string): Promise<boolean> {
    try {
      await galleryDB.deleteMedia(audioId);
      mediaEventBus.emit('mediaDeleted', { mediaId: audioId });
      return true;
    } catch {
      return false;
    }
  }
}