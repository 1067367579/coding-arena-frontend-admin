import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      //前缀一旦匹配 就会触发转发机制
      "/dev-api": {
        target: "http://127.0.0.1:19090/system",
        //此处要将URL中的dev-api删除 替换为空字符串 就形成了正确的资源路径
        rewrite: (p) => p.replace(/^\/dev-api/,""),
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('ace-builds')) {
            if (id.includes('mode-java')) return 'vendor-ace-mode-java'
            if (id.includes('theme-tomorrow_night')) return 'vendor-ace-theme'
            if (id.includes('ext-language_tools')) return 'vendor-ace-tools'
            return 'vendor-ace-core'
          }
          if (id.includes('@vueup/vue-quill') || id.includes('quill')) return 'vendor-quill'
          if (id.includes('element-plus') || id.includes('@element-plus')) return 'vendor-element-plus'
          if (id.includes('vue-router')) return 'vendor-vue-router'
          if (id.includes('/vue/')) return 'vendor-vue'
          if (id.includes('axios')) return 'vendor-axios'
        }
      }
    }
  }
})
