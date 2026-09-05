import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Check GEMINI_API_KEY first (as set in Vercel), then fallback to API_KEY
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY)
    },
    build: {
      target: 'esnext',
      outDir: 'dist'
    }
  };
});