import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // Replace with your actual domain once deployed
  site: 'https://yourname.pages.dev',
  output: 'static',
  integrations: [mdx(), react(), tailwind()],
});
