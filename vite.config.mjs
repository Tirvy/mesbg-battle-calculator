import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
	base: '/mesbg-battle-calculator/', // replace mesbg-battle-calculator with your repo
})
