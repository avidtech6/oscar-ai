<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	
	export let accessToken: string = '';
	export let projectFolderId: string = '';
	export let projectName: string = '';
	
	const dispatch = createEventDispatcher();
	
	// Camera state
	let videoStream: MediaStream | null = null;
	let videoElement: HTMLVideoElement;
	let canvasElement: HTMLCanvasElement;
	let isCameraActive = false;
	let isCapturing = false;
	let isSaving = false;
	let facingMode: 'user' | 'environment' = 'environment';
	let error: string | null = null;
	
	// Captured photo
	let capturedPhoto: string | null = null;
	let photoBlob: Blob | null = null;
	
	// Photo metadata
	let tags: string = '';
	let description: string = '';
	
	// Start camera
	async function startCamera() {
		error = null;
		
		try {
			const constraints: MediaStreamConstraints = {
				video: {
					facingMode: facingMode,
					width: { ideal: 1920 },
					height: { ideal: 1080 }
				},
				audio: false
			};
			
			videoStream = await navigator.mediaDevices.getUserMedia(constraints);
			
			if (videoElement) {
				videoElement.srcObject = videoStream;
				await videoElement.play();
				isCameraActive = true;
			}
		} catch (err) {
			console.error('Camera error:', err);
			error = 'Could not access camera. Please check permissions.';
		}
	}
	
	// Stop camera
	function stopCamera() {
		if (videoStream) {
			videoStream.getTracks().forEach(track => track.stop());
			videoStream = null;
		}
		isCameraActive = false;
	}
	
	// Capture photo
	async function capturePhoto() {
		if (!videoElement || !canvasElement || isCapturing) return;
		
		isCapturing = true;
		
		try {
			const context = canvasElement.getContext('2d');
			if (!context) return;
			
			// Set canvas size to match video
			canvasElement.width = videoElement.videoWidth;
			canvasElement.height = videoElement.videoHeight;
			
			// Draw video frame to canvas
			context.drawImage(videoElement, 0, 0);
			
			// Convert to blob
			photoBlob = await new Promise<Blob>((resolve) => {
				canvasElement.toBlob((blob) => {
					resolve(blob!);
				}, 'image/jpeg', 0.92);
			});
			
			// Create data URL for preview
			capturedPhoto = canvasElement.toDataURL('image/jpeg', 0.92);
			
			// Stop camera after capture
			stopCamera();
		} catch (err) {
			console.error('Capture error:', err);
			error = 'Failed to capture photo';
		} finally {
			isCapturing = false;
		}
	}
	
	// Save photo to Google Drive
	async function savePhoto() {
		if (!photoBlob || !accessToken) return;
		
		isSaving = true;
		error = null;
		
		try {
			// Generate filename with timestamp
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const filename = `IMG_${timestamp}.jpg`;
			
			// Upload to Google Drive
			const formData = new FormData();
			formData.append('photo', photoBlob, filename);
			formData.append('projectFolderId', projectFolderId);
			formData.append('projectName', projectName);
			formData.append('tags', tags);
			formData.append('description', description);
			
			const response = await fetch('/api/drive/upload-photo', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${accessToken}`
				},
				body: formData });
			
			const data = await response.json();
			
			if (data.success) {
				dispatch('photoSaved', {
					fileId: data.fileId,
					fileName: data.fileName,
					thumbnailUrl: data.thumbnailUrl,
					webViewLink: data.webViewLink,
					tags: tags.split(',').map(t => t.trim()).filter(t => t),
					description
				});
				
				// Reset
				reset();
			} else {
				error = data.error || 'Failed to save photo';
			}
		} catch (err) {
			console.error('Save error:', err);
			error = 'Failed to save photo to Google Drive';
		} finally {
			isSaving = false;
		}
	}
	
	// Reset
	function reset() {
		capturedPhoto = null;
		photoBlob = null;
		tags = '';
		description = '';
		stopCamera();
	}
	
	// Retake photo
	function retakePhoto() {
		capturedPhoto = null;
		photoBlob = null;
		startCamera();
	}
	
	// Switch camera
	async function switchCamera() {
		facingMode = facingMode === 'environment' ? 'user' : 'environment';
		stopCamera();
		await startCamera();
	}
	
	onDestroy(() => {
		stopCamera();
	});
</script>

<div class="camera-capture">
	<!-- Camera View -->
	{#if !capturedPhoto}
		<div class="camera-view">
			{#if error}
				<div class="error-message" transition:fade>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
					</svg>
					{error}
				</div>
			{/if}
			
			{#if isCameraActive}
				<video 
					bind:this={videoElement}
					playsinline
					muted
					class="camera-video"
				></video>
				
				<div class="camera-controls">
					<button class="control-btn" on:click={switchCamera} title="Switch camera">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
						</svg>
					</button>
					
					<button 
						class="capture-btn" 
						on:click={capturePhoto}
						disabled={isCapturing}
					>
						{#if isCapturing}
							<div class="spinner"></div>
						{:else}
							<div class="capture-inner"></div>
						{/if}
					</button>
					
					<button class="control-btn" on:click={stopCamera} title="Close camera">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						</svg>
					</button>
				</div>
			{:else}
				<div class="camera-prompt">
					<button class="start-camera-btn" on:click={startCamera}>
						<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
						</svg>
						<span>Open Camera</span>
					</button>
					<p class="hint">Take photos of trees, site conditions, and survey data</p>
				</div>
			{/if}
		</div>
	{/if}
	
	<!-- Preview -->
	{#if capturedPhoto}
		<div class="photo-preview" transition:fade>
			<img src={capturedPhoto} alt="Captured photo" class="preview-image" />
			
			<div class="photo-form">
				<div class="form-group">
					<label for="tags">Tags (comma separated)</label>
					<input
						id="tags"
						type="text"
						bind:value={tags}
						placeholder="oak, T1, disease, canopy"
						class="input"
					/>
				</div>
				
				<div class="form-group">
					<label for="description">Description</label>
					<textarea
						id="description"
						bind:value={description}
						placeholder="Describe this photo..."
						class="input"
						rows="2"
					></textarea>
				</div>
				
				{#if error}
					<div class="error-message">
						{error}
					</div>
				{/if}
				
				<div class="preview-actions">
					<button class="btn btn-secondary" on:click={retakePhoto} disabled={isSaving}>
						Retake
					</button>
					<button class="btn btn-primary" on:click={savePhoto} disabled={isSaving}>
						{#if isSaving}
							<span class="spinner"></span>
							Saving...
						{:else}
							Save to Drive
						{/if}
					</button>
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Hidden canvas for capture -->
	<canvas bind:this={canvasElement} class="hidden-canvas"></canvas>
</div>

<style>
	.camera-capture {
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	
	.camera-view {
		position: relative;
		background: #1f2937;
		aspect-ratio: 16 / 9;
		display: flex;
		flex-direction: column;
	}
	
	.camera-video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.camera-controls {
		position: absolute;
		bottom: 20px;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 20px;
	}
	
	.control-btn {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.2);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
	}
	
	.control-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}
	
	.capture-btn {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		background: white;
		border: 4px solid rgba(255, 255, 255, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: transform 0.2s;
	}
	
	.capture-btn:hover {
		transform: scale(1.05);
	}
	
	.capture-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
	
	.capture-inner {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: white;
		border: 2px solid #e5e7eb;
	}
	
	.camera-prompt {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}
	
	.start-camera-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem 2rem;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border: 2px dashed rgba(255, 255, 255, 0.3);
		border-radius: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.start-camera-btn:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.5);
	}
	
	.hint {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.875rem;
	}
	
	.photo-preview {
		padding: 1rem;
	}
	
	.preview-image {
		width: 100%;
		border-radius: 8px;
		margin-bottom: 1rem;
	}
	
	.photo-form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	
	.form-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}
	
	.preview-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		margin-top: 0.5rem;
	}
	
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}
	
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.btn-primary {
		background: #2f5233;
		color: white;
	}
	
	.btn-primary:hover:not(:disabled) {
		background: #234026;
	}
	
	.btn-secondary {
		background: #6b7280;
		color: white;
	}
	
	.btn-secondary:hover:not(:disabled) {
		background: #4b5563;
	}
	
	.error-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: #fef2f2;
		color: #dc2626;
		border-radius: 0.5rem;
		font-size: 0.875rem;
	}
	
	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.hidden-canvas {
		display: none;
	}
</style>
