import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

// 现在使用 JS 文件，Vite 的标准 HMR 应该可以正常工作
// 如果需要，可以在这里添加额外的插件

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  resolve: {
    alias: {
      '@': '/src/_dev',
      '@components': '/src/_dev/components',
      '@styles': '/src/_dev/styles',
      '@utils': '/src/_dev/utils',
    },
  },
  // 确保静态资源可以被访问
  publicDir: 'public',
  // 配置开发服务器
  server: {
    port: 8812,
    open: true,
    // 允许访问 public 目录下的文件
    // 监听 src/_dev 目录下的 app-files.js 文件变化
    watch: {
      // 监听 src/_dev 目录下的 JS 文件
      include: ['src/_dev/**/*.js'],
      // 排除一些不需要监听的文件
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    // 配置静态文件服务，使 src 目录下的文件可以通过 HTTP 访问
    // middlewareMode: false,
    // fs: {
    //   // 允许服务器访问项目根目录外的文件
    //   strict: false,
    //   allow: ['..']
    // }
  },
});
