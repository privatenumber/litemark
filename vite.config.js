import vue from '@vitejs/plugin-vue';

const viteConfig = {
	base: '/litemark',
	assetsDir: 'assets',
	plugins: [vue()],
};

export default viteConfig;
