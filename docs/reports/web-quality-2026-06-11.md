# Web Quality Report — cy92-org

日期: 2026-06-11
MODEL_TIER: lite
LITE_CORE: F01,F02,S02,S03,T01,T04,X04,F05,F07,V01,V04,E01

## 本轮状态表

| 维度 | 结论 | 轮次 |
|------|------|------|
| F01 断链 | 已检查；4 处外链 404/DNS 失效已修复 | 1 |
| F02 空实现 | 已检查；无发现（合格） | 2 |
| S02 特异性 | 已检查；无 P0/P1/P2；1 条 P3 观察 | 3 |
| S03 死代码 | 已检查；global.css 与 SkillBar.astro 无引用（P2，需人工决策） | 4 |
| T01 标题层级 | 已检查；h1 唯一、无跳级（合格）；另发现 ProjectCard 死组件 | 5 |
| T04 对比度 | 已检查；正文组合达标；暗色 accent 系列 4 条 AA 违规（配色体系，需人工决策） | 6 |
| X04 键盘焦点 | 已检查；全局 :focus-visible + 抽屉焦点管理完整（合格） | 8 |
| F05 错误容错 | 已检查；静态站无客户端 fetch，空态有兜底（合格） | 9 |
| F07 核心指标 | 已检查；构建沙箱内 spawn EPERM 失败、无 LHCI 配置 → 全 UNKNOWN | 10 |
| V01 XSS | 已检查；唯一 set:html 用于硬编码 SVG，无注入面（合格） | 11 |
| V04 密钥泄露 | 已检查；无 .env、wrangler.json 无 secret、dist 0 密钥（合格） | 12 |
| E01 交互态 | 已检查；适用场景七态齐备，目标尺寸/alt/宽高合规（合格） | 13 |

## 发现

### F01 断链（第 1 轮）

本轮维度: F01 断链
看哪些文件: consts.ts, Header.astro, Footer.astro, ProjectCard.astro, blog/index.astro, content.config.ts, blog/[slug].astro, works.astro（共 8 文件）
搜什么: href= / src= 全部出处；本地资源对照 public/ 目录；外链用 web_fetch 实抓状态码；锚点 # 无引用

已检查范围:
- 本地路由链接（/ /works /about /blog/…）→ 对应 pages/*.astro 均存在
- 本地静态资源（/favicon.svg /fonts/*.woff /default-cover.webp /images/冥想系列-*.webp /rss.xml）→ 均存在于 public/ 或由 rss.xml.js 生成
- 内链锚点 href="#" → 未发现
- 外链逐一实抓：github.com/cgartlab(200)、sspai.com/u/cgartlab(200)、cgartlab.com(200)、cgartlab.com/posts/meditation-series/(200)、space.bilibili.com/38043072(200)、bilibili 两个 BV 视频(200)

[P2] F01 src/consts.ts:132（已修复）— 玄光周刊项目链接域名已死，DNS 无法解析
  Found:    link: "https://weekly.cgartlab.com",
  Expected: 指向仍存活的周刊页面
  Fix:      link: "https://cgartlab.com/weekly/",
  Basis:    web_fetch 返回 getaddrinfo ENOTFOUND weekly.cgartlab.com；Resolve-DnsName 仅得 SOA、无 A 记录；判定表"断链"行
  Note:     cgartlab.com/weekly/ 已实抓 HTTP 200（专栏页，含 No.01–No.20 全部周刊）。影响首页项目卡片外链。

[P2] F01 src/consts.ts:138（已修复）— LayerRenamer 项目链接指向 /blog/，该路径 404
  Found:    link: "https://cgartlab.com/blog/",
  Expected: 指向 LayerRenamer 文章页
  Fix:      link: "https://cgartlab.com/posts/layerrenamer/",
  Basis:    web_fetch https://cgartlab.com/blog 返回 HTTP 404 Not Found；sitemap 无 /blog/ 条目；判定表"断链"行
  Note:     https://cgartlab.com/posts/layerrenamer/ 已实抓 HTTP 200。影响首页项目卡片外链。

[P2] F01 src/consts.ts:144（已修复）— 「个人知识管理系统」项目链接 /blog/obsidian-second-brain 404
  Found:    link: "https://cgartlab.com/blog/obsidian-second-brain",
  Expected: 指向第二大脑文章页
  Fix:      link: "https://cgartlab.com/posts/second-brain-for-designer/",
  Basis:    web_fetch 返回 HTTP 404 Not Found；sitemap 实际 slug 为 second-brain-for-designer；判定表"断链"行
  Note:     https://cgartlab.com/posts/second-brain-for-designer/ 已实抓 HTTP 200。影响首页项目卡片外链。

[P2] F01 src/pages/works.astro:175（已修复）— Bilibili 空间链接用 handle 而非 UID，返回 404
  Found:    href="https://space.bilibili.com/cgartlab"
  Expected: 使用与 consts.ts 一致的 UID 空间地址
  Fix:      href="https://space.bilibili.com/38043072"
  Basis:    web_fetch 返回 HTTP 404「无法找到该页面~」；space.bilibili.com/38043072 实抓 200；判定表"断链"行
  Note:     影响作品页「Bilibili 主页」卡片。

已修复文件: src/consts.ts（3 行链接）、src/pages/works.astro（1 行链接），均在预算内（2 文件 / 4 行）。
验证方式: 全部替换后的 URL 已用 web_fetch 实抓 HTTP 200；本地资源与路由对照目录树存在。

UNKNOWN:
- x.com/cgartlab 无法从本环境验证（web_fetch TypeError / TLS 失败，疑似网络封锁而非断链），未定级。

观察（非 F01 断链，移交功能维度参考）:
- src/content/blog 目录不存在（content.config.ts glob base ./src/content/blog），getCollection('blog') 返回空；blog/index.astro 有空态兜底「暂无博客文章」，[slug].astro 不产出文章页 → 无断链，但博客区为空。是否需从 cgartlab.github.io 同步内容属设计决策，标「需人工决策」。

## 移交强模型

### F02 空实现（第 2 轮）

本轮维度: F02 空实现
看哪些文件: index.astro, about.astro, Icon.astro, FormattedDate.astro, BaseHead.astro, BlogPost.astro, rss.xml.js, SkillBar.astro（共 8 文件；另 Header/Footer/ProjectCard/works/blog-index 已于 F01 轮读过）
搜什么: href="#"、onClick=() => {}、on[A-Z]* 空箭头函数、TODO、FIXME、placeholder、alert(、console.log、return null、notImplemented

已检查范围:
- 全 src 树 grep：href="#" → 0 命中；onClick=() => {} → 0 命中；TODO/FIXME/placeholder → 0 命中
- 空箭头函数：唯一命中 src/components/Header.astro:159 的 onScroll 为真实实现（scroll 阴影切换），非空壳
- console.log：仅存在于 src/scripts/sync-word-count.{mjs,ts}（构建期工具脚本，非页面产物），不报
- Icon.astro：icons 映射表中所有页面引用的图标名（github/twitter/bilibili/open_in_new/rss_feed/place/person/mail/dark_mode/light_mode/brush/arrow_forward）均有 path 定义；未发现悬空图标名
- FormattedDate.astro:8 `if (!date) return null` 为防御性空值处理（合法），非空实现
- rss.xml.js 正常输出 posts 映射；SkillBar.astro 渐变/标签函数均有真实逻辑
- Header 主题切换、移动导航、滚动阴影、scroll-reveal 脚本均有完整实现（已在 F01 轮读过）

结论: F02 无发现，合格。无需修改，无退出码需记录（本轮零编辑）。

### S02 特异性（第 3 轮）

本轮维度: S02 特异性
看哪些文件: src/styles/app.css（1–971 全读）、src/styles/global.css（1–620 全读）、BaseHead.astro（样式入口）
搜什么: !important、style="、#id 选择器、超长选择器

已检查范围:
- !important 全部 48 处逐条核对，均落在三类标准场景：
  · 打印样式 @media print（global.css 420–571、app.css 686–693）
  · prefers-reduced-motion（global.css 612–614、app.css 700–702、968）
  · 桌面断点复位移动抽屉（app.css 897–910）
- 内联 style=：69 处全部只引用令牌 var(--ds-*) / var(--accent)，无裸色值、无对 class 的覆盖冲突
- CSS 中 #id 选择器：0 处（grep 命中 #\w+ 全部是十六进制色值前缀，如 #D4A574、#000）
- 超长选择器：最深为 .ds-mnav-trigger.is-open .ds-mnav-trigger-bar:nth-child(n)（3 层+伪类），可接受
- 未发现同属性不同来源的冲突声明；app.css 与 global.css 无同名属性互相覆盖

[P3] S02 src/styles/app.css:897-910 — 桌面断点用 10 条 !important 复位移动抽屉（观察项，非缺陷）
  Found:    .ds-navbar-links {
  		display: flex !important;
  		position: static !important;
  		transform: none !important;
  		visibility: visible !important;
  		flex-direction: row !important;
  		background: none !important;
  		box-shadow: none !important;
  		padding: 0 !important;
  		width: auto !important;
  		overflow: visible !important;
  	}
  Expected: 断点切换仅需覆盖 display/position/transform 等核心属性，其余属性可在移动端媒体查询内隔离，减少 !important 堆叠
  Fix:      需人工决策（涉及抽屉布局重构，超出小修预算）
  Basis:    判定表「!important 与内联滥用」检查项；此处是断点状态切换的标准手法，非特异性冲突
  Note:     min-width:768px 下重置 max-width:767px 的抽屉规则属有意设计，行为正确；仅建议后续重构。影响：无功能缺陷。

观察（移交 S03 轮）:
- src/styles/global.css 全库无引用（BaseHead.astro 仅 import '../styles/app.css'；全仓 grep "global.css" 0 命中），疑似死代码 / 旧令牌体系残留（--accent/--color-text-* 旧令牌 vs --ds-* 新令牌）。

### S03 死代码（第 4 轮）

本轮维度: S03 死代码
看哪些文件: src/styles/global.css、src/styles/app.css、src/components/SkillBar.astro、tailwind.config.js、BaseHead.astro、全部 import 关系
搜什么: 十六进制色值、rgba(、重复声明块、无引用文件/组件（排除 tokens/theme 定义）

已检查范围:
- 裸色值/rgba 全量 grep：43 处。剔除后：
  · global.css :root 令牌定义区（--accent/--color-text-* 等）与 print 样式（#000/#ddd）→ 属令牌定义与有意打印设计，不报
  · app.css 687/693 的 #000/#ddd 均在 @media print 内 → 有意设计，不报
  · SkillBar.astro:61 rgba(27,54,93,0.15) → 随死组件一并处理（见下）
- 重复声明块：app.css 内无同选择器重复声明；global.css 与 app.css 有同名元素级声明（h1/h2/body/p/a），但 global.css 无引用故无实际冲突

[P2] S03 src/styles/global.css:1-620 — 整个文件无任何引用（死文件），含旧令牌体系（--accent/--color-text-*）与 Atkinson @font-face
  Found:    BaseHead.astro 仅 `import '../styles/app.css';`；全仓 grep "global.css" 0 命中
  Expected: 要么被样式入口引用，要么删除；旧令牌体系（--accent/--color-text-*）与 app.css 的 --ds-* 新令牌并存但从未生效
  Fix:      需人工决策（删除文件或决定是否重新接入；涉及双令牌体系取舍，非小修）
  Basis:    判定表「死代码」行；grep 引用关系 0 命中
  Note:     620 行死 CSS 增加维护噪音；若删除需同步确认无 dist 缓存依赖。删除超 30 行预算，只记录不硬改。

[P2] S03 src/components/SkillBar.astro:1-79 — 组件无任何 import 引用（死组件）
  Found:    全 src 树 grep "SkillBar" 仅命中自身定义文件；无页面/layout import
  Expected: 删除，或在页面中接入
  Fix:      需人工决策（删除文件）
  Basis:    判定表「死代码」行；import 关系核查
  Note:     内含裸色值 rgba(27,54,93,0.15) 与 3 组 getLevel* 函数，均随死组件失效。删除超 30 行预算，只记录不硬改。

[P3] S03 src/components/BaseHead.astro:20-21 — preload Atkinson 字体但全站无 font-family 使用该字体（无效 preload）
  Found:    <link rel="preload" href="/fonts/atkinson-regular.woff" as="font" type="font/woff" crossorigin />
  	<link rel="preload" href="/fonts/atkinson-bold.woff" as="font" type="font/woff" crossorigin />
  Expected: 移除 preload 或接入 Atkinson 字体族（当前 tailwind.config.js fontFamily 用 Iowan Old Style/Noto Serif SC）
  Fix:      需人工决策（字体体系取舍）
  Basis:    判定表「死代码」行；grep "Atkinson" 仅 global.css @font-face 与 BaseHead preload 命中，无实际 font-family 引用
  Note:     浏览器会为未使用字体发起 preload 请求，浪费带宽/拖慢 LCP；2 行改动但属字体体系决策，标「需人工决策」

结论: S03 发现 3 条（2 P2 死文件/死组件 + 1 P3 无效 preload），均超小修预算或属设计决策，只记录不修改。本轮零编辑。

### T01 标题层级（第 5 轮）

本轮维度: T01 标题层级
看哪些文件: index.astro、about.astro、works.astro、blog/index.astro、BlogPost.astro（layout）、ProjectCard.astro、Header.astro（均已有全文上下文；本轮 grep 全量标题）
搜什么: <h1>…<h6>、role="heading"

已检查范围（逐页核对）:
- index.astro: h1×1（首页名，唯一）→ h2×6（专业技能/教育经历/工作经历/荣誉与成就/创作实践/项目作品）→ h3×N（各项条目）——无跳级
- about.astro: h1×1（关于我，唯一）→ h2×7（我是谁/数据主权理念/创作即认知/工具哲学/创作者工作流/关于本站/联系方式）——无跳级
- works.astro: h1×1（作品展示，唯一）→ h2×3（CG艺术作品集/冥想系列/更多作品）→ h3×4 ——无跳级
- blog/index.astro: h1×1（博客文章，唯一）→ h2×1（文章标题）——无跳级
- BlogPost.astro: h1×1（文章标题，唯一）——无跳级
- role="heading"：0 命中
- 无 h4–h6 使用，未发现跳级或 h1 重复

补充发现（S03 延续）:
- [P2] src/components/ProjectCard.astro:1-37 — 无任何 import 引用（死组件）；grep "ProjectCard" 全 src 0 命中；index.astro 内联手写了项目卡片（214–239 行），未用该组件。属死代码，需人工决策（删除），追加到 S03 记录。

结论: T01 合格（每页 h1 唯一、层级连续不跳级）。本轮零编辑，无退出码需记录。

### T04 对比度（第 6 轮）

本轮维度: T04 对比度
看哪些文件: src/styles/app.css（亮色 :root + 暗色 [data-theme=dark] 令牌、a/btn/tag/social-link 定义）
搜什么: 文字色与背景色令牌组合；用 node 内联脚本做 OKLch→sRGB→相对亮度→WCAG 比值

已检查范围（node 实算，OKLch→sRGB→相对亮度，WCAG 1.4.3）:
- 亮色正文：fg/bg=16.63、fgStrong/bg=18.28、fgSubtle/bg=10.40、muted/bg=6.01、accent/bg=4.96 → 均达标
- 暗色正文：fg/bg=12.04、fgStrong/bg=15.52、fgSubtle/bg=7.36、muted/bg=4.98 → 均达标
- 按钮白字/accent：亮 5.41 达标、暗 4.40 不达标
- tag(accent/accent-muted)：亮 4.04 不达标、暗 3.93 不达标
- 导航 hover(accent/accent-soft)：亮 3.12、暗 3.41（≥3，大文本/UI OK）
- 大文本阈值 3:1、正文阈值 4.5:1（WCAG 1.4.3；大文本=≥18.66px 普通 或 ≥14px bold700）

[P2] T04 src/styles/app.css:337-338 — 暗色 a 链接用 accent，对比度 4.47 < AA 正文 4.5
  Found:    a {
  		color: var(--ds-accent);
  		text-decoration: none;
  }
  Expected: 链接正文对比度 ≥4.5:1（暗色 accent=olive-400 oklch(57% .065 115) on bg oklch(15% .008 75) = 4.47）
  Fix:      需人工决策（调暗色 accent 至 olive-500 oklch(64% .065 115) 或提亮，属配色体系）
  Basis:    WCAG 1.4.3（正文 ≥4.5:1）；node 实算 4.47；判定表「WCAG AA 违规不低于 P2」
  Note:     影响所有未加类的 a 链接（含 BlogPost prose 内链接）；差距仅 0.03。配色体系不动手。

[P2] T04 src/styles/app.css:506-508 — 暗色 btn-primary 白字 on accent，对比度 4.40 < 4.5
  Found:    .btn-primary {
  		background: var(--ds-accent);
  		color: var(--ds-color-white);
  Expected: 按钮文字（14px+semibold600，非大文本）≥4.5:1（暗色 4.40）
  Fix:      需人工决策（提亮暗色 accent 或按钮改用 fg-strong 文字+accent 边框）
  Basis:    WCAG 1.4.3；node 实算 4.40；app.css:497-498 字号 body-sm(14px)+semibold(600)
  Note:     亮色 5.41 达标；仅暗色违规，差 0.1。index.astro 联系按钮受影响。

[P2] T04 src/styles/app.css:531-534 — tag 的 accent 文字 on accent-muted 背景，亮 4.04 / 暗 3.93 均 < 4.5
  Found:    .tag {
  		background: var(--ds-accent-muted);
  		color: var(--ds-accent);
  Expected: tag 文字（12px caption+semibold，正文级）≥4.5:1
  Fix:      需人工决策（tag 文字改用 fg/fg-strong，或加深 accent-muted 背景）
  Basis:    WCAG 1.4.3；node 实算 亮 4.04 / 暗 3.93；app.css:537-538 字号 caption(12px)
  Note:     tag 为装饰性标签（技能/项目标签），非关键信息；但 AA 违规 ≥P2。两主题均违规。

[P2] T04 src/styles/app.css（暗色 accent on surface）— 暗色 accent 文字 on 卡片 surface = 4.20 < 4.5
  Found:    accent(oklch 57% .065 115) on surface(oklch 19% .008 75) = 4.20
  Expected: 卡片内 accent 文字/链接 ≥4.5:1
  Fix:      需人工决策（同上，调暗色 accent 色）
  Basis:    WCAG 1.4.3；node 实算 4.20
  Note:     影响卡片内的 accent 装饰文字（works 年份、section 装饰等）。

结论: T04 正文主组合（fg/fg-subtle/muted on bg）两主题均达标；4 条 AA 违规均集中在暗色 accent 系（链接/按钮/tag/卡片），差距 0.03–0.57，属配色体系，标「需人工决策」不硬改。本轮零编辑。

### X04 键盘焦点（第 8 轮）

本轮维度: X04 键盘焦点
看哪些文件: src/styles/app.css（:focus-visible 定义）、src/components/Header.astro（抽屉焦点管理 96–151）、全 astro 树
搜什么: outline: none、:focus、:focus-visible、tabIndex、role="dialog"、aria-modal、focus()/blur()

已检查范围:
- 全局焦点可见：app.css:351 `:focus-visible { outline: 2px solid var(--ds-accent); outline-offset: 2px; }` → 所有原生可聚焦元素（a/button/social-link/btn/tag/mnav-trigger）均有 2px accent 焦点轮廓
- Tailwind 类覆盖检查：astro 文件 grep `outline-none|focus:outline` → 0 命中，无类覆盖焦点
- tabIndex：0 命中，无 tabindex 属性，自然 tab 顺序
- 移动抽屉焦点管理（Header.astro:98–151）逐项核对：
  · 108 setAttribute('role','dialog')、109 aria-modal='true'（仅打开时）
  · 114–115 打开后 60ms 聚焦首个 .ds-navbar-link（焦点移入）
  · 132 lastFocused?.focus?.()（关闭后归还焦点）
  · 141 Escape 关闭（e.preventDefault()）
  · 142–150 Tab 陷阱（Shift+Tab/Tab 在 nav 范围内循环，display:none 元素不可聚焦故桌面社交图标不参与）
  · trigger aria-expanded/aria-controls（62–64）齐全
- global.css:347-348 `input:focus...{outline:none; box-shadow:0 0 0 3px accent-subtle}` 在死文件内（S03 已确认无引用），不生效；即便生效亦以 box-shadow ring 替代，非裸 outline:none

结论: X04 合格。全局 :focus-visible 轮廓完备、无 outline:none 滥用、移动抽屉具备完整 role=dialog/aria-modal/焦点移入/归还/Tab 陷阱/ESC。本轮零编辑，无退出码需记录。

### F05 错误容错（第 9 轮）

本轮维度: F05 错误容错
看哪些文件: 全 src 树 grep（fetch/await/catch/throw/client:/ErrorBoundary）；rss.xml.js、blog/[...slug].astro、blog/index.astro、Header.astro（前轮已读）
搜什么: fetch(、await、.catch(、try{/catch、throw、ErrorBoundary、client: 指令

已检查范围:
- 客户端 fetch：grep `fetch(` → 0 命中。静态 Astro 站无运行时网络请求，无失败场景需提示
- await：4 处均在 frontmatter 服务端构建期（rss.xml.js:6、blog/[slug].astro:7/16、blog/index.astro:9）；getCollection 空集合返回 [] 不抛错；render 失败由 build `|| exit 0` 容错（AGENTS.md 声明）
- try/catch：仅 src/scripts/sync-word-count.{ts,mjs}（构建工具，非页面产物）
- client: 指令 / ErrorBoundary：均 0 命中。无客户端水合组件，静态 HTML 无组件树崩溃风险，无需 error boundary
- 空态兜底：blog/index.astro:30-33 `posts.length === 0` → "暂无博客文章"（src/content/blog 缺失时空态生效，见 F01 观察）
- 运行时防御：Header.astro:91 `if (!trigger || !panel) return` 提前退出；:83/115 `?.` 可选链防 null
- 无表单（mailto 链接替代），无提交失败风险

结论: F05 合格。静态站点无运行时异步操作需容错；服务端 await 在构建期并由 || exit 0 兜底；空态有文案。本轮零编辑，无退出码需记录。

### F07 核心指标（第 10 轮）

本轮维度: F07 核心指标
看哪些文件: package.json（scripts）、lighthouserc* glob、.github/workflows、实跑 `pnpm build`
搜什么: Lighthouse/LHCI 配置；构建退出码与输出

已检查范围:
- Lighthouse/LHCI 配置：glob `**/lighthouserc*` → 0 命中；.github/workflows 仅 argus-review.yml（非 LHCI）。无运行时指标采集工具
- 实跑 `pnpm build`（即 `astro build || exit 0`）：
  · 退出码 = 0（因 `|| exit 0` 容错，不代表成功）
  · 实际输出：`[GenerateContentTypesError] astro sync command failed to generate content collection types: spawn EPERM`
  · 根因：astro sync 调用 ChildProcess.spawn 被沙箱拒绝（EPERM），属环境限制非代码缺陷
  · 附加 vite 警告：Failed to resolve dependency astro>cssesc/aria-query/axobject-query（optimizeDeps，非致命）

[UNKNOWN] F07 构建状态 — 沙箱内 astro sync spawn EPERM，无法判定真实构建是否成功
  Found:    `[GenerateContentTypesError] ... spawn EPERM`（退出码 0 系 || exit 0 兜底）
  Expected: 构建可独立完成产出 dist
  Fix:      需人工决策（在无沙箱限制的 CI/本地复跑 `pnpm build` 验证）
  Basis:    F07「没工具就标 UNKNOWN」；沙箱 ChildProcess.spawn EPERM 非代码问题
  Note:     缺：无沙箱限制的构建环境。退出码 0 不可信（|| exit 0）。需在 CI 复验。

[UNKNOWN] F07 LCP/INP/CLS — 无 Lighthouse/LHCI 配置，运行时指标无法测量
  Found:    无 lighthouserc、无 LHCI workflow、package.json 无 lighthouse 脚本
  Expected: LCP≤2.5s / INP≤200ms / CLS≤0.1（六簇要点）
  Fix:      需人工决策（接入 Lighthouse CI 或在 CI 跑 PageSpeed Insights；属构建/部署配置，不动手）
  Basis:    F07「没工具就标 UNKNOWN」
  Note:     缺：Lighthouse 运行环境与部署 URL。建议强模型在部署后用 PSI/LHCI 采 LCP/INP/CLS。

结论: F07 全 UNKNOWN（构建沙箱受限 + 无 Lighthouse 工具）。符合 F07「没工具就标 UNKNOWN」。本轮零编辑，构建退出码 0（不可信）。

### V01 XSS（第 11 轮）

本轮维度: V01 XSS
看哪些文件: 全 src 树 grep（innerHTML/dangerouslySetInnerHTML/v-html/insertAdjacentHTML/set:html/document.write/eval）；Icon.astro（F02 轮已读全文）
搜什么: innerHTML、dangerouslySetInnerHTML、v-html、insertAdjacentHTML、set:html（Astro 等价）、document.write、eval(

已检查范围:
- innerHTML / dangerouslySetInnerHTML / v-html / insertAdjacentHTML / document.write / eval( → 均 0 命中
- 唯一命中：src/components/Icon.astro:106 `set:html={pathData}`
  · pathData 来源：`const icon = icons[name]; pathData = fill && icon.filled ? icon.filled : icon.outline`
  · `icons` 为组件内硬编码 `Record<string,{outline,filled?}>`（line 11–91，静态 SVG path d 字符串）
  · `name`（Props）仅作查表键，不拼入 pathData；表内无该 name 则 icon=undefined（构建期 TS 已约束调用方均用表内名）
  · set:html 注入受信静态 SVG path，无用户输入/外部数据路径 → 无 XSS 面
- BlogPost.astro 渲染 `<Content />`（markdown）：Astro 默认 remark/rehype 输出转义 HTML；当前 src/content/blog 缺失无 markdown 实际渲染
- Header.astro DOM 操作均为 classList.toggle/setAttribute（属性级），不注入 HTML

结论: V01 合格。唯一 set:html 用于硬编码内部 SVG 数据，不存在可执行注入路径。本轮零编辑，无退出码需记录。

### V04 密钥泄露（第 12 轮）

本轮维度: V04 密钥泄露
看哪些文件: 全 src 树 grep（api_key/secret/token/bearer/password/AKID/ACCESS_KEY/PRIVATE_KEY）、wrangler.json、.gitignore（F01 轮已读）、dist 产物 grep、git ls-files
搜什么: api_key/secret/token/bearer/password；dist 产物；.env 跟踪状态

已检查范围:
- src grep：仅 2 命中，均为 app.css 注释（"Semantic text colors using DS tokens" :642 / "layering tokens (v1.1)" :715），匹配 "token" 单词为设计令牌，非密钥
- .env 文件：工作区根无 .env（glob 0 命中）；.gitignore 已忽略 .env/.env.local/.env.*；`git ls-files | Select-String '.env'` → 无输出（无 .env 被 git 跟踪）
- wrangler.json（14 行）：仅 name/compatibility_date/compatibility_flags/main/assets{directory,binding:ASSETS}/observability/upload_source_maps；**无 secrets/vars 字段，无密钥绑定**
- dist 产物（67 文件，上次构建残留）：grep bearer/api_key/apikey/AKID/ACCESS_KEY/PRIVATE_KEY/BEGIN PRIVATE/aws_secret → **0 命中**
- consts.ts 链接均为公开 URL（cgartlab.com/github/bilibili），无 API key

结论: V04 合格。无 .env 提交、wrangler.json 无 secret 绑定、dist 产物无密钥泄露、src 无硬编码密钥。本轮零编辑，无退出码需记录。

### E01 交互态（第 13 轮）

本轮维度: E01 交互态
看哪些文件: 全 src 树 grep（:hover/:focus-visible/:active/:disabled/aria-busy/loading/empty）；app.css 组件定义（card/btn/tag/social-link/navbar）；HeaderLink.astro
搜什么: :hover、:focus-visible、:active、:disabled、aria-busy、loading=、empty、cursor:、aria-pressed/aria-current

已检查范围（七态逐项）:
- hover ✓ 充分：a/card/stat-card/logo-mark/btn-primary/btn-secondary/tag/social-link/timeline-item/navbar-brand/navbar-link/mnav-trigger/scrollbar-thumb/skill-bar 均有 :hover；Tailwind group-hover:scale 也用
- focus ✓：全局 :focus-visible（app.css:351，2px accent 轮廓覆盖所有可聚焦元素）+ mnav-trigger:focus-visible(802)；X04 轮已核
- active ✓：ds-navbar-link:active(885)；button 原生 :active + transition-all 反馈
- disabled — grep :disabled/aria-disabled 0 命中；本站无表单/无提交按钮（mailto 替代），无 disabled 场景 → 合理缺失，非缺陷
- loading — img loading="lazy"（BlogPost:31/blog-index:48）；aria-busy 0 命中；静态站无异步加载 → 无 loading 态需求，合理
- empty ✓：blog/index.astro:30-33 `posts.length === 0` → "暂无博客文章" 空态
- error — 无表单错误/无运行时错误场景（静态站）→ 合理缺失

目标尺寸 ≥24×24px：
- social-link w-9 h-9(36px)/Footer w-8 h-8(32px)、mnav-trigger 44×44、btn-primary ≈34px、tag ≈28px、navbar-link(HeaderLink) ≈32px → 均 ≥24px ✓

alt + 宽高预留：
- index/about favicon alt="CG艺术实验室(/Logo)"；works 封面 alt="冥想系列封面"、artwork alt={title} ✓
- blog/index+BlogPost img 有 width+height+alt=""(装饰性封面，标题独立)+loading="lazy" ✓
- HeaderLink aria-current="page"(激活标记，额外无障碍加分) ✓

同类样式一致：card/stat-card/btn/tag/social-link 统一 ✓

结论: E01 合格。适用场景七态齐备（hover/focus/active/empty 有；disabled/loading/error 因静态站无相关场景合理缺失）；目标尺寸、alt/宽高预留、aria-current 合规。本轮零编辑，无退出码需记录。

---

## 十二项汇总

LITE_CORE 十二项全部完成：
- 已修复：F01（4 处断链，consts.ts/works.astro）
- 合格无发现：F02、X04、F05、V01、V04、E01
- 合格+观察：S02（P3 抽屉 !important）、T01（合格，发现 ProjectCard 死组件）
- 需人工决策（P2/P3，已说明不硬改）：S03（global.css/SkillBar/ProjectCard 死代码 + Atkinson preload）、T04（暗色 accent 系列 4 条 AA 违规，配色体系）
- UNKNOWN：F07（构建沙箱 spawn EPERM + 无 LHCI 配置）

P0/P1：无。所有 P2/P3 已在报告中说明并标「需人工决策」或已修复。

## 移交强模型

- F01 已收尾。建议强模型处理: ① 确认 src/content/blog 是否应填充（当前博客页恒为空态，涉及内容来源与 CI 同步策略）；② x.com/cgartlab 在可访问外网环境复验；③ 全站外链建议接入定期断链巡检（如 lychee/LHCI 的 URL 检查），本报告以手工 + web_fetch 抽样完成。
