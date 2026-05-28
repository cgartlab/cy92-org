# cy92.org 网站开发指南 (Complete Development Guide)

> 本文档是 cy92.org 网站的全面深度开发指南，涵盖架构、样式系统、代码逻辑、视觉映射关系等所有技术细节。
> 面向对象：任何开发者、设计师、AI 大模型，均可依据本文档理解并修改本站。

---

## 目录

1. [项目概览](#1-项目概览)
2. [技术栈与工具链](#2-技术栈与工具链)
3. [项目目录结构](#3-项目目录结构)
4. [构建与部署流程](#4-构建与部署流程)
5. [路由系统与页面架构](#5-路由系统与页面架构)
6. [组件系统详解](#6-组件系统详解)
7. [设计系统与样式架构](#7-设计系统与样式架构)
8. [颜色系统深度解析](#8-颜色系统深度解析)
9. [排版系统与字体](#9-排版系统与字体)
10. [布局系统与视觉定位](#10-布局系统与视觉定位)
11. [暗色模式实现机制](#11-暗色模式实现机制)
12. [动画与交互系统](#12-动画与交互系统)
13. [内容管理系统](#13-内容管理系统)
14. [数据驱动架构](#14-数据驱动架构)
15. [样式代码与视觉效果映射关系](#15-样式代码与视觉效果映射关系)
16. [常见修改场景指南](#16-常见修改场景指南)
17. [⚠️ 关键注意事项与陷阱](#17-️-关键注意事项与陷阱)
18. [跨项目依赖关系](#18-跨项目依赖关系)

---


## 1. 项目概览

**网站名称**: CG艺术实验室 (ChenYang | Designer & Creator)
**域名**: https://cy92.org
**性质**: 个人品牌网站/在线简历/作品集
**语言**: 中文 (zh-CN)
**作者**: ChenYang — 跨领域数字创作者

### 网站功能模块

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | `/` | 个人简历：Hero区、统计数据、技能、教育、工作、荣誉、创作实践、项目 |
| 作品展示 | `/works` | CG艺术作品集视频(Bilibili嵌入)、冥想系列数字绘画画廊 |
| 关于 | `/about` | 个人哲学、创作理念、工具哲学、工作流介绍 |
| 博客列表 | `/blog` | 文章列表，网格卡片展示 |
| 博客文章 | `/blog/[slug]` | 单篇文章详情，Markdown/MDX渲染 |
| RSS订阅 | `/rss.xml` | RSS Feed输出 |

---

## 2. 技术栈与工具链

### 核心框架
- **Astro 5.16.2** — 静态站点生成器 (SSG)，Islands Architecture
- **Tailwind CSS 3.4.17** — 原子化CSS框架
- **TypeScript 5.9.3** — 类型安全

### 集成插件
- **@astrojs/mdx** — MDX支持（Markdown中嵌入组件）
- **@astrojs/sitemap** — 自动生成sitemap.xml
- **@astrojs/tailwind** — Tailwind集成（`applyBaseStyles: false`，手动控制样式引入）
- **@astrojs/rss** — RSS Feed生成
- **@astrojs/cloudflare** — Cloudflare Workers适配器
- **@tailwindcss/typography** — `prose`类排版插件

### 部署平台
- **Cloudflare Workers** — 边缘计算部署
- **Wrangler 4.61.0** — Cloudflare CLI工具

### 包管理
- **pnpm 10.11.1** — 包管理器（`packageManager`字段锁定版本）

### 运行要求
- **Node.js ≥ 22**

---

## 3. 项目目录结构

```
cy92-org/
├── .astro/                    # Astro编译产物（自动生成，勿手动修改）
│   ├── collections/           # 内容集合schema
│   ├── data-store.json        # 内容数据缓存
│   └── types.d.ts             # 自动生成的类型定义
├── public/                    # 静态资源（直接复制到输出目录）
│   ├── fonts/                 # 字体文件 (Atkinson Regular/Bold .woff)
│   ├── images/                # 冥想系列图片
│   ├── favicon.svg            # 网站图标
│   ├── default-cover.webp     # 默认文章封面图
│   └── *.webp                 # 各文章封面图
├── src/
│   ├── components/            # 可复用Astro组件
│   │   ├── BaseHead.astro     # HTML <head> 元信息
│   │   ├── Header.astro       # 网站顶部导航栏
│   │   ├── Footer.astro       # 网站底部
│   │   ├── HeaderLink.astro   # 导航链接（含active状态）
│   │   ├── Icon.astro         # SVG图标系统
│   │   ├── FormattedDate.astro# 日期格式化
│   │   ├── ProjectCard.astro  # 项目卡片
│   │   └── SkillBar.astro     # 技能进度条
│   ├── content/
│   │   └── blog/              # 博客文章 (.md/.mdx)
│   ├── layouts/
│   │   └── BlogPost.astro     # 博客文章布局模板
│   ├── pages/                 # 页面路由（文件即路由）
│   │   ├── index.astro        # 首页
│   │   ├── about.astro        # 关于页
│   │   ├── works.astro        # 作品页
│   │   ├── blog/
│   │   │   ├── index.astro    # 博客列表
│   │   │   └── [...slug].astro# 博客动态路由
│   │   └── rss.xml.js         # RSS端点
│   ├── scripts/               # 工具脚本
│   │   ├── sync-word-count.mjs
│   │   └── sync-word-count.ts
│   ├── styles/
│   │   ├── app.css            # ★ 主样式文件（设计系统核心）
│   │   └── global.css         # 遗留样式文件（逐步弃用中）
│   ├── consts.ts              # ★ 全站数据常量
│   ├── content.config.ts      # 内容集合配置
│   └── env.d.ts               # 环境类型声明
├── astro.config.mjs           # Astro配置
├── tailwind.config.js         # Tailwind配置
├── tsconfig.json              # TypeScript配置
├── wrangler.json              # Cloudflare Workers配置
├── package.json               # 项目依赖与脚本
└── AGENTS.md                  # AI协作指南
```

---

## 4. 构建与部署流程

### 命令一览

```bash
pnpm install              # 安装依赖
pnpm run dev              # 本地开发服务器 (localhost:4321)
pnpm run build            # 生产构建 (输出到 ./dist/)
pnpm run deploy           # 部署到 Cloudflare Workers
pnpm run preview          # 本地预览生产构建
pnpm run check            # 完整检查 (build + tsc + wrangler dry-run)
pnpm run cf-typegen       # 生成 Cloudflare 类型定义
```

### 构建流程细节

1. `astro build` 编译所有 .astro/.md/.mdx 文件为静态HTML
2. Tailwind CSS 在构建时扫描 `src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}` 生成CSS
3. 输出到 `./dist/` 目录
4. `wrangler deploy` 将 `./dist/_worker.js/index.js` 和静态资源上传到 Cloudflare

### ⚠️ 构建容错机制

`package.json` 中的 `build` 脚本使用 `astro build || exit 0`，这意味着**即使构建失败也不会报错退出**。这是有意设计，**不要移除 `|| exit 0`**。

---


## 5. 路由系统与页面架构

### Astro 文件路由规则

Astro 使用**文件系统路由**，`src/pages/` 下的每个 `.astro` 文件自动对应一个URL路径：

| 文件路径 | 生成URL | 路由类型 |
|----------|---------|---------|
| `src/pages/index.astro` | `/` | 静态 |
| `src/pages/about.astro` | `/about` | 静态 |
| `src/pages/works.astro` | `/works` | 静态 |
| `src/pages/blog/index.astro` | `/blog` | 静态 |
| `src/pages/blog/[...slug].astro` | `/blog/任意路径/` | 动态 |
| `src/pages/rss.xml.js` | `/rss.xml` | API端点 |

### 页面共通结构

每个页面都遵循相同的HTML骨架：

```astro
<!doctype html>
<html lang="zh-CN">
  <head>
    <BaseHead title={...} description={...} />
  </head>
  <body class="min-h-screen bg-canvas">
    <Header />
    <main class="container-custom py-8 md:py-12">
      <!-- 页面内容 -->
    </main>
    <Footer />
  </body>
</html>
```

**视觉效果**：
- `min-h-screen` → body至少占满整个视口高度
- `bg-canvas` → 背景色为温暖的羊皮纸色 (#F5F4ED，暗色模式为 #1C1917)
- `container-custom` → 内容区最大宽度 896px (max-w-4xl)，水平居中，左右内边距 24px/32px/48px(响应式)
- `py-8 md:py-12` → 上下内边距 32px，中等屏幕以上为 48px

### 动态路由机制 (blog/[...slug].astro)

```typescript
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: post,
  }));
}
```

`[...slug]` 是 Astro 的 rest 参数路由，匹配所有子路径。在构建时通过 `getStaticPaths()` 生成所有博客文章的静态页面。

---

## 6. 组件系统详解

### 6.1 BaseHead.astro — HTML头部

**文件**: `src/components/BaseHead.astro`
**职责**: 设置所有HTML `<head>` 内容

**Props接口**:
```typescript
interface Props {
  title: string;       // 页面标题
  description: string; // 页面描述
  image?: string;      // OG图片 (默认: /default-cover.webp)
}
```

**功能清单**:
1. 引入主样式 `../styles/app.css` — 这是整个设计系统的入口
2. 基础meta标签 (charset, viewport, generator)
3. 字体预加载 (Atkinson Regular/Bold)
4. SEO canonical URL
5. Open Graph 标签 (og:type, og:url, og:title, og:description, og:image)
6. Twitter Card 标签
7. **暗色模式初始化脚本** (防闪烁)

**暗色模式脚本逻辑**:
```javascript
// 在页面渲染前执行，防止白屏闪烁
const getThemePreference = () => {
  // 优先级: localStorage > 系统偏好
  if (localStorage.getItem('theme')) return localStorage.getItem('theme');
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
document.documentElement.classList.toggle('dark', isDark);
```

### 6.2 Header.astro — 网站顶部导航

**文件**: `src/components/Header.astro`
**视觉行为**: 粘性定位在视口顶部，半透明毛玻璃背景

**关键CSS类解析**:
```
sticky top-0 z-50    → 粘性定位，始终在顶部，最高层级
border-b             → 底部1px边框
bg-canvas/90         → 背景色90%透明度
backdrop-blur-md     → 模糊背景（毛玻璃效果）
```

**结构**:
- 左侧: 网站标题（链接回首页）
- 中间: 导航链接（首页、作品、博客[外链]、关于）—— 仅桌面端显示
- 右侧: 社交图标 + 主题切换按钮 —— 仅桌面端显示
- 移动端: 汉堡菜单按钮

**⚠️ 注意**: 博客链接指向外部 `https://cgartlab.com`，不是内部 `/blog`

**移动端菜单交互逻辑**:
1. 点击汉堡按钮 → 展开菜单面板（max-height动画 + opacity + translateY）
2. 展开时锁定body滚动（`overflow: hidden; position: fixed`）
3. 关闭时恢复滚动位置（记忆了scrollPosition）
4. 支持Escape键关闭
5. 点击菜单内链接自动关闭

**滚动阴影效果**:
```javascript
// 页面滚动超过10px时，Header显示底部阴影
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) header.classList.add('shadow-sm');
  else header.classList.remove('shadow-sm');
});
```

### 6.3 Footer.astro — 网站底部

**文件**: `src/components/Footer.astro`
**视觉**: 顶部边框分隔，两栏布局（桌面端）

结构:
- 左侧: 版权信息 + 引用语（斜体）
- 右侧: 社交链接图标组

### 6.4 HeaderLink.astro — 导航链接

**文件**: `src/components/HeaderLink.astro`
**核心逻辑**: 自动检测当前页面路径，高亮active状态

```typescript
const { pathname } = Astro.url;
const subpath = pathname.match(/[^\/]+/g);
const isActive = href === pathname || href === '/' + subpath?.[0];
```

**视觉区别**:
- Active: `text-ink font-medium` → 深蓝色，中等粗细
- Inactive: `text-muted-foreground/80 hover:text-ink hover:bg-secondary/50` → 灰色，hover时变蓝+浅背景

### 6.5 Icon.astro — SVG图标系统

**文件**: `src/components/Icon.astro`
**实现方式**: 内联SVG，所有图标path数据硬编码在组件中

**Props**:
```typescript
interface Props {
  name: string;    // 图标名称
  size?: number;   // 尺寸 (默认24)
  class?: string;  // 额外CSS类
  fill?: boolean;  // 是否填充模式 (默认false=描边模式)
}
```

**可用图标**:
`light_mode`, `dark_mode`, `menu`, `close`, `place`, `person`, `star`, `school`, `schedule`, `emoji_events`, `folder`, `mail`, `videocam`, `info`, `open_in_new`, `arrow_right`, `arrow_forward`, `brush`, `layers`, `work`, `rss_feed`, `github`, `twitter`, `bilibili`, `sspai`

**使用方式**:
```astro
<Icon name="github" size={16} class="w-4 h-4" fill />
```

### 6.6 FormattedDate.astro — 日期格式化

**文件**: `src/components/FormattedDate.astro`
**输出格式**: `2024年1月15日` (zh-CN locale, short month)

```astro
<time datetime={date.toISOString()}>
  {date.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'short', day: 'numeric'
  })}
</time>
```

### 6.7 ProjectCard.astro — 项目卡片

**文件**: `src/components/ProjectCard.astro`
**注意**: 当前未被使用（首页index.astro直接内联了卡片代码）

### 6.8 SkillBar.astro — 技能进度条

**文件**: `src/components/SkillBar.astro`
**注意**: 当前未被使用（技能部分改为了tag标签展示形式）
**功能**: 带动画的进度条，根据level值显示不同颜色渐变和文字标签

---


## 7. 设计系统与样式架构

### 样式文件层次关系

```
┌─────────────────────────────────────────────────┐
│  tailwind.config.js                              │
│  ├─ Tailwind主题扩展（颜色映射到CSS变量）       │
│  ├─ 自定义动画/圆角/阴影/字体                   │
│  └─ Typography插件配置                           │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│  src/styles/app.css  ← ★ 核心设计系统            │
│  ├─ @tailwind base (含:root CSS变量)            │
│  ├─ @tailwind components (含自定义组件类)        │
│  └─ @tailwind utilities (含自定义工具类)         │
└─────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│  src/styles/global.css  ← 遗留样式（逐步弃用）   │
│  ├─ 独立的CSS变量系统（与app.css部分重复）       │
│  ├─ 基础元素样式（适用于prose内容区域）          │
│  └─ 打印样式                                     │
└─────────────────────────────────────────────────┘
```

### ⚠️ 关于两套样式的共存问题

**`app.css`** 是当前实际生效的主样式文件，通过 `BaseHead.astro` 中的 `import '../styles/app.css'` 引入。

**`global.css`** 是早期设计系统的遗留文件。它定义了一套独立的CSS变量系统（`--accent`, `--color-text-primary`等），与 `app.css` 中的变量**不是同一套系统**。`global.css` 中的元素级样式（body, h1-h6, a, blockquote等）可能仍在生效并影响渲染，特别是在博客文章的 prose 内容区域中。

**实际影响**:
- `global.css` 的 body 样式设置了 `font-family: var(--font-serif)` 和大号字体（1.125rem），但被 `app.css` 的 body 样式覆盖（0.9375rem + font-sans）
- `global.css` 的标题样式使用 `--font-display` (Inter)，而 `app.css` 使用 `--font-serif` (Source Serif 4)
- 在博客文章内容中，`global.css` 的 blockquote/code/pre 样式可能仍然生效

### Tailwind配置中的样式映射

`tailwind.config.js` 将Tailwind的颜色类名映射到CSS变量：

```javascript
colors: {
  background: 'hsl(var(--background) / <alpha-value>)',  // bg-background
  foreground: 'hsl(var(--foreground) / <alpha-value>)',  // text-foreground
  primary: 'hsl(var(--primary) / <alpha-value>)',        // text-primary, bg-primary
  muted: {
    DEFAULT: 'hsl(var(--muted) / <alpha-value>)',        // bg-muted
    foreground: 'hsl(var(--muted-foreground) / ...)',    // text-muted-foreground
  },
  // ...
}
```

**这意味着**: 当你在代码中看到 `text-foreground`、`bg-background` 等Tailwind类，它们的实际颜色值取决于 `app.css` 中 `:root` 或 `.dark` 下定义的CSS变量值。

---

## 8. 颜色系统深度解析

### 8.1 设计理念: "Kami Canvas" (纸/羊皮纸)

整个配色方案以「温暖的羊皮纸质感」为核心，搭配「墨蓝色」作为强调色，营造文人书斋的视觉氛围。

### 8.2 亮色模式颜色表

| CSS变量 | HSL值 | HEX近似 | 用途 | 视觉效果 |
|---------|-------|---------|------|---------|
| `--canvas` | — | `#F5F4ED` | 页面主背景 | 温暖的米黄/羊皮纸色 |
| `--ivory` | — | `#FAF9F5` | 卡片/区块背景 | 更亮的象牙白 |
| `--warm-sand` | — | `#E8E6DC` | 边框/分隔 | 温暖的沙色 |
| `--ink-blue` | — | `#1B365D` | 主强调色/标题 | 深墨蓝色 |
| `--ink-light` | — | `#2D5A8A` | hover/次要强调 | 中等蓝色 |
| `--near-black` | — | `#141413` | 最深色文字 | 近黑色（微暖） |
| `--dark-warm` | — | `#3D3D3A` | 正文主色 | 暖灰深色 |
| `--olive` | — | `#504E49` | 次要文字/描述 | 橄榄灰 |
| `--stone` | — | `#6B6A64` | 辅助文字/图标 | 石头灰 |

### 8.3 暗色模式颜色表

| CSS变量 | HEX值 | 用途 |
|---------|-------|------|
| `--dark-canvas` | `#1C1917` | 页面背景 |
| `--dark-ivory` | `#252320` | 卡片背景 |
| `--dark-warm-sand` | `#3D3835` | 边框 |
| `--dark-ink` | `#5B8DB8` | 强调色 |
| `--dark-ink-light` | `#7BA3CC` | hover强调 |
| `--dark-near-black` | `#FAF9F5` | 主文字（反转为亮色） |
| `--dark-dark-warm` | `#D6D3D1` | 次要文字 |
| `--dark-olive` | `#A8A29E` | 描述文字 |
| `--dark-stone` | `#78716C` | 辅助文字 |

### 8.4 HSL变量系统（供Tailwind使用）

`:root` 中定义的 HSL 变量（如 `--background: 48 20% 95%`）是**不带括号和hsl()前缀**的纯值，由 Tailwind 的 `hsl(var(--xxx) / <alpha-value>)` 模板包装后使用：

```css
/* 亮色模式 */
--background: 48 20% 95%;      /* 温暖的浅黄背景 */
--foreground: 60 4% 8%;        /* 深色文字 */
--primary: 216 55% 23%;        /* 深蓝主色 */
--card: 48 25% 97%;            /* 卡片白 */
--muted: 45 10% 88%;           /* 静音灰 */
--border: 45 12% 85%;          /* 边框色 */

/* 暗色模式 (.dark) */
--background: 30 8% 10%;       /* 深暖灰 */
--foreground: 40 10% 96%;      /* 亮色文字 */
--primary: 210 35% 55%;        /* 中蓝色 */
```

### 8.5 Tag标签配色

Tag使用了专门的半透明蓝色系背景：
```css
--tag-08: #EEF2F7;  /* 默认背景 - 极浅蓝 */
--tag-14: #E4ECF5;  /* 中等蓝 */
--tag-18: #E4ECF5;  /* hover背景 */
--tag-22: #D0DCE9;  /* 深蓝 */
```

---


## 9. 排版系统与字体

### 9.1 字体栈

| 变量 | 字体列表 | 用途 |
|------|---------|------|
| `--font-serif` | Source Serif 4, Noto Serif SC, Georgia, serif | 标题、引用、重要文字 |
| `--font-sans` | Inter, Noto Sans SC, -apple-system, sans-serif | 正文、UI元素 |
| `--font-mono` | JetBrains Mono, Fira Code, SF Mono, monospace | 代码块 |

**加载方式**: Google Fonts CDN（在 app.css 的 `@layer base` 中 `@import url(...)`) + 本地 Atkinson 字体（通过 `@font-face`，预加载在 BaseHead.astro 中）

### 9.2 基础字体设置

```css
body {
  font-family: var(--font-sans);  /* Inter / Noto Sans SC */
  font-size: 0.9375rem;           /* 15px */
  line-height: 1.55;
  letter-spacing: 0.01em;
}
```

### 9.3 标题层级

| 标签 | 字体 | 大小 | 行高 | 场景 |
|------|------|------|------|------|
| h1 | font-serif | clamp(2.25rem, 5vw, 3.25rem) | 1.08-1.15 | 页面主标题 |
| h2 | font-serif | text-lg/text-xl (1.125rem/1.25rem) | 1.25 | Section标题 |
| h3 | font-serif | text-base (1rem) | 1.3 | 卡片标题 |

**⚠️ 视觉陷阱**: 首页h1使用 `style="font-size: clamp(2.25rem, 5vw, 3.25rem)"` 的内联样式，这意味着它的大小会在 36px 到 52px 之间根据视口宽度流动变化。Tailwind的 `text-3xl`/`text-4xl` 类虽然定义在 base layer 中，但被内联样式覆盖。

### 9.4 文字颜色层级映射

| 语义 | 亮色模式 | 暗色模式 | Tailwind类/CSS |
|------|---------|---------|---------------|
| 最重要（标题、名称） | #1B365D (ink-blue) | #5B8DB8 | `text-ink` |
| 正文主色 | #141413 (near-black) | #FAF9F5 | `text-foreground` |
| 次要文字（描述） | #504E49 (olive) | #A8A29E | `text-olive` |
| 辅助文字（标签单位） | #6B6A64 (stone) | #78716C | `text-stone` |
| 淡化文字 | hsl(45 5% 40%) | hsl(30 5% 55%) | `text-muted-foreground` |

---

## 10. 布局系统与视觉定位

### 10.1 容器系统

**主容器 `container-custom`**:
```css
.container-custom {
  max-width: 56rem;       /* 896px = max-w-4xl */
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;   /* 24px (默认) */
  padding-right: 1.5rem;
}
/* sm (640px+) → px-8 (32px) */
/* lg (1024px+) → px-12 (48px) */
```

**视觉效果**: 内容区域在大屏上是一个居中的窄列（约896px宽），两侧留白。在小屏上内容几乎铺满但有24px边距。

**博客文章容器**:
```css
/* BlogPost.astro 使用不同的容器 */
main { max-width: 48rem; /* 768px = max-w-3xl */ }
```

### 10.2 网格布局

首页使用多种网格：

| Section | 桌面布局 | 移动布局 |
|---------|---------|---------|
| 统计数据 | `grid-cols-4` (4列) | `grid-cols-2` (2列) |
| 技能分类 | `grid-cols-2` (2列) | 单列 |
| 项目卡片 | `grid-cols-2` (2列) | 单列 |
| 博客列表 | `grid-cols-2` (2列) | 单列 |

**作品页画廊**:
```
grid-cols-2 → sm:grid-cols-3 → md:grid-cols-4 → lg:grid-cols-5
```
这意味着冥想系列图片从2列逐步增加到5列。

### 10.3 Section间距节奏

```css
.section {
  padding-top: 2rem;      /* py-8 → 32px */
  padding-bottom: 2rem;
}
/* sm (640px+) → py-10 (40px) */
/* md (768px+) → py-12 (48px) */
```

**每个Section之间的视觉间距 = 上一个section的padding-bottom + 下一个的padding-top = 64px-96px**

### 10.4 Hero区域布局

```
桌面端 (md+):
┌────────────────────────────────────────────┐
│ [名称区域 (flex-1)]          [Logo (128px)] │
│  标签(跨领域数字创作者)                      │
│  大标题(ChenYang)                           │
│  引用块(画画是画画的酬劳...)                  │
│  地点/性格标签                               │
└────────────────────────────────────────────┘

移动端:
┌──────────────────────┐
│ 标签                  │
│ 大标题               │
│ 引用块               │
│ 标签                 │
│    [Logo 112px]      │
└──────────────────────┘
```

flex布局: `flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-10`

### 10.5 卡片内部间距

```css
.card p-5       → padding: 1.25rem (20px)
.card p-5 md:p-6 → 桌面端 padding: 1.5rem (24px)
```

**卡片与卡片之间**: `gap-4` (16px) 或 `gap-5` (20px)

---

## 11. 暗色模式实现机制

### 11.1 技术方案: Class-based Dark Mode

暗色模式使用 Tailwind 的 `darkMode: ['class']` 策略，通过在 `<html>` 元素上切换 `dark` 类来实现。

### 11.2 完整切换流程

```
┌─ 页面加载 ─────────────────────────────────────────────────┐
│                                                              │
│  BaseHead.astro 中的 <script is:inline>                     │
│    1. 检查 localStorage.getItem('theme')                    │
│    2. 若无，检查 prefers-color-scheme 媒体查询              │
│    3. document.documentElement.classList.toggle('dark', ...)  │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ 用户点击切换 ─────────────────────────────────────────────┐
│                                                              │
│  Header.astro 中的 toggleTheme()                            │
│    1. document.documentElement.classList.toggle('dark')       │
│    2. localStorage.setItem('theme', isDark?'dark':'light')   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 11.3 暗色模式样式实现的三种方式

本项目混合使用了三种暗色模式方式：

**方式一: Tailwind dark:前缀** (在HTML模板中)
```html
<Icon name="dark_mode" class="hidden dark:block" />
<Icon name="light_mode" class="block dark:hidden" />
```

**方式二: CSS .dark选择器** (在app.css组件层中)
```css
.dark .card {
  background: #30302E;
  border-color: rgba(255, 255, 255, 0.06);
}
```

**方式三: CSS变量切换** (通过.dark选择器修改变量值)
```css
.dark {
  --background: 30 8% 10%;
  --border-subtle: var(--dark-warm-sand);
}
```

**⚠️ 关键陷阱**: 自定义工具类（如 `text-ink`, `bg-canvas`）通过CSS实现暗色模式：
```css
.text-ink { color: var(--ink-blue); }
.dark .text-ink { color: var(--dark-ink); }
```
这些**不能**使用 `dark:text-ink` 这种Tailwind写法，因为 `text-ink` 本身已经内含了暗色模式逻辑。

---


## 12. 动画与交互系统

### 12.1 入场动画

| 动画名 | 效果 | 持续时间 | 缓动 | 使用场景 |
|--------|------|---------|------|---------|
| `fadeIn` | 从透明到可见 | 0.6s | ease-out-quart | 通用淡入 |
| `slideUp` | 从下方20px淡入 | 0.6s | ease-out-expo | 卡片、区块出现 |
| `scaleIn` | 从95%缩放淡入 | 0.4s | ease-out-quart | 小元素出现 |
| `progressFill` | 宽度从0到目标值 | 1.2s | ease-out-expo | SkillBar进度条 |

### 12.2 缓动函数

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);   /* 快速启动，极慢停止 */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);  /* 自然减速 */
```

### 12.3 交互反馈

**卡片hover**:
```css
.card:hover {
  box-shadow: 0 8px 36px rgba(0, 0, 0, 0.07);
  transform: translateY(-2px);       /* 向上浮起2px */
  border-color: rgba(27, 54, 93, 0.12);  /* 边框微微变蓝 */
}
```

**Timeline圆点hover**:
```css
.timeline-item:hover::before {
  transform: scale(1.25);   /* 放大25% */
  box-shadow: 0 0 0 5px var(--tag-14);  /* 外环变大 */
}
```

**社交链接hover**:
```css
.social-link:hover {
  border-color: var(--ink-blue);   /* 边框变蓝 */
  background: var(--tag-08);       /* 背景变浅蓝 */
}
```

### 12.4 Stagger动画（错开延迟）

统计卡片使用动画延迟创造依次出现效果：
```astro
{STATS.map((stat, index) => (
  <div class="stat-card animate-slide-up" style={`animation-delay: ${index * 100}ms`}>
```
第1个卡片: 0ms延迟，第2个: 100ms，第3个: 200ms，第4个: 300ms

### 12.5 过渡时长系统

```css
--duration-fast: 150ms;     /* 微交互（按钮颜色变化） */
--duration-normal: 250ms;   /* 标准交互 */
--duration-slow: 400ms;     /* 大面积变化（卡片） */
```

### 12.6 无障碍: 减少动画偏好

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 13. 内容管理系统

### 13.1 Content Collections (Astro 5)

博客文章存放在 `src/content/blog/` 目录中，支持 `.md` 和 `.mdx` 格式。

**Schema定义** (`src/content.config.ts`):
```typescript
const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),           // 必填：文章标题
    description: z.string(),     // 必填：文章描述
    pubDate: z.coerce.date(),    // 必填：发布日期
    updatedDate: z.coerce.date().optional(),  // 可选：更新日期
    heroImage: z.string().optional(),         // 可选：封面图URL
  }),
});
```

### 13.2 文章Frontmatter示例

```yaml
---
title: "文章标题"
description: "文章描述，用于SEO和列表页展示"
pubDate: "2024-01-15"
updatedDate: "2024-02-01"
heroImage: "/cover-image.webp"
---
```

### 13.3 文章渲染流程

```
src/content/blog/example.md
    ↓ getCollection('blog')
blog/index.astro (列表展示: 标题+日期+封面)
    ↓ 用户点击
blog/[...slug].astro
    ↓ render(post) → <Content />
BlogPost.astro (布局: 封面图 + 标题 + 日期 + prose内容)
```

### 13.4 文章列表视觉规则

- 第一篇文章: 跨2列（`md:col-span-2`），封面比例21:9，标题更大
- 后续文章: 单格，封面比例16:9，标题正常大小

---

## 14. 数据驱动架构

### 14.1 核心数据文件: `src/consts.ts`

所有页面的结构化数据都来自 `consts.ts`，修改数据即可更新网站内容，无需修改页面组件。

### 14.2 数据结构总览

```typescript
// 站点基础信息
SITE_TITLE: string        // "ChenYang | Designer & Creator"
SITE_DESCRIPTION: string  // SEO描述文字

// 个人信息
PERSONAL_INFO: {
  name, nameEn, title, siteName, email,
  location, personality, hobbies[], bio, description
}

// 社交链接
SOCIAL_LINKS: Array<{ name, url, icon }>

// 技能（按分类，每类含多个tag）
SKILLS: Array<{ category, items[] }>

// 工作经历（含时间线）
WORK_EXPERIENCE: Array<{ period, title, department?, position?, description }>

// 教育经历
EDUCATION: Array<{ period, school, major, degree }>

// 创作实践
EXPERIENCE: Array<{ period, title, description }>

// 项目作品
PROJECTS: Array<{ title, description, link, tags[] }>

// 统计数据
STATS: Array<{ label, value, unit }>

// 荣誉
HONORS: Array<{ year, title, description }>
```

### 14.3 数据修改示例

**更新统计数字**:
```typescript
// src/consts.ts
export const STATS = [
  { label: "累计字数", value: "170,903", unit: "字" },  // ← 修改这里
  // ...
];
```

**添加新项目**:
```typescript
export const PROJECTS = [
  // 新项目添加在数组开头（会显示在前面）
  {
    title: "新项目名称",
    description: "项目描述",
    link: "https://example.com",
    tags: ["标签1", "标签2"]
  },
  // ...existing projects
];
```

---


## 15. 样式代码与视觉效果映射关系

> ⚠️ **核心警告**: 代码层面的样式修改并不总是直观地等于视觉层面的效果。以下详细说明各种情况。

### 15.1 CSS变量的间接性

**问题**: 修改一个CSS变量可能影响数十个元素。

```css
/* 修改 --ink-blue 会同时影响: */
/* ✓ 所有 text-ink 类的文字颜色 */
/* ✓ section-title 的颜色 */
/* ✓ timeline圆点颜色 */
/* ✓ btn-primary 背景色 */
/* ✓ quote-block 左边框 */
/* ✓ social-link hover边框 */
/* ✓ tag文字颜色 */
/* ✓ stat-value数字颜色 */
/* ✓ focus-visible轮廓色 */
/* ✓ ::selection选中背景 */
```

**映射图**:
```
--ink-blue (#1B365D) ─┬─→ .text-ink (标题文字)
                      ├─→ .section-title (区块标题)
                      ├─→ .stat-value (统计数字)
                      ├─→ .btn-primary background (主按钮)
                      ├─→ .tag color (标签文字)
                      ├─→ .timeline-item::before (时间线圆点)
                      ├─→ .quote-block border-left (引用左边框)
                      ├─→ .social-link:hover border (社交链接hover)
                      ├─→ :focus-visible outline (焦点指示器)
                      └─→ ::selection background (文字选中)
```

### 15.2 Tailwind类与CSS变量的双层映射

```
代码中写: text-foreground
    ↓ (Tailwind编译)
color: hsl(var(--foreground) / 1)
    ↓ (CSS变量解析)
color: hsl(60 4% 8% / 1)  ← 亮色模式
color: hsl(40 10% 96% / 1) ← 暗色模式
```

**陷阱**: 如果你在 `tailwind.config.js` 中修改了 `foreground` 的映射模板，或在 `app.css` 中修改了 `--foreground` 的值，效果完全不同：
- 修改config中的映射 → 影响Tailwind如何引用变量
- 修改CSS中的变量值 → 直接改变视觉呈现的颜色

### 15.3 响应式断点的视觉跳变

Tailwind的响应式前缀在特定宽度处产生**突变**，不是渐变：

```
< 640px (sm):  container内边距 24px, 单列布局
≥ 640px (sm):  container内边距 32px
≥ 768px (md):  2列网格, 导航栏展开, 统计4列
≥ 1024px (lg): container内边距 48px, 画廊5列
```

**示例**: `grid md:grid-cols-2`
- 在767px宽的屏幕上: 单列，卡片铺满宽度
- 在768px宽的屏幕上: 突然变为2列

### 15.4 clamp() 函数的流动尺寸

首页标题使用 `clamp(2.25rem, 5vw, 3.25rem)`：
```
视口320px → font-size = max(36px, 16px) = 36px (被min限制)
视口720px → font-size = 36px (5vw=36px)
视口900px → font-size = 45px
视口1040px+ → font-size = 52px (被max限制)
```

### 15.5 box-shadow与transform的视觉层次

```css
/* 静态状态 */
.card {
  box-shadow: 0 4px 24px rgba(0,0,0,0.05);  /* 极淡阴影 */
}

/* hover状态 */
.card:hover {
  box-shadow: 0 8px 36px rgba(0,0,0,0.07);  /* 稍深阴影 */
  transform: translateY(-2px);                /* 上移2px */
}
```

**视觉感知**: 卡片hover时看起来"浮起"了，实际是阴影加深+物理位移2px的组合效果。如果只修改其中一个，效果会不自然。

### 15.6 透明度对视觉的影响

Header背景: `bg-canvas/90`
- 这不是"接近canvas色的浅色"
- 这是canvas色（#F5F4ED）加90%透明度
- 搭配 `backdrop-blur-md`（12px模糊），页面内容会透过Header可见但模糊

### 15.7 border-color使用内联style vs CSS类的区别

项目中频繁使用：
```html
<div style="border-color: var(--border-subtle);">
```

这是因为 Tailwind 的 `border-border` 已经在 `@layer base` 中全局应用于 `*`，但某些元素需要使用 `--border-subtle`（更浅的边框）而不是默认的 `--border`。内联style的优先级比Tailwind的全局规则高。

### 15.8 aspect-ratio与图片裁剪

```html
<div class="aspect-video">     <!-- 16:9 -->
<div class="aspect-[21/9]">    <!-- 21:9 超宽 -->
<div class="aspect-square">    <!-- 1:1 正方形 -->
```

配合 `object-cover`：图片会被**裁剪**以填满容器，不会变形但会丢失部分内容。

### 15.9 gap vs margin/padding 的布局区别

```html
<!-- gap只影响子元素之间的间距 -->
<div class="grid gap-4">
  <div>卡片1</div>  <!-- 卡片间16px间距 -->
  <div>卡片2</div>
</div>

<!-- padding影响容器内壁到内容的间距 -->
<div class="p-5">  <!-- 容器内壁到内容有20px -->
  <p>内容</p>
</div>
```

### 15.10 flex-1 vs flex-shrink-0 的宽度控制

Hero区域：
```html
<div class="flex-1 min-w-0">  <!-- 自动撑满剩余空间，可缩小 -->
  <!-- 文字内容区 -->
</div>
<div class="flex-shrink-0">   <!-- 固定不缩小 -->
  <!-- Logo图片 -->
</div>
```

如果文字过长，文字区域会缩小，但Logo永远保持固定尺寸。

---

## 16. 常见修改场景指南

### 16.1 修改网站主色调

**当前主色**: 墨蓝 `#1B365D`

要修改为其他颜色，需要修改以下位置：

1. `src/styles/app.css` → `:root` 中的 `--ink-blue` 和 `--ink-light`
2. `src/styles/app.css` → `.dark` 中的 `--dark-ink` 和 `--dark-ink-light`
3. `src/styles/app.css` → `--tag-*` 系列变量（需要重新计算基于新颜色的浅色背景）
4. `src/styles/app.css` → `--primary` HSL值
5. `src/styles/app.css` → `.dark` 中的 `--primary` HSL值
6. `src/styles/app.css` → `::selection` 中的rgba颜色

**⚠️ 不要忘记**: 暗色模式也需要对应修改，暗色模式的强调色通常更亮/饱和度更低。

### 16.2 修改页面最大宽度

**当前**: 896px (max-w-4xl)

修改 `src/styles/app.css` 中:
```css
.container-custom {
  @apply max-w-4xl mx-auto px-6 sm:px-8 lg:px-12;
  /* 将 max-w-4xl 改为需要的宽度 */
}
```

可选值: `max-w-3xl`(768px), `max-w-5xl`(1024px), `max-w-6xl`(1152px)

### 16.3 添加新页面

1. 在 `src/pages/` 下创建 `new-page.astro`
2. 使用标准模板结构（参考第5节）
3. 在 `Header.astro` 中添加导航链接:
```astro
<HeaderLink href="/new-page">新页面</HeaderLink>
```

### 16.4 添加新图标

在 `src/components/Icon.astro` 的 `icons` 对象中添加:
```typescript
new_icon: {
  outline: '<path d="..."/>',
  filled: '<path d="..."/>'   // 可选
}
```

图标使用24x24 viewBox的SVG path数据。可从 [Material Symbols](https://fonts.google.com/icons) 获取。

### 16.5 修改博客文章样式

博客文章内容使用 Tailwind Typography 的 `prose` 类渲染。

修改 `tailwind.config.js` 的 `typography` 配置:
```javascript
typography: (theme) => ({
  DEFAULT: {
    css: {
      '--tw-prose-body': theme('colors.stone.700'),    // 正文颜色
      '--tw-prose-links': theme('colors.amber.700'),   // 链接颜色
      // ...
    }
  }
})
```

### 16.6 修改字体

1. 在 `app.css` 的 `@import url(...)` 中修改 Google Fonts 链接
2. 修改 `--font-serif` / `--font-sans` / `--font-mono` 变量值
3. 同步修改 `tailwind.config.js` 中的 `fontFamily` 配置

---


## 17. ⚠️ 关键注意事项与陷阱

### 17.1 样式优先级冲突

本项目中存在**三个层级**的样式优先级:

```
1. 内联 style="..." (最高优先级)
   → 用于 border-color, font-size(clamp), font-family 等
   
2. app.css @layer components 中的自定义类
   → .card, .tag, .btn-primary, .timeline-item 等
   
3. Tailwind 原子类 (编译后)
   → text-sm, p-5, grid, flex 等
```

**常见陷阱**: 你用 Tailwind 类 `text-xl` 覆盖不了内联 `style="font-size: 2rem"`。

### 17.2 global.css 与 app.css 的冲突

`global.css` 中定义了 `body { font-family: var(--font-serif) }`，但 `app.css` 中 body 使用 `font-family: var(--font-sans)`。由于 `app.css` 通过Tailwind的 `@layer base` 层引入，而 `global.css` 的样式没有 layer 声明，**global.css的非layer样式实际优先级更高**。

但实际上 `global.css` 是否被引入取决于是否有其他文件 import 它。当前只有 `app.css` 通过 BaseHead.astro 引入，global.css 可能不会自动加载。

**建议**: 不要修改 `global.css`，所有样式改动应在 `app.css` 中进行。

### 17.3 暗色模式遗漏点

自定义组件类在 `app.css` 中手动定义了 `.dark` 前缀版本，但有些地方使用了固定颜色值（如 `#30302E`）而不是CSS变量：

```css
.dark .card { background: #30302E; }     /* 硬编码 */
.dark .stat-card { background: #30302E; } /* 硬编码 */
```

如果要统一修改暗色模式的卡片背景色，需要搜索所有 `#30302E` 出现的位置。

### 17.4 图标系统的限制

`Icon.astro` 中的图标是硬编码的SVG path。如果需要的图标不在列表中，**不能**通过传入不存在的name使用，会导致渲染错误（undefined的path）。需要先在组件中注册新图标。

### 17.5 社交链接的显示规则

- Header桌面端: 只显示前3个 (`SOCIAL_LINKS.slice(0, 3)`)
- Header移动端: 只显示前3个
- Footer: 显示全部
- 首页Hero: 只显示前4个 (`SOCIAL_LINKS.slice(0, 4)`)

修改链接数量时需注意各处的slice参数。

### 17.6 构建脚本的容错

```json
"build": "astro build || exit 0"
```

**不要移除 `|| exit 0`**。这是有意设计，允许在某些内容缺失时构建仍能继续。

### 17.7 platformProxy 设置

```javascript
adapter: cloudflare({ platformProxy: { enabled: false } })
```

**不要开启 `platformProxy`**。当前设为false，与其他项目（animpoly-com）不同。

### 17.8 CSS变量作用域

`:root` 中定义的变量是全局的，`.dark` 中重新定义的变量只在 `html.dark` 时生效。但 `--border-subtle` 在亮色模式引用 `var(--warm-sand)`，在暗色模式引用 `var(--dark-warm-sand)`，这种"变量引用变量"的模式使得追踪最终颜色值需要两跳。

### 17.9 字体加载的两种方式并存

1. **Google Fonts CDN**: 在 `app.css` 中通过 `@import url(...)` 加载 Inter, Source Serif 4, Noto Serif SC
2. **本地字体**: Atkinson 字体通过 `@font-face` 定义并在 BaseHead.astro 中 preload

Atkinson 字体虽然被定义和预加载了，但在 font-family 变量中**没有被引用**（可能是遗留代码）。

### 17.10 Tailwind Typography 与自定义prose

`tailwind.config.js` 中定制了 `prose` 的颜色（使用 stone/amber 配色），这些在博客文章内容中生效。如果文章内容看起来颜色不对，检查:
1. `tailwind.config.js` → `typography` 配置
2. `BlogPost.astro` 中是否有 `prose` 和 `dark:prose-invert` 类

---

## 18. 跨项目依赖关系

### 18.1 cgartlab.github.io → cy92-org

`src/scripts/sync-word-count.ts` 从 cgartlab.github.io 仓库读取所有文章，计算总字数后更新到 `consts.ts` 的 STATS 数组中。

**运行方式**:
```bash
npx tsx src/scripts/sync-word-count.ts
```

**注意**: 脚本中使用了 Windows 绝对路径 (`D:\\github-repos\\...`)，在其他环境需要修改路径配置。

### 18.2 外部链接依赖

| 链接目标 | 来源位置 |
|----------|---------|
| https://cgartlab.com | Header导航(博客)、works页、consts.ts(PROJECTS) |
| https://weekly.cgartlab.com | consts.ts(PROJECTS) |
| https://space.bilibili.com/38043072 | consts.ts(SOCIAL_LINKS)、works页 |
| https://x.com/cgartlab | consts.ts(SOCIAL_LINKS) |
| https://github.com/cgartlab | consts.ts(SOCIAL_LINKS) |
| https://sspai.com/u/cgartlab | consts.ts(SOCIAL_LINKS) |

### 18.3 Bilibili视频嵌入

works页通过iframe嵌入B站播放器:
```html
src="//player.bilibili.com/player.html?isOutside=true&bvid=${work.bilibiliId}&..."
```

当前嵌入的视频BV号:
- `BV1yyyKYVEeZ` — 本科动画毕业十年后的作品集 2020-2024
- `BV1UK4y1X7rM` — 个人CG艺术作品集 2016-2020

---

## 附录A: 完整组件类速查表

| 类名 | 视觉效果 | 使用场景 |
|------|---------|---------|
| `.container-custom` | 最大896px居中，响应式内边距 | 每个页面的main容器 |
| `.section` | 上下padding 32-48px | 内容区块分隔 |
| `.section-header` | flex水平排列，items-center | 区块标题行 |
| `.section-title` | 墨蓝色，serif字体，lg/xl | 区块标题文字 |
| `.section-line` | 渐变水平线（左到右消失） | 标题后装饰线 |
| `.card` | 象牙白背景，细边框，轻阴影，hover浮起 | 内容卡片 |
| `.stat-card` | 居中文字，象牙白，hover浮起 | 首页统计数据 |
| `.stat-value` | 墨蓝色，serif，大号字 | 统计数字 |
| `.stat-unit` | 石头灰，小号 | 统计单位 |
| `.stat-label` | 橄榄灰，xs | 统计标签 |
| `.tag` | 浅蓝背景，墨蓝文字，圆角，小字 | 标签/技能 |
| `.btn` | 圆角，flexbox居中 | 按钮基础 |
| `.btn-primary` | 墨蓝背景白字 | 主要操作按钮 |
| `.btn-secondary` | 沙色背景深灰字 | 次要按钮 |
| `.social-link` | 方形圆角，边框，hover变蓝 | 社交媒体图标 |
| `.timeline-item` | 左侧圆点+连线，padding-left | 时间线条目 |
| `.quote-block` | 左边蓝色边框，斜体serif | 引用块 |
| `.dash-list` | 无序列表，dash符号 | 列表样式 |
| `.logo-mark` | 圆角方形，边框，hover放大 | Logo容器 |
| `.text-ink` | 墨蓝色文字 | 强调文字 |
| `.text-olive` | 橄榄灰文字 | 描述/次要 |
| `.text-stone` | 石头灰文字 | 最淡文字 |
| `.bg-canvas` | 羊皮纸背景色 | 页面背景 |
| `.bg-ivory` | 象牙白背景 | 卡片/区块 |

---

## 附录B: 视觉层次架构图

```
┌─ 页面视觉层次 ─────────────────────────────────────────────┐
│                                                              │
│  ┌─ Header (z-50, 粘性, 毛玻璃) ─────────────────────────┐ │
│  │  Logo | 导航 | 社交+主题                                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Main (容器896px, 水平居中) ─────────────────────────┐   │
│  │                                                        │   │
│  │  ┌─ Section (py 32-48px) ─────────────────────────┐   │   │
│  │  │  Section Header (标题 + 装饰线)                  │   │   │
│  │  │                                                  │   │   │
│  │  │  ┌─ Card (象牙白, 边框, 阴影) ─────────────┐   │   │   │
│  │  │  │  内容 (padding 20-24px)                   │   │   │   │
│  │  │  │  ├─ 标题 (serif, ink色)                  │   │   │   │
│  │  │  │  ├─ 描述 (sans, olive色)                 │   │   │   │
│  │  │  │  └─ Tags (浅蓝背景, 小号)               │   │   │   │
│  │  │  └──────────────────────────────────────────┘   │   │   │
│  │  │                                                  │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Footer (边框分隔, 版权+社交) ────────────────────────┐  │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  背景层: bg-canvas (#F5F4ED / dark: #1C1917)                │
└──────────────────────────────────────────────────────────────┘
```

---

## 附录C: 文件修改影响范围速查

| 修改文件 | 影响范围 |
|----------|---------|
| `src/consts.ts` | 所有页面的数据内容 |
| `src/styles/app.css` `:root` | 整站所有颜色、间距、字体 |
| `src/styles/app.css` `.dark` | 整站暗色模式 |
| `src/styles/app.css` 组件层 | 所有使用该类的元素 |
| `tailwind.config.js` colors | Tailwind类到CSS变量的映射 |
| `tailwind.config.js` typography | 博客文章内容排版 |
| `src/components/Header.astro` | 所有页面的顶部导航 |
| `src/components/Footer.astro` | 所有页面的底部 |
| `src/components/BaseHead.astro` | 所有页面的head（SEO/样式引入） |
| `src/components/Icon.astro` | 所有使用图标的地方 |
| `src/layouts/BlogPost.astro` | 所有博客文章页面 |
| `astro.config.mjs` | 构建行为、插件、部署 |
| `wrangler.json` | Cloudflare部署配置 |

---

*文档最后更新: 2025年5月*
*本文档基于项目完整代码分析自动生成*
