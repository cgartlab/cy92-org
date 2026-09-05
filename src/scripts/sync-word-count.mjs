/**
 * 字数统计同步脚本（ESM .mjs，零第三方依赖）
 *
 * 从 cgartlab.github.io 仓库的文章内容计算累计字数，写回本仓库 src/consts.ts 中
 * `{ label: "累计字数", value: "...", unit: "字" }` 字段。写回采用「同目录临时文件
 * + renameSync 原子覆盖」；统计项缺失时拒绝写坏原文件。
 *
 * 仓库路径解析优先级（自上而下取首个可用）:
 *   1. CLI 参数:      node sync-word-count.mjs --repo <path>
 *   2. 环境变量:      CGARTLAB_REPO=<path>
 *   3. sibling 推导:  resolve(scriptDir, '../../..', 'cgartlab.github.io')
 *                     （脚本在 <root>\src\scripts 下，向上三级即仓库平级目录）
 * 全部不可用时明确报错并退出码 1，绝不静默使用错误路径。
 * 目标 consts.ts 固定从脚本位置推导: resolve(scriptDir, '../consts.ts')，无需参数化。
 *
 * 日志分级:
 *   默认      仅 stdout 输出一行最终结果（累计字数 + 已更新文件路径）
 *   --verbose stdout 额外输出每篇文章明细
 *   --quiet   stdout 全静默（错误仍走 stderr）
 *
 * 用法:
 *   node src/scripts/sync-word-count.mjs
 *   node src/scripts/sync-word-count.mjs --repo <cgartlab.github.io 仓库路径>
 *   node src/scripts/sync-word-count.mjs --verbose
 *   node src/scripts/sync-word-count.mjs --quiet
 *
 * 模块化: 导出纯函数 countWords / getPostFiles / calculateTotalWords /
 * updateConstsFile 及解析辅助 parseArgs / resolveCgartlabRepo，供单测直接调用。
 * main 仅在作为入口执行时运行（import.meta.url 守卫）。
 */

import {
	existsSync,
	readdirSync,
	readFileSync,
	renameSync,
	statSync,
	unlinkSync,
	writeFileSync,
} from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// posts 目录在 cgartlab.github.io 仓库内的相对位置
const REPO_POSTS_REL = ['src', 'content', 'posts'];

// 脚本所在目录（ESM 无 __dirname，由 import.meta.url 转换）
const scriptDir = dirname(fileURLToPath(import.meta.url));

// 目标 consts.ts：脚本位于 <repo>\src\scripts，上一级 src/ 内
const CONSTS_FILE = resolve(scriptDir, '../consts.ts');

// consts.ts 中累计字数统计项（与源数据字段格式一致，仅更新数字）
const STATS_PATTERN = /\{ label: "累计字数", value: "[\d,]+", unit: "字" \}/;

/**
 * 解析 CLI 参数。未知参数忽略；--repo 缺值时明确报错。
 * @param {string[]} argv process.argv.slice(2)
 * @returns {{ repo: string|null, quiet: boolean, verbose: boolean }}
 */
export function parseArgs(argv) {
	const args = { repo: null, quiet: false, verbose: false };
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--repo') {
			const value = argv[i + 1];
			if (!value || value.startsWith('--')) {
				throw new Error('--repo 需要一个路径参数，用法: --repo <path>');
			}
			args.repo = value;
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
 * 解析 cgartlab.github.io 仓库路径（纯计算，不做文件系统校验）。
 * 优先级: CLI 参数 > 环境变量 CGARTLAB_REPO > sibling 相对推导。
 * @param {{ cliPath?: string|null, envPath?: string|null, scriptDir: string }} opts
 * @returns {string} 解析出的绝对路径
 */
export function resolveCgartlabRepo({ cliPath, envPath, scriptDir: baseDir }) {
	if (cliPath) {
		return resolve(cliPath); // 绝对路径原样；相对路径以 cwd 为基准
	}
	if (envPath) {
		return resolve(envPath);
	}
	// sibling 推导: <scriptDir>/../../.. = 本仓库平级目录，期望命中 cgartlab.github.io
	return resolve(baseDir, '../../..', 'cgartlab.github.io');
}

/**
 * 计算文本字数。口径与原脚本一致：先移除 frontmatter，再统计
 * 中文字符（含中文标点/全角符号）数量 + 英文单词（连续字母）数量。
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
	// 移除 frontmatter
	const cleanText = text.replace(/^---[\s\S]*?---/, '');

	// 中文字符（含中文字符与标点）
	const chineseChars = cleanText.match(/[\u4E00-\u9FA5\u3000-\u303F\uFF00-\uFFEF]/g) || [];

	// 英文单词
	const englishWords = cleanText.match(/[a-z]+/gi) || [];

	return chineseChars.length + englishWords.length;
}

/**
 * 递归扫描 postsDir 下所有文章文件路径。
 * 排除规则（与原脚本一致）: 目录中跳过 _images / _files；文件仅收 .md，
 * 且跳过 *-en.md（英文版）。
 * @param {string} postsDir
 * @returns {string[]} 文章绝对路径列表（顺序为 readdirSync 顺序）
 */
export function getPostFiles(postsDir) {
	const files = [];
	const items = readdirSync(postsDir);

	for (const item of items) {
		const fullPath = join(postsDir, item);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			// 排除 _images 和 _files 目录
			if (item !== '_images' && item !== '_files') {
				files.push(...getPostFiles(fullPath));
			}
		} else if (extname(item) === '.md') {
			// 排除英文版文件
			if (!item.endsWith('-en.md')) {
				files.push(fullPath);
			}
		}
	}

	return files;
}

/**
 * 遍历统计所有文章的总字数。
 * @param {string[]} postFiles getPostFiles 返回的文件路径列表
 * @returns {number} 总字数
 */
export function calculateTotalWords(postFiles) {
	let totalWords = 0;
	for (const file of postFiles) {
		const content = readFileSync(file, 'utf-8');
		totalWords += countWords(content);
	}
	return totalWords;
}

/**
 * 同目录临时文件 + renameSync 原子覆盖写。
 * rename 失败时清理临时文件并向上抛错；目标文件保持完好。
 * @param {string} targetPath
 * @param {string} content
 */
function writeFileAtomic(targetPath, content) {
	const tmpPath = join(dirname(targetPath), `consts.ts.tmp-${process.pid}`);
	try {
		writeFileSync(tmpPath, content, 'utf-8');
		renameSync(tmpPath, targetPath);
	} catch (error) {
		try {
			unlinkSync(tmpPath);
		} catch {
			// 临时文件可能未创建或已被清理，忽略
		}
		throw error;
	}
}

/**
 * 读 consts.ts → 校验累计字数统计项存在 → 原子写入替换后的内容。
 * 统计项未找到（模式不匹配）时抛错，绝不静默写坏原文件。
 * @param {string} constsPath
 * @param {number} totalWords
 * @returns {boolean} 正常路径恒为 true（已成功更新）
 */
export function updateConstsFile(constsPath, totalWords) {
	const content = readFileSync(constsPath, 'utf-8');
	const formattedWords = totalWords.toLocaleString();
	const replacement = `{ label: "累计字数", value: "${formattedWords}", unit: "字" }`;

	if (!STATS_PATTERN.test(content)) {
		throw new Error(`未在 ${constsPath} 中找到累计字数统计项（期望匹配 ${STATS_PATTERN}），已中止写入`);
	}

	const updatedContent = content.replace(STATS_PATTERN, replacement);
	writeFileAtomic(constsPath, updatedContent);
	return true;
}

/**
 * 主流程: 解析路径 → 校验存在 → 扫描文章 → 统计字数 → 原子更新 consts.ts。
 * 默认 stdout 仅一行最终结果；--verbose 打印明细；--quiet 静默。
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
		const repoPath = resolveCgartlabRepo({
			cliPath: args.repo,
			envPath: process.env.CGARTLAB_REPO,
			scriptDir,
		});

		if (!existsSync(repoPath)) {
			throw new Error(
				`cgartlab.github.io 仓库路径不存在: ${repoPath}。` +
					'可用 --repo <path> 或环境变量 CGARTLAB_REPO 显式指定仓库位置。'
			);
		}

		const postsDir = join(repoPath, ...REPO_POSTS_REL);
		if (!existsSync(postsDir)) {
			throw new Error(`文章目录不存在: ${postsDir}（期望结构 ${REPO_POSTS_REL.join('/')}/）`);
		}

		const postFiles = getPostFiles(postsDir);
		if (postFiles.length === 0) {
			throw new Error(`未在 ${postsDir} 下找到任何文章文件（排除 -en.md 与 _images/_files 目录）`);
		}

		detailLog(`找到 ${postFiles.length} 篇文章`);
		for (const file of postFiles) {
			const relPath = relative(postsDir, file);
			const words = countWords(readFileSync(file, 'utf-8'));
			detailLog(`  ${relPath}: ${words.toLocaleString()} 字`);
		}

		const totalWords = calculateTotalWords(postFiles);
		updateConstsFile(CONSTS_FILE, totalWords);
		finalLog(`累计字数: ${totalWords.toLocaleString()} 字（已更新: ${CONSTS_FILE}）`);
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
