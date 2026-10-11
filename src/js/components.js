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
  download: svg('<path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/>'),
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

/** 项目在站内的落点：有详情页走站内，否则走在线演示。 */
export function projectHref(project) {
  return project.detail ? `/projects/${project.id}.html` : project.links.demo
}

/** 封面左上角的状态标。 */
export function statusMeta(project) {
  if (project.links.play) return { text: '在线试玩', live: true, accent: true }
  if (project.links.demo) return { text: '在线演示', live: true, accent: true }
  return { text: '站内详情', live: false, accent: false }
}

/** 封面右上角：开源 / 未开源。 */
export function opennessMeta(project) {
  if (project.links.source) {
    return { text: project.license ?? '开源', strong: false }
  }
  // 私有仓库与「源码未公开」都归到这里
  return { text: '未开源', strong: false }
}

/* -------------------------------------------------------------- 卡片 */
export function cardHtml(project, { feature = false, eager = false } = {}) {
  const status = statusMeta(project)
  const openness = opennessMeta(project)
  const href = projectHref(project)
  const external = !project.detail

  const badges =
    `<div class="card__badges">` +
    `<span class="pill ${status.accent ? 'pill--accent' : ''} ${status.live ? 'pill--live' : ''}">` +
    `<span class="pill__dot"></span>${escapeHtml(status.text)}</span>` +
    `<span class="pill">${escapeHtml(openness.text)}</span>` +
    `</div>`

  const tags = (project.tech ?? [])
    .slice(0, feature ? 5 : 4)
    .map((tag) => `<li class="tag">${escapeHtml(tag)}</li>`)
    .join('')

  const actions = []
  if (project.links.play) {
    actions.push(
      `<a class="btn btn--primary" href="${escapeHtml(project.links.play)}" target="_blank" rel="noopener">` +
        `${icons.play}<span>在线试玩</span></a>`,
    )
  } else if (project.links.demo) {
    actions.push(
      `<a class="btn btn--primary" href="${escapeHtml(project.links.demo)}" target="_blank" rel="noopener">` +
        `${icons.external}<span>打开演示</span></a>`,
    )
  } else {
    actions.push(
      `<a class="btn btn--primary" href="${escapeHtml(href)}">` +
        `${icons.doc}<span>查看详情</span></a>`,
    )
  }

  if (project.links.source) {
    actions.push(
      `<a class="btn" href="${escapeHtml(project.links.source)}" target="_blank" rel="noopener">` +
        `${icons.github}<span>源码</span></a>`,
    )
  }
  if (project.links.download) {
    actions.push(
      `<a class="btn" href="${escapeHtml(project.links.download)}" target="_blank" rel="noopener">` +
        `${icons.download}<span>下载</span></a>`,
    )
  }
  // 有在线演示、同时又有详情页时，补一个站内详情入口
  if (project.detail && (project.links.demo || project.links.play)) {
    actions.push(
      `<a class="btn btn--ghost" href="/projects/${escapeHtml(project.id)}.html">` +
        `${icons.arrow}<span>详情</span></a>`,
    )
  }

  const media =
    `<div class="card__media">` +
    `<img src="${escapeHtml(project.cover)}" alt="${escapeHtml(project.name)} 封面" ` +
    `width="1200" height="750" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'} />` +
    badges +
    `</div>`

  const body =
    `<div class="card__body">` +
    `<h3 class="card__title">${escapeHtml(project.name)}` +
    `<span class="card__title-en">${escapeHtml(project.nameEn)}</span></h3>` +
    `<p class="card__line">${escapeHtml(project.oneLiner)}</p>` +
    `<ul class="card__tags">${tags}</ul>` +
    `</div>`

  return (
    `<article class="card ${feature ? 'card--feature' : ''}" style="${accentStyle(project)}" ` +
    `data-category="${escapeHtml(project.category)}" data-id="${escapeHtml(project.id)}">` +
    media +
    body +
    `<div class="card__actions">${actions.join('')}</div>` +
    `</article>`
  )
}

/* ------------------------------------------------------- 站点图标（内联 SVG） */
export const brandMark = `<svg class="brand__mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <rect x="1.2" y="1.2" width="29.6" height="29.6" rx="9" stroke="rgba(255,255,255,.22)" stroke-width="1.4"/>
  <path d="M10 21.5V10.5" stroke="#4f8cff" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M22 21.5V10.5" stroke="#3ec9d6" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M10 16h12" stroke="rgba(255,255,255,.75)" stroke-width="2.2" stroke-linecap="round"/>
</svg>`
