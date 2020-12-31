import marked from 'https://cdn.skypack.dev/pin/marked@v1.2.6-VhC1uUH1mBVSJfkyxYzD/min/marked.js';
import emojis from 'https://cdn.skypack.dev/pin/gh-emojis@v1.0.0-bskTbS6n1u16gIfhvfbJ/min/gh-emojis.js';
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

		text(text) {
			text = text.replace(/:([\w+-]+):/g, (fullMatch, emojiId) => {
				const foundEmoji = emojis[emojiId];
				if (foundEmoji) {
					return `
					<img
						class="emoji"
						title="${fullMatch}"
						alt="${fullMatch}"
						src="${foundEmoji}"
						height="20"
						width="20"
						align="absmiddle"
					>`;
				}

				return fullMatch;
			});
			return text;
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

// eslint-disable-next-line no-async-promise-executor
const markedWrapped = source => new Promise(async (resolve, reject) => {
	marked(source, { gfm: true }, (error, result) => {
		if (error) {
			reject(error);
			return;
		}

		resolve(result);
	});
});

export default markedWrapped;
