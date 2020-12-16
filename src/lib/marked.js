import marked from 'https://cdn.skypack.dev/pin/marked@v1.2.6-VhC1uUH1mBVSJfkyxYzD/min/marked.js';
import ky from 'https://cdn.skypack.dev/pin/ky@v0.25.1-Vz6hQ384evEQfuYrbaQy/min/ky.js';
import highlight from './highlight.js';

let emojis = {};
const fetchingEmojis = ky('https://api.github.com/emojis').json().then(_emojis => {
	emojis = _emojis;
});

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

const markedWrapped = src => new Promise(async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
	await fetchingEmojis;
	marked(src, {gfm: true}, (err, result) => {
		if (err) {
			return reject(err);
		}

		resolve(result);
	});
});

export default markedWrapped;
