# huoyue.club · HYClub 项目展示站

个人项目与作品的索引站，部署在 GitHub Pages 上，绑定自定义域名 **https://huoyue.club/**。

线上地址：<https://huoyue.club/>

---

## 这个站点是什么

一页式的项目墙：首屏精选 4 个可以直接玩的作品，下面是可按分类筛选的全部项目。
每个项目给出在线演示 / 下载 / 源码的入口，没有在线演示的走站内详情页。

当前的 9 个项目分三类：

| 分类 | 项目 |
| --- | --- |
| 游戏 | 深海声呐员、雪人兄弟、股神异闻录、AI 影游平台 |
| 引擎 / 框架 | HYC 游戏框架、Graphi 着色器库、DSH 游戏工作室、影游开发套件 |
| 工具 | SteamCMD 界面 |

**私有或源码未公开的项目也会上墙**，只是不渲染「源码」按钮 —— 按钮在 `links.source` 为 `null` 时根本不生成，而不是渲染成一个灰色的假按钮。

---

## 技术栈

- **Vite 8** 构建，多页（MPA）输出：首页 + `projects/` 下每个详情页各是一个入口
- **原生 ES 模块 + 原生 CSS**，零运行时框架、零运行时依赖
- 站点数据集中在 `src/data/projects.js` 一个文件里
- 部署走 **GitHub Actions → GitHub Pages**

### 为什么需要 Actions

GitHub Pages 只是静态托管，它**不会执行构建**。这个仓库里存的是源码（`src/`），
浏览器看不懂，必须先 `npm run build` 产出 `dist/`。那个「构建环节」就是
`.github/workflows/deploy.yml`。

> 如果哪天想省掉构建，可以把 `src/` 的产物直接当源码写、Pages 源切回
> 「Deploy from a branch」—— 但那就等于放弃组件复用与打包压缩。

---

## 目录结构

```
.
├─ index.html                 首页（HTML 只放骨架，内容由 JS 渲染）
├─ projects/                  详情页外壳：每个文件只负责 meta 与 <body data-project>
│  ├─ hyc-framework.html
│  ├─ graphi-shader.html
│  ├─ dsgs.html
│  ├─ vgame-toolkit.html
│  └─ steamcmd-gui.html
├─ src/
│  ├─ data/projects.js        ★ 唯一数据源（改文案、加项目只动这里）
│  ├─ js/
│  │  ├─ components.js        卡片 / 图标 / 按钮等共享渲染片段
│  │  ├─ home.js              首页：精选、筛选、网格
│  │  └─ detail.js            详情页渲染器（5 个页面共用）
│  └─ styles/site.css         设计系统（深色 + 每个项目一个主题色）
├─ public/                    原样拷贝进 dist/
│  ├─ CNAME                   huoyue.club
│  ├─ .nojekyll
│  ├─ 404.html  robots.txt  sitemap.xml  favicon.svg
│  └─ img/                    封面与分享图（由 tools/gen-assets.py 生成）
├─ tools/gen-assets.py        一次性资源生成器（不属于构建流程）
├─ scripts/check-links.mjs    手动跑的链接体检
└─ .github/workflows/deploy.yml
```

---

## 本地开发

```bash
npm install
npm run dev            # http://127.0.0.1:5173
npm run build          # 产出 dist/
npm run preview        # 预览构建结果
npm run check-links    # 检查所有外链、详情页与封面是否齐全
```

> **Windows 提示**：如果 `npm install` 报 `EPERM` 或缓存目录写入失败，
> 可能是 npm 全局缓存不可写，加 `--cache .npm-cache` 把缓存放进工作区即可。

---

## 怎么加一个新项目

1. 在 `src/data/projects.js` 的 `PROJECTS` 数组里加一个对象。至少要有：
   `id`、`name`、`nameEn`、`tagline`、`oneLiner`、`summary`、`category`、
   `accent`（主题色）、`cover`、`tech`、`links`。

2. **有在线演示** → `detail: null`，卡片主按钮直接跳 `links.demo`。
   **没有在线演示** → 写 `detail: { features, sections, specs, structure }`，
   并在 `projects/<id>.html` 建一个外壳（复制任意一个现有文件，改 meta 与
   `data-project` 即可，正文不用写）。

3. 生成封面：把项目加进 `tools/gen-assets.py` 顶部的 `PROJECTS` 列表，
   然后 `python tools/gen-assets.py`。有官方截图的项目把截图放到 `.asset-src/`
   并把文件名填进列表最后一列，否则会自动生成一张几何母题封面。

4. `npm run check-links` 确认没有断链，然后提交。

> 详情页的正文**不写在 HTML 里**，而是由 `detail.js` 从 `projects.js` 渲染。
> 这样 5 个详情页只有一份模板，不会各自漂移。HTML 文件存在的意义是给每个
> 页面独立的 `<title>`、`description` 与 OG 标签，方便分享与收录。

---

## 封面与分享图

`tools/gen-assets.py` 生成两样东西：

- `public/img/cover-<id>.webp` —— 卡片封面，1200×750。没有官方截图的工程类项目用
  「程序化几何母题 + 项目主题色」生成，保证整墙卡片视觉统一；有截图的游戏则直接用截图。
- `public/img/og-<id>.png` 与 `public/img/og.png` —— 1200×630 的分享预览图。

它是**一次性工具**，不属于构建流程（CI 不会跑它）。项目名与主题色在这个脚本里
重复声明了一次，改完记得重跑：

```bash
python tools/gen-assets.py     # 需要 Pillow 与 Windows 字体 msyh.ttc
```

原始截图放在 `.asset-src/`（已 gitignore），产物提交进 `public/img/`。

---

## 部署

推送到 `main` 即触发 `.github/workflows/deploy.yml`：

```
push → checkout → setup-node 24 → npm ci → npm run build
     → configure-pages → upload-pages-artifact(dist) → deploy-pages
```

**仓库设置里的 Pages Source 必须是 “GitHub Actions”**，不是 “Deploy from a branch”。
如果哪天切错成分支部署，站点会直接发布未构建的源码目录，页面会白屏。

自定义域名 `huoyue.club` 有两处来源，都需要保持：

- 仓库 Settings → Pages → Custom domain（这是真正生效的那处）
- `public/CNAME`（会随构建产物一起发布，作为兜底）

`www` 与各个子域（`deepseasonar` / `snowbros` / `sp` / `vgame`）是**另外 4 个仓库**
各自的 Pages 站点，不在这里维护。
