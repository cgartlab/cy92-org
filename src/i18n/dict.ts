// ═══ i18n — bilingual string dictionary ═══
// Single source of truth for STATIC copy switched via `data-t` attributes.
// Data-driven content (SKILLS, HONORS, …) lives in consts.ts as parallel *_EN
// exports and is switched by the same `html.lang-en` class (see .bl/.blk rules
// in styles/app.css). Both mechanisms are driven by one toggle.
//
// Convention: `zh` is the fallback — a missing `en` silently renders Chinese,
// so a half-translated key never shows empty text.

export type Lang = 'zh' | 'en';

export type I18NEntry = { zh: string; en: string };

export const I18N: Record<string, I18NEntry> = {
	// ══ Homepage header / navigation ══
	skipLink: { zh: '跳到主内容', en: 'Skip to content' },
	workNavAria: { zh: '作品导航', en: 'Work navigation' },
	navCollection: { zh: '合集', en: 'All Works' },
	navMeditation: { zh: '冥想系列', en: 'Meditation Series' },
	navMore: { zh: '更多作品即将加入…', en: 'More works coming soon' },
	scrollCueAria: { zh: '向下滚动到统计页', en: 'Scroll down to the statistics slide' },
	dataSrcAria: { zh: '数据来源少数派个人主页', en: 'Source: my sspai.com profile' },
	allWorks: { zh: '全部作品', en: 'All works' },
	medAllAria: { zh: '冥想系列 — 全部作品', en: 'Meditation Series — all works' },

	// ══ Shared site chrome (Header / Footer) ══
	brandAria: { zh: '返回首页', en: 'Back to home' },
	mainNavAria: { zh: '主导航', en: 'Main navigation' },
	navAbout: { zh: '关于', en: 'About' },
	navWork: { zh: '作品', en: 'Work' },
	navBlog: { zh: '博客', en: 'Blog' },
	menuOpenAria: { zh: '打开导航菜单', en: 'Open the navigation menu' },
	menuCloseAria: { zh: '关闭导航菜单', en: 'Close the navigation menu' },
	themeAria: { zh: '切换主题', en: 'Toggle color theme' },
	langAria: { zh: '切换语言', en: 'Switch language' },
	footerQuoteTools: {
		zh: '工具是人类肢体的延伸，电脑是大脑的延伸，写作是思考本身。',
		en: 'Tools extend our limbs, computers extend our minds, and writing is thinking itself.'
	},

	// ══ Social links (tooltip / accessible names) ══
	socialGithub: { zh: 'GitHub', en: 'GitHub' },
	socialTwitter: { zh: 'Twitter/X', en: 'Twitter/X' },
	socialBilibili: { zh: 'Bilibili', en: 'Bilibili' },
	socialSspai: { zh: '少数派', en: 'Sspai' },
	socialRss: { zh: 'RSS', en: 'RSS' },

	// ══ SkillBar ══
	skillExpert: { zh: '精通', en: 'Expert' },
	skillAdvanced: { zh: '熟练', en: 'Advanced' },
	skillIntermediate: { zh: '良好', en: 'Intermediate' },
	skillBeginner: { zh: '基础', en: 'Beginner' },

	// ══ Slide 0 — hero ══
	heroTag1: { zh: '动态视觉设计师', en: 'Motion Visual Designer' },
	heroTag2: { zh: '内容创作者', en: 'Content Creator' },
	heroTag3: { zh: '产品工程师', en: 'Product Engineer' },

	// ══ Slide 1 — stats ══
	statKicker1: { zh: '累计发表字数', en: 'Words Published' },
	statUnit1: { zh: '字', en: 'words' },
	statKicker2: { zh: '过去一年提交代码', en: 'Code Commits (Past Year)' },
	statUnit2: { zh: '次', en: 'commits' },
	statKicker3: { zh: '致力于数字创作领域', en: 'Years in Digital Creation' },
	statUnit3: { zh: '年', en: 'years' },
	statKicker4: { zh: '文章累计被浏览', en: 'Article Views' },
	statSrc: { zh: '少数派', en: 'sspai.com' },

	// ══ Slide 2 — What I do ══
	whatHeading: { zh: '跨领域<br/>数字创作者', en: 'Cross-Domain<br/>Digital Creator' },
	whatBody: {
		zh: '我创建数字产品、塑造品牌视觉、分享创作背后的思考过程。倡导数据主权，坚持创作即认知的理念。',
		en: 'I create digital products, shape brand visuals, and share the thinking behind the work. An advocate of data sovereignty — creation as cognition.'
	},

	// ══ Slide 3 — Featured Work ══
	workTitle: { zh: '动态视觉从业十年，只有热爱，别无他解。', en: 'A decade in motion visuals — nothing but love for the craft.' },
	workBody1: {
		zh: '从三维动画、CG 艺术到动态视觉与数字产品，十年创作路一直在探索媒介与叙事。没有捷径可言，凭的是一点热爱与坚持——每一件作品都是对边界的试探。',
		en: 'From 3D animation and CG art to motion design and digital products — a decade of exploring media and narrative. No shortcuts, just love and persistence: every piece pushes a boundary.'
	},
	workBody2: {
		zh: '从实验性 VR 数字艺术作品《Hello World 2.0》，到品牌与发布会开场动效，再到入选 CCG EXPO 的《COVID-19》——作品在变，媒介在变，那个最初让我拿起笔的理由没有变。',
		en: 'From the experimental VR piece Hello World 2.0, to brand event openers, to CCG EXPO’s COVID-19 — the work and medium evolve, but the reason I first picked up the pen never changed.'
	},

	// ══ Slide 5 — profile ══
	aboutHeading: { zh: '画画是画画的酬劳，写作是写作的回报。', en: 'Painting rewards itself with painting; writing rewards itself with writing.' },
	aboutBody1: {
		zh: '我是数字动态视觉出身的设计师，十余年来在设计、动画与前端之间来回穿梭。现在，我把写作当成思考的入口，把 AI 当作协作者，把每个项目都看作一次方法论的实验：慢一点比较快，先设计规则，再执行规则。',
		en: 'A motion-visual designer by training, I have spent over a decade moving between design, animation, and front-end. Now I treat writing as the gateway to thinking, AI as a collaborator, and every project as a methodology experiment: slower is faster — design the rules first, then execute.'
	},
	aboutBody2: {
		zh: '我相信「数据主权」与「创作即认知」——不把自己交给封闭平台，也不让想法只停在草稿里。工具会更新，软件会被淘汰，能一直带走的是想清楚的能力；CG 艺术实验室，就是我把这种能力写下来、做出来、验证过的地方。',
		en: 'I believe in data sovereignty and creation as cognition — never handing yourself over to a closed platform, never letting ideas die in a draft. Tools update, software gets retired; what stays is the ability to think clearly. CG Art Lab is where I write it down, build it out, and prove it works.'
	},
	cvWork: { zh: '工作经历', en: 'Work Experience' },
	cvEdu: { zh: '教育经历', en: 'Education' },
	cvProjects: { zh: '项目经历与奖项认证', en: 'Projects & Awards' },

	// ══ Slide 6 — contact ══
	contactBody: {
		zh: '如果你对我的作品感兴趣，或者有任何合作想法，欢迎随时联系我。',
		en: 'If you like my work or have collaboration ideas, feel free to reach out.'
	},

	// ══ Footer ══
	footerQuote: { zh: '画画是画画的酬劳，写作是写作的回报。', en: 'Painting rewards itself with painting; writing rewards itself with writing.' }
};
