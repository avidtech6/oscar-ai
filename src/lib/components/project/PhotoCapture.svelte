<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	
	export let isOpen: boolean = false;
	export let projectId: string = '';
	export let photosFolderId: string = '';
	
	const dispatch = createEventDispatcher();
	
	let videoStream: MediaStream | null = null;
	let videoElement: HTMLVideoElement;
	let canvasElement: HTMLCanvasElement;
	let capturedImage: string | null = null;
	let isRecording: boolean = false;
	let error: string | null = null;
	let isUploading: boolean = false;
	let gpsLocation: { latitude: number; longitude: number } | null = null;
	let tags: string = '';
	
	// Get GPS location
	async function getLocation() {
		if ('geolocation' in navigator) {
			try {
				const position = await new Promise<GeolocationPosition>((resolve, reject) => {
					navigator.geolocation.getCurrentPosition(resolve, reject, {
						enableHighAccuracy: true,
						timeout: 10000
					});
				});
				
				gpsLocation = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude
				};
			} catch (e) {
				console.warn('Could not get GPS location:', e);
			}
		}
	}
	
	async function startCamera() {
		error = null;
		
		try {
			videoStream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: 'environment',
					width: { ideal: 1920 },
					height: { ideal: 1080 }
				}
			});
			
			if (videoElement) {
				videoElement.srcObject = videoStream;
				await videoElement.play();
			}
			
			// Try to get GPS location
			await getLocation();
			
			isRecording = true;
		} catch (e: any) {
			error = e.message || 'Failed to access camera';
			console.error('Camera error:', e);
		}
	}
	
	function stopCamera() {
		if (videoStream) {
			videoStream.getTracks().forEach(track => track.stop());
			videoStream = null;
		}
		isRecording = false;
	}
	
	function capturePhoto() {
		if (!videoElement || !canvasElement) return;
		
		const ctx = canvasElement.getContext('2d');
		if (!ctx) return;
		
		canvasElement.width = videoElement.videoWidth;
		canvasElement.height = videoElement.videoHeight;
		
		ctx.drawImage(videoElement, 0, 0);
		
		capturedImage = canvasElement.toDataURL('image/jpeg', 0.85);
		stopCamera();
	}
	
	function retakePhoto() {
		capturedImage = null;
		gpsLocation = null;
		tags = '';
		startCamera();
	}
	
	async function uploadPhoto() {
		if (!capturedImage || !projectId) return;
		
		isUploading = true;
		
		try {
			const filename = `photo_${Date.now()}.jpg`;
			const imageData = capturedImage.split(',')[1]; // Remove data URL prefix
			
			const metadata = {
				timestamp: new Date().toISOString(),
				projectId,
				gps: gpsLocation ? {
					latitude: gpsLocation.latitude,
					longitude: gpsLocation.longitude
				} : undefined,
				tags: tags ? tags.split(',').map(t => t.trim()) : []
			};
			
			dispatch('upload', {
				filename,
				imageData,
				metadata,
				folderId: photosFolderId
			});
			
			close();
		} catch (e: any) {
			error = e.message || 'Failed to upload photo';
		} finally {
			isUploading = false;
		}
	}
	
	function close() {
		stopCamera();
		capturedImage = null;
		gpsLocation = null;
		tags = '';
		error = null;
		dispatch('close');
	}
	
	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				capturedImage = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}
	
	onMount(() => {
		if (isOpen) {
			startCamera();
		}
		
		return () => {
			stopCamera();
		};
	});
	
	$: if (isOpen && !capturedImage) {
		startCamera();
	}
</script>

{#if isOpen}
	<div class="photo-capture fixed inset-0 z-50 bg-black flex flex-col">
		<!-- Header -->
		<div class="p-4 flex items-center justify-between bg-black/50">
			<button 
				class="p-2 text-white hover:bg-white/20 rounded-full"
				on:click={close}
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
				</svg>
			</button>
			
			<h3 class="text-white font-semibold">Take Photo</h3>
			
			<div class="w-10"></div>
		</div>
		
		<!-- Camera/Preview Area -->
		<div class="flex-1 relative flex items-center justify-center">
			{#if error}
				<div class="text-center p-8">
					<p class="text-red-400 mb-4">{error}</p>
					<button 
						class="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
						on:click={startCamera}
					>
						Try Again
					</button>
				</div>
			{:else if capturedImage}
				<img 
					src={capturedImage} 
					alt="Captured" 
					class="max-h-full max-w-full object-contain"
				/>
			{:else if isRecording}
				<video 
					bind:this={videoElement}
					class="max-h-full max-w-full"
					autoplay
					playsinline
					muted
				></video>
			{:else}
				<div class="text-center p-8">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
					<p class="text-white">Starting camera...</p>
				</div>
			{/if}
			
			<!-- GPS Indicator -->
			{#if gpsLocation}
				<div class="absolute top-4 left-4 px-3 py-1 bg-green-500/80 rounded-full flex items-center gap-2">
					<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
					</svg>
					<span class="text-white text-xs">GPS Active</span>
				</div>
			{/if}
		</div>
		
		<!-- Controls -->
		<div class="p-6 bg-black/50">
			{#if capturedImage}
				<!-- Edit Mode -->
				<div class="space-y-4">
					<input
						type="text"
						bind:value={tags}
						placeholder="Add tags (comma separated)"
						class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
					/>
					
					<div class="flex gap-3">
						<button 
							class="flex-1 px-4 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30"
							on:click={retakePhoto}
						>
							Retake
						</button>
						<button 
							class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
							on:click={uploadPhoto}
							disabled={isUploading}
						>
							{isUploading ? 'Uploading...' : 'Use Photo'}
						</button>
					</div>
				</div>
			{:else}
				<!-- Capture Mode -->
				<div class="flex items-center justify-center gap-8">
					<!-- Upload from device -->
					<label class="p-3 text-white/70 hover:text-white cursor-pointer">
						<input 
							type="file" 
							accept="image/*" 
							class="hidden"
							on:change={handleFileSelect}
						/>
						<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
						</svg>
					</label>
					
					<!-- Capture Button -->
					<button 
						class="w-20 h-20 rounded-full bg-white border-4 border-white/50 hover:scale-105 transition-transform"
						on:click={capturePhoto}
						disabled={!isRecording}
					>
						<span class="sr-only">Capture</span>
					</button>
					
					<!-- Flip Camera (placeholder) -->
					<button class="p-3 text-white/70 hover:text-white">
						<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
						</svg>
					</button>
				</div>
			{/if}
		</div>
		
		<!-- Hidden canvas for capture -->
		<canvas bind:this={canvasElement} class="hidden"></canvas>
	</div>
{/if}
