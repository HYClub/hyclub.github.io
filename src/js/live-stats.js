/**
 * live-stats.js —— 卡片上的实时仓库数据
 *
 * 目前只有星数。GitHub 的 /repos/{owner}/{repo} 匿名可读、带 CORS，
 * 页面加载后直接拉一次，拉到就把星标插进卡片右上角。
 *
 * 拉不到就不显示 —— 不 loading、不报错、不留空位。
 * 结果缓存在 localStorage 10 分钟，避免同一访客反复刷新把匿名额度（60 次/小时）用光。
 *
 * 克隆数不在这里：GitHub 的 /traffic/clones 需要仓库管理权限，
 * 匿名调用返回 401，静态站点在浏览器里读不到。详见 README。
 */

const CACHE_KEY = 'hyclub:repo-stars:v1'
const CACHE_TTL = 10 * 60 * 1000
const TIMEOUT_MS = 4000

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') ?? {}
  } catch {
    return {}
  }
}

function writeCache(map) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map))
  } catch {
    // 隐私模式 / 配额满，忽略即可
  }
}

async function fetchStars(repo) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      signal: controller.signal,
      headers: { accept: 'application/vnd.github+json' },
    })
    if (!response.ok) return null
    const json = await response.json()
    return typeof json?.stargazers_count === 'number' ? json.stargazers_count : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function starPill(count) {
  const pill = document.createElement('span')
  pill.className = 'pill pill--stars'
  pill.title = `GitHub 星标 ${count}`
  pill.textContent = `★ ${count}`
  return pill
}

export async function attachStars() {
  const cards = [...document.querySelectorAll('[data-repo]')]
  if (!cards.length) return

  const cache = readCache()
  const now = Date.now()
  let dirty = false

  await Promise.all(
    cards.map(async (card) => {
      const repo = card.dataset.repo
      const slot = card.querySelector('.card__badges-right')
      if (!repo || !slot) return

      const cached = cache[repo]
      let stars = cached && now - cached.at < CACHE_TTL ? cached.stars : null

      if (stars === null) {
        stars = await fetchStars(repo)
        if (stars === null) return // 读不到就什么都不显示
        cache[repo] = { stars, at: now }
        dirty = true
      }

      if (stars <= 0) return // 0 星不占位置
      slot.prepend(starPill(stars))
    }),
  )

  if (dirty) writeCache(cache)
}
