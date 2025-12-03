import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue3-toastify': 'vue3-toastify/dist/index.js',
      'vue3-toastify-css': 'vue3-toastify/dist/index.css',
    },
  },
  optimizeDeps: {
    include: ['vue3-toastify'],
  },
})
