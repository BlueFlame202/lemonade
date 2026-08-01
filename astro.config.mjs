import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import { unified } from '@astrojs/markdown-remark';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import sitemap from "@astrojs/sitemap";
import auth from 'auth-astro';

import vercel from "@astrojs/vercel";

import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
  site: 'https://aathreyakadambi.vercel.app/',
  integrations: [react(), mdx(), sitemap(), db(), auth()],
  output: "server",
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['maplibre-gl']
    }
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    components: {
      Decryptor: "./src/components/Decryptor.astro",
    },
  },
});
