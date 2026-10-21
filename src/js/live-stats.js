/**
 * live-stats.js —— 卡片 / 详情页上的实时仓库数据
 *
 * 目前只有星数。GitHub 的 /repos/{owner}/{repo} 匿名可读、带 CORS，
 * 页面加载后按 [data-stars-for] 标记逐个拉一次，拉到就填上并显示。
 *
 * 占位是隐藏的空胶囊，所以：
 *   - 拿到数据 → 出现；读不到或 0 星 → 永远不出现，不留空位、不报错
 *   - 同一页面里同一个仓库只请求一次（首页卡片和详情页可能同时出现）
 * 
 * 结果缓存在 localStorage 10 分钟，避免同一访客反复刷新把匿名额度（60 次/小时）用光。
 *
 * 克隆数不在这里：GitHub 的 /traffic/clones 需要仓库管理权限，
 * 匿名调用返回 401，静态站点的访客在浏览器里读不到。详见 README。
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

export async function attachStars() {
  const slots = [...document.querySelectorAll('[data-stars-for]')]
  if (!slots.length) return

  const cache = readCache()
  const now = Date.now()
  const repos = [...new Set(slots.map((el) => el.dataset.starsFor).filter(Boolean))]

  const counts = new Map()
  let dirty = false

  await Promise.all(
    repos.map(async (repo) => {
      const cached = cache[repo]
      if (cached && now - cached.at < CACHE_TTL) {
        counts.set(repo, cached.stars)
        return
      }
      const stars = await fetchStars(repo)
      if (stars === null) return // 读不到就什么都不显示
      counts.set(repo, stars)
      cache[repo] = { stars, at: now }
      dirty = true
    }),
  )

  if (dirty) writeCache(cache)

  for (const slot of slots) {
    const stars = counts.get(slot.dataset.starsFor)
    if (typeof stars !== 'number' || stars <= 0) continue
    slot.textContent = `★ ${stars}`
    slot.title = `GitHub 星标 ${stars}`
    slot.hidden = false
  }
}
