import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        'react-native': path.resolve(__dirname, './src/mocks/react-native.ts'),
        'react-native-purchases': path.resolve(__dirname, './src/mocks/react-native-purchases.ts'),
        'react-native-purchases-ui': path.resolve(__dirname, './src/mocks/react-native-purchases-ui.ts'),
      }
    },
    build: {
      target: 'esnext',
      outDir: 'dist'
    }
  };
});