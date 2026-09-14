import { describe, expect, it } from 'vitest';
import { extractReferences } from '../check-links.mjs';

describe('extractReferences', () => {
	it('ignores references inside comments, script tags, and style tags', () => {
		const html = `
			<!-- <a href="/commented"> </a> -->
			<a href="/valid">valid</a>
			<script>
				const href = '/scripted';
			</script>
			<style>
				background: url('/styled');
			</style>
		`;

		expect(extractReferences(html)).toEqual(['/valid']);
	});

	it('ignores script references when the closing tag uses invalid whitespace or attributes', () => {
		const html = `
			<a href="/valid">valid</a>
			<script src="/script-src">
				const href = '/scripted';
			</script\t\n data="x">
		`;

		expect(extractReferences(html)).toEqual(['/valid']);
	});

	it('ignores style references when the closing tag uses invalid whitespace or attributes', () => {
		const html = `
			<img src="/valid.png" />
			<style media="all">
				background: url('/styled');
			</style\t\n data="x">
		`;

		expect(extractReferences(html)).toEqual(['/valid.png']);
	});
});
