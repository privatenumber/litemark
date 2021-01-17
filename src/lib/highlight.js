import highlightJs from 'skypack://highlight.js/lib/core.js';

const langMap = {
	js: 'javascript',
	html: 'xml',
	xhtml: 'xml',
	rss: 'xml',
	atom: 'xml',
	xjb: 'xml',
	xsd: 'xml',
	xsl: 'xml',
	plist: 'xml',
	wsf: 'xml',
	svg: 'xml',
	vue: 'xml',
};

async function highlight(lang, code) {
	if (!lang) {
		return code;
	}

	if (langMap[lang]) {
		lang = langMap[lang];
	}

	const { default: langModule } = await import(/* @vite-ignore */`https://cdn.skypack.dev/highlight.js/lib/languages/${lang}`).catch(() => ({}));
	if (langModule) {
		highlightJs.registerLanguage(lang, langModule);
	} else {
		// eslint-disable-next-line no-console
		console.warn('Failed to load', lang);
	}

	try {
		return highlightJs.highlight(lang, code).value;
	} catch {
		return code;
	}
}

export default highlight;
