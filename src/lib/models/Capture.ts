/**
 * Module 5: Capture Data Models
 * 
 * This module handles camera, voice-to-text, voice recording, and quick note capture functionality.
 * Capture must be instant, low-friction, and available across all device classes.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// 5.1 Capture Philosophy & Core Interfaces
// ============================================================================

/**
 * Capture Mode - The type of capture being performed
 */
export type CaptureMode = 'camera' | 'voice-to-text' | 'voice-recording' | 'quick-note';

/**
 * Capture Device Behaviour - How capture behaves on different devices
 */
export interface CaptureDeviceBehaviour {
  id: string;
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile';
  captureMode: CaptureMode;
  
  // UI Configuration
  interfaceType: 'full-screen' | 'modal-overlay' | 'bottom-sheet' | 'right-panel';
  showAskOscarBar: boolean;
  showBottomBar: boolean;
  
  // Behaviour Configuration
  autoSave: boolean;
  autoTranscribe: boolean;
  autoTagLocation: boolean;
  maxDuration?: number; // in seconds, for voice recording
  maxFileSize?: number; // in bytes, for camera
  
  // Metadata Configuration
  requireMetadata: boolean;
  metadataFields: string[]; // e.g., ['title', 'tags', 'project', 'location']
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Capture Action - A specific capture action that can be triggered
 */
export interface CaptureAction {
  id: string;
  name: string;
  description: string;
  captureMode: CaptureMode;
  
  // Trigger Configuration
  triggerIcon: string;
  triggerLabel: string;
  triggerShortcut?: string; // keyboard shortcut for desktop
  
  // Destination Configuration
  defaultDestination: 'files' | 'workspace' | 'ask-oscar' | 'map' | 'connect';
  availableDestinations: string[];
  
  // Processing Configuration
  autoProcess: boolean;
  processingPipeline: string[]; // e.g., ['compress', 'ocr', 'tag']
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 5.2 Camera Capture
// ============================================================================

/**
 * Camera Capture - Represents a photo or document scan
 */
export interface CameraCapture {
  id: string;
  title: string;
  description?: string;
  
  // Capture Details
  captureDate: Date;
  captureMode: 'photo' | 'document' | 'whiteboard' | 'scan';
  filter?: string; // e.g., 'document', 'whiteboard', 'photo'
  
  // Media Details
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  
  // Processing Details
  hasDocumentEdges: boolean;
  isScanned: boolean;
  ocrText?: string;
  ocrConfidence?: number;
  
  // Location Details
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  
  // Metadata
  tags: string[];
  projectId?: string;
  noteId?: string;
  reportId?: string;
  mapMarkerId?: string;
  
  // System Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile';
}

/**
 * Camera Configuration - Settings for camera capture
 */
export interface CameraConfiguration {
  id: string;
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile';
  
  // Capture Settings
  quality: 'low' | 'medium' | 'high' | 'max';
  flashMode: 'auto' | 'on' | 'off';
  hdrEnabled: boolean;
  gridEnabled: boolean;
  
  // Document Scan Settings
  autoDetectEdges: boolean;
  autoEnhance: boolean;
  autoCrop: boolean;
  saveFormat: 'jpg' | 'png' | 'pdf';
  
  // Processing Settings
  autoOcr: boolean;
  autoCompress: boolean;
  autoUpload: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 5.3 Voice-to-Text Capture
// ============================================================================

/**
 * VoiceToTextCapture - Represents a voice-to-text transcription
 */
export interface VoiceToTextCapture {
  id: string;
  title: string;
  
  // Capture Details
  captureDate: Date;
  duration: number; // in seconds
  language: string;
  
  // Transcription Details
  text: string;
  confidence: number; // 0-1
  rawAudioPath?: string;
  
  // Processing Details
  hasPunctuation: boolean;
  hasCapitalization: boolean;
  wasEdited: boolean;
  
  // Destination
  destinationType: 'ask-oscar' | 'note' | 'file' | 'workspace-item';
  destinationId?: string; // ID of the destination item
  
  // Metadata
  tags: string[];
  projectId?: string;
  
  // System Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile';
}

/**
 * VoiceToTextConfiguration - Settings for voice-to-text capture
 */
export interface VoiceToTextConfiguration {
  id: string;
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile';
  
  // Recognition Settings
  language: string;
  autoPunctuation: boolean;
  autoCapitalization: boolean;
  profanityFilter: boolean;
  
  // Processing Settings
  autoSave: boolean;
  autoSendToAskOscar: boolean;
  autoInsertIntoNote: boolean;
  
  // Audio Settings
  sampleRate: number;
  channels: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 5.4 Voice Recording Capture
// ============================================================================

/**
 * VoiceRecordingCapture - Represents a voice recording
 */
export interface VoiceRecordingCapture {
  id: string;
  title: string;
  description?: string;
  
  // Capture Details
  captureDate: Date;
  duration: number; // in seconds
  fileSize: number;
  
  // Audio Details
  filePath: string;
  fileName: string;
  mimeType: string;
  sampleRate: number;
  channels: number;
  bitrate: number;
  
  // Processing Details
  isTranscribed: boolean;
  transcriptionId?: string;
  transcriptionConfidence?: number;
  
  // Destination
  destinationType: 'file' | 'workspace-item' | 'ask-oscar' | 'connect-message';
  destinationId?: string;
  
  // Metadata
  tags: string[];
  projectId?: string;
  noteId?: string;
  
  // System Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile';
}

/**
 * VoiceRecordingConfiguration - Settings for voice recording
 */
export interface VoiceRecordingConfiguration {
  id: string;
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile';
  
  // Recording Settings
  quality: 'low' | 'medium' | 'high';
  format: 'mp3' | 'wav' | 'ogg';
  maxDuration: number; // in seconds, 0 for unlimited
  
  // Processing Settings
  autoTranscribe: boolean;
  autoSave: boolean;
  autoUpload: boolean;
  
  // Audio Settings
  sampleRate: number;
  channels: number;
  bitrate: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 5.5 Quick Note Capture
// ============================================================================

/**
 * QuickNoteCapture - Represents a quick text note capture
 */
export interface QuickNoteCapture {
  id: string;
  title: string;
  content: string;
  
  // Capture Details
  captureDate: Date;
  captureMethod: 'keyboard' | 'voice' | 'pencil';
  
  // Formatting
  format: 'plain' | 'markdown' | 'rich-text';
  hasAttachments: boolean;
  attachmentIds: string[];
  
  // Destination
  destinationType: 'workspace-note' | 'file' | 'ask-oscar' | 'project';
  destinationId?: string;
  
  // Metadata
  tags: string[];
  projectId?: string;
  isPinned: boolean;
  
  // System Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile';
}

// ============================================================================
// 5.6 Capture Metadata & Cross-Domain Linking
// ============================================================================

/**
 * CaptureMetadata - Common metadata for all capture types
 */
export interface CaptureMetadata {
  id: string;
  captureId: string;
  captureType: 'camera' | 'voice-to-text' | 'voice-recording' | 'quick-note';
  
  // Cross-domain links
  linkedProjects: string[];
  linkedNotes: string[];
  linkedReports: string[];
  linkedFiles: string[];
  linkedMapMarkers: string[];
  linkedConnectItems: string[];
  
  // Usage statistics
  viewCount: number;
  lastViewed: Date;
  editCount: number;
  lastEdited: Date;
  
  // AI Processing
  aiTags: string[];
  aiSummary?: string;
  aiCategories: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * CaptureRecent - Recently accessed captures for quick access
 */
export interface CaptureRecent {
  id: string;
  userId: string;
  captureId: string;
  captureType: 'camera' | 'voice-to-text' | 'voice-recording' | 'quick-note';
  
  // Access details
  lastAccessed: Date;
  accessCount: number;
  accessMethod: 'direct' | 'search' | 'recent-list' | 'suggestion';
  
  // Context
  contextDomain?: 'workspace' | 'files' | 'map' | 'connect' | 'ask-oscar';
  contextItemId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 5.7 Default Configurations
// ============================================================================

/**
 * Default capture device behaviours for each device type
 */
export const DEFAULT_CAPTURE_DEVICE_BEHAVIOURS: CaptureDeviceBehaviour[] = [
  // Desktop
  {
    id: uuidv4(),
    deviceType: 'desktop',
    captureMode: 'camera',
    interfaceType: 'modal-overlay',
    showAskOscarBar: true,
    showBottomBar: false,
    autoSave: true,
    autoTranscribe: false,
    autoTagLocation: true,
    maxFileSize: 10485760, // 10MB
    requireMetadata: true,
    metadataFields: ['title', 'tags', 'project', 'location'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'desktop',
    captureMode: 'voice-to-text',
    interfaceType: 'bottom-sheet',
    showAskOscarBar: true,
    showBottomBar: false,
    autoSave: true,
    autoTranscribe: true,
    autoTagLocation: false,
    requireMetadata: false,
    metadataFields: ['title'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'desktop',
    captureMode: 'voice-recording',
    interfaceType: 'right-panel',
    showAskOscarBar: true,
    showBottomBar: false,
    autoSave: true,
    autoTranscribe: true,
    autoTagLocation: false,
    maxDuration: 300, // 5 minutes
    requireMetadata: true,
    metadataFields: ['title', 'tags', 'project'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'desktop',
    captureMode: 'quick-note',
    interfaceType: 'right-panel',
    showAskOscarBar: true,
    showBottomBar: false,
    autoSave: true,
    autoTranscribe: false,
    autoTagLocation: false,
    requireMetadata: true,
    metadataFields: ['title', 'tags', 'project'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Tablet Landscape
  {
    id: uuidv4(),
    deviceType: 'tablet-landscape',
    captureMode: 'camera',
    interfaceType: 'modal-overlay',
    showAskOscarBar: true,
    showBottomBar: false,
    autoSave: true,
    autoTranscribe: false,
    autoTagLocation: true,
    maxFileSize: 10485760,
    requireMetadata: true,
    metadataFields: ['title', 'tags', 'project', 'location'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'tablet-landscape',
    captureMode: 'voice-to-text',
    interfaceType: 'bottom-sheet',
    showAskOscarBar: true,
    showBottomBar: false,
    autoSave: true,
    autoTranscribe: true,
    autoTagLocation: false,
    requireMetadata: false,
    metadataFields: ['title'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'tablet-landscape',
    captureMode: 'voice-recording',
    interfaceType: 'right-panel',
    showAskOscarBar: true,
    showBottomBar: false,
    autoSave: true,
    autoTranscribe: true,
    autoTagLocation: false,
    maxDuration: 300,
    requireMetadata: true,
    metadataFields: ['title', 'tags', 'project'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'tablet-landscape',
    captureMode: 'quick-note',
    interfaceType: 'right-panel',
    showAskOscarBar: true,
    showBottomBar: false,
    autoSave: true,
    autoTranscribe: false,
    autoTagLocation: false,
    requireMetadata: true,
    metadataFields: ['title', 'tags', 'project'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Tablet Portrait
  {
    id: uuidv4(),
    deviceType: 'tablet-portrait',
    captureMode: 'camera',
    interfaceType: 'full-screen',
    showAskOscarBar: false,
    showBottomBar: true,
    autoSave: true,
    autoTranscribe: false,
    autoTagLocation: true,
    maxFileSize: 10485760,
    requireMetadata: true,
    metadataFields: ['title', 'tags', 'project', 'location'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'tablet-portrait',
    captureMode: 'voice-to-text',
    interfaceType: 'full-screen',
    showAskOscarBar: false,
    showBottomBar: true,
    autoSave: true,
    autoTranscribe: true,
    autoTagLocation: false,
    requireMetadata: false,
    metadataFields: ['title'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'tablet-portrait',
    captureMode: 'voice-recording',
    interfaceType: 'full-screen',
    showAskOscarBar: false,
    showBottomBar: true,
    autoSave: true,
    autoTranscribe: true,
    autoTagLocation: false,
    maxDuration: 300,
    requireMetadata: true,
    metadataFields: ['title', 'tags', 'project'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'tablet-portrait',
    captureMode: 'quick-note',
    interfaceType: 'full-screen',
    showAskOscarBar: false,
    showBottomBar: true,
    autoSave: true,
    autoTranscribe: false,
    autoTagLocation: false,
    requireMetadata: true,
    metadataFields: ['title', 'tags', 'project'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Mobile
  {
    id: uuidv4(),
    deviceType: 'mobile',
    captureMode: 'camera',
    interfaceType: 'full-screen',
    showAskOscarBar: false,
    showBottomBar: true,
    autoSave: true,
    autoTranscribe: false,
    autoTagLocation: true,
    maxFileSize: 5242880, // 5MB
    requireMetadata: true,
    metadataFields: ['title', 'tags', 'project', 'location'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'mobile',
    captureMode: 'voice-to-text',
    interfaceType: 'full-screen',
    showAskOscarBar: false,
    showBottomBar: true,
    autoSave: true,
    autoTranscribe: true,
    autoTagLocation: false,
    requireMetadata: false,
    metadataFields: ['title'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'mobile',
    captureMode: 'voice-recording',
    interfaceType: 'full-screen',
    showAskOscarBar: false,
    showBottomBar: true,
    autoSave: true,
    autoTranscribe: true,
    autoTagLocation: false,
    maxDuration: 300,
    requireMetadata: true,
    metadataFields: ['title', 'tags', 'project'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'mobile',
    captureMode: 'quick-note',
    interfaceType: 'full-screen',
    showAskOscarBar: false,
    showBottomBar: true,
    autoSave: true,
    autoTranscribe: false,
    autoTagLocation: false,
    requireMetadata: true,
    metadataFields: ['title', 'tags', 'project'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Default capture actions for each capture mode
 */
export const DEFAULT_CAPTURE_ACTIONS: CaptureAction[] = [
  // Camera Actions
  {
    id: uuidv4(),
    name: 'Take Photo',
    description: 'Capture a photo with the camera',
    captureMode: 'camera',
    triggerIcon: 'camera',
    triggerLabel: 'Camera',
    defaultDestination: 'files',
    availableDestinations: ['files', 'workspace', 'map', 'ask-oscar'],
    autoProcess: true,
    processingPipeline: ['compress', 'auto-tag'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Scan Document',
    description: 'Scan a document with edge detection',
    captureMode: 'camera',
    triggerIcon: 'document',
    triggerLabel: 'Scan',
    defaultDestination: 'files',
    availableDestinations: ['files', 'workspace'],
    autoProcess: true,
    processingPipeline: ['edge-detect', 'enhance', 'ocr', 'compress'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Voice-to-Text Actions
  {
    id: uuidv4(),
    name: 'Dictate to Ask Oscar',
    description: 'Speak directly to Ask Oscar',
    captureMode: 'voice-to-text',
    triggerIcon: 'mic',
    triggerLabel: 'Voice',
    triggerShortcut: 'Ctrl+Shift+V',
    defaultDestination: 'ask-oscar',
    availableDestinations: ['ask-oscar', 'note', 'file'],
    autoProcess: true,
    processingPipeline: ['transcribe', 'punctuate', 'capitalize'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Dictate Note',
    description: 'Create a note by speaking',
    captureMode: 'voice-to-text',
    triggerIcon: 'note',
    triggerLabel: 'Dictate',
    defaultDestination: 'workspace',
    availableDestinations: ['workspace', 'file'],
    autoProcess: true,
    processingPipeline: ['transcribe', 'punctuate'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Voice Recording Actions
  {
    id: uuidv4(),
    name: 'Record Audio Note',
    description: 'Record an audio note',
    captureMode: 'voice-recording',
    triggerIcon: 'record',
    triggerLabel: 'Record',
    defaultDestination: 'files',
    availableDestinations: ['files', 'workspace', 'ask-oscar'],
    autoProcess: true,
    processingPipeline: ['compress', 'auto-transcribe'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Record Meeting',
    description: 'Record a meeting or conversation',
    captureMode: 'voice-recording',
    triggerIcon: 'meeting',
    triggerLabel: 'Meeting',
    defaultDestination: 'workspace',
    availableDestinations: ['workspace', 'files'],
    autoProcess: true,
    processingPipeline: ['compress', 'segment', 'transcribe'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Quick Note Actions
  {
    id: uuidv4(),
    name: 'Quick Text Note',
    description: 'Create a quick text note',
    captureMode: 'quick-note',
    triggerIcon: 'text',
    triggerLabel: 'Note',
    triggerShortcut: 'Ctrl+Shift+N',
    defaultDestination: 'workspace',
    availableDestinations: ['workspace', 'file', 'project'],
    autoProcess: false,
    processingPipeline: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Quick Task',
    description: 'Create a quick task',
    captureMode: 'quick-note',
    triggerIcon: 'task',
    triggerLabel: 'Task',
    defaultDestination: 'workspace',
    availableDestinations: ['workspace', 'project'],
    autoProcess: true,
    processingPipeline: ['parse-task', 'set-reminder'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Default camera configurations for each device type
 */
export const DEFAULT_CAMERA_CONFIGURATIONS: CameraConfiguration[] = [
  {
    id: uuidv4(),
    deviceType: 'desktop',
    quality: 'high',
    flashMode: 'auto',
    hdrEnabled: true,
    gridEnabled: true,
    autoDetectEdges: true,
    autoEnhance: true,
    autoCrop: true,
    saveFormat: 'jpg',
    autoOcr: true,
    autoCompress: true,
    autoUpload: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'tablet-landscape',
    quality: 'high',
    flashMode: 'auto',
    hdrEnabled: true,
    gridEnabled: true,
    autoDetectEdges: true,
    autoEnhance: true,
    autoCrop: true,
    saveFormat: 'jpg',
    autoOcr: true,
    autoCompress: true,
    autoUpload: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'tablet-portrait',
    quality: 'medium',
    flashMode: 'auto',
    hdrEnabled: true,
    gridEnabled: true,
    autoDetectEdges: true,
    autoEnhance: true,
    autoCrop: true,
    saveFormat: 'jpg',
    autoOcr: true,
    autoCompress: true,
    autoUpload: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'mobile',
    quality: 'medium',
    flashMode: 'auto',
    hdrEnabled: true,
    gridEnabled: true,
    autoDetectEdges: true,
    autoEnhance: true,
    autoCrop: true,
    saveFormat: 'jpg',
    autoOcr: true,
    autoCompress: true,
    autoUpload: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Default voice-to-text configurations for each device type
 */
export const DEFAULT_VOICE_TO_TEXT_CONFIGURATIONS: VoiceToTextConfiguration[] = [
  {
    id: uuidv4(),
    deviceType: 'desktop',
    language: 'en-US',
    autoPunctuation: true,
    autoCapitalization: true,
    profanityFilter: false,
    autoSave: true,
    autoSendToAskOscar: true,
    autoInsertIntoNote: false,
    sampleRate: 44100,
    channels: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'tablet-landscape',
    language: 'en-US',
    autoPunctuation: true,
    autoCapitalization: true,
    profanityFilter: false,
    autoSave: true,
    autoSendToAskOscar: true,
    autoInsertIntoNote: false,
    sampleRate: 44100,
    channels: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'tablet-portrait',
    language: 'en-US',
    autoPunctuation: true,
    autoCapitalization: true,
    profanityFilter: false,
    autoSave: true,
    autoSendToAskOscar: true,
    autoInsertIntoNote: false,
    sampleRate: 44100,
    channels: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'mobile',
    language: 'en-US',
    autoPunctuation: true,
    autoCapitalization: true,
    profanityFilter: false,
    autoSave: true,
    autoSendToAskOscar: true,
    autoInsertIntoNote: false,
    sampleRate: 44100,
    channels: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Default voice recording configurations for each device type
 */
export const DEFAULT_VOICE_RECORDING_CONFIGURATIONS: VoiceRecordingConfiguration[] = [
  {
    id: uuidv4(),
    deviceType: 'desktop',
    quality: 'high',
    format: 'mp3',
    maxDuration: 600, // 10 minutes
    autoTranscribe: true,
    autoSave: true,
    autoUpload: false,
    sampleRate: 44100,
    channels: 1,
    bitrate: 128000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'tablet-landscape',
    quality: 'high',
    format: 'mp3',
    maxDuration: 600,
    autoTranscribe: true,
    autoSave: true,
    autoUpload: false,
    sampleRate: 44100,
    channels: 1,
    bitrate: 128000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'tablet-portrait',
    quality: 'medium',
    format: 'mp3',
    maxDuration: 300, // 5 minutes
    autoTranscribe: true,
    autoSave: true,
    autoUpload: false,
    sampleRate: 44100,
    channels: 1,
    bitrate: 96000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    deviceType: 'mobile',
    quality: 'medium',
    format: 'mp3',
    maxDuration: 300,
    autoTranscribe: true,
    autoSave: true,
    autoUpload: false,
    sampleRate: 44100,
    channels: 1,
    bitrate: 96000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================================================
// 5.8 Helper Functions
// ============================================================================

/**
 * Get the default device behaviour for a specific device type and capture mode
 */
export function getDefaultDeviceBehaviour(
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile',
  captureMode: CaptureMode
): CaptureDeviceBehaviour | undefined {
  return DEFAULT_CAPTURE_DEVICE_BEHAVIOURS.find(
    behaviour => behaviour.deviceType === deviceType && behaviour.captureMode === captureMode
  );
}

/**
 * Get all capture actions for a specific capture mode
 */
export function getCaptureActionsByMode(captureMode: CaptureMode): CaptureAction[] {
  return DEFAULT_CAPTURE_ACTIONS.filter(action => action.captureMode === captureMode);
}

/**
 * Get camera configuration for a specific device type
 */
export function getCameraConfiguration(
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile'
): CameraConfiguration | undefined {
  return DEFAULT_CAMERA_CONFIGURATIONS.find(config => config.deviceType === deviceType);
}

/**
 * Get voice-to-text configuration for a specific device type
 */
export function getVoiceToTextConfiguration(
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile'
): VoiceToTextConfiguration | undefined {
  return DEFAULT_VOICE_TO_TEXT_CONFIGURATIONS.find(config => config.deviceType === deviceType);
}

/**
 * Get voice recording configuration for a specific device type
 */
export function getVoiceRecordingConfiguration(
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile'
): VoiceRecordingConfiguration | undefined {
  return DEFAULT_VOICE_RECORDING_CONFIGURATIONS.find(config => config.deviceType === deviceType);
}

/**
 * Create a new camera capture with default values
 */
export function createCameraCapture(
  title: string,
  filePath: string,
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile',
  createdBy: string
): CameraCapture {
  return {
    id: uuidv4(),
    title,
    captureDate: new Date(),
    captureMode: 'photo',
    filePath,
    fileName: filePath.split('/').pop() || 'photo.jpg',
    fileSize: 0,
    mimeType: 'image/jpeg',
    hasDocumentEdges: false,
    isScanned: false,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy,
    deviceType,
  };
}

/**
 * Create a new voice-to-text capture with default values
 */
export function createVoiceToTextCapture(
  title: string,
  text: string,
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile',
  createdBy: string
): VoiceToTextCapture {
  return {
    id: uuidv4(),
    title,
    captureDate: new Date(),
    duration: 0,
    language: 'en-US',
    text,
    confidence: 1.0,
    hasPunctuation: true,
    hasCapitalization: true,
    wasEdited: false,
    destinationType: 'ask-oscar',
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy,
    deviceType,
  };
}

/**
 * Create a new voice recording capture with default values
 */
export function createVoiceRecordingCapture(
  title: string,
  filePath: string,
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile',
  createdBy: string
): VoiceRecordingCapture {
  return {
    id: uuidv4(),
    title,
    captureDate: new Date(),
    duration: 0,
    fileSize: 0,
    filePath,
    fileName: filePath.split('/').pop() || 'recording.mp3',
    mimeType: 'audio/mp3',
    sampleRate: 44100,
    channels: 1,
    bitrate: 128000,
    isTranscribed: false,
    destinationType: 'file',
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy,
    deviceType,
  };
}

/**
 * Create a new quick note capture with default values
 */
export function createQuickNoteCapture(
  title: string,
  content: string,
  deviceType: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile',
  createdBy: string
): QuickNoteCapture {
  return {
    id: uuidv4(),
    title,
    content,
    captureDate: new Date(),
    captureMethod: 'keyboard',
    format: 'plain',
    hasAttachments: false,
    attachmentIds: [],
    destinationType: 'workspace-note',
    tags: [],
    isPinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy,
    deviceType,
  };
}

/**
 * Create capture metadata for a capture item
 */
export function createCaptureMetadata(
  captureId: string,
  captureType: 'camera' | 'voice-to-text' | 'voice-recording' | 'quick-note'
): CaptureMetadata {
  return {
    id: uuidv4(),
    captureId,
    captureType,
    linkedProjects: [],
    linkedNotes: [],
    linkedReports: [],
    linkedFiles: [],
    linkedMapMarkers: [],
    linkedConnectItems: [],
    viewCount: 0,
    lastViewed: new Date(),
    editCount: 0,
    lastEdited: new Date(),
    aiTags: [],
    aiCategories: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create a capture recent entry
 */
export function createCaptureRecent(
  userId: string,
  captureId: string,
  captureType: 'camera' | 'voice-to-text' | 'voice-recording' | 'quick-note'
): CaptureRecent {
  return {
    id: uuidv4(),
    userId,
    captureId,
    captureType,
    lastAccessed: new Date(),
    accessCount: 1,
    accessMethod: 'direct',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}