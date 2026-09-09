// 校验构建产物: 英文版默认态是否有中文泄漏。
// 用法: node scripts/i18n-verify.mjs [构建产物目录]   （默认 dist/，即 pnpm build 之后）
// 1) <head> 语言初始化脚本存在
// 2) 每个 data-t 元素的兜底文本不含 CJK（默认英文态首帧即正确）
// 3) data-l zh/en 成对, 无孤儿
// 4) title/meta 带 data-en / data-zh
// 5) 正文里未被 data-l 门控的裸露中文（即英文态会显示的中文）

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : 'dist';
if (!fs.existsSync(ROOT)) {
	console.error(`✗ 找不到构建产物目录 ${ROOT}，请先运行 pnpm build`);
	process.exit(1);
}
const pages = ['index.html', 'about/index.html', 'works/index.html', 'blog/index.html'];
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef]/;

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

for (const p of pages) {
	if (!fs.existsSync(path.join(ROOT, p))) {
		console.log(`\n✗ 缺失 ${p}`);
		continue;
	}
	const html = read(p);
	console.log(`\n═══ ${p} ═══`);

	// 1) head 语言初始化
	const headInit = html.includes("document.documentElement.classList.add('lang-en')")
		|| html.includes('classList.add("lang-en")');
	console.log(`  ${headInit ? '✓' : '✗'} <head> 英文默认初始化`);

	// 2) data-t 兜底文本
	const tags = ['a', 'span', 'p', 'h2', 'h3', 'h4', 'div', 'button', 'li'];
	const dtRe = new RegExp(`<(${tags.join('|')})[^>]*\\bdata-t="([^"]+)"[^>]*>([\\s\\S]*?)</\\1>`, 'g');
	let bad = 0,
		n = 0;
	let m;
	while ((m = dtRe.exec(html))) {
		n++;
		if (CJK.test(m[3])) {
			bad++;
			console.log(`      ✗ data-t="${m[2]}" 兜底仍是中文: ${m[3].trim().slice(0, 50)}`);
		}
	}
	console.log(`  ${bad ? '✗' : '✓'} data-t 兜底英文 (${n} 个, ${bad} 个含中文)`);

	// 3) data-l 成对
	const zh = (html.match(/data-l="zh"/g) || []).length;
	const en = (html.match(/data-l="en"/g) || []).length;
	console.log(`  ${zh === en ? '✓' : '!'} data-l 成对 zh=${zh} en=${en}`);

	// 4) title / meta 双语
	const tEn = /<title[^>]*data-en="/.test(html);
	const mEn = /<meta[^>]*data-en="/.test(html);
	console.log(`  ${tEn && mEn ? '✓' : '✗'} title/meta 双语属性 (title=${tEn} meta=${mEn})`);

	// 5) 裸露中文: 按标签嵌套深度剥掉 <script>/<style>/注释 与 data-l="zh" 块,
	//    剩下的才是英文默认态会渲染出的文本。
	const stripLang = (html, lang) => {
		const langDepth = new Map();
		let activeLang = null;
		let out = '';
		let i = 0;
		while (i < html.length) {
			const lt = html.indexOf('<', i);
			if (lt < 0) return out + html.slice(i);
			out += html.slice(i, lt);
			const gt = html.indexOf('>', lt);
			if (gt < 0) return out + html.slice(lt);
			const tag = html.slice(lt, gt + 1);
			i = gt + 1;
			if (/^<(script|style)/i.test(tag)) {
				const end = html.indexOf(`</${tag.slice(1).split(/[\s.]/)[0]}>`, i);
				if (end < 0) return out;
				i = end + 2;
				continue;
			}
			const m = tag.match(/^<(\/?)([a-z][\w-]*)((?:[^>]*?))>/i);
			if (!m) continue;
			const [, closing, name, attrs] = m;
			const selfClose = /\s\/>$/.test(tag) || selfClosing.has(name.toLowerCase());
			if (closing) {
				if (langDepth.get(name) > 0) langDepth.set(name, langDepth.get(name) - 1);
				if (langDepth.get(name) === 0 && activeLang === lang) activeLang = null;
				continue;
			}
			if (selfClose) continue;
			if (!activeLang && new RegExp(`\\bdata-l="${lang}"\\b`).test(attrs)) {
				activeLang = lang;
				langDepth.set(name, 1);
				continue;
			}
			if (activeLang === lang) {
				langDepth.set(name, (langDepth.get(name) || 0) + 1);
				continue;
			}
			out += tag;
		}
		return out;
	};
	const selfClosing = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'area', 'base', 'col', 'embed', 'track', 'wbr']);

	const COMMENT_RE = new RegExp(String.raw`<![\s\S]*?-->`);
	let stripped = html.replace(COMMENT_RE, '');
	stripped = stripLang(stripLang(stripped, 'zh'), 'en');
	const visible = stripped.replace(/<[^>]*>/g, ' ');
	const cnRuns = visible.match(/[\u4e00-\u9fff][\u4e00-\u9fff\s\uff0c\u3002\u3001\uff1a\uff0c\uff08\uff09「」·—–,.;:()"'…&%/]{0,60}/g) || [];
	const uniq = [...new Set(cnRuns.map((s) => s.trim()).filter(Boolean))];
	console.log(`  ${uniq.length ? '✗' : '✓'} 英文态可见中文片段: ${uniq.length}`);
	if (uniq.length) uniq.slice(0, 12).forEach((s) => console.log('      | ' + s.slice(0, 70)));
}
