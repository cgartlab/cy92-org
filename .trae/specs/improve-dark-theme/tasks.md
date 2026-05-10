# Tasks

- [x] Task 1: 重构暗色 CSS 变量体系
  - [x] SubTask 1.1: 在 `app.css` 中重写 `.dark` 根变量，引入暖炭灰基底（`#1C1917` canvas, `#30302E` card, `#252320` secondary）
  - [x] SubTask 1.2: 新增暗色语义变量 `--dark-ink` (`#5B8DB8`)、`--dark-ink-light` (`#7BA3CC`)、`--dark-olive` (`#A8A29E`)、`--dark-stone` (`#78716C`)、`--dark-warm-sand` (`#3D3835`)
  - [x] SubTask 1.3: 新增暗色 tag tint 变量 `--dark-tag-08` ~ `--dark-tag-30`
  - [x] SubTask 1.4: 将 body、selection、focus-visible 的暗色适配从硬编码改为使用新变量

- [x] Task 2: 覆盖核心组件暗色样式
  - [x] SubTask 2.1: `.card` 暗色背景、边框、hover 阴影
  - [x] SubTask 2.2: `.tag` 暗色背景、文字、hover 状态
  - [x] SubTask 2.3: `.timeline-item` 暗色圆点、连接线、glow
  - [x] SubTask 2.4: `.quote-block` 暗色边框、文字、背景
  - [x] SubTask 2.5: `.social-link` 暗色背景、边框、hover
  - [x] SubTask 2.6: `.btn-primary` / `.btn-secondary` 暗色样式
  - [x] SubTask 2.7: `.section-line` 暗色渐变线
  - [x] SubTask 2.8: `.dash-list` 暗色符号与文字色

- [x] Task 3: 修复页面级硬编码颜色与暗色协同
  - [x] SubTask 3.1: 检查 `index.astro` 中所有 `style="..."` 硬编码颜色，替换为暗色变量或移除
  - [x] SubTask 3.2: 检查 `works.astro` 中硬编码颜色
  - [x] SubTask 3.3: 检查 `about.astro` 中硬编码颜色
  - [x] SubTask 3.4: 检查 `blog/index.astro` 与 `BlogPost.astro` 中硬编码颜色

- [x] Task 4: 验证与构建
  - [x] SubTask 4.1: 运行 `npm run build` 确保无编译错误
  - [x] SubTask 4.2: 运行 `npm run dev` 并在浏览器中手动切换暗色模式，检查各页面视觉效果
  - [x] SubTask 4.3: 检查移动端菜单在暗色下的表现

# Task Dependencies
- Task 2 依赖 Task 1（变量必须先定义）
- Task 3 可与 Task 2 并行执行，但需在 Task 1 完成后
- Task 4 依赖 Task 1、2、3 全部完成
