import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for Granava.
// `npm run build` outputs optimized static files to /dist — deploy that folder.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Inline small assets, hash filenames for caching
    assetsInlineLimit: 4096,
  },
})
