
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';
import { execSync } from 'child_process';

// Try to update browserslist before build without modifying package.json
try {
  if (process.env.NODE_ENV === 'production') {
    console.log('Updating browserslist database before production build...');
    execSync('npx update-browserslist-db@latest', { stdio: 'pipe' });
  }
} catch (error) {
  console.warn('Warning: Could not update browserslist database');
  // Continue with build even if update fails
}

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
    // Custom plugin to handle directory imports
    {
      name: 'handle-directory-imports',
      load(id) {
        if (fs.existsSync(id) && fs.statSync(id).isDirectory()) {
          // Check if there's an index file in the directory
          const indexPath = path.join(id, 'index.ts');
          const indexJsPath = path.join(id, 'index.js');
          const indexTsxPath = path.join(id, 'index.tsx');
          const indexJsxPath = path.join(id, 'index.jsx');
          
          if (fs.existsSync(indexPath)) {
            return fs.readFileSync(indexPath, 'utf-8');
          } else if (fs.existsSync(indexTsxPath)) {
            return fs.readFileSync(indexTsxPath, 'utf-8');
          } else if (fs.existsSync(indexJsPath)) {
            return fs.readFileSync(indexJsPath, 'utf-8');
          } else if (fs.existsSync(indexJsxPath)) {
            return fs.readFileSync(indexJsxPath, 'utf-8');
          } else {
            // Generate a warning index file that exports nothing
            console.warn(`Warning: Attempting to import directory ${id} without an index file`);
            return '';
          }
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Explicitly tell Vite how to resolve directories
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
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
