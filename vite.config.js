import vue from '@vitejs/plugin-vue';

const viteConfig = {
	build: {
		base: '/litemark',
	},
	plugins: [vue()],
};

export default viteConfig;
