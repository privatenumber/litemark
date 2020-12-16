import highlightJs from 'https://cdn.skypack.dev/pin/highlight.js@v10.4.1-oEk2335kfyV8Qqf49vGK/mode=raw,min/lib/core';

const langMap = {
	js: 'javascript',
	'html': 'xml',
	'xhtml': 'xml',
	'rss': 'xml',
	'atom': 'xml',
	'xjb': 'xml',
	'xsd': 'xml',
	'xsl': 'xml',
	'plist': 'xml',
	'wsf': 'xml',
	'svg': 'xml',
	'vue': 'xml',
};

async function highlight(lang, code) {
	if (!lang) {
		return code;
	}

	if (langMap[lang]) {
		lang = langMap[lang];
	}

	const { default: langModule } = await import('https://cdn.skypack.dev/highlight.js/lib/languages/' + lang).catch(() => ({}));
	if (langModule) {
		highlightJs.registerLanguage(lang, langModule);
	} else {
		console.log('Failed to load', lang);
	}

	try {
		return highlightJs.highlight(lang, code).value;
	} catch {
		return code;
	}
}

export default highlight;
