/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				forest: {
					50: '#f2f7f5',
					100: '#e1efe8',
					200: '#c3dfd1',
					300: '#96c4ad',
					400: '#64a583',
					500: '#3d8962',
					600: '#2f6b4d',
					700: '#265540',
					800: '#204436',
					900: '#1a382d'
				},
				oak: {
					50: '#f7f3ef',
					100: '#ede5dc',
					200: '#dccabb',
					300: '#c5a68f',
					400: '#b28a6b',
					500: '#a37351',
					600: '#8b5a2b',
					700: '#704623',
					800: '#5c3a1e',
					900: '#4d301b'
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				serif: ['Merriweather', 'Georgia', 'serif']
			}
		}
	},
	plugins: []
};
