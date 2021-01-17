<template>
	<div
		ref="monacoRef"
		class="monaco-editor"
	/>
</template>

<script>
import * as monaco from 'skypack://monaco-editor';

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register(`${import.meta.env.BASE_URL}monaco-editor-skypack.sw.js`);
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
			this.editor = monaco.editor.create(this.$refs.monacoRef, {
				value: this.modelValue,
				language: this.language,
				theme: this.theme,
				automaticLayout: true,
				wordWrap: true,
				quickSuggestions: false,
			});

			this.editor.updateOptions({
				tabSize: 4,
			});

			this.editor.onDidChangeModelContent(() => {
				this.$emit('update:modelValue', this.editor.getValue());
			});
		},

		insertToCaret(text) {
			const { editor } = this;

			editor.executeEdits('', [{
				range: editor.getSelection(),
				text,
				forceMoveMarkers: true,
			}]);
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
