import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // Replace with your actual domain once deployed
  site: 'https://yourname.pages.dev',
  output: 'static',
  adapter: cloudflare(),
  integrations: [mdx(), react(), tailwind()],
});
