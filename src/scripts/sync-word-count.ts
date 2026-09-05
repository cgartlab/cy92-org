/**
 * 字数统计同步脚本
 * 
 * 从 cgartlab.github.io 仓库的文章内容计算总字数，并同步到 cy92-org 的 consts.ts
 * 
 * 使用方法:
 * npx tsx src/scripts/sync-word-count.ts
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// 路径解析：优先级 env var > 脚本自身位置推导
// 与 AGENTS.md 描述的 workspace 布局一致（../cgartlab.github.io 作为 cy92-org 的同级 sibling）
function resolvePaths() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const cy92Default = resolve(scriptDir, '..', '..');
  const cy92 = process.env.CY92_REPO_DIR ?? cy92Default;
  const cgartlab = process.env.CGARTLAB_REPO_DIR ?? join(cy92, '..', 'cgartlab.github.io');
  return {
    cgartlab: resolve(cgartlab),
    cy92: resolve(cy92),
    posts: join(resolve(cgartlab), 'src', 'content', 'posts'),
    consts: join(resolve(cy92), 'src', 'consts.ts'),
  };
}
const { posts: POSTS_DIR, consts: CY92_CONSTS_FILE } = resolvePaths();

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`Usage: npx tsx ${process.argv[1]} [options]

Env vars (override defaults):
  CGARTLAB_REPO_DIR   cgartlab.github.io repo root (default: ../cgartlab.github.io relative to cy92-org repo)
  CY92_REPO_DIR       cy92-org repo root (default: two levels up from this script)

Defaults match the workspace layout described in AGENTS.md.
`);
  process.exit(0);
}

/**
 * 计算文本字数
 * 中文字符、标点符号和英文单词每个计为一个字符
 */
function countWords(text: string): number {
	// 移除 frontmatter
	const cleanText = text.replace(/^---[\s\S]*?---/, '');
	
	// 计算中文字符（包括中文字符和标点符号）
	const chineseChars = cleanText.match(/[\u4E00-\u9FA5\u3000-\u303F\uFF00-\uFFEF]/g) || [];
	
	// 计算英文单词
	const englishWords = cleanText.match(/[a-z]+/gi) || [];
	
	return chineseChars.length + englishWords.length;
}

/**
 * 递归获取所有文章 .md 文件路径
 * 排除 _images / _files 目录和 -en.md 英文版本
 *
 * 用 readdirSync 递归实现，避免引入额外 glob 依赖（原实现 import 'glob' 依赖 tsx 解析器
 * 从 Astro 内部传递依赖中解析，独立运行不稳定；见 issue #24 相关讨论）。
 */
function getPostFiles(dir: string = POSTS_DIR): string[] {
	const files: string[] = [];
	const items = readdirSync(dir);

	for (const item of items) {
		const fullPath = join(dir, item);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			if (item !== '_images' && item !== '_files') {
				files.push(...getPostFiles(fullPath));
			}
		} else if (extname(item) === '.md') {
			if (!item.endsWith('-en.md')) {
				files.push(fullPath);
			}
		}
	}

	return files;
}

/**
 * 计算所有文章的总字数
 */
function calculateTotalWords(): number {
	const files = getPostFiles();
	let totalWords = 0;
	
	console.log(`找到 ${files.length} 篇文章`);
	
	for (const file of files) {
		const content = readFileSync(file, 'utf-8');
		const words = countWords(content);
		totalWords += words;
		const relPath = relative(POSTS_DIR, file);
		console.log(`  ${relPath}: ${words.toLocaleString()} 字`);
	}
	
	return totalWords;
}

/**
 * 更新 cy92-org 的 consts.ts 中的字数统计
 */
function updateConstsFile(totalWords: number): void {
	const content = readFileSync(CY92_CONSTS_FILE, 'utf-8');
	const formattedWords = totalWords.toLocaleString();
	
	// 替换 STATS 数组中的累计字数
	const updatedContent = content.replace(
		/\{ label: "累计字数", value: "[\d,]+", unit: "字" \}/,
		`{ label: "累计字数", value: "${formattedWords}", unit: "字" }`
	);
	
	writeFileSync(CY92_CONSTS_FILE, updatedContent, 'utf-8');
	console.log(`\n已更新 ${CY92_CONSTS_FILE}`);
	console.log(`累计字数: ${formattedWords} 字`);
}

// 主函数
function main() {
	console.log('开始同步字数统计...\n');
	
	try {
		const totalWords = calculateTotalWords();
		updateConstsFile(totalWords);
		console.log('\n同步完成！');
	} catch (error) {
		console.error('同步失败:', error);
		process.exit(1);
	}
}

main();
