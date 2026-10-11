import { defineConfig } from 'vite'
import { readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))

// 多页入口：首页 + projects/ 下的每个详情页。
// 新增一个详情页 = 往 projects/ 丢一个 .html，无需改配置。
const detailPages = readdirSync(resolve(root, 'projects'))
  .filter((file) => file.endsWith('.html'))
  .map((file) => `projects/${file}`)

export default defineConfig({
  // 站点挂在自定义域名 huoyue.club 根路径下
  base: '/',
  // 页脚展示「最后更新」，构建时注入，避免运行期请求
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // 每个页面一个入口，产物是真正的静态 HTML，利于分享与 SEO
    rollupOptions: {
      input: ['index.html', ...detailPages].map((page) => resolve(root, page)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
})
