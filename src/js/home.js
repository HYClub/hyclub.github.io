/**
 * home.js —— 首页
 *
 * 内容就是一块「排布板」：顺序与大小由 projects.js 的 BOARD 决定，
 * 末尾自动补一张「更多 → GitHub」的磁贴。没有筛选、没有分类切换。
 */

import '../styles/site.css'
import { SITE, PROJECTS, boardItems } from '../data/projects.js'
import { brandMark, cardHtml, escapeHtml, moreTileHtml } from './components.js'
import { attachStars } from './live-stats.js'

const $ = (selector, root = document) => root.querySelector(selector)
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]

/* ------------------------------------------------------------ 品牌图标 */
$$('[data-brand-mark]').forEach((el) => {
  el.innerHTML = brandMark
})

/* -------------------------------------------------------------- 首屏 */
function renderHero() {
  const intro = Array.isArray(SITE.intro) ? SITE.intro : [SITE.intro]
  $('#hero-intro').innerHTML = intro
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('')
}

/* -------------------------------------------------------------- 排布板 */
function renderBoard() {
  const html = boardItems()
    .map((project) => cardHtml(project, { size: project.size }))
    .join('')

  const more = moreTileHtml({
    href: SITE.github,
    kicker: '还有更多',
    title: '去 GitHub 看全部仓库',
    desc: '公开仓库、私有项目的更新记录，以及还没做成页面的东西都在那边。',
    meta: '@HYClub',
  })

  $('#board').innerHTML = html + more
}

/* --------------------------------------------------------- 顶栏与页脚 */
function wireTopbar() {
  const topbar = $('.topbar')
  if (!topbar) return
  const onScroll = () => topbar.classList.toggle('is-stuck', window.scrollY > 8)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}

function renderFooter() {
  const year = new Date().getFullYear()
  const years = year > SITE.since ? `${SITE.since}–${year}` : `${SITE.since}`
  $$('[data-footer-years]').forEach((el) => {
    el.textContent = years
  })
  $$('[data-build-time]').forEach((el) => {
    el.textContent = __BUILD_TIME__.slice(0, 10)
  })

  // 项目数这类统计放在页脚一行小字里，首屏不占版面
  const online = PROJECTS.filter((p) => p.links.demo)
  const openSource = PROJECTS.filter((p) => p.openSource)
  $$('[data-footer-stats]').forEach((el) => {
    el.textContent =
      `${PROJECTS.length} 个项目 · ${online.length} 个有在线页面 · ` +
      `${openSource.length} 个开源`
  })
}

/* ---------------------------------------------------------------- 启动 */
renderHero()
renderBoard()
wireTopbar()
renderFooter()

// 星标是后补的，放在最后；读不到就什么都不发生
attachStars()
