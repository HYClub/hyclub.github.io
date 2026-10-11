/**
 * home.js —— 首页
 *
 * 首屏「精选」大卡 + 可筛选的全部项目网格，两者都由 projects.js 渲染。
 */

import '../styles/site.css'
import { SITE, PROJECTS, CATEGORIES } from '../data/projects.js'
import { brandMark, cardHtml, escapeHtml } from './components.js'

const $ = (selector, root = document) => root.querySelector(selector)
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]

/* ------------------------------------------------------------ 品牌图标 */
$$('[data-brand-mark]').forEach((el) => {
  el.innerHTML = brandMark
})

/* -------------------------------------------------------------- 首屏 */
function renderHero() {
  const games = PROJECTS.filter((p) => p.category === 'game')
  const playable = PROJECTS.filter((p) => p.links.play || p.links.demo)
  const openSource = PROJECTS.filter((p) => p.links.source)

  const stats = [
    { value: PROJECTS.length, label: 'Projects' },
    { value: playable.length, label: 'Live demos' },
    { value: games.length, label: 'Games' },
    { value: openSource.length, label: 'Open source' },
  ]

  $('#hero-stats').innerHTML = stats
    .map(
      (stat) =>
        `<div class="stat"><div class="stat__value">${stat.value}</div>` +
        `<div class="stat__label">${escapeHtml(stat.label)}</div></div>`,
    )
    .join('')

  $('#hero-intro').textContent = SITE.intro
}

/* -------------------------------------------------------------- 精选 */
function renderFeatured() {
  const featured = PROJECTS.filter((p) => p.featured)
  $('#featured-list').innerHTML = featured
    .map((project, index) => cardHtml(project, { feature: true, eager: index < 2 }))
    .join('')
}

/* ------------------------------------------------------------ 筛选 + 网格 */
function renderGrid() {
  const counts = { all: PROJECTS.length }
  for (const project of PROJECTS) {
    counts[project.category] = (counts[project.category] ?? 0) + 1
  }

  $('#filters').innerHTML = CATEGORIES.map((category) => {
    const count = counts[category.id] ?? 0
    return (
      `<button class="chip" type="button" data-filter="${category.id}" ` +
      `aria-pressed="${category.id === 'all'}">` +
      `${escapeHtml(category.label)}<span class="chip__count">${count}</span></button>`
    )
  }).join('')

  const order = ['game', 'engine', 'tool']
  const sorted = [...PROJECTS].sort((a, b) => {
    const byCategory = order.indexOf(a.category) - order.indexOf(b.category)
    if (byCategory !== 0) return byCategory
    return a.name.localeCompare(b.name, 'zh-Hans-CN')
  })

  $('#grid').innerHTML = sorted.map((project) => cardHtml(project)).join('')
  $('#empty').hidden = true
}

function wireFilters() {
  const filters = $('#filters')
  const grid = $('#grid')
  const empty = $('#empty')

  filters.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter]')
    if (!chip) return

    const wanted = chip.dataset.filter
    $$('.chip', filters).forEach((el) =>
      el.setAttribute('aria-pressed', String(el === chip)),
    )

    let visible = 0
    $$('.card', grid).forEach((card) => {
      const match = wanted === 'all' || card.dataset.category === wanted
      card.hidden = !match
      if (match) visible += 1
    })

    empty.hidden = visible > 0
  })
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
}

/* ---------------------------------------------------------------- 启动 */
renderHero()
renderFeatured()
renderGrid()
wireFilters()
wireTopbar()
renderFooter()
