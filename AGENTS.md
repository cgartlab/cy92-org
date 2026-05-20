# AGENTS.md — cy92-org

**分层**: 个人品牌 (Personal Brand) — 个人简历

个人在线简历。Astro + TailwindCSS + Cloudflare Workers 部署。

## STRUCTURE

```
src/
├── components/    # Astro/React 组件（Tailwind 样式）
├── content/       # 简历相关内容
├── data/          # 站点数据/配置（含 consts.ts 字数统计）
├── layouts/       # Tailwind 布局
├── pages/         # 路由页面（works, about, blog/）
├── scripts/       # 工具脚本（含 sync-word-count.ts）
└── styles/        # Tailwind 全局样式入口
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

- **Node ≥22** — `package.json` `engines` 强制。
- **TailwindCSS 3.4** — `@astrojs/tailwind` 集成, `applyBaseStyles: false` (手动引入)。
- **Cloudflare adapter** — `@astrojs/cloudflare` 12.x, `platformProxy.enabled: false`。
- **`|| exit 0` 容错** — `build`, `check`, `preview` 脚本均允许构建失败不中断。**不要移除**。

## ANTI-PATTERNS

- **不要移除 `|| exit 0`** — 构建脚本依赖此容错逻辑，移除会导致 CI 误报失败。
- **不要启用 `platformProxy`** — 当前设为 `false`，与 animpoly-com 不同。

## CROSS-PROJECT DEPENDENCIES

- **cgartlab.github.io (强依赖)** — `src/scripts/sync-word-count.ts` 从 `../cgartlab.github.io/src/content/posts/`（相对于 workspace 根目录）读取文章内容，计算总字数后更新到 `src/consts.ts`。运行方式: `npx tsx src/scripts/sync-word-count.ts`。
- **外部链接** — `src/consts.ts` 和页面组件引用 cgartlab.com、weekly.cgartlab.com。

## COMMANDS

```bash
npm install && npm run dev        # 本地开发 (astro dev)
npm run build                     # Astro 构建（允许失败）
npm run deploy                    # Wrangler 部署到 Cloudflare
npm run cf-typegen                # 生成 Cloudflare 类型
npm run check                     # 构建 + tsc + wrangler dry-run
npm run preview                   # 构建 + wrangler dev 本地预览
npx tsx src/scripts/sync-word-count.ts  # 同步字数统计
```

## NOTES

- Tailwind 插件: `@tailwindcss/typography` 0.5.x (prose 样式)
- `cross-env` 用于跨平台环境变量（devDependency）
- `site` URL 已更新为 `https://cy92.org`
- 与 animpoly-com 主要区别: TailwindCSS vs 纯 CSS + 设计系统, `platformProxy: false` vs `true`
