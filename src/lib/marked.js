import marked from 'https://cdn.skypack.dev/pin/marked@v1.2.6-VhC1uUH1mBVSJfkyxYzD/min/marked.js';
import pify from 'https://cdn.skypack.dev/pin/pify@v5.0.0-SFaZHgr4au90NrUPzOcV/min/pify.js';
import highlight from './highlight.js';

const highlightJs2github = [
	[/hljs-comment/g, 'pl-c'],
	[/hljs-keyword/g, 'pl-k'],
	[/hljs-name|hljs-attr/g, 'pl-ent'],
	[/hljs-number|hljs-literal/g, 'pl-c1'],
	[/hljs-string/g, 'pl-s'],
	[/hljs-built_in/g, 'pl-smi'],
	[/hljs-addition/g, 'pl-mi1'],
	[/hljs-deletion/g, 'pl-md'],
	[/ class="hljs-tag"/g, ''],
];

marked.use({
	renderer: {
		heading(text, level) {
			const escapedText = text.toLowerCase().replace(/\W+/g, '-');
			return `
			<h${level}>
				<a
					id="${escapedText}"
					class="anchor"
					href="#${escapedText}"
				>
					<span
						aria-hidden="true"
						class="octicon octicon-link"
					></span>
				</a>
				${text}
			</h${level}>
			`;
		},
	},
	async highlight(code, lang, callback) {
		let html = await highlight(lang, code);

		for (const [ptrn, replacement] of highlightJs2github) {
			html = html.replace(ptrn, replacement);
		}

		callback(null, html);
	},
});

export default pify(marked);
