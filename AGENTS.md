# AGENTS.md — cy92-org

**分层**: 个人品牌 (Personal Brand) — 个人简历
**Updated:** 2026-05-29

个人在线简历。Astro + TailwindCSS + Cloudflare Workers 部署。pnpm@10.11.1，Wrangler 4.61.0。

## STRUCTURE

```
src/
├── components/    # Astro/React 组件（Tailwind 样式）
├── layouts/       # Tailwind 布局
├── pages/         # 路由页面（works, about, blog/）
├── scripts/       # 工具脚本（sync-word-count.ts, sync-word-count.mjs）
├── styles/        # Tailwind 全局样式入口
├── consts.ts      # 个人信息、社交链接、作品列表、字数统计
├── content.config.ts
└── env.d.ts
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 简历数据 | `src/consts.ts` | 个人信息、社交链接、作品列表、字数统计 |
| 作品集 | `src/pages/works.astro` | 项目案例展示，部分链接到 cgartlab.com |
| Tailwind 配置 | `tailwind.config.*` | `@tailwindcss/typography` |
| Cloudflare 配置 | `astro.config.mjs` | `platformProxy.enabled: false` |
| 字数同步脚本 | `src/scripts/sync-word-count.ts` | 从 cgartlab.github.io 读取文章统计字数 |

## CONVENTIONS

- **pnpm@10.11.1** — `package.json` `packageManager` 强制，禁止 npm/yarn。
- **Node ≥22** — `package.json` `engines` 强制。
- **TailwindCSS 3.4** — `@astrojs/tailwind` 集成, `applyBaseStyles: false` (手动引入)。
- **Cloudflare adapter** — `@astrojs/cloudflare` 12.x, `platformProxy.enabled: false`。
- **`|| exit 0` 容错** — `build`, `check`, `preview` 脚本均允许构建失败不中断。**不要移除**。

## ANTI-PATTERNS

- **不要移除 `|| exit 0`** — 构建脚本依赖此容错逻辑，移除会导致 CI 误报失败。
- **不要启用 `platformProxy`** — 当前设为 `false`，与 animpoly-com 不同。
- **不要恢复 `pnpm-workspace.yaml`** — 在 `ci-check` 通过时已被移除，Cloudflare CI 会因存在该文件报错。`packageManager` 字段已足够。`publish` 脚本在发布前自动检查并移除该文件。

## CROSS-PROJECT DEPENDENCIES

- **cgartlab.github.io (强依赖)** — `src/scripts/sync-word-count.ts` 从 `../cgartlab.github.io/src/content/posts/`（相对于 workspace 根目录）读取文章内容，计算总字数后更新到 `src/consts.ts`。运行方式: `npx tsx src/scripts/sync-word-count.ts`。
- **外部链接** — `src/consts.ts` 和页面组件引用 cgartlab.com、weekly.cgartlab.com。

## COMMANDS

```bash
pnpm install && pnpm dev          # 本地开发 (astro dev)
pnpm build                        # Astro 构建（允许失败）
pnpm deploy                       # Wrangler 部署到 Cloudflare
pnpm cf-typegen                   # 生成 Cloudflare 类型
pnpm check                        # 构建 + tsc + wrangler dry-run
pnpm preview                      # 构建 + wrangler dev 本地预览
npx tsx src/scripts/sync-word-count.ts  # 同步字数统计
```

## NOTES

- Tailwind 插件: `@tailwindcss/typography` 0.5.x (prose 样式)
- `cross-env` 用于跨平台环境变量（devDependency）
- `site` URL 已更新为 `https://cy92.org`
- 与 animpoly-com 主要区别: TailwindCSS vs 纯 CSS + 设计系统, `platformProxy: false` vs `true`
- **暗色主题**: 已全面重构为基于 CSS 变量的切换系统，支持手动切换 + `prefers-color-scheme`
- **安全审计**: `security-report.md` 位于根目录（191 行）
