module.exports = {
	extends: [
		'plugin:vue/vue3-recommended',
	],
	extensions: ['vue'],
	rules: {
		'comma-dangle': [
			'error',
			'always-multiline',
		],
		'import/extensions': ['error', 'always'],
	},
	overrides: [
		{
			files: 'public/*-sw.js',
			env: 'serviceworker',
		},
		{
			files: '**/*.vue',
			rules: {
				'unicorn/filename-case': ['error', {case: 'pascalCase'}],
				'vue/html-indent': ['error', 'tab'],
				'import/no-anonymous-default-export': 'off',
			},
		},
	],
};
