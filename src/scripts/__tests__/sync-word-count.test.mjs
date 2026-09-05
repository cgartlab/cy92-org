/**
 * sync-word-count.mjs 单元测试（vitest，.mjs ESM 原生支持）
 *
 * 覆盖:
 *   countWords      中文/英文/混合计数口径 + frontmatter 移除
 *   getPostFiles    过滤规则（_images/_files 目录、-en.md、非 .md 文件）
 *   updateConstsFile 原子写入 + 统计项缺失抛错
 *
 * 期望值均为从源码逻辑手算推导（见各用例注释）。
 */
import { describe, it, expect, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { countWords, getPostFiles, updateConstsFile } from '../sync-word-count.mjs';

// ---------------------------------------------------------------- countWords

describe('countWords', () => {
	it('纯中文（含全角标点）: 每个中文字符与全角标点各计 1', () => {
		// 这是一个测试(6) 。(1) 你好(2) ，(1) 世界(2) ！(1) = 13
		expect(countWords('这是一个测试。你好，世界！')).toBe(13);
	});

	it('纯英文: 连续字母算一个单词', () => {
		// Hello world, this is a test. → 6 个单词
		expect(countWords('Hello world, this is a test.')).toBe(6);
	});

	it('中英混合: 中文字符 + 英文单词数相加', () => {
		// 中文: 我在学习(4) 和(1) ，(1) 每天进步一点点(7) 。(1) = 14
		// 英文: JavaScript + TypeScript = 2
		expect(countWords('我在学习 JavaScript 和 TypeScript，每天进步一点点。')).toBe(16);
	});

	it('frontmatter 内容不参与计数', () => {
		// frontmatter 内的 测试 不计数；正文: 正文内容(4) Hello(1) 世界(2) = 7
		const text = '---\ntitle: 测试文章\ndate: 2026-01-01\n---\n正文内容 Hello 世界';
		expect(countWords(text)).toBe(7);
	});

	it('无中文字符且无英文单词时返回 0', () => {
		expect(countWords('')).toBe(0);
		expect(countWords('12345 67890')).toBe(0); // 纯数字不算单词
	});
});

// --------------------------------------------------------------- getPostFiles

describe('getPostFiles', () => {
	let postsDir;

	afterAll(() => {
		if (postsDir) rmSync(postsDir, { recursive: true, force: true });
	});

	it('仅收集 .md 文章，排除 -en.md、非 md 文件与 _images/_files 目录', () => {
		postsDir = mkdtempSync(join(tmpdir(), 'posts-'));
		mkdirSync(join(postsDir, '_images'));
		mkdirSync(join(postsDir, '_files'));
		writeFileSync(join(postsDir, 'a.md'), '这是一篇中文文章。');
		writeFileSync(join(postsDir, 'b-en.md'), 'English post.');
		writeFileSync(join(postsDir, 'c.txt'), 'not markdown');
		writeFileSync(join(postsDir, '_images', 'image.md'), '图片目录里的 md 也应排除');
		writeFileSync(join(postsDir, '_files', 'attachment.md'), '附件目录里的 md 也应排除');

		const files = getPostFiles(postsDir);

		expect(files).toEqual([join(postsDir, 'a.md')]);
	});
});

// ---------------------------------------------------------- updateConstsFile

describe('updateConstsFile', () => {
	let tmpDir;

	afterAll(() => {
		if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
	});

	it('找到累计字数统计项并原子更新为格式化后的新数字，返回 true', () => {
		tmpDir = mkdtempSync(join(tmpdir(), 'consts-'));
		const constsPath = join(tmpDir, 'consts.ts');
		writeFileSync(
			constsPath,
			'export const STATS = { label: "累计字数", value: "170,903", unit: "字" };\n'
		);

		const result = updateConstsFile(constsPath, 12345);

		expect(result).toBe(true);
		const updated = readFileSync(constsPath, 'utf-8');
		// 与源码一致的格式化口径（toLocaleString），避免 locale 分隔符差异
		expect(updated).toContain(`{ label: "累计字数", value: "${(12345).toLocaleString()}", unit: "字" }`);
		expect(updated).not.toContain('170,903');
	});

	it('统计项缺失（模式不匹配）时抛错，且不写坏原文件', () => {
		tmpDir = mkdtempSync(join(tmpdir(), 'consts-missing-'));
		const constsPath = join(tmpDir, 'consts.ts');
		const original = 'export const STATS = { label: "文章数", value: "42", unit: "篇" };\n';
		writeFileSync(constsPath, original);

		expect(() => updateConstsFile(constsPath, 999)).toThrow();
		expect(readFileSync(constsPath, 'utf-8')).toBe(original); // 原文件保持完好
	});
});