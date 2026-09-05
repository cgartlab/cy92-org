/**
 * 字数统计同步脚本
 * 
 * 从 cgartlab.github.io 仓库的文章内容计算总字数，并同步到 cy92-org 的 consts.ts
 * 
 * 使用方法:
 * npx tsx src/scripts/sync-word-count.ts [--dry-run]
 * 
 * 说明:
 * - 跨平台路径解析见 PR #34（本 PR 关注原子写入，路径仍用同 PR 修好的路径）
 * - consts.ts 通过 temp-file + fsync + rename 原子替换，避免中途崩溃留下半截文件
 * - 新增 --dry-run 只报告不写盘，便于 CI 预览
 */

import { readFileSync, writeFileSync, openSync, fsyncSync, closeSync, renameSync, unlinkSync, statSync } from 'fs';
import { globSync } from 'glob';
import { join, relative, dirname } from 'path';

// 配置
const CGARTLAB_REPO = 'D:\\github-repos\\cgartlab.github.io';
const CY92_CONSTS_FILE = 'D:\\github-repos\\cy92-org\\src\\consts.ts';
const POSTS_DIR = join(CGARTLAB_REPO, 'src', 'content', 'posts');

// 用法: npx tsx src/scripts/sync-word-count.ts [--dry-run]
const DRY_RUN = process.argv.slice(2).includes('--dry-run');

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
 * 获取所有文章文件路径
 */
function getPostFiles(): string[] {
	const pattern = join(POSTS_DIR, '**/*.md');
	const files = globSync(pattern, {
		ignore: [
			'**/*-en.md',  // 排除英文版
			'**/_images/**',
			'**/_files/**',
		]
	});
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
 * 更新 cy92-org 的 consts.ts 中的字数统计（原子写入）
 * 1) 生成新内容，校验替换真正发生（regex 命中）
 * 2) 写临时文件（consts.ts.<pid>.tmp），fsync 落盘
 * 3) rename 覆盖目标文件（POSIX/Windows 都是原子操作）
 * 4) 失败时清理临时文件
 */
function updateConstsFile(totalWords: number): void {
	const content = readFileSync(CY92_CONSTS_FILE, 'utf-8');
	const formattedWords = totalWords.toLocaleString();
	const replacement = `{ label: "累计字数", value: "${formattedWords}", unit: "字" }`;

	// 1) 生成新内容 + 校验替换真正发生（否则 regex 不匹配时会静默回写旧内容）
	const updatedContent = content.replace(
		/\{ label: "累计字数", value: "[\d,]+", unit: "字" \}/,
		replacement
	);
	if (updatedContent === content) {
		throw new Error(
			`consts.ts 中未找到「累计字数」条目，未做写入（避免把 consts 写空/写坏）`
		);
	}

	// --dry-run: 只打印不写盘
	if (DRY_RUN) {
		console.log(`\n[dry-run] 目标文件: ${CY92_CONSTS_FILE}`);
		console.log(`[dry-run] 累计字数: ${formattedWords} 字`);
		console.log('[dry-run] 已跳过写入');
		return;
	}

	// 2) 同目录 tmp（rename 跨目录可能非原子）
	const dir = dirname(CY92_CONSTS_FILE);
	const tmpPath = join(dir, `consts.ts.${process.pid}.tmp`);
	try {
		writeFileSync(tmpPath, updatedContent, 'utf-8');
		// 3) fsync：保证 tmp 真的落盘（CI kill -9 也不丢）
		const fd = openSync(tmpPath, 'r');
		fsyncSync(fd);
		closeSync(fd);
		// 4) rename：原子覆盖
		renameSync(tmpPath, CY92_CONSTS_FILE);
	} catch (err) {
		// 清理 tmp，主 consts 保持原状
		try { if (statSync(tmpPath).isFile()) unlinkSync(tmpPath); } catch { /* best-effort */ }
		throw err;
	}

	console.log(`\n已更新 ${CY92_CONSTS_FILE}`);
	console.log(`累计字数: ${formattedWords} 字`);
}

// 主函数
function main() {
	console.log(DRY_RUN ? '开始同步字数统计（--dry-run）...\n' : '开始同步字数统计...\n');
	
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
