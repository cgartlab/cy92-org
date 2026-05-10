/**
 * 字数统计同步脚本
 * 
 * 从 cgartlab.github.io 仓库的文章内容计算总字数，并同步到 cy92-org 的 consts.ts
 * 
 * 使用方法:
 * node src/scripts/sync-word-count.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';

// 配置
const CGARTLAB_REPO = 'D:\\github-repos\\cgartlab.github.io';
const CY92_CONSTS_FILE = 'D:\\github-repos\\cy92-org\\src\\consts.ts';
const POSTS_DIR = join(CGARTLAB_REPO, 'src', 'content', 'posts');

/**
 * 计算文本字数
 * 中文字符、标点符号和英文单词每个计为一个字符
 */
function countWords(text) {
	// 移除 frontmatter
	const cleanText = text.replace(/^---[\s\S]*?---/, '');
	
	// 计算中文字符（包括中文字符和标点符号）
	const chineseChars = cleanText.match(/[\u4E00-\u9FA5\u3000-\u303F\uFF00-\uFFEF]/g) || [];
	
	// 计算英文单词
	const englishWords = cleanText.match(/[a-z]+/gi) || [];
	
	return chineseChars.length + englishWords.length;
}

/**
 * 递归获取所有文章文件路径
 */
function getPostFiles(dir) {
	const files = [];
	const items = readdirSync(dir);
	
	for (const item of items) {
		const fullPath = join(dir, item);
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
 * 计算所有文章的总字数
 */
function calculateTotalWords() {
	const files = getPostFiles(POSTS_DIR);
	let totalWords = 0;
	
	console.log(`找到 ${files.length} 篇文章\n`);
	
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
function updateConstsFile(totalWords) {
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
