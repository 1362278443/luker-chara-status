import vue from '@vitejs/plugin-vue'
import path from 'path'
import UnoCSS from 'unocss/vite'
import unpluginAutoImport from 'unplugin-auto-import/vite'
import unpluginVueComponents from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import pluginExternal from 'vite-plugin-external'

/**
 * ST 已内置的全局库，打包时外置以避免重复加载、减小体积
 */
const externals = {
  jquery: '$',
  toastr: 'toastr',
  lodash: '_',
}

export default defineConfig({
  plugins: [
    vue({
      features: {
        optionsAPI: false,
      },
    }),
    UnoCSS(),
    pluginExternal({
      externals,
    }),
    unpluginAutoImport({
      imports: [
        'vue',
        'pinia',
        '@vueuse/core',
      ],
      dts: 'src/auto-imports.d.ts',
    }),
    unpluginVueComponents({
      dirs: ['src/components'],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'CharaStatus',
      formats: ['iife'],
      fileName: () => 'index.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'index.css'
          return assetInfo.name ?? ''
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
})
