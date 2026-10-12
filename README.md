# huoyue.club · HYClub 项目展示站

个人项目与作品的索引站，部署在 GitHub Pages 上，绑定自定义域名 **https://huoyue.club/**。

线上地址：<https://huoyue.club/>

---

## 这个站点是什么

一页式的作品墙，4 列排布板：

| 行 | 内容 |
| --- | --- |
| 1 · 大卡 | HYC 游戏框架 · DSH 游戏工作室 |
| 2 · 小卡 | AI 影游平台 · 影游开发套件 · 雪人兄弟 · 深海声呐员 |
| 3 · 小卡 | 股神异闻录 · SteamCMD 界面 · **更多 → GitHub** |

顺序与大小写在 `src/data/projects.js` 的 `BOARD` 里，改排布不用动 CSS：

```js
export const BOARD = [
  { id: 'hyc-framework', size: 'lg' },   // lg = 占 2 列
  { id: 'dsgs', size: 'lg' },
  { id: 'vgame', size: 'sm' },           // sm = 占 1 列
  // …
]
```

当前 8 个项目分三类：

| 分类 | 项目 |
| --- | --- |
| 游戏 | 深海声呐员、雪人兄弟、股神异闻录、AI 影游平台 |
| 引擎 / 框架 | HYC 游戏框架、DSH 游戏工作室、影游开发套件 |
| 工具 | SteamCMD 界面 |

### 两条内容规矩

**一、按钮标签说实话。** 「能玩的游戏」和「一页介绍」不该共用同一个词。
每个项目在数据里声明 `cta`，文案表在 `src/js/components.js`：

| `cta` | 角标 | 按钮 | 用在 |
| --- | --- | --- | --- |
| `play` | 可以玩 | 在线试玩 | 深海声呐员（有可玩构建） |
| `demo` | 演示页 | 查看演示 | 雪人兄弟 |
| `explore` | 可探索 | 进去探索 | 股神异闻录（7 种玩法样式） |
| `intro` | 项目介绍 | 查看介绍 | AI 影游平台 |
| `detail` | 站内详情 | 查看详情 | 其余四个 |

**二、没截图就不配图。** 卡片封面只放真实截图（`cover` 字段指向的图）。
没有截图的项目 `cover` 为 `null`，卡片自动走纯排版样式（`card--plain`）：
主题色底 + 顶部一道主题色细线，不塞占位图、不画几何图案。

### 开源与否怎么判定

**看项目源码本身是否公开，不看有没有 Pages，也不看有没有公开仓库。**

有公开的演示页仓库（雪人兄弟）、有只放构建产物的分支（股神异闻录）、
有纯粹的产品介绍页（AI 影游平台）—— 这些都不算开源。

判定写在数据里的 `openSource` 字段，一处声明，两处生效：

- **右上角徽章**：`未开源` / `开源` / `开源 ｜ MIT`
- **源码按钮**：只有 `openSource` 为 `true` 时才渲染

许可证单独用 `license` 字段。两者都有时徽章渲染成两段式
（标签 ｜ 值，对应 shields.io 那种 `license | MIT` 的版式），
比单独挂一个 `MIT` 清楚得多。

### 卡片上出现哪些按钮

由 `src/js/components.js` 里的规则决定，不靠人工逐个项目配：

1. **主按钮**永远是这个项目的 `cta`。
2. **主按钮没落在项目主页时**（例如 `play` 直接进了游戏本体），
   再补一个「查看详情」回项目主页 —— 不让人找不到介绍页。
3. **源码按钮跟着 `openSource` 走**（见上一节）。
4. **没有下载按钮。** 下载（APK / Windows）属于项目主页的内容，
   卡片上再用一个按钮重复它没有意义。

**未开源的项目照样上墙**，只是不渲染「源码」按钮 ——
按钮在 `openSource` 为 `false` 时根本不生成，而不是渲染成一个灰色的假按钮。

### 首屏

`SITE.intro` 两段自我介绍，加到 `SITE` 里即可。
项目数那类统计放在**页脚**一行小字里，首屏不占版面。

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
│  ├─ dsgs.html
│  ├─ vgame-toolkit.html
│  └─ steamcmd-gui.html
├─ src/
│  ├─ data/projects.js        ★ 唯一数据源（改文案、加项目、调排布只动这里）
│  ├─ js/
│  │  ├─ components.js        卡片 / 图标 / 按钮 / CTA 文案表
│  │  ├─ home.js              首页：按 BOARD 渲染排布板 + 「更多」磁贴
│  │  └─ detail.js            详情页渲染器（4 个页面共用）
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
   `id`、`name`、`nameEn`、`tagline`、`blurb`、`summary`、`category`、
   `cta`、`accent`（主题色）、`cover`、`tech`、`links`。
   **没有真实截图就把 `cover` 写成 `null`**，卡片会自动走纯排版样式。

2. 在 `BOARD` 里加一行决定它出现在第几行、多大：`{ id: 'xxx', size: 'lg' }`。

3. **有自己的站点** → `detail: null`，整卡与主按钮都跳 `links.demo`。
   **没有站点** → 写 `detail: { features, sections, specs, structure }`，
   并在 `projects/<id>.html` 建一个外壳（复制任意一个现有文件，改 meta 与
   `data-project` 即可，正文不用写）。

4. 把项目加进 `tools/gen-assets.py` 顶部的 `PROJECTS` 列表并跑一次
   `python tools/gen-assets.py`（只生成分享图；有截图的项目同时生成卡片封面）。

5. `npm run check-links` 确认没有断链，然后提交。

> 详情页的正文**不写在 HTML 里**，而是由 `detail.js` 从 `projects.js` 渲染。
> 这样 4 个详情页只有一份模板，不会各自漂移。HTML 文件存在的意义是给每个
> 页面独立的 `<title>`、`description` 与 OG 标签，方便分享与收录。

---

## 封面与分享图

`tools/gen-assets.py` 生成两样东西，原则是**不编造图**：

- `public/img/cover-<id>.webp` —— 卡片封面，1200×750。
  **只为有真实截图的项目生成**（当前是深海声呐员与股神异闻录）。
  其余项目没有封面，卡片走 `card--plain` 纯排版样式。
- `public/img/og-<id>.jpg` 与 `public/img/og.jpg` —— 1200×630 的分享预览图。
  有截图的用截图压暗后叠标题；没有截图的用一张纯排版分享卡
  （深色底 + 主题色细线 + 项目名）。分享卡是链接预览的版式，不是给项目编的假截图。

用 JPEG 不用 PNG 是因为截图做底时 PNG 会到 800 KB，JPEG 只要 60 KB。

它是**一次性工具**，不属于构建流程（CI 不会跑它）。项目名与主题色在这个脚本里
重复声明了一次，改完记得重跑：

```bash
python tools/gen-assets.py     # 需要 Pillow 与 Windows 字体 msyh.ttc
```

原始截图放在 `.asset-src/`（已 gitignore），产物提交进 `public/img/`。
缺图时脚本会直接打印下载地址。

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
