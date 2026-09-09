# AGENTS.md — cy92-org

**分层**: 个人品牌 (Personal Brand) — 个人简历
**Updated:** 2026-06-16

个人在线简历。Astro 5.16.2 + TailwindCSS 3.4.17 + Cloudflare Workers 部署。
`pnpm@10.11.1`（`packageManager` 强制），Wrangler 4.61.0，Node 22（CI 固定；本地见「PITFALLS」）。

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
│   │   ├── ProjectCard.astro  # works 页卡片
│   │   └── SkillBar.astro     # 技能条
│   ├── layouts/BlogPost.astro
│   ├── pages/         # index(1725 行，单文件承载 4 屏幻灯 + i18n + canvas 动效)
│   │                   # about / works / blog/[...slug].astro / blog/index.astro / rss.xml.js
│   ├── scripts/
│   │   ├── sync-word-count.mjs            # 字数同步（ESM 零依赖）
│   │   └── __tests__/sync-word-count.test.mjs   # vitest 8 用例
│   ├── styles/
│   │   ├── app.css      # 设计系统核心（986 行，改样式一律在此）
│   │   └── global.css   # 遗留（620 行，含唯一 @font-face；不要修改）
│   ├── Assets/          # 演示视频素材（当前无页面引用，死素材）
│   ├── consts.ts        # 全站数据（155 行，见「3. 数据层」）
│   ├── content.config.ts  # blog 集合 schema（glob src/content/blog）
│   └── env.d.ts
├── scripts/
│   └── check-links.mjs  # 构建产物链接/锚点静态检查（ESM 零依赖）
├── public/
│   ├── favicon.svg / default-cover.webp
│   ├── fonts/           # atkinson-*.woff，仅被 global.css 引用（遗留）
│   ├── images/          # 作品配图（冥想系列等）
│   ├── video/demo.mp4   # 幻灯 3-4 屏共用背景视频（#reel）
│   └── *.webp           # 文章封面，中文文件名（勿重命名，consts/文章已引用）
├── .trae/specs/improve-dark-theme/   # 历史 spec 工作区（checklist/spec/tasks）
├── astro.config.mjs · wrangler.json · tailwind.config.js · tsconfig.json · .npmrc
├── DEVELOPMENT_GUIDE.md  # 1300+ 行架构/样式/颜色/暗色模式全解（改视觉前必读）
├── security-report.md    # 安全审计（2 LOW + 5 INFO）
├── chenyang_resume.md    # 简历源文（内容素材，非构建输入）
└── README.md             # ⚠️ 未修改的 Cloudflare 模板，不要信任其命令
```

## 2. WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 简历数据（改字） | `src/consts.ts` | SITE_TITLE / SITE_DESCRIPTION / PERSONAL_INFO / SOCIAL_LINKS / SKILLS / WORK_EXPERIENCE / EDUCATION / EXPERIENCE / PROJECTS / STATS / HONORS |
| 首页 4 屏幻灯文案 | `src/pages/index.astro` | 视觉文案 + `data-t` key 内联在此，**不在 consts.ts** |
| 英文译文 | `index.astro` 内 `<script>` 的 `I18N` 字典 | 中英双语见「5. i18n」 |
| 主样式 | `src/styles/app.css` | 设计 token + 站点 shell；Tailwind 颜色映射到 CSS 变量 |
| 遗留样式 | `src/styles/global.css` | **不要修改**，改样式一律在 app.css |
| 主题（暗色） | `BaseHead.astro` 初始态 + `app.css` `[data-theme="dark"]`/`.dark` 两处 token | 见「4. 主题」 |
| 图标 | `src/components/Icon.astro` | SVG path 硬编码，新图标必须在此注册 |
| Cloudflare 配置 | `astro.config.mjs` + `wrangler.json` | `platformProxy.enabled: false`，`compatibility_date: 2025-10-08`，`nodejs_compat` |
| 字数同步 | `src/scripts/sync-word-count.mjs` | 写回 consts.ts `STATS[0].value`（见「6. 跨仓库依赖」） |
| 死链检查 | `scripts/check-links.mjs` | 检查 `dist/`，需先 build；见 COMMANDS |
| 博客集合 | `src/content/blog/` | **目录不存在**，集合为空；dev 报 `collection "blog" does not exist or is empty` 是预期噪音，由 `build` 的 `|| exit 0` 吸收 |

## 3. CONVENTIONS

- **pnpm@10.11.1** — `packageManager` 强制，禁止 npm/yarn。Node 22（CI `setup-node@v4` 固定；`package.json` **未**用 `engines` 强制）。
- **TailwindCSS 3.4.17** — `@astrojs/tailwind` 集成，`applyBaseStyles: false`（BaseHead.astro 手动引入 app.css）。`tailwind.config.js` 颜色映射 `hsl(var(--x))` 到 app.css 变量；改色需同步 `:root` 浅色块与 `[data-theme="dark"]`/`.dark` 深色块。
- **Cloudflare adapter** — `@astrojs/cloudflare` 12.6.12，`platformProxy.enabled: false`。
- **`|| exit 0` 容错** — `build` / `check` / `preview` 均允许构建失败不中断（吸收空 blog 集合警告）。**不要移除**。
- **纯静态、无 JS 框架** — 页面为 `.astro`，动效/交互为页内原生 `<script>`（canvas 2D、IntersectionObserver），不引入 React/Vue。
- **零第三方依赖脚本** — `scripts/*.mjs` 与 `src/scripts/*.mjs` 均只用 Node 内置模块，新增脚本保持这一约定。
- **中文文件名资产** — `public/*.webp` 多为中文+空格文件名，被页面直接引用；重命名必须同步改引用。

## 4. 主题系统（易误判，读清楚）

- `app.css` **同时定义了浅色与深色两套 token**：浅色在 `:root` 块（约 1-190 行，`--ds-*` 与 `--background`/`--primary` 等 HSL 变量），深色在 `[data-theme="dark"]`（189 行）与 `.dark`（258 行）两处**重复定义**，改深色色值要改两处。
- `BaseHead.astro` 内联脚本**无条件** `isDark = true` → 加 `.dark` 类 + `data-theme="dark"`，并加 `.ds-js` 类（使 scroll-reveal 仅在 JS 可用时隐藏内容）。注释称 "Dark-only site"，与实际不完全一致。
- `Header.astro` 保留了 `#theme-toggle` 按钮，点击可切到浅色；但 **BaseHead 不读取 `localStorage.theme`，用户偏好不会在下次加载恢复**（始终回到暗色）。这是当前已知行为，非 bug 修复项——若要改，需同时动 BaseHead 与 Header。
- `html.dark, html[data-theme="dark"] { color-scheme: dark; }`（app.css 391 行）。

## 5. i18n（中英双语，仅首页）

- 实现全在 `src/pages/index.astro` 的 `<script>` 块：`I18N` 字典（`{ zh, en }`）+ `switchLang()` + `localStorage['lang']`（默认 `zh`）。
- 标记方式为元素上的 `data-t="<key>"`，当前 **29 个 key 全部集中在 index.astro**；`about.astro`、`works.astro`、`Footer.astro` 均未接入双语（仍为中文硬编码）。
- 英文值可含 HTML（如 `<br/>`），`switchLang` 用正则判断后决定 `innerHTML` / `textContent`。
- 切换时同步 `document.documentElement.lang = 'zh-CN' | 'en'`。
- 新增首页文案：先写 `data-t` key，再往 `I18N` 加 zh/en 双语条目，缺一侧会静默回退中文。
- 顶部导航语言切换按钮不在 Header.astro，若需新增入口请自行确认位置。

## 6. ANTI-PATTERNS

- **不要移除 `|| exit 0`** — 构建脚本依赖此容错，移除会导致 `pnpm build` 因空 blog 集合警告误报失败。
- **不要启用 `platformProxy`** — 当前 `false`，与 animpoly-com 不同。
- **不要引入 `pnpm-workspace.yaml`** — 已在 `.gitignore` 中，Cloudflare CI 见到该文件会报错。
- **不要信任 `README.md`** — 是未修改的 Cloudflare 模板（含 `npm` 命令与 dash-content 块），命令一律以 `package.json` 为准。
- **不要生成/更新 `package-lock.json`** — `pnpm-lock.yaml` 是唯一锁文件；现有 package-lock.json（313KB）是模板残留，勿删勿改勿提交。
- **不要向仓库添加 React/Vue/框架依赖** — 本仓刻意保持纯 Astro。
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
- `security-report.md` — 2 项 LOW（间接依赖 CVE、缺安全响应头、Bilibili iframe 无 sandbox）+ 5 项 INFO（无 robots.txt 等）；改动 Bilibili 嵌入时顺手补 `sandbox`。
- 无部署 CI —— 部署全靠本地 `pnpm deploy` 手动执行。

## 10. NOTES

- `.npmrc`：`node-linker=hoisted` — D 盘 exFAT 不支持 symlink，pnpm 默认 symlinked 布局会安装失败；hoisted 保证本机与 CI 行为一致。
- `package.json` 的 `pnpm.onlyBuiltDependencies: [esbuild, sharp, workerd]` — pnpm 10 默认禁止 postinstall，这三者必须显式白名单，勿删。
- 字体：正文走 **Google Fonts CDN**（Outfit + Noto Sans SC，BaseHead.astro 预连接 + print→onload 懒加载）；`public/fonts/atkinson-*.woff` 仅被 global.css 的遗留 `@font-face` 引用，实际不参与渲染。
- tsconfig 继承 `astro/tsconfigs/strict`，`strictNullChecks: true`，`include` 含 `.astro/types.d.ts`。
- `src/consts.ts` 中 `EDUCATION`/`EXPERIENCE`/`PROJECTS`/`HONORS` 与 `WORK_EXPERIENCE`/`SKILLS` 部分语义重叠（简历改版遗留），展示时以页面实际引用为准，勿自行合并。
- 首页 `index.astro` 1725 行是单文件巨石：4 屏幻灯 HTML + `<style>` + `<script>`（i18n、code rain、Seaweed 海藻 canvas、视频 mask）。动效改动需谨慎，`prefers-reduced-motion` 降级路径在 app.css 718/981 行与 Header 的 scroll-reveal 内。
- 性能注意：`public/video/demo.mp4` 为幻灯 3-4 屏共用背景视频，`autoplay muted loop playsinline`；新增视频资源会影响首屏流量。
- 历史 spec：`.trae/specs/improve-dark-theme/` 记录了暗色主题改造的 spec/checklist/tasks，改造前先读 `spec.md`。
- 本地遗留：`dev*.log`（已 gitignore）、`chenyang_resume.md`、`worker-configuration.d.ts`（`pnpm cf-typegen` 产物，勿手改）。
- 详细架构文档：`DEVELOPMENT_GUIDE.md`（章节 7/8/11/17 是样式、颜色、暗色模式、陷阱速查，改视觉前必读）。
