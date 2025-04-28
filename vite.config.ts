
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Only use component tagger in development mode
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize build for mobile apps
  build: {
    // Minify outputs for production builds
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.logs in production
        drop_console: mode === 'production',
        // Remove debugger statements in production
        drop_debugger: mode === 'production',
      },
    },
    // Don't generate source maps in production
    sourcemap: mode !== 'production',
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@/components/ui'],
        },
      },
    },
  },
  // Optimize preview server
  preview: {
    port: 8080,
    host: true,
  },
}));
