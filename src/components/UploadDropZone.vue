<template>
	<div
		class="upload-drop-zone"
		@drop="onDrop"
		@dragover.prevent
	>
		<div
			class="dotted-container"
		>
			Drop to upload
		</div>
	</div>
</template>

<script>
export default {
	methods: {
		onDrop(ev) {
			ev.preventDefault();

			if (ev.dataTransfer.items) {
				for (let item of ev.dataTransfer.items) {
					const file = item.getAsFile();
					this.$emit('drop-file', file);
				}
			} else {
				console.log(ev.dataTransfer.files);
			}

		},
	},
};
</script>

<style scoped>
.upload-drop-zone {
	position: absolute;
	width: 100%;
	height: 100%;
	z-index: 1;
	padding: 32px;
	opacity: .5;
}

.dotted-container {
	display: grid;
	place-items: center;
	pointer-events: none;
	width: 100%;
	height: 100%;
	border: 8px dashed #fff;
	border-radius: 32px;
	background-color: rgba(255, 255, 255, 0.1);

	color: #fff;
	font-family: system-ui;
	text-transform: uppercase;
	font-size: 24px;
	font-weight: bold;
	letter-spacing: 2px;
}
</style>
