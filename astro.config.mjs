import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://kyle-mcleod.io',
  output: 'static',
  integrations: [mdx(), react(), tailwind()],
});
