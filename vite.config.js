import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.error('Proxy Error:', err)
            if (!res.headersSent) {
              res.writeHead(502, {
                'Content-Type': 'application/json',
              })
              res.end(JSON.stringify({ 
                error: 'Proxy Error',
                message: err.message 
              }))
            }
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Ensure proper headers
            proxyReq.setHeader('Accept', 'application/json')
            console.log('Proxy Request:', {
              method: req.method,
              url: req.url,
              headers: proxyReq.getHeaders()
            })
          })
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 生产环境移除 console
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // 配置生产环境的基础路径
  base: '/',
})
