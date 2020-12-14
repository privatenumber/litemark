<template>
	<div
		ref="monacoRef"
		class="monaco-editor"
	/>
</template>

<script>
import * as monaco from 'https://cdn.skypack.dev/pin/monaco-editor@v0.21.2-u7UQTXc50XqDQUVFktmh/min/monaco-editor.js';

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/monaco-editor-skypack-sw.js');
}

export default {
	props: {
		modelValue: {
			type: String,
			required: true,
		},

		language: {
			type: String,
			required: true,
		},

		theme: {
			type: String,
			default: 'vs',
		},
	},

	emits: ['update:modelValue'],

	mounted() {
		window.MonacoEnvironment = {
			baseUrl: 'https://unpkg.com/monaco-editor@0.21.2/min/',
			getWorkerUrl() {
				return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
					importScripts('https://unpkg.com/monaco-editor@0.21.2/min/vs/base/worker/workerMain.js');
				`)}`;
			},
		};

		this.initMonaco();
	},

	methods: {
		initMonaco() {
			const editor = monaco.editor.create(this.$refs.monacoRef, {
				value: this.modelValue,
				language: this.language,
				automaticLayout: true,
				wordWrap: true,
				quickSuggestions: false,
				theme: this.theme,
			});

			editor.onDidChangeModelContent(() => {
				this.$emit('update:modelValue', editor.getValue());
			});
		},
	},
};
</script>

<style scoped>
.monaco-editor {
	width: 100%;
	height: 100%;
	overflow: hidden;
}
</style>
