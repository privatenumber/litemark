// https://github.com/snowpackjs/snowpack/discussions/1327#discussioncomment-203760

self.addEventListener('activate', event => {
	// Apply on first page load
	event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
	if (event.request.url.endsWith('codicon.ttf')) {
		event.respondWith(
			fetch('https://unpkg.com/monaco-editor@0.21.2/esm/vs/base/browser/ui/codicons/codicon/codicon.ttf'),
		);
	}
});
