import highlightJs from 'highlight.js/lib/core.js';

const langMap = {
	js: 'javascript',
	ts: 'typescript',
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
	sh: 'bash',
};

const languages = {
	javascript: () => import('highlight.js/lib/languages/javascript.js'),
	typescript: () => import('highlight.js/lib/languages/typescript.js'),
	yaml: () => import('highlight.js/lib/languages/yaml.js'),
	json: () => import('highlight.js/lib/languages/json.js'),
	xml: () => import('highlight.js/lib/languages/xml.js'),
	diff: () => import('highlight.js/lib/languages/diff.js'),
	bash: () => import('highlight.js/lib/languages/bash.js'),
};

async function highlight(lang, code) {
	if (!lang) {
		return code;
	}

	if (langMap[lang]) {
		lang = langMap[lang];
	}

	if (!languages[lang]) {
		return code;
	}

	const { default: langModule } = await languages[lang]();

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
