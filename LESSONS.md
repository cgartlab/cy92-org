# LESSONS — cy92-org

> 个人在线简历站（Astro 5.18 + TailwindCSS 3.4 + Cloudflare Workers，pnpm@10.11.1 强制，端口 4402，`build` 含 `|| exit 0` 容错不可删）。
> 本仓库从真实失误沉淀的「教训→规则」清单。**会话开始先全文阅读并遵循其中所有规则**；出现新失误按 §维护 追加。
> 权威依据：Anthropic Claude Code memory/best practices（<200 行、具体可验证、第二次犯同样错即写入）；社区 lessons.md 惯例（Boris Cherny，Anthropic）。
> 来源：本仓库 AGENTS.md + 已验证 fix 提交（2026-09 至 2026-10）。

## 维护
- **触发**：用户纠正 / Agent 自查到的失误 / 非显而易见的 gotcha。
- **格式**：`### <主题>` 下，每条 = 失误（具体场景）→ 规则（最小可执行指令），一行可验证。
- **只记项目特有、不可从代码推断的**；通用最佳实践不写；含糊措辞（"小心""注意"）删掉。
- **重复出现** → 升级进 `AGENTS.md` 硬规则；**月度审阅**裁剪过期项；目标 < 200 行。

## 设计系统（暗色唯一）

### 本站是 dark-only 设计
- 失误：跟随系统 `prefers-color-scheme` 导致浅色模式下深色文字压在视频背景上不可读 → 规则：强制 `isDark=true`，让 `ds` 令牌恒解析为浅色文字；**不要**恢复系统跟随（commit 475cc7f root cause）

### 样式只改 `src/styles/app.css`
- 失误：在组件里新开 style 文件或内联散写 → 规则：`app.css` 是**唯一**样式文件；Tailwind 颜色映射到 CSS 变量，不直接用调色板类

### 视频页共享同一背景参数
- 失误：同类视频页亮度/遮罩不一致（0.45 vs 0.7）看起来像不同场景 → 规则：共用视频背景的页面，`brightness` 与 scrim 必须一致，只有前景文案不同（commit 475cc7f）

## 数据与构建

### 构建期固化的时间计算会出错
- 失误：「从事数字创作领域」被固化为 `-44 年` → 规则：与"当前时间"有关的计算必须在**运行时**完成，不可在构建期求值（commit 5109bb6）

### `|| exit 0` 不可删
- 失误：删除 `build` 脚本里的容错导致部署中断 → 规则：`build` 中的 `|| exit 0` 是有意容错（见根 AGENTS.md ANTI-PATTERNS）

## 资源与体积

### Workers 单文件上限 25MB
- 失误：把 60MB 视频打进构建产物导致部署失败 → 规则：大体积媒体放 `public/` 且不参与构建打包；`video/Demo-lite.mp4` 用 `preload=none`（commit e6659e1）

## 双语（i18n）

### 新增文案必须双写
- 失误：只加 `data-t` 未在 `dict.ts` 补 zh/en → 规则：任何文案先加双语条目，再跑 `pnpm check:i18n`（commit ebe9571、283bded）

### `data-l` 切换需要配套 CSS
- 失误：加了 `data-l` 属性但缺 CSS 规则，语言切换无效 → 规则：新增语言切换位点必须同时补 CSS 规则

## 无障碍与交互

### 装饰性动画要降级
- 失误：canvas 动画忽略 `prefers-reduced-motion` → 规则：所有装饰性动画补 reduced-motion 降级（commit 7ba00f4）

### 触屏命中区 44px
- 失误：移动端可点击区域小于 44px → 规则：用 `--ds-touch-target`（44px），`@media (pointer: coarse)` 下生效（commit 5b59613）

### skip-link 与键盘可达
- 失误：skip-link 焦点不可见、下拉不可键盘操作 → 规则：交付前跑键盘 Tab 走查（commit 486253b）

### iframe 要 sandbox
- 失误：外部 iframe 未加 sandbox → 规则：所有第三方 iframe 加 `sandbox` 与 `loading="lazy"`（commit 8f37f5b）

## CI 与安全

### `public/_headers` 是安全头唯一来源
- 失误：在别处重复定义 CSP/HSTS → 规则：安全响应头只维护 `public/_headers`，Wrangler 部署时读取

### pr-triage 不要重复 assign
- 失误：`pr-triage` 与 `auto-assign` 都做 assign，间歇性失败 → 规则：一件事只有一个 workflow 负责（commit 55f3636）

### 依赖告警用 overrides 收口
- 失误：逐个升级传递依赖无效 → 规则：用 `pnpm.overrides` 收口，升级大版本时同改 Tailwind/PostCSS 集成（commit a252387、d5eeb57、98b93a8）

### 中文排版与横向溢出
- 失误：中文标点/换行与移动端横向溢出 → 规则：改排版后必须在 390px 视口实拍验证（commit 9128230，PR #72）
