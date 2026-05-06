import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? '/ResearchHub/' : '/',
  server: {
    // SPA fallback: 所有路由返回 index.html，解决刷新 404
    historyApiFallback: true
  }
})
