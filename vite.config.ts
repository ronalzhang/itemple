import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression2'

// 准备插件数组
const plugins: any[] = [react()];

// 添加压缩插件
plugins.push(
  // 生成gzip文件
  compression({
    include: [/\.(js|css|html|svg|json)$/],
    algorithm: 'gzip',
    deleteOriginalAssets: false
  }),
  // 生成brotli文件
  compression({
    include: [/\.(js|css|html|svg|json)$/],
    algorithm: 'brotliCompress',
    deleteOriginalAssets: false
  })
);

// 如果启用了分析，添加visualizer插件
if (process.env.ANALYZE === 'true') {
  plugins.push(
    visualizer({
      open: true, // 自动打开分析报告
      filename: 'dist/stats.html',
      gzipSize: true,
      template: 'treemap' // 使用树形图更直观地显示模块大小
    })
  );
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins,
  base: '/',
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 2000, // 提高警告限制
    // 启用CSS代码分割
    cssCodeSplit: true,
    // terser优化配置
    terserOptions: {
      compress: {
        drop_console: true, // 删除console语句
        drop_debugger: true, // 删除debugger语句
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // 移除额外的控制台函数
        passes: 2, // 多次压缩以获得更好的结果
      },
      format: {
        comments: false, // 删除注释
      }
    },
    // 打包优化配置
    rollupOptions: {
      output: {
        // 恢复到原来的简单分块策略
        manualChunks: {
          // 将React相关库打包在一起
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // 将Ant Design相关库打包在一起
          'vendor-antd': ['antd', '@ant-design/icons', '@ant-design/charts'],
          // 将i18n相关库打包在一起
          'vendor-i18n': ['i18next', 'react-i18next'],
          // 将工具库打包在一起
          'vendor-utils': ['axios', 'lunar-javascript', 'html2canvas'],
        },
        // 自定义chunk名称格式
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/other/[name]-[hash][extname]';
          
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|ico)(\?.*)?$/.test(assetInfo.name)) {
            extType = 'img';
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/.test(assetInfo.name)) {
            extType = 'fonts';
          } else if (/\.(css)$/.test(assetInfo.name)) {
            extType = 'css';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        }
      }
    }
  },
  preview: {
    port: 7070,
    host: "0.0.0.0"
  },
  server: {
    port: 7070,
    open: false,
    
    // 允许跨域访问
    allowedHosts: ['etemple.live', 'www.etemple.live'],
    
    // 配置开发服务器HMR
    hmr: {
      // 热更新优化
      overlay: false, // 禁用全屏报错
    },
    // 允许从任何IP地址访问
    host: '0.0.0.0',
    // 禁用CORS限制
    cors: true,
    // 端口被占用时允许使用下一个可用端口
    strictPort: false,
    // 添加history API回退支持
    middlewareMode: false,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false
      }
    }
  },
  // 优化CSS处理
  css: {
    // 禁用css sourcemap减少内存使用
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        // 移除全局导入，避免与@use规则冲突
        // 每个SCSS文件应该自己导入变量
      },
    }
  },
  // 优化预构建和缓存
  optimizeDeps: {
    // 强制预构建这些依赖
    include: [
      'react', 
      'react-dom', 
      'antd', 
      '@ant-design/icons', 
      'i18next', 
      'react-i18next',
      'html2canvas'
    ],
    // 缓存配置
    esbuildOptions: {
      target: 'es2020',
      // 启用tree-shaking优化
      treeShaking: true
    }
  },
  // 提高首屏加载速度
  esbuild: {
    legalComments: 'none', // 删除注释
    drop: ['console', 'debugger'], // 删除console和debugger语句
    // 启用更多优化
    treeShaking: true,
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true
  }
});
