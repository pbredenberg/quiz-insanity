import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import netlify from '@netlify/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), netlify(), tailwindcss()],
});
