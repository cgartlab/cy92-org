/**
 * 链接检查脚本（ESM .mjs，零第三方依赖）
 *
 * 递归扫描构建产物 <root>/dist/ 下所有 .html，提取 href / src 本地引用并校验：
 *   - 文件路径引用（/works/、/about/、/rss.xml、相对路径 …）→ 对应文件在 dist 下存在
 *   - 锚点引用（#xxx）→ 目标页（或当前页）存在 id="xxx" 或 <a name="xxx">
 * 忽略外部与特殊协议：http(s)://、协议相对 //、javascript:、mailto:、tel:、
 * data:、blob:、ftp:，以及单独的 "#"（回到页首）。外部链接不做网络请求，避免 flaky。
 *
 * 目标存在性判定兼容 Astro directory 输出格式：
 *   /works/     → dist/works/index.html
 *   /works      → dist/works/index.html 或 dist/works.html
 *   /rss.xml    → dist/rss.xml
 *   /img/a.png  → dist/img/a.png
 * 相对引用（./ ../ 等）以当前 HTML 所在目录为基准解析。
 *
 * 日志分级:
 *   默认      stdout 仅一行最终结果（通过）；失败时 stderr 输出问题清单
 *   --verbose stdout 额外输出扫描统计（HTML 文件数 / 内部引用数 / 锚点数）
 *   --quiet   stdout 全静默（错误仍走 stderr）
 *
 * 用法:
 *   node scripts/check-links.mjs
 *   node scripts/check-links.mjs --root <仓库根，默认脚本上一级>
 *   node scripts/check-links.mjs --verbose
 *
 * 模块化: 导出 collectHtmlFiles / extractReferences / parseReference / hasAnchor /
 * scanLinks 供单测直接调用。main 仅在作为入口执行时运行（import.meta.url 守卫）。
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as posix from 'node:path/posix';

// 脚本所在目录（ESM 无 __dirname，由 import.meta.url 转换）
const scriptDir = dirname(fileURLToPath(import.meta.url));

// 默认仓库根：脚本位于 <root>\scripts，上一级即仓库根
const DEFAULT_ROOT = resolve(scriptDir, '..');

// 需要忽略的协议前缀（大小写不敏感）。http(s) 一律视为外部链接，
// 不做网络请求，避免 flaky（本站点内部导航在 Astro 配置 site 后输出为绝对 URL，
// 同样跳过——见 parseReference 注释）。
const IGNORE_SCHEME_RE = /^(?:https?|javascript|mailto|tel|data|blob|ftp|file|irc|sms):/i;

/**
 * 解析 CLI 参数。未知参数忽略；--root 缺值时明确报错。
 * @param {string[]} argv process.argv.slice(2)
 * @returns {{ root: string|null, quiet: boolean, verbose: boolean }}
 */
export function parseArgs(argv) {
	const args = { root: null, quiet: false, verbose: false };
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--root') {
			const value = argv[i + 1];
			if (!value || value.startsWith('--')) {
				throw new Error('--root 需要一个路径参数，用法: --root <path>');
			}
			args.root = value;
			i++; // 消费路径参数
		} else if (arg === '--quiet') {
			args.quiet = true;
		} else if (arg === '--verbose') {
			args.verbose = true;
		}
		// 其他未知参数忽略
	}
	return args;
}

/**
 * 递归收集 distDir 下所有 .html 文件（相对于 distDir 的 posix 路径，含 / 分隔符）。
 * @param {string} distDir
 * @returns {string[]} 相对路径列表（已排序）
 */
export function collectHtmlFiles(distDir) {
	const files = [];
	if (!existsSync(distDir)) return files;

	const walk = (absDir, relPrefix) => {
		for (const entry of readdirSync(absDir, { withFileTypes: true })) {
			const rel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
			if (entry.isDirectory()) {
				walk(join(absDir, entry.name), rel);
			} else if (entry.isFile() && extname(entry.name).toLowerCase() === '.html') {
				files.push(rel);
			}
		}
	};
	walk(distDir, '');
	return files.sort();
}

/**
 * 提取 HTML 中所有 href / src 属性值。先剔除注释、<script>、<style> 内容，
 * 避免把内联 JS / CSS / JSON-LD 里的伪引用当链接。
 * @param {string} html
 * @returns {string[]} 属性值列表（未 trim，原始引号内容）
 */
export function extractReferences(html) {
	const cleaned = html
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
		.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '');
	const refs = [];
	const re = /\s(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
	let match;
	while ((match = re.exec(cleaned)) !== null) {
		refs.push(match[1] ?? match[2] ?? match[3]);
	}
	return refs;
}

/**
 * 分类一条引用。外部/特殊协议/空值返回 null（忽略）；站内引用归一为
 * { raw, path, hash, anchorOnly }。path 为剥离 query 与 hash 的路径部分；
 * anchorOnly 表示仅页内锚点（path 为空）。
 * @param {string} raw
 * @returns {null | { raw: string, path: string, hash: string, anchorOnly: boolean }}
 */
export function parseReference(raw) {
	const value = String(raw).trim();
	if (!value) return null;
	if (value.startsWith('//')) return null; // 协议相对（//cdn.xxx）
	// 说明：Astro 配置 site 后，站内导航链接在构建产物中输出为绝对 URL
	// （https://cy92.org/about/）。按任务约束统一视为外部链接忽略，不校验。
	if (IGNORE_SCHEME_RE.test(value)) return null;

	const hashIndex = value.indexOf('#');
	const pathQueryPart = hashIndex === -1 ? value : value.slice(0, hashIndex);
	const path = pathQueryPart.split('?')[0];
	const hash = hashIndex === -1 ? '' : value.slice(hashIndex + 1).split('?')[0];

	if (path === '' && hash === '') return null; // 单独的 "#"
	return { raw: value, path, hash, anchorOnly: path === '' };
}

/**
 * URL 解码（路径用）。decodeURI 遇到非法转义时原样返回，不中断扫描。
 * @param {string} value
 * @returns {string}
 */
function safeDecodeURI(value) {
	try {
		return decodeURI(value);
	} catch {
		return value;
	}
}

/**
 * URL 解码（锚点用）。decodeURIComponent 失败时原样返回。
 * @param {string} value
 * @returns {string}
 */
function safeDecodeComponent(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

/**
 * 在 dist 下定位 path 引用的目标文件绝对路径；找不到返回 null。
 * 兼容 directory 输出（/works/ → works/index.html）与显式扩展名两种形态。
 * @param {string} distDir
 * @param {string} baseRel 当前 HTML 所在目录（posix 相对，'' 表示 dist 根）
 * @param {string} rawPath 已剥离 hash/query 的路径
 * @returns {string|null} 目标文件绝对路径
 */
export function locateFileTarget(distDir, baseRel, rawPath) {
	const isFile = (p) => {
		try {
			return statSync(p).isFile();
		} catch {
			return false;
		}
	};
	const decoded = safeDecodeURI(rawPath);
	// 注意: posix.join 对以 / 开头的绝对路径不会重置 baseRel
	// （join('about','/favicon.svg') === 'about/favicon.svg'），
	// 因此绝对路径直接作为根相对路径，只有相对路径才拼接当前目录。
	const isAbsolute = decoded.startsWith('/');
	const fullPosix = posix.normalize(isAbsolute ? decoded : posix.join(baseRel, decoded));
	let segs = (fullPosix.startsWith('/') ? fullPosix.slice(1) : fullPosix)
		.split('/')
		.filter((s) => s && s !== '.');
	if (segs.length === 0) segs = ['index.html']; // 指向根目录

	const direct = join(distDir, ...segs);
	if (isFile(direct)) return direct;

	const last = segs[segs.length - 1];
	if (!extname(last)) {
		// 无扩展名：可能是目录式页面（…/index.html）或 .html 文件
		const dirIndex = join(distDir, ...segs, 'index.html');
		if (isFile(dirIndex)) return dirIndex;
		const htmlSibling = `${direct}.html`;
		if (isFile(htmlSibling)) return htmlSibling;
	}
	return null;
}

/**
 * 判断目标文件是否为 .html（决定是否校验锚点）。
 * @param {string} fileAbs
 * @returns {boolean}
 */
function isHtmlFile(fileAbs) {
	return extname(fileAbs).toLowerCase() === '.html';
}

/**
 * 在 HTML 中查找锚点（id="x" 或 <a name="x">）。
 * @param {string} html
 * @param {string} rawAnchor hash 中的原始锚点名（可含 URL 编码）
 * @returns {boolean}
 */
export function hasAnchor(html, rawAnchor) {
	const name = safeDecodeComponent(rawAnchor);
	if (!name) return false;
	const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const idRe = new RegExp(`\\sid\\s*=\\s*["']${escaped}["']`);
	const aNameRe = new RegExp(`<a\\b[^>]*\\bname\\s*=\\s*["']${escaped}["']`, 'i');
	return idRe.test(html) || aNameRe.test(html);
}

/**
 * 主检查流程：扫描全部 HTML → 提取引用 → 逐条校验文件/锚点。
 * @param {string} distDir
 * @returns {{ htmlFileCount: number, internalCount: number, anchorCount: number,
 *             problems: Array<{ file: string, raw: string, reason: string }> }}
 */
export function scanLinks(distDir) {
	const htmlFiles = collectHtmlFiles(distDir);
	const problems = [];
	let internalCount = 0;
	let anchorCount = 0;

	const cache = new Map();
	const readContent = (abs) => {
		if (!cache.has(abs)) cache.set(abs, readFileSync(abs, 'utf-8'));
		return cache.get(abs);
	};

	for (const rel of htmlFiles) {
		const abs = join(distDir, rel);
		const content = readContent(abs);
		const baseRel = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '';

		for (const raw of extractReferences(content)) {
			const parsed = parseReference(raw);
			if (!parsed) continue;
			internalCount++;

			if (parsed.anchorOnly) {
				// 仅页内锚点 → 当前页校验
				anchorCount++;
				if (!hasAnchor(content, parsed.hash)) {
					problems.push({ file: rel, raw, reason: `当前页缺少锚点 #${parsed.hash}` });
				}
				continue;
			}

			const target = locateFileTarget(distDir, baseRel, parsed.path);
			if (!target) {
				problems.push({ file: rel, raw, reason: '目标文件不存在（dist/ 下无对应文件或目录）' });
				continue;
			}

			if (parsed.hash && isHtmlFile(target)) {
				// 站内 .html 目标的锚点校验（资源文件带 hash 无意义，跳过）
				anchorCount++;
				const targetContent = readContent(target);
				if (!hasAnchor(targetContent, parsed.hash)) {
					problems.push({ file: rel, raw, reason: `目标页缺少锚点 #${parsed.hash}` });
				}
			}
		}
	}

	return { htmlFileCount: htmlFiles.length, internalCount, anchorCount, problems };
}

/**
 * 主流程: 解析参数 → 校验 dist 存在 → 扫描 → 输出结果 / 问题清单。
 */
function main() {
	let args;
	try {
		args = parseArgs(process.argv.slice(2));
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.stack);
		} else {
			console.error(String(error));
		}
		process.exitCode = 1;
		return;
	}

	const finalLog = (msg) => {
		if (!args.quiet) console.log(msg);
	};
	const detailLog = (msg) => {
		if (args.verbose && !args.quiet) console.log(msg);
	};

	try {
		const root = args.root ? resolve(args.root) : DEFAULT_ROOT;
		const distDir = join(root, 'dist');

		if (!existsSync(distDir)) {
			throw new Error(
				`构建产物目录不存在: ${distDir}。请先运行 pnpm build 生成 dist/ 后再执行链接检查。`
			);
		}

		const result = scanLinks(distDir);
		if (result.htmlFileCount === 0) {
			throw new Error(`在 ${distDir} 下未找到任何 .html 文件，疑似不是有效的 Astro 构建产物。`);
		}

		detailLog(
			`扫描 ${result.htmlFileCount} 个 HTML，共 ${result.internalCount} 条内部引用（其中锚点 ${result.anchorCount} 条）`
		);

		if (result.problems.length > 0) {
			for (const p of result.problems) {
				console.error(`  [${p.file}] 引用 "${p.raw}" -> ${p.reason}`);
			}
			console.error(`发现 ${result.problems.length} 个无效内部引用`);
			process.exitCode = 1;
			return;
		}

		finalLog(`所有内部链接有效 (${result.internalCount} 条)`);
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.stack);
		} else {
			console.error(String(error));
		}
		process.exitCode = 1;
	}
}

// main 守卫：仅当以入口脚本直接执行时才运行（被 import 时不执行）
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main();
}
