import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['tslib', '@material-tailwind/react', 'react', 'react-dom'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  resolve: {
    alias: {
      tslib: 'tslib',
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    proxy: {
      '/api-proxy': {
        target: 'http://192.168.1.103:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})
