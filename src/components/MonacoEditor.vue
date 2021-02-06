<template>
	<div
		ref="monacoRef"
		class="monaco-editor"
	/>
</template>

<script>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';

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
