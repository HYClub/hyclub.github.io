/**
 * detail.js —— 项目详情页
 *
 * 所有详情页共用一个渲染器：HTML 文件只负责 meta 与 <body data-project="…">，
 * 正文全部由这里按 projects.js 的数据渲染，避免 5 份重复模板各自漂移。
 */

import '../styles/site.css'
import { SITE, PROJECTS, getProject } from '../data/projects.js'
import { brandMark, escapeHtml, hexToRgb, icons, starPillHtml } from './components.js'
import { refreshVersion } from './live-version.js'
import { attachStars } from './live-stats.js'

const $ = (selector, root = document) => root.querySelector(selector)
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]

const CATEGORY_LABEL = {
  game: '游戏 / Game',
  engine: '引擎 · 框架 / Engine',
  tool: '工具 / Tool',
}

const id = document.body.dataset.project
const project = getProject(id)

if (!project) {
  throw new Error(`projects.js 里没有 id 为 "${id}" 的项目`)
}

/* ---------------------------------------------------- 主题色注入到根节点 */
const root = document.documentElement
root.style.setProperty('--accent', project.accent)
root.style.setProperty('--accent-rgb', hexToRgb(project.accent))

$$('[data-brand-mark]').forEach((el) => {
  el.innerHTML = brandMark
})

/* ------------------------------------------------------------ 片段构造 */
const metaItems = [
  ['语言', project.lang],
  ['版本', project.version],
  ['许可证', project.license],
  ['年份', project.year],
].filter(([, value]) => value)

// 「版本」这一格打上标记，页面加载后由 live-version.js 换成现读的最新值
const metaHtml = metaItems
  .map(([key, value]) => {
    const val =
      key === '版本'
        ? `<span class="meta__val" data-version-value>${escapeHtml(value)}</span>`
        : `<span class="meta__val">${escapeHtml(value)}</span>`
    return `<div class="meta__item"><span class="meta__key">${escapeHtml(key)}</span>${val}</div>`
  })
  .join('')

const linkButtons = []
if (project.links.play) {
  linkButtons.push(
    `<a class="btn btn--primary" href="${escapeHtml(project.links.play)}" target="_blank" rel="noopener">` +
      `${icons.play}<span>在线试玩</span></a>`,
  )
}
if (project.links.demo) {
  linkButtons.push(
    `<a class="btn btn--primary" href="${escapeHtml(project.links.demo)}" target="_blank" rel="noopener">` +
      `${icons.external}<span>打开演示页</span></a>`,
  )
}
if (project.openSource && project.links.source) {
  linkButtons.push(
    `<a class="btn" href="${escapeHtml(project.links.source)}" target="_blank" rel="noopener">` +
      `${icons.github}<span>查看源码</span></a>`,
  )
}

const detail = project.detail ?? {}

const featuresHtml = (detail.features ?? [])
  .map(
    (feature) =>
      `<div class="feature"><h3 class="feature__title">${escapeHtml(feature.title)}</h3>` +
      `<p class="feature__desc">${escapeHtml(feature.desc)}</p></div>`,
  )
  .join('')

const sectionsHtml = (detail.sections ?? [])
  .map(
    (section) =>
      `<div class="prose__item"><h3>${escapeHtml(section.heading)}</h3>` +
      section.body.map((para) => `<p>${escapeHtml(para)}</p>`).join('') +
      `</div>`,
  )
  .join('')

// 规格里的 {version} 占位符换成版本号，并且包一层 data-version-value，
// 这样页面加载后 live-version.js 能连同顶部那格一起更新。
// 免得规格表里再手写一份版本、跟顶部的版本标签各写各的。
const VERSION = project.version ?? '—'

function specValueHtml(text) {
  const [head, ...tail] = String(text).split('{version}')
  if (!tail.length) return escapeHtml(text)
  return (
    escapeHtml(head) +
    `<span data-version-value>${escapeHtml(VERSION)}</span>` +
    escapeHtml(tail.join('{version}'))
  )
}

const specsHtml = (detail.specs ?? [])
  .map(
    ([key, value]) =>
      `<div class="spec"><span class="spec__key">${escapeHtml(key)}</span>` +
      `<span class="spec__val">${specValueHtml(value)}</span></div>`,
  )
  .join('')

const structureHtml = (detail.structure ?? [])
  .map((line) => `<li>${escapeHtml(line)}</li>`)
  .join('')

/* --------------------------------------------------------------- 分页 */
const siblings = PROJECTS.filter((p) => p.detail !== null)
const index = siblings.findIndex((p) => p.id === project.id)
const prev = index > 0 ? siblings[index - 1] : siblings[siblings.length - 1]
const next = index < siblings.length - 1 ? siblings[index + 1] : siblings[0]

const pagerHtml =
  siblings.length > 1
    ? `<nav class="pager" aria-label="项目导航">` +
      `<a class="pager__link" href="/projects/${escapeHtml(prev.id)}.html">` +
      `<div class="pager__dir">← 上一个</div><div class="pager__name">${escapeHtml(prev.name)}</div></a>` +
      `<a class="pager__link pager__link--next" href="/projects/${escapeHtml(next.id)}.html">` +
      `<div class="pager__dir">下一个 →</div><div class="pager__name">${escapeHtml(next.name)}</div></a>` +
      `</nav>`
    : ''

/* --------------------------------------------------------------- 渲染 */
$('#main').innerHTML = `
  <div class="detail-hero">
    <div class="wrap">
      <a class="back" href="/">${icons.arrowLeft}<span>全部项目</span></a>
      <div class="detail-hero__kicker mono">${escapeHtml(
        CATEGORY_LABEL[project.category] ?? project.category,
      )}</div>
      <h1>${escapeHtml(project.name)}</h1>
      <p class="detail-hero__en">${escapeHtml(project.nameEn)}</p>
      <p class="detail-hero__tagline">${escapeHtml(project.tagline)}</p>
      <p class="detail-hero__summary">${escapeHtml(project.summary)}</p>
      <div class="meta">${metaHtml}</div>
      ${starPillHtml(project) ? `<div class="detail-stars">${starPillHtml(project)}</div>` : ''}
      <div class="detail-links">${linkButtons.join('')}</div>
      ${
        project.cover
          ? `<figure class="detail-cover">
               <img src="${escapeHtml(project.cover)}" alt="${escapeHtml(
                 project.name,
               )} 封面" width="1200" height="750" fetchpriority="high" />
             </figure>`
          : ''
      }
    </div>
  </div>

  <div class="wrap">
    ${
      featuresHtml
        ? `<section class="block"><h2 class="block__title">核心能力</h2>
             <div class="features">${featuresHtml}</div></section>`
        : ''
    }
    ${
      sectionsHtml
        ? `<section class="block"><h2 class="block__title">详细介绍</h2>
             <div class="prose">${sectionsHtml}</div></section>`
        : ''
    }
    ${
      specsHtml
        ? `<section class="block"><h2 class="block__title">规格</h2>
             <div class="specs">${specsHtml}</div></section>`
        : ''
    }
    ${
      structureHtml
        ? `<section class="block"><h2 class="block__title">仓库结构</h2>
             <ul class="structure">${structureHtml}</ul></section>`
        : ''
    }
    ${pagerHtml}
  </div>
`

/* --------------------------------------------------------- 顶栏与页脚 */
const topbar = $('.topbar')
if (topbar) {
  const onScroll = () => topbar.classList.toggle('is-stuck', window.scrollY > 8)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}

const year = new Date().getFullYear()
const years = year > SITE.since ? `${SITE.since}–${year}` : `${SITE.since}`
$$('[data-footer-years]').forEach((el) => {
  el.textContent = years
})
$$('[data-build-time]').forEach((el) => {
  el.textContent = __BUILD_TIME__.slice(0, 10)
})

/* ------------------------------------------------------------ 版本号 */
// 页面已经用构建时写入的版本渲染好了，这里再向源站要一次最新值；
// 读到就替换，读不到就保持原样（不 loading、不报错、不阻塞）。
refreshVersion(project.id)

/* -------------------------------------------------------------- 星标 */
// 同理：读不到就不显示，不影响页面其余部分。
attachStars()
