import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
    resolve: { mainFields: ["module", "browser", "main"] },
    ssr: { noExternal: ["gsap"] },
    plugins: [
        laravel({
            input: ["resources/js/app.ts"],
            ssr: "resources/js/ssr.ts",
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: { base: null, includeAbsolute: false },
            },
        }),
    ],
});
