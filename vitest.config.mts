import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vitest/config';

/**
 * Next turns static image imports into StaticImageData ({ src, width, height });
 * Vite would give a bare URL string, which next/image rejects. Mirror Next here.
 */
const staticImages = (): Plugin => ({
  name: 'next-static-images',
  enforce: 'pre',
  load(id) {
    const file = id.split('?')[0] ?? id;
    if (!/\.(png|jpe?g|webp|avif|gif)$/.test(file)) return null;
    return `export default { src: ${JSON.stringify(file)}, width: 960, height: 960, blurDataURL: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' };`;
  },
});

export default defineConfig({
  plugins: [react(), staticImages()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      reporter: ['text', 'html'],
    },
  },
});
