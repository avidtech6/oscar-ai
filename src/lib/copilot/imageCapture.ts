/**
 * Capture image and integrate with Copilot input pipeline.
 */

import { imageAttachment, hasImageAttachment } from './copilotStore';

/**
 * Capture an image (data URL) and send it to the Copilot pipeline.
 * @param imageData - Data URL of the captured image
 */
export function captureImage(imageData: string): void {
	console.log('Image captured:', imageData.substring(0, 50) + '...');
	
	// Store image attachment
	imageAttachment.set(imageData);
	hasImageAttachment.set(true);
	
	// Dispatch event for other components
	window.dispatchEvent(new CustomEvent('copilot:image-captured', {
		detail: { imageData }
	}));
}

/**
 * Clear the current image attachment.
 */
export function clearImageCapture(): void {
	imageAttachment.set(null);
	hasImageAttachment.set(false);
}

/**
 * Get the current image attachment.
 */
export function getImageAttachment(): string | null {
	let value: string | null = null;
	imageAttachment.subscribe(v => value = v)();
	return value;
}