/**
 * live-version.js —— 版本号的「直接引用」
 *
 * 详情页打开后，直接从 GitHub 上读项目自己的版本文件
 * （raw.githubusercontent.com，带 CORS、不限流），读到就把页面上的版本更新掉。
 * 读不到（离线、被墙、仓库私有）就保持构建时写进 versions.json 的值。
 *
 * 好处是不需要定时重建：源变了，下次有人打开页面就是新的。
 * ref 用 HEAD，自动跟随仓库的默认分支，不写死 main / master。
 */

/** 超时就放弃，不能为了一个版本号让页面卡住 */
const TIMEOUT_MS = 4000

/**
 * id → 读哪个文件、怎么取值。
 * 私有仓库（影游开发套件）页面读不到，不在这里列，永远用构建时的值。
 */
const SOURCES = {
  'hyc-framework': {
    url: 'https://raw.githubusercontent.com/HYClub/hyc-framework/HEAD/com.hyc.framework/package.json',
    pick: (text) => JSON.parse(text)?.version,
  },
  dsgs: {
    url: 'https://raw.githubusercontent.com/HYClub/deepseek-harness-game-studios/HEAD/package.json',
    pick: (text) => JSON.parse(text)?.version,
  },
  'steamcmd-gui': {
    url: 'https://raw.githubusercontent.com/HYClub/SteamCMD_GUI/HEAD/steamcmd_gui.py',
    pick: (text) => text.match(/__version__\s*=\s*["']([0-9][^"']*)["']/)?.[1],
  },
}

async function readVersion({ url, pick }) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' })
    if (!response.ok) return null
    const value = pick(await response.text())
    return typeof value === 'string' && value ? value : null
  } catch {
    // 读不到就用兜底值，不打扰用户
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** 把页面上所有 [data-version-value] 换成读到的最新值。读不到就什么也不做。 */
export async function refreshVersion(projectId) {
  const source = SOURCES[projectId]
  if (!source) return

  const value = await readVersion(source)
  if (!value) return

  for (const el of document.querySelectorAll('[data-version-value]')) {
    el.textContent = value
  }
}
