#!/usr/bin/env node
/**
 * check-links.mjs —— 手动跑的链接体检（不进 CI）
 *
 * 校验三类东西：
 *   1. projects.js 里的所有外部链接是否可达
 *   2. 每个项目的详情页 HTML 是否存在（detail !== null 的那些）
 *   3. 封面图 / 分享图是否都在 public/img 下
 *
 * 用法：  npm run check-links
 *        npm run check-links -- --internal-only   只查站内，不联网
 */

import { readFile, access } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { PROJECTS, SITE } from '../src/data/projects.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const internalOnly = process.argv.includes('--internal-only')

const ok = (msg) => console.log(`  \u001b[32m✓\u001b[0m ${msg}`)
const bad = (msg) => console.log(`  \u001b[31m✗\u001b[0m ${msg}`)
const info = (msg) => console.log(`\n\u001b[1m${msg}\u001b[0m`)

const exists = async (relative) => {
  try {
    await access(resolve(root, relative))
    return true
  } catch {
    return false
  }
}

async function checkUrl(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25_000)
  try {
    let response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'hyclub-portfolio-link-check' },
    })
    // 有些主机不支持 HEAD，回退到 GET
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
      })
    }
    return { status: response.status, finalUrl: response.url, ok: response.ok }
  } catch (error) {
    return { status: 0, error: error.message, ok: false }
  } finally {
    clearTimeout(timer)
  }
}

/* -------------------------------------------------------- 站内资源检查 */
info('站内资源')

let internalProblems = 0

for (const project of PROJECTS) {
  if (project.detail && !(await exists(`projects/${project.id}.html`))) {
    bad(`${project.id}：缺少详情页 projects/${project.id}.html`)
    internalProblems += 1
  }
  const cover = project.cover.replace(/^\//, 'public/')
  if (!(await exists(cover))) {
    bad(`${project.id}：缺少封面 ${cover}`)
    internalProblems += 1
  }
}

for (const asset of ['public/img/og.png', 'public/favicon.svg', 'public/404.html']) {
  if (!(await exists(asset))) {
    bad(`缺少 ${asset}`)
    internalProblems += 1
  }
}

// 详情页里的站内链接指向的路径
for (const project of PROJECTS) {
  if (project.detail) continue
  for (const key of ['demo', 'play']) {
    const value = project.links[key]
    if (value && value.startsWith(SITE.url)) {
      bad(`${project.id}.links.${key} 指向本站地址，应该走详情页或站内路径：${value}`)
      internalProblems += 1
    }
  }
}

if (internalProblems === 0) ok(`${PROJECTS.length} 个项目的详情页、封面与基础资源齐全`)

/* ---------------------------------------------------------- 外链检查 */
const external = []
for (const project of PROJECTS) {
  for (const [key, value] of Object.entries(project.links)) {
    if (value) external.push({ project: project.id, key, url: value })
  }
}
external.push({ project: 'site', key: 'github', url: SITE.github })

info(`外部链接（${external.length} 条）`)

let externalProblems = 0

if (internalOnly) {
  console.log('  已跳过（--internal-only）')
} else {
  const results = await Promise.all(
    external.map(async (entry) => ({ ...entry, ...(await checkUrl(entry.url)) })),
  )
  for (const result of results) {
    if (result.ok) {
      ok(`${result.project}.${result.key} → ${result.status}`)
    } else {
      bad(
        `${result.project}.${result.key} → ${result.status || result.error}  ${result.url}`,
      )
      externalProblems += 1
    }
  }
}

/* ------------------------------------------------------------- 汇总 */
info('汇总')
console.log(`  站内问题：${internalProblems}`)
console.log(`  外链问题：${internalOnly ? '未检查' : externalProblems}`)

if (internalProblems > 0 || externalProblems > 0) {
  process.exitCode = 1
} else {
  console.log('  \u001b[32m全部通过\u001b[0m')
}
