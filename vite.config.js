import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      // 限制文件系统访问范围，排除 old-vue 目录
      fs: {
        strict: true,
        allow: ['..']
      },
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8080/',
          // target: 'http://172.16.102.105:4002/',
          // target: 'http://47.106.196.236:5002/CM-API/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/')
        }
      }
    },
    optimizeDeps: {
      exclude: ['old-vue']
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development', // 只在开发环境生成 sourcemap
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@contexts': resolve(__dirname, 'src/contexts'),
        '@config': resolve(__dirname, 'src/config'),
        '@api': resolve(__dirname, 'src/api')
      }
    }
  }
})