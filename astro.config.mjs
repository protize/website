import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site:'https://nalsan-group.github.io/',
  base: '/protize-website/',
  integrations: [tailwind()]
});