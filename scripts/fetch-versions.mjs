#!/usr/bin/env node
/**
 * fetch-versions.mjs —— 构建前抓取各项目的真实版本号
 *
 * 版本号不手写，从这个项目自己的「版本源头」读：
 *   tag          —— git tag，取语义化版本最大的那个
 *   json         —— 仓库里某个 package.json 的 version 字段
 *   const        —— 源码里的某个版本常量（正则提取）
 *
 * 结果写进 src/data/versions.json，projects.js 在加载时用覆盖手写的 version。
 * 这样只要重新构建，站上就是最新版本；配了定时任务就能天天自动刷新。
 *
 * 为什么要构建时抓、而不是页面里 fetch GitHub API：
 * 匿名 API 每小时只有 60 次限额，访客一多就拉不到；构建时抓一次就够。
 *
 * 用法：  npm run versions
 *        GITHUB_TOKEN=xxx npm run versions     # 读私有库时需要
 *
 * 抓取失败不会让构建失败 —— 保留上一次的值（或 projects.js 里手写的值）。
 */

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'src/data/versions.json')

/** 每个项目的版本源头。改项目版本策略时只改这张表。 */
const SOURCES = {
  'hyc-framework': {
    repo: 'HYClub/hyc-framework',
    kind: 'json',
    path: 'com.hyc.framework/package.json',
  },
  dsgs: {
    repo: 'HYClub/deepseek-harness-game-studios',
    kind: 'tag',
  },
  'vgame-toolkit': {
    repo: 'HYClub/vgame-toolkit',
    kind: 'json',
    path: 'package.json',
  },
  'steamcmd-gui': {
    repo: 'HYClub/SteamCMD_GUI',
    kind: 'const',
    path: 'steamcmd_gui.py',
    pattern: /__version__\s*=\s*["']([0-9][^"']*)["']/,
  },
}

const api = 'https://api.github.com'

async function resolveToken() {
  const fromEnv = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  if (fromEnv) return fromEnv
  try {
    const { execFileSync } = await import('node:child_process')
    const token = execFileSync('gh', ['auth', 'token'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    return token || null
  } catch {
    return null
  }
}

async function request(path, token, accept) {
  const headers = {
    accept: accept ?? 'application/vnd.github+json',
    'user-agent': 'hyclub-portfolio-version-fetch',
  }
  if (token) headers.authorization = `Bearer ${token}`

  let lastError = null
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(api + path, { headers, redirect: 'follow' })
      if (response.status === 404) return { notFound: true }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return accept === 'application/vnd.github.raw'
        ? { text: await response.text() }
        : { json: await response.json() }
    } catch (error) {
      lastError = error
      // 本地代理偶发 EOF，退避重试
      await new Promise((r) => setTimeout(r, 700 * attempt))
    }
  }
  throw lastError ?? new Error('request failed')
}

/** 语义化版本比较，能处理 v 前缀与 1.2.3 这种格式。 */
function compareVersions(a, b) {
  const clean = (v) => v.replace(/^v/i, '').split(/[.-]/).map((p) => (/^\d+$/.test(p) ? Number(p) : p))
  const left = clean(a)
  const right = clean(b)
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const l = left[i] ?? 0
    const r = right[i] ?? 0
    if (typeof l === 'number' && typeof r === 'number') {
      if (l !== r) return l - r
    } else if (String(l) !== String(r)) {
      return String(l) < String(r) ? -1 : 1
    }
  }
  return 0
}

/** 读仓库里的原始文件。404 单独报清楚，别让它变成 JSON 解析错误。 */
async function readRaw(repo, path, token) {
  const result = await request(
    `/repos/${repo}/contents/${path}`,
    token,
    'application/vnd.github.raw',
  )
  if (result.notFound) {
    throw new Error(`${repo}/${path} 读不到（私有仓库需要带 token）`)
  }
  return result.text
}

async function resolveVersion(id, spec, token) {
  if (spec.kind === 'tag') {
    const result = await request(`/repos/${spec.repo}/tags?per_page=30`, token)
    if (result.notFound) {
      throw new Error(`${spec.repo} 不可读（私有仓库需要带 token）`)
    }
    const names = (result.json ?? []).map((t) => t.name)
    if (!names.length) throw new Error('仓库没有 tag')
    const newest = names.sort(compareVersions).at(-1)
    return newest.replace(/^v/i, '')
  }

  if (spec.kind === 'json') {
    const text = await readRaw(spec.repo, spec.path, token)
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      throw new Error(`${spec.path} 不是合法的 JSON`)
    }
    const version = parsed?.version
    if (!version) throw new Error(`${spec.path} 里没有 version 字段`)
    return version
  }

  if (spec.kind === 'const') {
    const text = await readRaw(spec.repo, spec.path, token)
    const match = text.match(spec.pattern)
    if (!match) throw new Error(`${spec.path} 里没匹配到版本常量`)
    return match[1]
  }

  throw new Error(`未知的 kind: ${spec.kind}`)
}

async function readExisting() {
  try {
    const raw = await readFile(OUT, 'utf8')
    return JSON.parse(raw)?.versions ?? {}
  } catch {
    return {}
  }
}

async function main() {
  const previous = await readExisting()
  const token = await resolveToken()
  const versions = { ...previous }
  const failed = []

  for (const [id, spec] of Object.entries(SOURCES)) {
    try {
      const version = await resolveVersion(id, spec, token)
      const changed = previous[id] !== version
      versions[id] = version
      console.log(`  ${changed ? '更新' : '未变'}  ${id.padEnd(16)} ${version}`)
    } catch (error) {
      const kept = previous[id]
      failed.push(id)
      console.warn(
        `  ${kept ? '沿用' : '跳过'}  ${id.padEnd(16)} ` +
          `${kept ?? '(无历史值)'}  —— ${error.message}${token ? '' : '（无 token，私有库读不到）'}`,
      )
    }
  }

  const payload = {
    _note: '由 scripts/fetch-versions.mjs 生成，构建前会自动刷新；不要手改。',
    _fetchedAt: new Date().toISOString(),
    ...(failed.length ? { _failed: failed } : {}),
    versions,
  }

  await writeFile(OUT, JSON.stringify(payload, null, 2) + '\n', 'utf8')
  console.log(`\n写入 ${OUT.replace(root + '\\', '').replace(root + '/', '')}`)
  if (failed.length) {
    console.warn(`抓取失败 ${failed.length} 个：${failed.join(', ')}（已保留上次的值）`)
  }
}

// 版本号只影响展示，任何失败都不该挡住构建
main().catch((error) => {
  console.warn(`版本抓取整体失败，保留原文件：${error.message}`)
})
