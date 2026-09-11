# AGENTS.md — cy92-org

**分层**: 个人品牌 (Personal Brand) — 个人简历
**Updated:** 2026-09-12

个人在线简历。Astro 5.18.2 + TailwindCSS 3.4.19 + Cloudflare Workers 部署。
`pnpm@10.11.1`（`packageManager` 强制），Wrangler 4.129.0，Node 22（CI 固定；本地见「PITFALLS」）。

---

## 1. STRUCTURE

```
cy92-org/
├── src/
│   ├── components/    # 纯 .astro 组件（无 React/Vue）
│   │   ├── BaseHead.astro     # <head> 模板 + SEO/OG + 字体 + 初始 theme
│   │   ├── Header.astro       # 导航栏 + 主题切换 + 移动抽屉 + 全局 scroll-reveal
│   │   ├── Footer.astro / HeaderLink.astro / FormattedDate.astro
│   │   ├── Icon.astro         # SVG path 硬编码注册表（新图标必须在此注册）
│   │   ├── LangScript.astro   # 语言运行时（data-t/data-l 切换，全站共用）
│   │   ├── ProjectCard.astro  # works 页卡片
│   │   └── SkillBar.astro     # 技能条
│   ├── layouts/BlogPost.astro
│   ├── i18n/dict.ts    # 双语字典单一来源（全站共享，见「5. i18n」）
│   ├── pages/         # index(1720 行，单文件承载 7 屏幻灯 + i18n + canvas 动效)
│   │                   # about / works / blog/[...slug].astro / blog/index.astro / rss.xml.js
│   ├── scripts/
│   │   ├── sync-word-count.mjs            # 字数同步（ESM 零依赖）
│   │   └── __tests__/sync-word-count.test.mjs   # vitest 8 用例
│   ├── styles/
│   │   ├── app.css      # 设计系统核心（965 行，改样式一律在此）
│   │   └── global.css   # 遗留（620 行，含唯一 @font-face；不要修改）
│   ├── Assets/          # 演示视频素材（当前无页面引用，死素材）
│   ├── consts.ts        # 全站数据（253 行，见「3. 数据层」）
│   ├── content.config.ts  # blog 集合 schema（glob src/content/blog）
│   └── env.d.ts
├── scripts/
│   ├── check-links.mjs  # 构建产物链接/锚点静态检查（ESM 零依赖）
│   └── i18n-verify.mjs  # i18n 字典完整性校验（pnpm check:i18n）
├── public/
│   ├── favicon.svg / default-cover.webp
│   ├── fonts/           # atkinson-*.woff，仅被 global.css 引用（遗留）
│   ├── images/          # 作品配图（冥想系列等）
│   ├── video/Demo-lite.mp4  # 幻灯共用背景视频（#reel，25MB，preload=none）
│   ├── _headers         # 安全响应头（CSP/HSTS/X-Frame-Options，见「9. CI / 安全」）
│   ├── robots.txt       # 爬虫 + Sitemap 指向
│   └── *.webp           # 文章封面，中文文件名（勿重命名，consts/文章已引用）
├── .trae/specs/improve-dark-theme/   # 历史 spec 工作区（checklist/spec/tasks）
├── astro.config.mjs · wrangler.json · tailwind.config.js · tsconfig.json · .npmrc
├── DEVELOPMENT_GUIDE.md  # 1300+ 行架构/样式/颜色/暗色模式全解（改视觉前必读）
├── security-report.md    # 2026-05-11 快照，LOW 项已在 #50 落地修复（见「9」）
├── chenyang_resume.md    # 简历源文（内容素材，非构建输入）
└── README.md             # 项目主页（命令清单以 package.json 为准）
```

## 2. WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 简历数据（改字） | `src/consts.ts` | SITE_TITLE / SITE_DESCRIPTION / PERSONAL_INFO / SOCIAL_LINKS / SKILLS / WORK_EXPERIENCE / EDUCATION / EXPERIENCE / PROJECTS / STATS / HONORS |
| 首页 7 屏幻灯文案 | `src/pages/index.astro` | 视觉文案在此；`data-t` key 译文在 `src/i18n/dict.ts` |
| 双语字典 | `src/i18n/dict.ts` | 单一来源，新增文案先加 zh/en 条目，见「5. i18n」 |
| 语言运行时 | `src/components/LangScript.astro` | 全站共用，切换 data-t 文本 / aria / data-l 双渲染 |
| 主样式 | `src/styles/app.css` | 设计 token + 站点 shell；Tailwind 颜色映射到 CSS 变量 |
| 遗留样式 | `src/styles/global.css` | **不要修改**，改样式一律在 app.css |
| 主题（暗色） | `BaseHead.astro` 初始态 + `app.css` `[data-theme="dark"], .dark` 合并选择器 token | 见「4. 主题」 |
| 图标 | `src/components/Icon.astro` | SVG path 硬编码，新图标必须在此注册 |
| Cloudflare 配置 | `astro.config.mjs` + `wrangler.json` | `platformProxy.enabled: false`，`compatibility_date: 2025-10-08`，`nodejs_compat` |
| 安全响应头 | `public/_headers` | CSP / HSTS / X-Frame-Options / Referrer-Policy 等；Wrangler 部署时读取并剥离 |
| 爬虫 / Sitemap | `public/robots.txt` | `Allow: /` + sitemap-index.xml |
| 触屏命中区 | `src/styles/app.css` | `--ds-touch-target`（44px，`@media (pointer: coarse)`，#51） |
| i18n 校验 | `scripts/i18n-verify.mjs` | `pnpm check:i18n`；新增字典条目后必跑 |
| 字数同步 | `src/scripts/sync-word-count.mjs` | 写回 consts.ts `STATS[0].value`（见「6. 跨仓库依赖」） |
| 死链检查 | `scripts/check-links.mjs` | 检查 `dist/`，需先 build；见 COMMANDS |
| 博客集合 | `src/content/blog/` | **目录不存在**，集合为空；dev 报 `collection "blog" does not exist or is empty` 是预期噪音，由 `build` 的 `|| exit 0` 吸收 |

## 3. CONVENTIONS

- **pnpm@10.11.1** — `packageManager` 强制，禁止 npm/yarn。Node 22（CI `setup-node@v4` 固定；`package.json` **未**用 `engines` 强制）。
- **TailwindCSS 3.4.19** — `@astrojs/tailwind` 集成，`applyBaseStyles: false`（BaseHead.astro 手动引入 app.css）。`tailwind.config.js` 颜色映射 `hsl(var(--x))` 到 app.css 变量；改色需同步 `:root` 浅色块与 `[data-theme="dark"]`/`.dark` 深色块。
- **Cloudflare adapter** — `@astrojs/cloudflare` 12.6.13，`platformProxy.enabled: false`。
- **`|| exit 0` 容错** — `build` / `check` / `preview` 均允许构建失败不中断（吸收空 blog 集合警告）。**不要移除**。
- **纯静态、无 JS 框架** — 页面为 `.astro`，动效/交互为页内原生 `<script>`（canvas 2D、IntersectionObserver），不引入 React/Vue。
- **零第三方依赖脚本** — `scripts/*.mjs` 与 `src/scripts/*.mjs` 均只用 Node 内置模块，新增脚本保持这一约定。
- **中文文件名资产** — `public/*.webp` 多为中文+空格文件名，被页面直接引用；重命名必须同步改引用。

## 4. 主题系统（易误判，读清楚）

- `app.css` **同时定义了浅色与深色两套 token**：浅色在 `:root` 块（约 1-185 行，`--ds-*` 与 `--background`/`--primary` 等 HSL 变量），深色在 **`[data-theme="dark"], .dark` 合并选择器**（189 行起，单一来源，改一次即可）。
- `BaseHead.astro` 内联脚本**无条件** `isDark = true` → 加 `.dark` 类 + `data-theme="dark"`，并加 `.ds-js` 类（使 scroll-reveal 仅在 JS 可用时隐藏内容）。注释称 "Dark-only site"，与实际不完全一致。
- `Header.astro` 保留了 `#theme-toggle` 按钮，点击可切到浅色；但 **BaseHead 不读取 `localStorage.theme`，用户偏好不会在下次加载恢复**（始终回到暗色）。这是当前已知行为，非 bug 修复项——若要改，需同时动 BaseHead 与 Header。
- `html.dark, html[data-theme="dark"] { color-scheme: dark; }`（app.css 332 行）。

## 5. i18n（中英双语，全站）

- **字典单一来源**：`src/i18n/dict.ts` 导出 `I18N: Record<string, { zh, en }>`，全站共享（首页幻灯、Header/Footer、blog 索引等）。
- **运行时**：`src/components/LangScript.astro`，每个页面渲染一次；切换时同步 `html.lang-en` class + `document.documentElement.lang`，并派发 `langchange` 事件供 canvas 等脚本同步。
- **默认语言是 `en`**（与旧版相反）：只有显式 `localStorage['lang'] === 'zh'` 才回中文；BaseHead 首帧前读取，避免 EN 访客闪中文。**zh 是 fallback**——缺 `en` 条目静默回中文，永不空文本。
- 5 种标记机制：
  | 标记 | 作用 |
  |------|------|
  | `data-t="<key>"` | 元素文本（值含 HTML 时用 innerHTML） |
  | `data-t-aria="<key>"` | 写入 `aria-label` |
  | `data-t-title="<key>"` | 写入 `title` 提示 |
  | `data-aria-zh` + `data-aria-en` | 配对写入 `img.alt` / `article.aria-label`（CSS 切不了） |
  | `data-l="zh|en"` | 双渲染标记，CSS 按 `html.lang-en` 显隐（.bl/.blk） |
- 新增文案流程：`dict.ts` 加 zh/en 条目 → 页面加 `data-t`（或 `data-l` 双渲染）→ `pnpm check:i18n` 校验完整性（`scripts/i18n-verify.mjs`）。
- 语言切换按钮：Header.astro 内 `[data-lang-toggle]`；LangScript 全站绑定。

## 6. ANTI-PATTERNS

- **不要移除 `|| exit 0`** — 构建脚本依赖此容错，移除会导致 `pnpm build` 因空 blog 集合警告误报失败。
- **不要启用 `platformProxy`** — 当前 `false`，与 animpoly-com 不同。
- **不要引入 `pnpm-workspace.yaml`** — 已在 `.gitignore` 中，Cloudflare CI 见到该文件会报错。
- **命令以 `package.json` 为准** — README.md 已重写为项目主页，但命令清单仍以 package.json 为唯一真相。
- **不要生成/更新 `package-lock.json`** — `pnpm-lock.yaml` 是唯一锁文件；现有 package-lock.json（313KB）是模板残留，勿删勿改勿提交。
- **不要向仓库添加 React/Vue/框架依赖** — 本仓刻意保持纯 Astro。
- **不要加回大体积视频** — Cloudflare Workers 静态资源部署上限 25MB；`Demo-lite.mp4`（25MB）已是临界值（#48 曾因 demo.mp4 63MB 部署失败），新增视频资源会直接压爆构建产物。
- **不要修改 `src/styles/global.css`**、不要重命名 `public/` 下的中文资产。
- **不要改动 `STATS[0]` 的 `label: "累计字数"` 与 `unit: "字"`** — `sync-word-count.mjs` 靠这个 key 定位并原子写入 value，改了就写不进去。
- **不要用 `git add -A`** — 只 add 自己新建/修改的明确文件（`dev*.log`、`dist/`、`node_modules/`、`worker-configuration.d.ts` 均在忽略范围或为产物）。

## 7. CROSS-PROJECT DEPENDENCIES

- **cgartlab.github.io（强依赖，两个方向）**
  1. **字数同步**：`node src/scripts/sync-word-count.mjs` 从 cgartlab.github.io 文章计算累计字数，原子写回 `src/consts.ts` 的 `{ label: "累计字数", unit: "字" }` 项；统计项缺失时拒绝写坏原文件。仓库路径解析三级：`--repo <path>` CLI > `CGARTLAB_REPO` 环境变量 > sibling 相对推导（脚本在 `src/scripts/` 下，上三级即 `D:\2-Area\github-repos\`，本机零配置可跑）；全失败明确报错退出 1。
  2. **文案耦合**：`index.astro` 的 canvas 代码雨 `RAIN_SENTENCES`（约 20 条）是 cgartlab.com 文章标题/金句的**手抄副本**，`workTitle`/`aboutBody` 等英文译文也源自同一批文章主题。上游文章增删后这些副本不会自动更新，属人工维护项。
- **外部链接** — cgartlab.com、weekly.cgartlab.com、bilibili、x.com、sspai、github.com/cgartlab（见 consts.ts SOCIAL_LINKS / PROJECTS）。
- **cgartlab/argus** — `.github/workflows/argus-review.yml` 调用 `cgartlab/argus/.github/actions/argus-review@main` composite action，故 argus 仓库必须保持 public。

## 8. COMMANDS

```bash
pnpm install            # 走 .npmrc node-linker=hoisted
pnpm dev                # astro dev（:4321）
pnpm build              # astro build || exit 0
pnpm check              # build(容错) && tsc && wrangler deploy --dry-run
pnpm check:links        # node scripts/check-links.mjs  ← 必须先 pnpm build（读 dist/）
pnpm check:i18n         # node scripts/i18n-verify.mjs（字典完整性校验）
pnpm test               # vitest run（src/scripts/__tests__/sync-word-count.test.mjs，8 用例）
pnpm cf-typegen         # wrangler types → worker-configuration.d.ts
pnpm preview            # build(容错) && wrangler dev
pnpm deploy             # wrangler deploy（⚠️ 生产发布，先确认）

node src/scripts/sync-word-count.mjs [--repo <path>] [--verbose|--quiet]
node scripts/check-links.mjs [--root <仓库根>] [--verbose|--quiet]
```

## 9. CI / 安全

- `.github/workflows/argus-review.yml` — PR opened/synchronize/ready_for_review 触发；`if: github.event.pull_request.user.type != 'Bot'` 显式跳过 Dependabot（第三方 GitHub App 不收 secrets，token 步骤必失败）。需仓库 secrets `ARGUS_FLASH_APP_ID` / `ARGUS_FLASH_PRIVATE_KEY`。
- `.github/workflows/test.yml` — push/PR 到 main，pnpm 10.11.1 + Node 22 + `--frozen-lockfile` + `pnpm test`，10 分钟超时。
- `.github/workflows/codeql.yml` — CodeQL javascript-typescript，`paths: src/**` 过滤，`permissions` 收敛到 `security-events: write`，30 分钟超时。
- `.github/dependabot.yml` — npm weekly；**全部 patch/minor 合成 1 个 PR**，并用 `groups` + `ignore` 双保险**排除所有 major 升级**（与 Astro 5.x / Tailwind 3.4 版本约定一致）。
- `.github/workflows/pr-triage.yml` — PR 自动打标签（`area:*`，按路径，见 `.github/labeler.yml`）+ 自动指派作者（solo 即 cgartlab）。`pull_request_target` 只跑打标/指派，**禁止**在该 workflow 加 checkout/执行 PR 代码。
- `security-report.md` — 2026-05-11 快照，内容已过期：#50 已落地 `public/_headers`（CSP/HSTS/X-Frame-Options/COOP/Permissions-Policy）、`robots.txt`、Bilibili iframe `sandbox`、视频 `preload="none"`。改动安全相关配置后顺手更新该文件。
- 无部署 CI —— 部署全靠本地 `pnpm deploy` 手动执行。

## 10. NOTES

- `.npmrc`：`node-linker=hoisted` — D 盘 exFAT 不支持 symlink，pnpm 默认 symlinked 布局会安装失败；hoisted 保证本机与 CI 行为一致。
- `package.json` 的 `pnpm.onlyBuiltDependencies: [esbuild, sharp, workerd]` — pnpm 10 默认禁止 postinstall，这三者必须显式白名单，勿删。
- 字体：正文走 **Google Fonts CDN**（Outfit + Noto Sans SC，BaseHead.astro 预连接 + print→onload 懒加载）；`public/fonts/atkinson-*.woff` 仅被 global.css 的遗留 `@font-face` 引用，实际不参与渲染。
- tsconfig 继承 `astro/tsconfigs/strict`，`strictNullChecks: true`，`include` 含 `.astro/types.d.ts`。
- `src/consts.ts` 中 `EDUCATION`/`EXPERIENCE`/`PROJECTS`/`HONORS` 与 `WORK_EXPERIENCE`/`SKILLS` 部分语义重叠（简历改版遗留），展示时以页面实际引用为准，勿自行合并。
- 首页 `index.astro` 1720 行是单文件巨石：7 屏幻灯 HTML（hero/stats/work/meditation/profile/contact）+ `<style>` + `<script>`（i18n、code rain、Seaweed 海藻 canvas、视频 mask）。动效改动需谨慎，`prefers-reduced-motion` 降级路径在 app.css 718/965 行与 Header 的 scroll-reveal 内。
- 性能注意：`public/video/Demo-lite.mp4` 为幻灯共用背景视频，`autoplay muted loop playsinline preload="none"`；25MB 已贴近 Workers 部署上限，不要再加视频资源。
- 移动端触屏（#51）：`--ds-touch-target` token（44px）+ `@media (pointer: coarse)` 命中区规则，位于 app.css 末尾触屏块（必须在基础尺寸规则之后，同特异性后者胜）。
- 已知滚动问题（#52）：冥想系列（slide 4）嵌套 snap 滚动与前几屏不一致；profile 页 `.slide-content.scroll-y`（`overscroll-behavior: contain`）滚到底后无法继续链到 contact 页。
- 历史 spec：`.trae/specs/improve-dark-theme/` 记录了暗色主题改造的 spec/checklist/tasks，改造前先读 `spec.md`。
- 本地遗留：`dev*.log`（已 gitignore）、`chenyang_resume.md`、`worker-configuration.d.ts`（`pnpm cf-typegen` 产物，勿手改）。
- 详细架构文档：`DEVELOPMENT_GUIDE.md`（章节 7/8/11/17 是样式、颜色、暗色模式、陷阱速查，改视觉前必读）。
