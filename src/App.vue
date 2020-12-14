<template>
	<div class="app">
		<div class="editor">
			<div class="settings">
				<label>
					<input
						v-model="state.useGithubApi"
						type="checkbox"
					>
					Use GitHub API
					<a
						href="https://developer.github.com/v3/markdown/"
						target="_blank"
					>
						[?]
					</a>
				</label>

				<div v-if="state.useGithubApi">
					<input
						v-model="state.githubToken"
						class="token-input"
						:type="tokenFocused ? 'text' : 'password'"
						placeholder="GitHub token"
						@focus="tokenFocused = true"
						@blur="tokenFocused = false"
					>

					{{ Number(rateLimit.remaining).toLocaleString() }}/{{ Number(rateLimit.limit).toLocaleString() }}
				</div>
			</div>
			<monaco-editor
				v-model="state.markdownSrc"
				language="markdown"
				theme="vs-dark"
			/>
		</div>
		<div class="preview">
			<spinner
				v-if="isLoading"
				class="spinner-container"
			/>
			<iframe
				ref="previewFrame"
				srcdoc="<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css'><style>.markdown-body{ padding: 32px }</style><div class='markdown-body'></div>"
				@load.once="renderMarkdown"
			/>
		</div>
	</div>
</template>

<script>
import pDebounce from 'https://cdn.skypack.dev/pin/p-debounce@v2.1.0-LRRtmDORx9LZe70mcYjZ/min/p-debounce.js';
import ky from 'https://cdn.skypack.dev/pin/ky@v0.25.1-Vz6hQ384evEQfuYrbaQy/min/ky.js';
import LRU from 'https://cdn.skypack.dev/pin/lru-cache@v6.0.0-IF3dXOIuVvZ6NoDdLuhR/min/lru-cache.js';
import marked from 'https://cdn.skypack.dev/pin/marked@v1.2.6-VhC1uUH1mBVSJfkyxYzD/min/marked.js';
import MonacoEditor from './components/MonacoEditor.vue';
import Spinner from './components/Spinner.vue';

const cache = new LRU({
	max: 1000,
});

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
});

export default {
	components: {
		MonacoEditor,
		Spinner,
	},

	data() {
		return {
			isLoading: false,
			tokenFocused: false,
			rateLimit: {
				remaining: 0,
				limit: 0,
			},
			state: JSON.parse(window.localStorage.getItem('state')) || {
				markdownSrc: '# 🖋 Welcome to Litemark\nLitemark is a GitHub Flavored Markdown editor.\n\nEdit your markdown on the left for it to be rendered on the right!\n',
				useGithubApi: false,
				githubToken: '',
			},
		};
	},

	computed: {
		cachePrefix() {
			return this.state.useGithubApi ? 'github' : 'marked';
		},
	},

	watch: {
		'state.markdownSrc': 'renderMarkdown',
		'state.useGithubApi': 'renderMarkdown',
		state: {
			handler(state) {
				window.localStorage.setItem('state', JSON.stringify(state));
			},
			deep: true,
		},
	},

	created() {
		this.getGithubMarkdown = pDebounce(this.getGithubMarkdown, 500);
	},

	methods: {
		async renderMarkdown() {
			const markdownSrc = this.state.markdownSrc.trim();
			const cacheKey = this.cachePrefix + markdownSrc;

			let markdownCompiledHtml = cache.get(cacheKey);
			if (!markdownCompiledHtml) {
				markdownCompiledHtml = this.state.useGithubApi ? (await this.getGithubMarkdown(markdownSrc)) : marked(markdownSrc, {
					gfm: true,
				});
				cache.set(cacheKey, markdownCompiledHtml);
			}

			this.setIframeHtml(markdownCompiledHtml);
		},

		setIframeHtml(html) {
			this.$refs.previewFrame.contentWindow.document.body.firstChild.innerHTML = html;
		},

		async getGithubMarkdown(text) {
			this.isLoading = true;
			let response;
			try {
				response = await ky.post('https://api.github.com/markdown', {
					headers: {

						...(this.state.githubToken ? {
							Authorization: `token ${this.state.githubToken}`,
						} : {}),
					},
					json: {text},
				});

				this.rateLimit.remaining = response.headers.get('x-ratelimit-remaining');
				this.rateLimit.limit = response.headers.get('x-ratelimit-limit');

				return await response.text();
			} catch (error) {
				console.log(error);
				return `Failed with error: ${error.message}`;
			} finally {
				this.isLoading = false;
			}
		},
	},
};
</script>

<style>
* {
	box-sizing: border-box;
}
body {
	margin: 0;
}
</style>

<style scoped>
a {
	color: inherit;
}

.app {
	display: flex;
	height: 100vh;
}

.editor {
	width: 50vw;
	display: flex;
	flex-direction: column;
}

.settings {
	font-size: 12px;
	padding: 16px;
	background-color: #1e1e1e;
	font-family: system-ui;
	color: #fff;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.token-input {
	font-size: 12px;
	padding: 0 4px;
	margin-right: 8px;
}

.preview {
	width: 50vw;
}

.spinner {
	position: absolute;
	top: 24px;
	right: 24px;
	width: 24px;
	height: 24px;
}

.preview iframe {
	border: none;
	width: 100%;
	height: 100%;
}
</style>
