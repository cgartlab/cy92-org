# AGENTS.md — cy92-org

**分层**: 个人品牌 (Personal Brand) — 个人简历
**Updated:** 2026-09-05

个人在线简历。Astro 5.16.2 + TailwindCSS 3.4 + Cloudflare Workers 部署。pnpm@10.11.1（`packageManager` 强制），Wrangler 4.61.0。

## STRUCTURE

```
src/
├── components/    # Astro 组件（纯 .astro，无 React）
├── layouts/       # BlogPost.astro
├── pages/         # 路由页面（index, works, about, blog/, rss.xml.js）
├── scripts/       # sync-word-count.mjs（字数同步，ESM 零依赖） + __tests__/
├── styles/        # app.css（主样式） + global.css（遗留）
├── consts.ts      # 全站数据：个人信息、社交链接、作品、统计
├── content.config.ts  # blog 集合 schema（glob src/content/blog）
└── env.d.ts
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 简历数据 | `src/consts.ts` | 所有页面数据（PERSONAL_INFO / SKILLS / WORK_EXPERIENCE / PROJECTS / STATS / HONORS） |
| 主样式 | `src/styles/app.css` | 设计系统核心；Tailwind 颜色映射到 CSS 变量 |
| 遗留样式 | `src/styles/global.css` | 逐步弃用，**不要修改**，改样式一律在 app.css |
| 暗色模式 | `app.css` `.dark` + `BaseHead.astro` | class 策略 + CSS 变量切换 |
| 图标 | `src/components/Icon.astro` | SVG path 硬编码，新图标必须在此注册 |
| Cloudflare 配置 | `astro.config.mjs` + `wrangler.json` | `platformProxy.enabled: false` |
| 博客集合 | `src/content/blog/` | 当前**不存在**，集合为空；Header「博客」外链到 cgartlab.com |

## CONVENTIONS

- **pnpm@10.11.1** — `packageManager` 强制，禁止 npm/yarn。Node ≥22（DEVELOPMENT_GUIDE 要求，`package.json` **未**用 `engines` 强制）。
- **TailwindCSS 3.4** — `@astrojs/tailwind` 集成，`applyBaseStyles: false`（BaseHead.astro 手动引入 app.css）。
- **Cloudflare adapter** — `@astrojs/cloudflare` 12.x，`platformProxy.enabled: false`。
- **`|| exit 0` 容错** — `build` / `check` / `preview` 均允许构建失败不中断。**不要移除**。

## ANTI-PATTERNS

- **不要移除 `|| exit 0`** — 构建脚本依赖此容错逻辑，移除会导致命令误报失败。
- **不要启用 `platformProxy`** — 当前设为 `false`，与 animpoly-com 不同。
- **不要引入 `pnpm-workspace.yaml`** — 已在 `.gitignore` 中；Cloudflare CI 会因存在该文件报错。`packageManager` 字段已足够。
- **不要信任 `README.md`** — 是未修改的 Cloudflare 模板（含 npm 命令），命令一律以 package.json 为准。
- **不要生成/更新 `package-lock.json`** — `pnpm-lock.yaml` 是唯一锁文件；现有 package-lock.json 是模板残留。

## CROSS-PROJECT DEPENDENCIES

- **cgartlab.github.io（强依赖）** — `src/scripts/sync-word-count.mjs`（ESM 零依赖）从 cgartlab.github.io 仓库读取文章统计字数，写回 `src/consts.ts` 的「累计字数」字段（原子写入，统计项缺失拒绝写坏）。仓库路径解析三级：`--repo <path>` CLI 参数 > `CGARTLAB_REPO` 环境变量 > sibling 相对推导（脚本上三级即 github-repos 平级目录，本机 `D:\2-Area\github-repos\` 零配置可跑）；全失败明确报错。运行: `node src/scripts/sync-word-count.mjs`。
- **外部链接** — cgartlab.com、weekly.cgartlab.com、bilibili、x.com、sspai（见 consts.ts）。

## COMMANDS

```bash
pnpm install && pnpm dev      # 本地开发（astro dev，:4321）
pnpm build                    # astro build || exit 0
pnpm deploy                   # wrangler deploy
pnpm cf-typegen               # wrangler types → worker-configuration.d.ts
pnpm check                    # build(容错) + tsc + wrangler deploy --dry-run
pnpm preview                  # build(容错) + wrangler dev
node src/scripts/sync-word-count.mjs    # 同步字数统计（--repo <path> / CGARTLAB_REPO / sibling fallback）
pnpm test                     # vitest run（src/scripts/__tests__）
```

## NOTES

- `tailwind.config.js` 颜色映射 `hsl(var(--x))` 到 app.css 的 CSS 变量；改色需同步 :root 与 `.dark` 两处。
- tsconfig 继承 `astro/tsconfigs/strict`，`strictNullChecks: true`。
- `wrangler.json`：`main: ./dist/_worker.js/index.js`，assets 指向 `./dist`，`nodejs_compat` flag。
- `.npmrc`：`node-linker=hoisted` — 本机 D 盘 exFAT 不支持 symlink，pnpm 默认 symlinked 布局会安装失败；hoisted 用 npm 平铺布局，保证本地与 CI 行为一致。
- 测试：vitest 5.0.0（devDependency），`pnpm test` = `vitest run`；单测 `src/scripts/__tests__/sync-word-count.test.mjs`（8 用例，覆盖路径解析 / 原子写入 / 统计项缺失拒写）。
- CI：`.github/workflows/argus-review.yml`（PR 自动审查，cgartlab/argus action）+ `test.yml`（push/PR 触发 pnpm test）+ `codeql.yml`（CodeQL javascript-typescript，build-mode: none，security-extended）；`.github/dependabot.yml`（npm weekly）。无部署 CI。
- 详细架构文档: `DEVELOPMENT_GUIDE.md`（样式 / 颜色 / 暗色模式全解）；安全审计: `security-report.md`。
