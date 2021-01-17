import vue from '@vitejs/plugin-vue';
import got from 'got';

const viteConfig = {
	build: {
		base: '/litemark',
	},
	plugins: [
		vue(),
		{
			name: 'skypack',
			async resolveId(id) {
				if (!id.startsWith('skypack://')) {
					return null;
				}

				const { headers } = await got(`https://cdn.skypack.dev/${id.slice(10)}`);
				if (headers['x-import-status'] !== 'SUCCESS') {
					return null;
				}

				return {
					id: `https://cdn.skypack.dev${headers['x-pinned-url']}`,
					external: true,
				};
			},
		},
	],
};

export default viteConfig;
