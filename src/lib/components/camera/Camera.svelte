<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { captureImage } from '$lib/copilot/imageCapture';
	import { showToast } from '$lib/stores/toast';

	let video: HTMLVideoElement | null = null;
	let canvas: HTMLCanvasElement | null = null;
	let stream: MediaStream | null = null;
	let capturedImage: string | null = null;
	let isCapturing = false;
	let error: string | null = null;

	onMount(async () => {
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
				audio: false
			});
			if (video) {
				video.srcObject = stream;
				video.play();
			}
		} catch (err) {
			error = 'Camera permission denied or not available.';
			console.error('Camera error:', err);
			showToast('Camera error: ' + (err as Error).message, 'error');
		}
	});

	onDestroy(() => {
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
		}
	});

	function capture() {
		if (!video || !canvas) return;
		const context = canvas.getContext('2d');
		if (!context) return;

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		context.drawImage(video, 0, 0, canvas.width, canvas.height);

		const imageData = canvas.toDataURL('image/jpeg', 0.8);
		capturedImage = imageData;
		isCapturing = true;

		// Send to Copilot pipeline
		captureImage(imageData);
		showToast('Image captured and sent to Copilot', 'success');
	}

	function retake() {
		capturedImage = null;
		isCapturing = false;
	}

	function useImage() {
		if (capturedImage) {
			// Already sent via captureImage, but we can also trigger a custom event
			window.dispatchEvent(new CustomEvent('camera:image-used', { detail: capturedImage }));
			showToast('Image ready for analysis', 'info');
		}
	}
</script>

<div class="flex flex-col items-center justify-center min-h-[60vh] p-4">
	<h1 class="text-2xl font-bold text-gray-900 mb-6">Camera</h1>

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
			{error}
		</div>
		<p class="text-gray-600 mb-4">Please ensure camera permissions are granted and try again.</p>
	{:else if capturedImage}
		<!-- Preview captured image -->
		<div class="mb-6">
			<img src={capturedImage} alt="Captured" class="rounded-lg shadow-lg max-w-full h-auto max-h-96" />
		</div>
		<div class="flex gap-4">
			<button
				on:click={retake}
				class="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
			>
				Retake
			</button>
			<button
				on:click={useImage}
				class="px-6 py-3 bg-forest-600 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors"
			>
				Use This Image
			</button>
		</div>
	{:else}
		<!-- Live video feed -->
		<div class="relative w-full max-w-2xl mb-6">
			<video
				bind:this={video}
				class="w-full h-auto rounded-lg shadow-lg bg-black"
				autoplay
				playsinline
				muted
			/>
			<canvas bind:this={canvas} class="hidden" />
		</div>

		<button
			on:click={capture}
			class="px-8 py-4 bg-forest-600 text-white font-bold rounded-full shadow-lg hover:bg-forest-700 transition-colors flex items-center gap-2"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
			Capture
		</button>

		<p class="text-gray-600 mt-4 text-center max-w-md">
			Capture an image of a tree, document, or site condition. The image will be sent to the Copilot for analysis.
		</p>
	{/if}
</div>