/**
 * projects.js —— 展示站的唯一数据源
 *
 * 首页排布、卡片按钮、详情页内容、分享预览图，全部由这个文件驱动。
 * 增删项目、改文案、换主题色，只改这里（外加重跑 tools/gen-assets.py 生成封面）。
 *
 * 字段约定：
 *   category   game | engine | tool        卡片上的分组标签
 *   cta        卡片主按钮的语义，见 components.js 的 CTA 表 ——
 *              play 真的能玩 / demo 演示页 / explore 可探索 / intro 介绍页 / detail 站内详情。
 *              标签必须说实话：不是能玩的游戏就不要写「在线试玩」。
 *   accent     项目主题色，同时用于卡片描边、悬停辉光与封面配色
 *   links      值为 null 的按钮不会渲染（而不是渲染成灰色假按钮）
 *   detail     为 null 表示该项目有在线站点，卡片直接跳外链；
 *              有内容则渲染 projects/<id>.html 详情页
 */

import versionData from './versions.json' with { type: 'json' }

/**
 * 构建前由 scripts/fetch-versions.mjs 从各项目的版本源头抓到的真实版本号。
 * 抓取失败时该文件会保留上一次的值，所以这里不会是空的。
 */
const VERSIONS = versionData?.versions ?? {}

export const SITE = {
  name: 'HYClub',
  title: 'HYClub · 项目与作品',
  tagline: '游戏 · 引擎 · 工具 · AI',
  intro: [
    '独立开发者。做游戏，也做支撑游戏的引擎与工具 —— 从 Unity 底层的 DOTS/ECS 框架，到打开浏览器就能玩的成品。习惯把一件事从头做到能用：底层自己写，手感自己调，最后一公里也自己铺完。',
    '深度使用 AI 创造，也一直在探索它的边界：不只让它补全代码，而是和它一起写框架、做游戏、搭内容生产线，看看一个人借助 AI 究竟能把产出推到多远。',
  ],
  url: 'https://huoyue.club/',
  github: 'https://github.com/HYClub',
  since: 2018,
  ogImage: '/img/og.jpg',
}

/**
 * 首页排布（顺序即显示顺序）。
 *
 * 栅格是 4 列：
 *   lg = 占 2 列的大卡，一行放 2 个
 *   sm = 占 1 列的小卡，一行放 4 个
 *
 * 想换排布就调整这个数组，卡片样式会自动跟着 size 走。
 * 末尾的「更多 → GitHub」卡片由 home.js 自动补上。
 */
export const BOARD = [
  // 第一行 · 两个大卡，最重要的开源项目
  { id: 'hyc-framework', size: 'lg' },
  { id: 'dsgs', size: 'lg' },
  // 第二行 · 四个小卡
  { id: 'vgame', size: 'sm' },
  { id: 'vgame-toolkit', size: 'sm' },
  { id: 'snow-bros', size: 'sm' },
  { id: 'deep-sea-sonar', size: 'sm' },
  // 第三行 · 两个小卡 + 末尾的「更多」
  { id: 'stock-persona', size: 'sm' },
  { id: 'steamcmd-gui', size: 'sm' },
]

export const PROJECTS = [
  /* ------------------------------------------------------------------ */
  /* 游戏                                                                */
  /* ------------------------------------------------------------------ */
  {
    id: 'deep-sea-sonar',
    name: '深海声呐员',
    nameEn: 'Deep Sea Sonar',
    tagline: '在漆黑深海里，用声呐找出唯一的活路',
    blurb:
      '以深海潜艇为主题的声呐探索游戏。海域几乎全黑，只能靠声呐回波判断地形与目标，在有限的资源下完成关卡任务。已发布 Android 与 Windows 版，同时提供浏览器内直接试玩的 WebGL 构建。',
    summary:
      '一款以深海潜艇为主题的声呐探索游戏。海域几乎全黑，玩家只能依靠声呐回波判断地形与目标，在有限的资源下完成关卡任务。已发布 Android APK 与 Windows 版，同时提供浏览器内直接试玩的 WebGL 构建。',
    category: 'game',
    status: 'released',
    year: '2026',
    version: 'v1.0',
    license: null,
    lang: 'C#',
    openSource: false,
    accent: '#3ec9d6',
    cta: 'play',
    cover: '/img/cover-deep-sea-sonar.webp',
    tech: ['Unity', 'C#', 'WebGL', 'Android'],
    links: {
      demo: 'https://deepseasonar.huoyue.club/',
      play: 'https://deepseasonar.huoyue.club/game/index.html',
      // 下载（APK / Windows）在项目主页上有，卡片不再单列一个下载按钮
      source: null,
    },
    detail: null,
  },
  {
    id: 'snow-bros',
    name: '雪人兄弟',
    nameEn: 'Snow Bros',
    tagline: '把敌人冻成雪球，再一脚踢出去',
    blurb:
      '经典街机玩法的浏览器复刻。喷出雪雾把敌人冻成雪球，推下平台、或让它撞上其他敌人形成连锁得分；实现了巡逻与飞行两类敌人的行为逻辑、可破坏地形与道具系统。纯前端渲染，打开即玩。',
    summary:
      '经典玩法的网页复刻。玩家喷出雪雾把敌人冻成雪球，推下平台或让它撞击其他敌人形成连锁得分。实现了巡逻与飞行两类敌人的行为逻辑、可破坏地形与道具系统，纯前端渲染，打开即玩，源码公开。',
    category: 'game',
    status: 'released',
    year: '2026',
    version: null,
    license: null,
    lang: 'JavaScript',
    openSource: false,
    accent: '#8fd8ff',
    cta: 'play',
    cover: null,
    tech: ['Unity', 'C#', 'WebGL'],
    links: {
      demo: 'https://snowbros.huoyue.club/',
      // 试玩是 Unity WebGL 构建，放在子路径；根路径是介绍页
      play: 'https://snowbros.huoyue.club/game/index.html',
      download: null,
      source: null, // 演示页仓库不作为「项目源码」对外；开源状态见 openSource
    },
    detail: null,
  },
  {
    id: 'stock-persona',
    name: '股神异闻录',
    nameEn: 'Stock Persona',
    tagline: '当 K 线图变成封印怪物的符咒',
    blurb:
      '把股市隐喻做成卡牌 RPG 的互动叙事实验。核心命题是「同一天，七个人，七种活法」：前五种样式的剧情完全一致，变的只有呈现与操作方式；后两种连玩法本身都换掉了。七种都能在线点开试。',
    summary:
      '一个把股市隐喻做成卡牌 RPG 的互动叙事实验。核心命题是「同一天，七个人，七种活法」：前五种样式的剧情内容完全一致，变的只有呈现与操作方式；后两种连玩法本身都换掉了。七种样式都能在线点开直接试。',
    category: 'game',
    status: 'released',
    year: '2026',
    version: null,
    license: null,
    lang: 'HTML',
    openSource: false,
    accent: '#e0455f',
    cta: 'explore',
    cover: '/img/cover-stock-persona.webp',
    tech: ['HTML', 'JavaScript', 'CSS', '互动叙事'],
    links: {
      demo: 'https://sp.huoyue.club/',
      play: 'https://sp.huoyue.club/style-6-persona.html',
      download: null,
      source: null,
    },
    detail: null,
  },
  {
    id: 'vgame',
    name: 'AI 影游平台',
    nameEn: 'vgame',
    tagline: '把互动影视的生产与变现链路画清楚',
    blurb:
      '一份关于 AI 互动影视平台的产品演示。它把「创作者用 AI 生产内容 → 平台分发 → 用户付费打赏 → 反哺创作」的完整闭环拆成可点开的链路，覆盖创作全流程、效率提升、零代码门槛、订阅级别与产线权益，以及从发布到转化的激励设计。',
    summary:
      '一份关于 AI 互动影视平台的产品演示页。它把「创作者用 AI 生产内容 → 平台分发 → 用户付费与打赏 → 反哺创作」的完整闭环拆成可点开的链路，覆盖创作全流程、效率提升、零代码门槛、订阅级别与产线权益，以及从发布到转化的激励设计。',
    category: 'game',
    status: 'released',
    year: '2026',
    version: null,
    license: null,
    lang: 'HTML',
    openSource: false,
    accent: '#a06bff',
    cta: 'intro',
    cover: null,
    tech: ['产品设计', 'HTML', '生态设计'],
    links: {
      demo: 'https://vgame.huoyue.club/',
      play: 'https://vgame.huoyue.club/',
      download: null,
      source: null,
    },
    detail: null,
  },

  /* ------------------------------------------------------------------ */
  /* 引擎 / 框架                                                          */
  /* ------------------------------------------------------------------ */
  {
    id: 'hyc-framework',
    name: 'HYC 游戏框架',
    nameEn: 'HYC Framework',
    tagline: 'Unity 2022.3 上的 DOTS/ECS 数据驱动游戏框架',
    blurb:
      '一套跑在 Unity 2022.3 上的 DOTS/ECS 数据驱动框架。配置、本地化与行为树全部以不可变 Blob 存储，运行期零托管分配、可 Burst 友好遍历；Excel 在生成期烘焙成 blittable 结构体，玩法层查表不需要 World 句柄。UI 是 ECS System 而非窗口管理器，行为树可视化编辑后序列化为纯数据、由解释器逐帧执行。包内附 28 篇中文深度文档。',
    summary:
      '一套基于 Unity 2022.3、以 DOTS/ECS 数据驱动为核心的轻量级游戏开发框架，内置配置管线、多语言本地化、ECS UI、输入与热键、过场演出与可视化行为树。它用不可变 Blob 承载配置与行为树数据，把运行期托管分配降到最低，并配套完整编辑器工具链。',
    category: 'engine',
    status: 'released',
    year: '2026',
    version: '2.0.6',
    license: 'MIT',
    lang: 'C#',
    openSource: true,
    accent: '#4f8cff',
    cta: 'detail',
    cover: null,
    tech: ['Unity 2022.3', 'DOTS/ECS', 'Burst', 'Blob Asset', 'Addressables'],
    links: {
      demo: null,
      play: null,
      download: null,
      source: 'https://github.com/HYClub/hyc-framework',
    },
    detail: {
      features: [
        {
          title: 'DOTS/ECS 数据驱动架构',
          desc: '以 World + 分层 ComponentSystemGroup 更新阶梯组织游戏逻辑（Root → A0 引导 → A1 数据 → A2 场景 → A3 玩法 → B9 UI）。配置、本地化、行为树全部以不可变 Blob 存储，运行期零托管分配、可 Burst 友好遍历。',
        },
        {
          title: '可视化行为树',
          desc: 'BTTreeAsset 可视化编辑后序列化为纯数据 BTRootBlob，由 BTManager 注册、BTInterpreterSystem 逐帧解释执行；支持自定义节点、运行时黑板与断点调试。',
        },
        {
          title: 'Excel 配置管线',
          desc: 'Excel / 模板驱动，生成期由 ConfigGenerator 把行烘焙成 blittable 结构体与 BlobAssetReference；运行期用世界无关的 ConfigManager 静态表提供无分配查询，UI 与玩法层查表都不需要 World 句柄。',
        },
        {
          title: 'Blob 多语言本地化',
          desc: '按语言分文件加载，支持 key 查询、string.Format 占位符、运行时切语言、MonoBehaviour 自动刷新与敏感词过滤。',
        },
        {
          title: 'ECS UI 系统',
          desc: 'UI 即 ECS System：UIManager 统一管理分层 Canvas 与 Addressables 实例化，ComponentBinderTable 生成强类型组件绑定，视图重新显示时 Reset 重新绑定，避免跨场景引用失效。',
        },
        {
          title: '编辑器工具链',
          desc: 'Excel 配置自动生成与校验、组件绑定代码生成、本地化 Key 浏览与导入、敏感词管理，以及行为树可视化编辑器与校验器，大幅降低手工出错率。',
        },
      ],
      sections: [
        {
          heading: '这是什么',
          body: [
            'HYC Framework 是一套基于 Unity 2022.3、以 DOTS/ECS 数据驱动为核心的轻量级游戏开发框架。仓库根目录只有 README 与 com.hyc.framework/ 包目录，框架本体作为 Unity Package 分发。',
            '它要解决的问题是：让中大型 Unity 项目在配置、本地化、UI、输入、过场与 AI 行为这些共性系统上，直接用一套以 Blob 为核心、运行期无托管分配的方案起步，而不是每个项目从 MonoBehaviour 轮子重造。',
          ],
        },
        {
          heading: '数据是怎么流动的',
          body: [
            '框架的数据流分四阶段。生成期由编辑器把 Excel / 模板烘焙成 blittable struct 与 BlobAssetReference，行为树可视化为 BTRootBlob；引导期把 Blob 读入并调用 ConfigManager.Register、LocalizationManager.Reload、BTManager.Register；运行期玩法系统查表，BTInterpreterSystem 对挂载了 RunningBT 的实体逐帧 Tick；表现期 UI 系统最后运行，读取最新状态刷新 HUD 与窗口。',
            '更新阶梯顺序为 Root → A0 → A1 → A2 → A3 → B9，并通过双模式（Live / Sim）区分联网正常会话与离线确定性模拟。单帧消息在玩法阶段被消费，帧末统一清理，消息绝不过帧。',
          ],
        },
        {
          heading: '怎么接入',
          body: [
            '以 git URL 安装时路径必须带 ?path=com.hyc.framework，例如 https://github.com/HYClub/hyc-framework.git?path=com.hyc.framework，可追加 #v2.0.6 锁定版本；也可以直接在 Packages/manifest.json 的 dependencies 中追加同名条目。',
            'FrameworkBootstrap 不会被 Entities 的 ICustomBootstrap 自动发现，游戏需通过 IFrameworkInstaller 注册安装器后自行调用 Initialize。UIManager 与 AbsUISystem 均标记了 DisableAutoCreation，必须由游戏显式创建并加入某个 UpdateGroup。',
            '包内 com.hyc.framework/Documentation~/ 提供 28 篇中文文档（架构、配置管线、多语言、ECS UI、输入、过场、消息、行为树、Blob 约定、文件与类索引），并针对 AI 助手做了处理，可以直接投喂。',
          ],
        },
      ],
      specs: [
        ['引擎版本', 'Unity 2022.3 或以上'],
        ['包版本', '{version}'],
        ['许可证', 'MIT'],
        ['核心依赖', 'com.unity.entities 1.0.16、Burst 1.8.16、Collections 2.1.4'],
        ['UI / 输入', 'Addressables 1.21.21、InputSystem 1.7.0、Timeline 1.7.7'],
        ['安装路径', 'git URL 需带 ?path=com.hyc.framework'],
      ],
      structure: [
        'com.hyc.framework/ —— Unity 包本体（package.json / LICENSE / CHANGELOG）',
        'Runtime/BT/ —— 行为树运行时：解释器、管理器、黑板、事件总线与 Blob 定义',
        'Runtime/Config、Loc、UI、Input、Timeline —— 配置、本地化、ECS UI、热键与过场模块',
        'Editor/BT/ —— 行为树可视化编辑器（IMGUI 画布）',
        'Editor/DataEditor/ —— 配置数据编辑器与代码生成模板',
        'Editor/Dlls/ —— NPOI / SharpZipLib / BouncyCastle，仅编辑器使用的 Excel 导入依赖',
        'Documentation~/ —— 28 篇中文深度文档',
        'Samples~/ —— HYC Simple 最小可运行接入示例',
      ],
    },
  },
  {
    id: 'dsgs',
    name: 'DeepSeek Harness Game Studios',
    nameEn: 'DSGS',
    tagline: '把一次 DSH 会话变成一个完整的游戏开发工作室',
    blurb:
      '把一次 DeepSeek Harness 会话变成一个完整的游戏开发工作室。移植自 Claude Code Game Studios（MIT），把 49 个 agent、76 个技能、13 条规则与 14 个 Node 钩子打包成一次性安装。已收录进 DSH 插件市场，一条命令装完重启就能用。',
    summary:
      'DeepSeek Harness Game Studios（DSGS）是把 Claude Code Game Studios（CCGS v1.1.2，MIT）移植到 DeepSeek Harness 的插件包。它把 49 个 agent、76 个技能、13 条规则与 14 个 Node 钩子打包成一次性安装：插件首次加载时把框架载荷装到机器级目录，之后在任意空文件夹开新会话输入 /start 就能初始化并进入引导。已收录进 awesome-dsh-plugin 插件列表。',
    category: 'engine',
    status: 'released',
    year: '2026',
    version: '0.1.8',
    license: 'MIT',
    lang: 'JavaScript',
    openSource: true,
    /** 卡片右上角实时显示 GitHub 星数（页面加载后从 GitHub API 读） */
    showStars: true,
    accent: '#3ddc97',
    cta: 'detail',
    cover: null,
    tech: ['DeepSeek Harness', 'Node.js', 'AI Agents', 'Hooks', 'Plugin'],
    links: {
      demo: null,
      play: null,
      download: null,
      source: 'https://github.com/HYClub/deepseek-harness-game-studios',
      // 已收录进 awesome-dsh-plugin，PR #7294 于 2026-10-17 合并
      marketplace:
        'https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/data/plugins/HYClub__deepseek-harness-game-studios.yml',
    },
    detail: {
      /** 插件最重要的动作是「怎么装」，单独给一块，不混在正文里 */
      install: {
        note: '两种装法，装完都要重启 dsh web。已经收录进 DSH 插件市场，装法和市面上的插件一致。',
        rows: [
          { label: '命令行', value: 'dsh plugin --profile web add https://github.com/HYClub/deepseek-harness-game-studios' },
          { label: '图形界面', value: 'Plugins → Add plugin → 粘贴上面的仓库地址 → Install' },
        ],
      },
      features: [
        {
          title: 'CCGS 全量移植',
          desc: '不是重写而是移植：技能、代理、规则与文档来自上游（MIT），本仓库提供 DSH 原生运行时（Node 钩子、技能生成、机器级安装、插件桥），并通过内容保真度校验证明零丢失。',
        },
        {
          title: '钩子桥覆盖全部事件',
          desc: '12 个上游 shell 脚本改写为 14 个 Node 版本，经钩子桥接覆盖上游全部 9 个事件。',
        },
        {
          title: '一键安装与自安装载荷',
          desc: '一个包 = 钩子桥 + 状态行投影 + 载荷自安装。首次加载时把框架装到机器级目录并写入用户级引导技能，从不触碰项目目录、从不覆盖项目文件，并提供成对的反安装命令。',
        },
        {
          title: '工作室状态行',
          desc: '/statusline 技能输出 stage · posture · epic > story · Sprint n/m · engine 的工作室状态行，并附带 13 个单元测试。',
        },
        {
          title: '嵌套代理委派',
          desc: '配置 subagent.maxDepth: 2，支持父 → 子 → 孙的嵌套委派并已验证（DSH 默认为 1）。',
        },
        {
          title: '技能测试框架',
          desc: '仓库内附带一套技能与代理的 QA 框架，用 /skill-test static|category|spec|audit 做结构化校验与质量评分，配合 /skill-improve 形成测试—修复—重测循环。',
        },
      ],
      sections: [
        {
          heading: '为什么要移植而不是重写',
          body: [
            '上游 CCGS 面向 Claude Code：依赖 .claude/ 目录、.sh 钩子、bash 一行命令与 @path 导入。这些在 DSH 下无法直接运行——没有 bash 工具、沙箱禁止管道子进程、@path 不展开。',
            '因此本仓库不改上游内容，而是生成一套 DSH 可运行的等价物，并用保真度校验证明没有内容丢失。仓库本身就是插件包，框架载荷打包在 payload/ 之下。',
          ],
        },
        {
          heading: '移植策略与实测状态',
          body: [
            '双栈同源：.claude/ 是内容源（保留上游原文），.dsh/** 由构建脚本生成、禁止手改；另有手写的 DSH 专属覆盖层，合并进 .dsh/。',
            '实现状态：74 个上游技能全部移植、49 个代理角色卡、13 条规则（用 PostToolUse 钩子在每次写入或编辑后注入匹配的规则文本，等价上游的路径作用域规则引擎）、12 个上游脚本改写为 14 个 Node 钩子。内容保真度实测 258 个文件 / 42,895 行，96.0% 逐字一致、0 处无法解释的丢失。',
            '同时明确列出了未实现项：GUI 停靠状态条、PreToolUse 事前提醒、3 个无法从提示触发的钩子事件（Notification / PreCompact / PostCompact 无 DSH 事件源）、按代理的工具白名单与代理自动发现、@path 导入、bash 预执行行，以及 bash 与 Node 的逐字节对等。',
          ],
        },
        {
          heading: '怎么装上',
          body: [
            '两种方式。图形界面：Plugins → Add plugin → 粘贴仓库地址 → Install → 重启。命令行：dsh plugin --profile web add <仓库地址>，同样需要重启。',
            '首次加载时插件在机器级安装框架与用户级引导技能。之后「新工作目录 → 新会话 → 输入 /start」：/start 先检查工作区是否已初始化，未初始化则先初始化，再带你走引导流程。',
            '仓库提供了独立校验脚本，用来核对技能、代理、规则与钩子的数量，以及移植保真度。',
          ],
        },
        {
          heading: '已收录进 DSH 插件市场',
          body: [
            '2026-10-17 收录进 awesome-dsh-plugin（DSH 的插件列表，PR #7294），分类 agi。收录条目里写的规模是 76 个技能、49 个代理与钩子桥。',
            '这意味着装法跟市面上其它 DSH 插件完全一致：不用 clone、不用手动铺目录，一条 dsh plugin 命令或界面上点两下即可，卸载也走同一套。',
          ],
        },
      ],
      specs: [
        ['插件版本', '{version}'],
        ['许可证', 'MIT（上游版权归 Donchitos，移植层同许可）'],
        ['Node 要求', 'engines.node >= 20'],
        ['上游版本', 'Claude Code Game Studios v1.1.2'],
        ['规模', '74 个上游技能 + 49 个代理 + 13 条规则 + 14 个 Node 钩子'],
        ['保真度', '258 个文件 / 42,895 行，96.0% 逐字一致'],
        ['插件市场', '已收录 · awesome-dsh-plugin（分类 agi）'],
      ],
      structure: [
        'payload/ —— 插件安装的框架载荷',
        'payload/.claude/ —— 上游内容源（MIT，保留原文）',
        'payload/.dsh/ —— 由构建脚本生成，禁止手改',
        'payload/tools/ —— 生成器、校验脚本、Node 移植与安装器',
        'payload/dsh-src/ —— 手写的 DSH 专属覆盖层',
        'payload/DSGS Skill Testing Framework/ —— 面向技能与代理本身的 QA 框架',
        'hooks.js / selfinstall.mjs / statusline/ —— 插件入口：钩子桥、载荷自安装与状态行',
        'README.md / README.zh-CN.md / SELF-INSTALL.md —— 双语文档与自安装说明',
      ],
    },
  },
  {
    id: 'vgame-toolkit',
    name: '影游开发套件',
    nameEn: 'vgame-toolkit',
    tagline: '把「互动影视游戏」抽象成数据加通用解释器',
    blurb:
      '一套做互动影视游戏的开发套件：编辑器产出数据，播放器解释数据。设计铁律是零代码、纯鼠标，策划拖拽连线就能搭出内容。框架只保留骨架，节点类型、导出目标、主题与媒体格式全部由插件提供，因此改剧情、换视频、调分支都只是替换文件，不必重新编译打包。',
    summary:
      '一套用于制作互动影视游戏的开发套件，由可视化编辑器、Hub（项目管理器）与播放器组成。核心思路是编辑器产出数据、播放器解释数据：内容以数据形式外置，运行时由通用解释器驱动，改剧情、换视频、调节点路径都只需替换资源，不必重新编译打包。套件的节点类型、导出目标、主题与媒体格式全部由插件提供，框架本身只负责让插件活着。',
    category: 'engine',
    status: 'wip',
    year: '2026',
    version: '0.1.0',
    license: null,
    lang: 'TypeScript',
    openSource: false,
    accent: '#ffcf4d',
    cta: 'detail',
    cover: null,
    tech: ['TypeScript', 'Tauri', 'React', 'pnpm', '插件架构'],
    links: {
      demo: null,
      play: null,
      download: null,
      source: null,
    },
    detail: {
      features: [
        {
          title: '数据与引擎解耦',
          desc: '「不变层」（框架与播放器代码）打包一次，「可变层」（配置、视频、音频、剧情节点、路径表）全部外置，换内容等于换文件。',
        },
        {
          title: '纯鼠标可视化编辑',
          desc: '设计铁律是零代码、纯鼠标：拖动、连线、点击即可搭建互动影视内容，用户全程不碰文本、JSON 或命令行。',
        },
        {
          title: '万物皆插件',
          desc: '框架只保留骨架，节点类型、导出目标、UI 主题、媒体格式都由插件提供；去掉所有插件框架仍能启动，只是什么都不能干。',
        },
        {
          title: '插件宿主与生命周期',
          desc: '宿主由 scanner、loader、validator 与 lifecycle 四部分组成，负责插件的发现、加载、校验、启用、禁用与卸载。',
        },
        {
          title: '事件总线 + 服务注册表',
          desc: '插件之间不直接互相引用，而是通过事件总线喊话、通过服务注册表按名注册与取用能力，从而把耦合压到契约层。',
        },
        {
          title: 'Hub 统一管理项目',
          desc: 'Hub 负责项目索引与存储、编辑器定位与版本管理、设置与注册表文件的读写，是多个项目并存时的入口。',
        },
      ],
      sections: [
        {
          heading: '这是什么',
          body: [
            '它把「互动影视游戏」抽象成「数据 + 通用解释器」：编辑器产出数据，播放器解释数据，两者解耦、各自升级。产品形态上类比为「游戏主机 + 卡带」「视频播放器 + 视频文件」。',
            '目标不是做单个游戏，而是做能做游戏的产品——竞争力不在一款游戏，而在协议设计、编辑器易用度、播放器稳定性、升级机制与插件生态。',
            '当前仓库已跑通插件宿主、编辑器骨架与 Tauri 桌面窗口；节点类型扩展点正在实现，画布节点、真实节点插件与导出链路尚未完成，所以状态标为进行中。',
          ],
        },
        {
          heading: '分层与契约',
          body: [
            '整体分五层，越往下越稳定：内核层（插件宿主、事件总线、服务注册表、数据模型基座、协议版本管理、权限沙箱）→ 契约层（扩展点接口、插件元信息规范、通信规则、版本与权限声明）→ 官方插件层（基础节点、导出、默认主题、媒体）→ 第三方插件层 → 产品层（具体游戏项目数据）。',
            '插件以 plugin.json 作为身份证，声明 id、类别、来源、版本要求、依赖、权限与 provides / extends 能力；插件类别覆盖 node、exporter、theme、media、player_core、publisher、tool、integration 八种。',
            '项目以文件夹为单位：project.json（含 formatVersion、protocolVersion、project、meta）加 assets/、chapters/ 与 .vgame/，由协议包负责序列化与反序列化。',
          ],
        },
        {
          heading: '给谁用',
          body: [
            '策划与编剧：不写代码，纯鼠标操作，拖拽连线做互动影视内容。',
            '独立创作者：制作互动影视、文字冒险、多结局游戏，用同一套产线承载不同题材。',
            '第三方开发者：按契约开发插件，扩展节点类型、导出目标、主题或媒体格式。',
          ],
        },
      ],
      specs: [
        ['仓库结构', 'pnpm monorepo（apps / packages / plugins）'],
        ['仓库版本', '{version}'],
        ['应用形态', 'Tauri 桌面程序（Editor / Hub / Player）'],
        ['运行环境', 'Node >= 20、pnpm >= 9'],
        ['插件类别', 'node / exporter / theme / media / player_core / publisher / tool / integration'],
        ['许可证', '仓库未标注'],
      ],
      structure: [
        'apps/editor —— 可视化编辑器（Tauri + React）',
        'apps/hub —— Hub 项目管理器（Tauri + React）',
        'apps/player —— 播放器进程',
        'packages/ —— 框架、契约、协议、UI、令牌、工具、config、hub-core',
        'plugins/ —— 官方插件：start-node、end-node、wait-node、hello-plugin',
        'docs/ —— 设计文档与实现文档，按 00–13 分组',
        'scripts/ —— 构建、发布与配置读取脚本',
        'config/ —— 项目常量配置',
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  /* 工具                                                                */
  /* ------------------------------------------------------------------ */
  {
    id: 'steamcmd-gui',
    name: 'SteamCMD 界面',
    nameEn: 'SteamCMD GUI',
    tagline: '给 SteamCMD 配一个能用的 Windows 图形界面',
    blurb:
      'Windows 下的 SteamCMD 图形界面。登录、创意工坊上传、SteamPipe 正式版发布、Depot 查询与实时控制台全都收进一个界面，并自动生成上传用的 VDF 配置；凭据走 DPAPI 加密保存，整个工具就是一个 57 KB 的单文件脚本。',
    summary:
      'Windows 下的 SteamCMD 图形界面工具，基于 ConPTY 实现终端交互。它把 SteamCMD 那套命令行流程——登录、工坊上传、SteamPipe 正式版发布、Depot 查询——收进一个界面里，并保留实时控制台输出，让上传进度看得见。凭据用 DPAPI 加密保存，支持多账号管理。',
    category: 'tool',
    status: 'released',
    year: '2026',
    version: '20260626',
    license: null,
    lang: 'Python',
    openSource: true,
    accent: '#6fa8c8',
    cta: 'detail',
    cover: null,
    tech: ['Python', 'Tkinter', 'ConPTY', 'pywinpty', 'Windows DPAPI'],
    links: {
      demo: null,
      play: null,
      download: null,
      source: 'https://github.com/HYClub/SteamCMD_GUI',
    },
    detail: {
      features: [
        {
          title: 'Steam 登录与多账号',
          desc: '支持用户名 / 密码加 Steam Guard 验证码登录，凭据用 Windows DPAPI 加密保存，可管理多个账号。',
        },
        {
          title: '工坊上传',
          desc: '填写预览图、标签与更新说明，走 workshop_build_item 完成创意工坊物品发布与更新。',
        },
        {
          title: 'SteamPipe 正式版上传',
          desc: '自动生成 app_build.vdf 与 depot_build.vdf，再执行 +run_app_build，把正式版发布流程从手工写配置变成点几下按钮。',
        },
        {
          title: 'Depot 查询',
          desc: '通过 app_info_print 获取某个 App 的 Depot 列表，以下拉选择代替手抄 Depot ID。',
        },
        {
          title: '实时控制台与进度',
          desc: '基于 ConPTY 实现终端交互，SteamCMD 输出实时显示，上传过程带进度条。',
        },
        {
          title: '自更新与安全退出',
          desc: '启动时后台检查 GitHub 上的新版本并在顶部提示；关闭窗口时自动终止 SteamCMD 进程，不留后台残留。',
        },
      ],
      sections: [
        {
          heading: '这是什么',
          body: [
            'SteamCMD 是 Valve 官方的命令行工具，但用它上传创意工坊物品或发布正式版本，意味着要记一堆参数、手写 VDF 配置、盯着黑框看进度。',
            '这个工具把那些流程收进一个界面：登录、查 Depot、填上传信息、执行构建、看实时输出。整个工具就是一个 Python 单文件脚本，放到 steamcmd.exe 同目录即可运行。',
          ],
        },
        {
          heading: '技术上怎么做的',
          body: [
            '界面用标准库 tkinter / ttk 构建，不引入任何 GUI 框架依赖。',
            '终端交互不用管道伪装，而是通过 pywinpty 调用 Windows ConPTY 启动真实伪终端，因此 SteamCMD 的输出（含 ANSI 控制序列）能实时显示；脚本里也实现了剥离 ANSI 序列后再写入日志。',
            '登录凭据通过 ctypes 调用 crypt32 的 CryptProtectData / CryptUnprotectData 做 DPAPI 加密后再保存，密钥绑定当前用户，避免了把密码明文写进配置文件；自更新则用正则从远端脚本里取出 __version__ 与本地版本比对。',
          ],
        },
        {
          heading: '怎么用',
          body: [
            '把脚本放到 steamcmd.exe 所在目录，用 pythonw 启动（这样不会附带一个控制台窗口），然后在界面里完成登录、上传与查询。',
            '依赖 Python 3.8+ 与 pywinpty（缺失时会自动安装）。因为是 Windows 专属实现，DPAPI 与 ConPTY 都没有跨平台替代方案。',
          ],
        },
      ],
      specs: [
        ['仓库结构', '单文件脚本（steamcmd_gui.py，约 57 KB）'],
        ['版本号', '{version}（源码内 __version__ 常量）'],
        ['运行环境', 'Windows / Python 3.8 或以上'],
        ['界面', '标准库 tkinter + ttk'],
        ['依赖', 'pywinpty（缺失时自动安装）'],
        ['许可证', '仓库未标注'],
      ],
      structure: [
        'steamcmd_gui.py —— 全部实现（GUI、ConPTY、上传流程、凭据加密、自更新）',
        'README.md —— 功能说明与使用步骤',
        '.gitignore —— 白名单式忽略，只保留脚本与文档',
      ],
    },
  },
]

/**
 * 版本号覆盖。
 *
 * 上面每个项目里的 `version` 只是兜底值；真实版本由 scripts/fetch-versions.mjs
 * 在构建前从各自的版本源头抓（git tag / package.json / 源码常量），
 * 写进 versions.json，这里统一覆盖。
 */
for (const project of PROJECTS) {
  const fetched = VERSIONS[project.id]
  if (fetched) project.version = fetched
}

/** 按 id 取项目，详情页渲染用。 */
export function getProject(id) {
  return PROJECTS.find((project) => project.id === id) ?? null
}

/** 有独立详情页的项目（即没有在线站点、需要站内介绍的那些）。 */
export function detailProjects() {
  return PROJECTS.filter((project) => project.detail !== null)
}

/** 首页排布：把 BOARD 的 id 还原成 { ...project, size } 的列表。 */
export function boardItems() {
  return BOARD.map(({ id, size }) => {
    const project = getProject(id)
    if (!project) throw new Error(`BOARD 里的 "${id}" 在 PROJECTS 中不存在`)
    return { ...project, size }
  })
}
