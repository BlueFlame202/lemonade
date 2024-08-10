import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import sitemap from "@astrojs/sitemap";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: 'https://aathreyakadambi.vercel.app/',
  integrations: [tailwind(), react(), mdx({
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  }), sitemap()],
  output: "server",
  adapter: vercel()
});