import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: 'index.html',
			pages: 'build',
			assets: 'build',
			failMaxPageSizeWarning: true,
			strict: false
		}),
		prerender: { entries: [] },
		alias: {
			$components: 'src/lib/components',
			$server: 'src/lib/server',
			$stores: 'src/lib/stores',
			$utils: 'src/lib/utils'
		}
	}
};

export default config;
