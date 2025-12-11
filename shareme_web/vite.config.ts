import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [sveltekit(), 		nodePolyfills({
			exclude: ['stream'], // Exclude 'stream' from polyfills
		})
	],
	ssr: {
		external: ['stream'], // Explicitly externalize 'stream' for SSR
	}
});
