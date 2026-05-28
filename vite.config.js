import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS()
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.js'),
      name: 'CharaStatus',
      formats: ['iife'],
      fileName: () => 'index.js'
    },
    outDir: 'dist',
    emptyOutDir: false, // 非常重要：千万不能清空根目录！
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css'
          return assetInfo.name
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})
