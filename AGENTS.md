# AGENTS.md — cy92-org

Astro 5 + TailwindCSS 博客，Cloudflare Workers 部署。

## STRUCTURE

```
src/
├── components/    # Astro/React 组件（Tailwind 样式）
├── content/       # MDX 博客文章
├── data/          # 站点数据/配置
├── layouts/       # Tailwind 布局
├── pages/         # 路由页面（含 blog/）
├── scripts/       # 工具脚本
└── styles/        # Tailwind 全局样式入口
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 博客文章 | `src/content/` | MDX 格式 |
| Tailwind 配置 | `tailwind.config.*` | `@tailwindcss/typography` |
| Cloudflare 配置 | `astro.config.mjs` | `platformProxy.enabled: false` |
| 类型生成 | `wrangler types` → `.wrangler/` | `npm run cf-typegen` |

## CONVENTIONS

- **Node ≥22** — `package.json` `engines` 强制。
- **TailwindCSS 3.4** — `@astrojs/tailwind` 集成, `applyBaseStyles: false` (手动引入)。
- **Cloudflare adapter** — `@astrojs/cloudflare` 12.x, `platformProxy.enabled: false`。
- **`|| exit 0` 容错** — `build`, `check`, `preview` 脚本均允许构建失败不中断。**不要移除**。

## ANTI-PATTERNS

- **不要移除 `|| exit 0`** — 构建脚本依赖此容错逻辑，移除会导致 CI 误报失败。
- **不要启用 `platformProxy`** — 当前设为 `false`，与 animpoly-com 不同。

## COMMANDS

```bash
npm install && npm run dev        # 本地开发 (astro dev)
npm run build                     # Astro 构建（允许失败）
npm run deploy                    # Wrangler 部署到 Cloudflare
npm run cf-typegen                # 生成 Cloudflare 类型
npm run check                     # 构建 + tsc + wrangler dry-run
npm run preview                   # 构建 + wrangler dev 本地预览
```

## NOTES

- Tailwind 插件: `@tailwindcss/typography` 0.5.x (prose 样式)
- `cross-env` 用于跨平台环境变量（devDependency）
- `site` URL 已更新为 `https://cy92.org`
- 与 animpoly-com 主要区别: TailwindCSS vs 纯 CSS, `platformProxy: false` vs `true`
