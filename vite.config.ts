import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import glsl from 'vite-plugin-glsl';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    glsl(),
    mode === 'development' &&
    componentTagger(),

  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'framer': ['framer-motion'],
          'ui': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.glsl': 'text',
      },
    },
  },
}));
