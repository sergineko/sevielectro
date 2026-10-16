import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';
export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_SITE_URL || 'https://sevielectro.com',
  compressHTML: true,
  // This one-page site paints immediately without a stylesheet round trip.
  build: { inlineStylesheets: 'always' },
  integrations: [react()],
  vite: { plugins: [tailwind()] },
});
