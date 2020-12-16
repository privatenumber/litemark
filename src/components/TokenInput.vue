<template>
	<input
		:value="modelValue"
		:type="tokenFocused ? 'text' : 'password'"
		@focus="tokenFocused = true"
		@blur="tokenFocused = false"
		@input="$emit('update:modelValue', $event.target.value)"
	>
</template>

<script>
export default {
	props: {
		modelValue: {
			type: String,
			required: true,
		},
	},

	emits: ['update:modelValue'],

	data() {
		return {
			tokenFocused: false,
		};
	},
};
</script>
