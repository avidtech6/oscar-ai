import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit({
		compilerOptions: {
			runes: true, // Enable runes for Svelte 5
			enableSourcemap: true
		}
	})],
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			allow: ['..']
		}
	},
	build: {
		target: 'es2022',
		sourcemap: true
	},
	optimizeDeps: {
		exclude: ['@supabase/supabase-js']
	}
});