<script lang="ts">
	import { peek, peekStore, type PeekItem, type PeekState } from './peek-store';
	
	// Re-export everything from the TypeScript module
	export { peek, peekStore };
	export type { PeekItem, PeekState };
	
	// Re-export individual functions for convenience
	export const setCurrentPeek = peek.setCurrentPeek;
	export const clearCurrentPeek = peek.clearCurrentPeek;
	export const togglePeek = peek.togglePeek;
	export const removeFromHistory = peek.removeFromHistory;
	export const clearHistory = peek.clearHistory;
	export const setMaxHistory = peek.setMaxHistory;
</script>

<!-- This component doesn't render anything, it's just a store wrapper -->
<div style="display: none;"></div>