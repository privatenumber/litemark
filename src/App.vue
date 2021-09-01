<template>
	<split-view>
		<template #A>
			<div
				class="editor"
				@dragenter="isDragging = true"
			>
				<upload-drop-zone
					v-if="isDragging"
					@dragleave="isDragging = false"
					@drop-file="onDropFile"
				/>

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
						<token-input
							v-model="state.githubToken"
							class="token-input"
							placeholder="GitHub token"
						/>

						{{ formatNumber(rateLimit.remaining) }}/{{ formatNumber(rateLimit.limit) }}
					</div>
				</div>
				<monaco-editor
					ref="monaco"
					v-model="state.markdownSource"
					language="markdown"
					theme="vs-dark"
				/>
			</div>
		</template>
		<template #B>
			<div class="preview">
				<spinner
					v-if="isLoading"
					class="spinner-container"
				/>
				<iframe
					ref="previewFrame"
					srcdoc="<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css'><link rel='stylesheet' href='https://unpkg.com/highlight.js@10.4.1/styles/github-gist.css'><base target='_blank'><style>.markdown-body{ padding: 32px }</style><div class='markdown-body'></div>"
					@load.once="renderMarkdown"
				/>
			</div>
		</template>
	</split-view>
</template>

<script>
import pDebounce from 'p-debounce';
import ky from 'ky';
import LRU from 'lru-cache';
import SplitView from 'vue-split-view'; // Loads CSS file -- easier to let Vite handle it
import marked from './lib/marked.js';
import MonacoEditor from './components/MonacoEditor.vue';
import Spinner from './components/Spinner.vue';
import TokenInput from './components/TokenInput.vue';
import UploadDropZone from './components/UploadDropZone.vue';

const cache = new LRU({
	max: 1000,
});

export default {
	components: {
		MonacoEditor,
		Spinner,
		TokenInput,
		UploadDropZone,
		SplitView,
	},

	data() {
		return {
			isDragging: false,
			isLoading: false,
			rateLimit: {
				remaining: 0,
				limit: 0,
			},
			state: JSON.parse(window.localStorage.getItem('state')) || {
				markdownSource: '# 🖋 Welcome to Litemark\nLitemark is a GitHub Flavored Markdown editor.\n\nEdit your markdown on the left for it to be rendered on the right!\n',
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
		'state.markdownSource': 'renderMarkdown',
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
		formatNumber(string) {
			return Number(string).toLocaleString();
		},

		onDropFile(file) {
			this.isDragging = false;

			if (file.type.startsWith('image')) {
				this.$refs.monaco.insertToCaret(`<img src="${URL.createObjectURL(file)}" alt="${file.name}">`);
			}
		},

		async renderMarkdown() {
			const markdownSource = this.state.markdownSource.trim();
			const cacheKey = this.cachePrefix + markdownSource;

			let markdownCompiledHtml = cache.get(cacheKey);
			if (!markdownCompiledHtml) {
				this.isLoading = true;
				markdownCompiledHtml = this.state.useGithubApi
					? (await this.getGithubMarkdown(markdownSource))
					: (await marked(markdownSource));
				this.isLoading = false;

				cache.set(cacheKey, markdownCompiledHtml);
			}

			this.setIframeHtml(markdownCompiledHtml);
		},

		setIframeHtml(html) {
			this.$refs.previewFrame.contentWindow.document.body.firstChild.innerHTML = html;
		},

		async getGithubMarkdown(text) {
			let response;
			try {
				response = await ky.post('https://api.github.com/markdown', {
					headers: {
						...(
							this.state.githubToken
								? { Authorization: `token ${this.state.githubToken}` }
								: {}
						),
					},
					json: { text },
				});

				this.rateLimit.remaining = response.headers.get('x-ratelimit-remaining');
				this.rateLimit.limit = response.headers.get('x-ratelimit-limit');

				return await response.text();
			} catch (error) {
				// eslint-disable-next-line no-console
				console.warn(error);
				return `Failed with error: ${error.message}`;
			}
		},
	},
};
</script>

<style>
* {
	box-sizing: border-box;
}

html, body {
	height: 100%;
	margin: 0;
}

#app {
	height: 100%;
}
</style>

<style scoped>
a {
	color: inherit;
}

.editor {
	height: 100%;
	position: relative;
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
	height: 100%;
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
