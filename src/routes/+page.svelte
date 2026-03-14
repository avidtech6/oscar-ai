<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	
	// Redirect to dashboard immediately (only in browser)
	if (browser) {
		goto('/dashboard');
	}
</script>

<p>Redirecting to dashboard...</p>