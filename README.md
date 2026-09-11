# cy92.org — 个人在线简历

[![Test](https://github.com/cgartlab/cy92-org/actions/workflows/test.yml/badge.svg)](https://github.com/cgartlab/cy92-org/actions/workflows/test.yml)
[![Argus-Flash Review](https://github.com/cgartlab/cy92-org/actions/workflows/argus-review.yml/badge.svg)](https://github.com/cgartlab/cy92-org/actions/workflows/argus-review.yml)

个人品牌 / 在线简历站：<https://cy92.org>

**Astro 5.18 + TailwindCSS 3.4 + Cloudflare Workers**（静态资源，纯前端无框架）。

## 特性

- **7 屏滚动幻灯首页**：hero → 数据 → 作品 → 冥想系列（10 幅 + 全部作品墙）→ Profile → 联系方式，全站 scroll-snap + Canvas 动效（代码雨 / 海藻 / 极光 / 波浪粒子）
- **中英双语**：默认英文，`localStorage['lang']` 记忆切换；字典单一来源 `src/i18n/dict.ts`，全站页面（含 Header/Footer）双语
- **暗色主题**：`BaseHead` 首帧注入 `.dark`，app.css 深色 token 单一来源
- **移动端触屏优化**：44px 命中区（`--ds-touch-target`）、安全区适配
- **安全响应头**：CSP / HSTS / X-Frame-Options / Referrer-Policy 等，见 `public/_headers`；`robots.txt` + Sitemap
- **SEO / OG**：canonical、OpenGraph、RSS、Sitemap 全配齐
- **自动化**：PR 自动打标签（area:frontend/styles/i18n/…）+ 指派作者（`pr-triage.yml`）、Dependabot weekly（major 全部排除）、CodeQL

## 开发

要求：**pnpm@10.11.1**（`packageManager` 强制）、Node 22。禁止 npm/yarn。

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装依赖（`.npmrc` `node-linker=hoisted`，D 盘 exFAT 无 symlink） |
| `pnpm dev` | 本地开发服务器 `:4321` |
| `pnpm build` | 构建到 `dist/`（容错：空 blog 集合不中断） |
| `pnpm check` | build（容错）+ `tsc` + `wrangler deploy --dry-run` |
| `pnpm check:links` | `dist/` 死链检查（先 `pnpm build`） |
| `pnpm check:i18n` | i18n 字典完整性校验（`scripts/i18n-verify.mjs`） |
| `pnpm test` | vitest（`src/scripts/__tests__/`） |
| `pnpm cf-typegen` | 生成 `worker-configuration.d.ts`（勿手改） |
| `pnpm deploy` | 部署到 Cloudflare Workers（**生产发布**，先确认） |

## 结构

```
src/
├── i18n/dict.ts        # 双语字典单一来源（data-t / data-t-aria / data-l 共用）
├── components/
│   ├── BaseHead.astro  # <head> + SEO/OG + 字体 + 初始 theme/lang（首帧防闪烁）
│   ├── LangScript.astro# 语言运行时：切换 data-t 文本、aria、data-l 双渲染
│   ├── Header / Footer / Icon / ProjectCard / SkillBar / …
├── pages/
│   ├── index.astro     # 7 屏幻灯巨石（1720 行：HTML + style + canvas 动效）
│   ├── about / works / blog / rss.xml.js
├── styles/
│   ├── app.css         # 设计系统核心（token + 深浅色），改样式一律在此
│   └── global.css      # 遗留（620 行），不要修改
├── consts.ts           # 简历数据（改字来这里，253 行）
├── scripts/            # sync-word-count.mjs、i18n-verify.mjs（零第三方依赖）
public/
├── _headers            # CSP 等安全响应头（Wrangler 部署时读取，不对外服务）
├── robots.txt / sitemap-index.xml
└── video/Demo-lite.mp4 # 幻灯共用背景视频（25MB，Workers 25MB 部署上限内）
```

- 简历内容数据：`src/consts.ts`（`WORK_EXPERIENCE` / `EDUCATION` / `HONORS` / `PROJECTS` 等）
- 首页幻灯文案与视觉：`src/pages/index.astro`
- 双语字典：`src/i18n/dict.ts`（新增 key：dict 加 zh/en 条目 → 页面加 `data-t` → `pnpm check:i18n`）
- 详细架构 / 样式 / 暗色模式：见 `DEVELOPMENT_GUIDE.md`（改视觉前必读）

## 已知问题

- 首页滚动：冥想系列滚动节奏与前几屏不一致；profile 页内部滚动无法顺滑链到联系方式页 — 跟踪 [#52](https://github.com/cgartlab/cy92-org/issues/52)

## 安全

`public/_headers` 提供 CSP / HSTS / X-Frame-Options 等响应头；Bilibili iframe 已加 `sandbox`；视频 `preload="none"` 降低首屏流量。`security-report.md` 是 2026-05-11 快照，其 LOW 项已在 #50 落地修复。

## 维护

单人维护。PR 流程：Conventional Commits（`feat|fix|docs|…`），PR 自动打 `area:*` 标签并指派作者，合并用 squash。
