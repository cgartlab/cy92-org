// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
	site: "https://cy92.org",
	integrations: [
		mdx(),
		sitemap(),
		tailwind({
			applyBaseStyles: false
		})
	],
	adapter: cloudflare({
		platformProxy: {
			enabled: false,
		},
	}),
});
