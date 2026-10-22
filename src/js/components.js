/**
 * components.js —— 共享的渲染片段
 *
 * 卡片、按钮、图标都从这里生成，首页与详情页共用，
 * 保证同一份 projects.js 数据在两处渲染出一致的外观。
 */

/* ------------------------------------------------------------- 图标 */
const svg = (paths, extra = '') =>
  `<svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
  `stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" ${extra} ` +
  `aria-hidden="true">${paths}</svg>`

export const icons = {
  play: svg('<path d="M6 4.5 19 12 6 19.5Z" fill="currentColor" stroke="none"/>'),
  external: svg(
    '<path d="M13 5h6v6"/><path d="M19 5 11 13"/>' +
      '<path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  ),
  github: svg(
    '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.8 1.8 5.8 2.1 5.8 2.1a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.4 8.7c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  ),
  arrow: svg('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
  arrowLeft: svg('<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>'),
  doc: svg(
    '<path d="M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5Z"/>' +
      '<path d="M14 3v4.5h4.5"/><path d="M9 13h6"/><path d="M9 17h4"/>',
  ),
}

/* --------------------------------------------------------- 小工具 */
export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (ch) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
  )

/** 把 #rrggbb 转成 "r, g, b"，用于 rgba() 拼装（比 color-mix 兼容性更稳）。 */
export function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const num = Number.parseInt(full, 16)
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`
}

/** 注入到卡片根节点的主题色变量。 */
export const accentStyle = (project) =>
  `--accent:${project.accent};--accent-rgb:${hexToRgb(project.accent)}`

/* ---------------------------------------------------------------- CTA */
/**
 * 卡片主按钮的语义。标签必须说实话 ——
 * 「能玩的游戏」和「一页介绍」不该共用同一个词。
 */
export const CTA = {
  play: { label: '在线试玩', badge: '可以玩', accent: true, live: true },
  demo: { label: '查看演示', badge: '演示页', accent: true, live: false },
  site: { label: '访问官网', badge: '官网', accent: true, live: false },
  explore: { label: '进去探索', badge: '可探索', accent: true, live: false },
  intro: { label: '查看介绍', badge: '项目介绍', accent: true, live: false },
  detail: { label: '查看详情', badge: '站内详情', accent: false, live: false },
}

const ctaOf = (project) => CTA[project.cta] ?? CTA.detail

/** 卡片本身的落点：有自己的页面就直接跳页面，没有才走站内详情页。 */
export function cardHref(project) {
  return project.links.demo ?? `/projects/${project.id}.html`
}

export function isExternal(project) {
  return Boolean(project.links.demo)
}

/** 主按钮的落点。 */
function primaryHref(project) {
  if (project.cta === 'play' && project.links.play) return project.links.play
  if (project.links.demo) return project.links.demo
  return `/projects/${project.id}.html`
}

function primaryIcon(project) {
  if (project.cta === 'play') return icons.play
  if (project.links.demo) return icons.external
  return icons.doc
}

/**
 * 右上角的开源徽章。
 *
 * 判断依据是项目数据里的 `openSource` —— 也就是「这个项目的源码本身公不公开」，
 * 而不是「有没有公开仓库」或「有没有 Pages」。有公开的演示页仓库、
 * 有只放构建产物的分支，都不等于项目开源。
 *
 * 有许可证时渲染成两段式徽章（标签 | 值），比单独一个「MIT」清楚得多。
 */
export function opennessBadgeHtml(project) {
  if (!project.openSource) {
    return `<span class="pill">未开源</span>`
  }
  if (!project.license) {
    return `<span class="pill pill--accent"><span class="pill__dot"></span>开源</span>`
  }
  return (
    `<span class="pill pill--split">` +
    `<span class="pill__seg">开源</span>` +
    `<span class="pill__seg pill__seg--value">${escapeHtml(project.license)}</span>` +
    `</span>`
  )
}

/**
 * 从 links.source 里取出 "owner/repo"，供星标使用。
 * 只有 showStars 打开的项目才返回 —— 星数是页面加载后实时拉的，
 * 每处标记都会产生一次 GitHub API 请求，没必要为 0 星的项目花。
 */
export function starredRepoSlug(project) {
  if (!project.showStars || !project.links.source) return null
  try {
    const url = new URL(project.links.source)
    if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') return null
    const [owner, name] = url.pathname.split('/').filter(Boolean)
    return owner && name ? `${owner}/${name}` : null
  } catch {
    return null
  }
}

/**
 * 星标占位。渲染时是空的并且 hidden —— 拉到数据才由 live-stats.js 填上并显示，
 * 读不到或 0 星就永远不出现，不占位置也不会让旁边的徽章移位。
 * 首页卡片和详情页共用这一个片段。
 */
export function starPillHtml(project) {
  const slug = starredRepoSlug(project)
  if (!slug) return ''
  return `<span class="pill pill--stars" data-stars-for="${escapeHtml(slug)}" hidden></span>`
}

/* -------------------------------------------------------------- 卡片 */
export function cardHtml(project, { size = 'sm' } = {}) {
  const cta = ctaOf(project)
  const href = cardHref(project)
  const external = isExternal(project)
  const tagLimit = size === 'lg' ? 5 : 3
  const hasCover = Boolean(project.cover)

  // 上架插件市场的标记：只在 links.marketplace 存在时出现，
  // 和「开源 | MIT」放一起，因为这三者回答的是同一类问题（这仓库是什么状态）。
  const marketPill = project.links?.marketplace
    ? `<span class="pill pill--market" title="已收录进 awesome-dsh-plugin（DSH 插件市场）">✓ 已收录</span>`
    : ''

  // 右侧单独包一层：星标是后加的，放进这个容器里只会向左长，
  // 不会把「开源 | MIT」推出原位。
  const badgesInner =
    `<span class="pill ${cta.accent ? 'pill--accent' : ''} ${cta.live ? 'pill--live' : ''}">` +
    `<span class="pill__dot"></span>${escapeHtml(cta.badge)}</span>` +
    `<span class="card__badges-right">${starPillHtml(project)}${marketPill}${opennessBadgeHtml(project)}</span>`

  const tags = (project.tech ?? [])
    .slice(0, tagLimit)
    .map((tag) => `<li class="tag">${escapeHtml(tag)}</li>`)
    .join('')

  const primaryTarget = primaryHref(project)
  const actions = [
    `<a class="btn btn--primary" href="${escapeHtml(primaryTarget)}"` +
      `${external || project.cta === 'play' ? ' target="_blank" rel="noopener"' : ''}>` +
      `${primaryIcon(project)}<span>${escapeHtml(cta.label)}</span></a>`,
  ]

  // 「可以玩」的卡片只给一个「在线试玩」。
  //
  // 主按钮直接进游戏本体时，项目主页仍然够得着 —— 整张卡片本身就是
  // 指向 project.links.demo 的链接（见 cardHref）。再挂一个「查看详情」
  // 会和卡片点击重复，而且只有「试玩地址 ≠ 主页」的项目才有，
  // 结果同样是「可以玩」的两张卡长出了不一样的按钮数。
  //
  // 源码按钮跟着 openSource 走，不跟着「有没有 Pages」走 ——
  // 只有项目源码本身公开时才给入口。
  if (project.openSource && project.links.source) {
    actions.push(
      `<a class="btn" href="${escapeHtml(project.links.source)}" target="_blank" rel="noopener">` +
        `${icons.github}<span>源码</span></a>`,
    )
  }

  // 整卡可点：一个铺满卡片的隐形链接；按钮层级更高，仍然各自可点
  const stretch =
    `<a class="card__stretch" href="${escapeHtml(href)}"` +
    `${external ? ' target="_blank" rel="noopener"' : ''}>` +
    `<span class="sr-only">打开 ${escapeHtml(project.name)}</span></a>`

  // 有截图的才放图。没有截图的项目不硬凑配图 ——
  // 改为纯排版卡片，用主题色底与顶边线撑住，比塞一张假图诚实。
  const media = hasCover
    ? `<div class="card__media">` +
      `<img src="${escapeHtml(project.cover)}" alt="" width="1200" height="750" ` +
      `loading="lazy" decoding="async" />` +
      `<div class="card__badges">${badgesInner}</div>` +
      `</div>`
    : ''

  const body =
    `<div class="card__body">` +
    (hasCover ? '' : `<div class="card__badges card__badges--static">${badgesInner}</div>`) +
    `<h3 class="card__title">${escapeHtml(project.name)}` +
    `<span class="card__title-en">${escapeHtml(project.nameEn)}</span></h3>` +
    `<p class="card__line">${escapeHtml(project.blurb)}</p>` +
    `<ul class="card__tags">${tags}</ul>` +
    `</div>`

  return (
    `<article class="card card--${size}${hasCover ? '' : ' card--plain'}" ` +
    `style="${accentStyle(project)}" data-id="${escapeHtml(project.id)}">` +
    stretch +
    media +
    body +
    `<div class="card__actions">${actions.join('')}</div>` +
    `</article>`
  )
}

/* ----------------------------------------------------- 「更多」磁贴 */
export function moreTileHtml({ href, kicker, title, desc, meta }) {
  return (
    `<a class="tile-more" href="${escapeHtml(href)}" target="_blank" rel="noopener">` +
    `<span class="tile-more__kicker mono">${escapeHtml(kicker)}</span>` +
    `<span class="tile-more__title">${escapeHtml(title)}</span>` +
    `<span class="tile-more__desc">${escapeHtml(desc)}</span>` +
    `<span class="tile-more__foot">` +
    `<span class="tile-more__meta mono">${escapeHtml(meta)}</span>` +
    `<span class="tile-more__icon">${icons.arrow}</span>` +
    `</span>` +
    `</a>`
  )
}

/* --------------------------------------------- 站点图标（内联 SVG） */
export const brandMark = `<svg class="brand__mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <rect x="1.2" y="1.2" width="29.6" height="29.6" rx="9" stroke="rgba(255,255,255,.22)" stroke-width="1.4"/>
  <path d="M10 21.5V10.5" stroke="#4f8cff" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M22 21.5V10.5" stroke="#3ec9d6" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M10 16h12" stroke="rgba(255,255,255,.75)" stroke-width="2.2" stroke-linecap="round"/>
</svg>`
