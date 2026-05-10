# 暗色主题阅读体验优化 Spec

## Why
当前 cy92-org 的暗色主题（`.dark`）仅做了基础的颜色反转，缺乏 Kami 设计系统中暗色模式的精细处理。具体表现为：
- 背景色过于接近纯黑，缺少暖调橄榄底色，与 Kami 的克制美学不符
- 卡片背景使用半透明 rgba，在暗色下对比度不足，边界模糊
- 文字层级不清晰，正文与辅助信息色阶差异过小
- 引用块、时间线、标签等组件缺少暗色模式下的独立样式，导致视觉断裂
- 暗色下的 `::selection` 高亮、hover 状态、阴影等细节未做适配

## What Changes
- **重构 `.dark` CSS 变量体系**：引入 Kami 暗色规范，使用暖炭灰 `#30302E` / `#1C1917` 作为基底，而非纯黑
- **新增暗色专用语义变量**：`--dark-canvas`、`--dark-ivory`、`--dark-ink`、`--dark-tag-*` 等，确保明暗主题变量一一对应
- **覆盖组件暗色样式**：为 `.card`、`.tag`、`.timeline-item`、`.quote-block`、`.social-link`、`.btn-primary`、`.btn-secondary`、`.section-line`、`.dash-list` 等组件补充 `.dark &` 或 `.dark .xxx` 规则
- **优化暗色下的 prose/typography**：调整博客文章在暗色下的代码块、引用、链接、表格等样式
- **修复暗色下的交互状态**：hover、focus-visible、selection、active 状态在暗色下的颜色适配
- **验证暗色切换逻辑**：确保 `localStorage` 主题持久化与系统偏好 `prefers-color-scheme` 的协同工作正常

## Impact
- Affected specs: 暗色主题阅读体验
- Affected code: `src/styles/app.css`（核心变量与组件样式）、`src/components/BaseHead.astro`（主题初始化脚本）、各页面组件中的硬编码颜色

## ADDED Requirements
### Requirement: 暗色变量体系
The system SHALL provide a complete set of dark-mode CSS custom properties that mirror the light-mode variables with warm, muted tones instead of pure black/white.

#### Scenario: Dark mode active
- **WHEN** the user activates dark mode
- **THEN** the page background uses `#1C1917` (deep dark with olive undertone)
- **AND** card backgrounds use `#30302E` (dark surface / warm charcoal)
- **AND** text colors use a warm gray scale from `#FAF9F5` (primary) down to `#78716C` (muted)
- **AND** the ink-blue accent adapts to `#5B8DB8` (lighter, desaturated) for sufficient contrast

### Requirement: 组件暗色覆盖
The system SHALL ensure all custom components render correctly in dark mode with appropriate contrast and visual hierarchy.

#### Scenario: Card in dark mode
- **WHEN** a `.card` component renders in dark mode
- **THEN** its background is solid `#30302E`
- **AND** its border is `rgba(255,255,255,0.08)`
- **AND** hover state uses `rgba(255,255,255,0.12)` border and subtle lift shadow

#### Scenario: Tag in dark mode
- **WHEN** a `.tag` component renders in dark mode
- **THEN** its background uses a dark tint of ink-blue (e.g. `#1E2D3D`)
- **AND** its text color is `#7BA3CC` (light ink)
- **AND** hover background becomes `#2A3D52`

#### Scenario: Timeline in dark mode
- **WHEN** a `.timeline-item` renders in dark mode
- **THEN** the dot uses the adapted ink-blue `#5B8DB8`
- **AND** the glow/shadow around the dot uses a dark tint
- **AND** the connecting line uses `#3D3835` (dark warm sand)

#### Scenario: Quote block in dark mode
- **WHEN** a `.quote-block` renders in dark mode
- **THEN** the left border uses the adapted ink-blue `#5B8DB8`
- **AND** the text color is `#A8A29E` (muted warm gray)
- **AND** the background is subtly different from surrounding content (e.g. `#252320`)

### Requirement: 交互状态暗色适配
The system SHALL adapt interactive states (hover, focus, selection) for dark mode to remain visible and aesthetically consistent.

#### Scenario: Selection in dark mode
- **WHEN** user selects text in dark mode
- **THEN** the highlight color is `rgba(91, 141, 184, 0.25)` (ink-blue at 25% opacity)
- **AND** the selected text color remains `#FAF9F5`

#### Scenario: Focus visible in dark mode
- **WHEN** an element receives keyboard focus in dark mode
- **THEN** the outline uses `#5B8DB8` (adapted ink-blue)

## MODIFIED Requirements
### Requirement: 现有亮色主题
现有亮色主题的变量与组件样式保持不变，仅作为暗色变量的参照基准。

## REMOVED Requirements
无移除需求。
