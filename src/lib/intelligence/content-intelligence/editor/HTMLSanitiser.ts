/**
 * HTML Sanitiser – ensures clean, safe HTML output for WordPress and social media.
 */

const ALLOWED_TAGS = [
	'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
	'p', 'br', 'hr',
	'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
	'ul', 'ol', 'li',
	'blockquote', 'q', 'cite',
	'a',
	'img',
	'figure', 'figcaption',
	'table', 'thead', 'tbody', 'tr', 'th', 'td',
	'code', 'pre', 'kbd', 'samp',
	'mark', 'small', 'abbr', 'dfn',
	'del', 'ins',
	'div', 'span',
	'video', 'audio', 'source', 'track',
	'iframe', // allowed with strict src validation
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
	a: ['href', 'title', 'target', 'rel'],
	img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
	video: ['src', 'controls', 'width', 'height', 'poster', 'preload'],
	audio: ['src', 'controls', 'preload'],
	iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
	table: ['border', 'cellpadding', 'cellspacing'],
	td: ['colspan', 'rowspan'],
	th: ['colspan', 'rowspan'],
	'*': ['class', 'id', 'style', 'data-*'],
};

const FORBIDDEN_STYLES = [
	'position',
	'z-index',
	'display',
	'visibility',
	'opacity',
	'filter',
	'transform',
	'transition',
	'animation',
];

/**
 * Sanitise HTML string.
 */
export function sanitiseHTML(html: string): string {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	sanitiseNode(doc.body);
	return doc.body.innerHTML;
}

/**
 * Recursively sanitise a DOM node.
 */
function sanitiseNode(node: Node) {
	if (node.nodeType === Node.ELEMENT_NODE) {
		const el = node as HTMLElement;
		const tagName = el.tagName.toLowerCase();

		// Remove forbidden tags
		if (!ALLOWED_TAGS.includes(tagName)) {
			node.parentNode?.removeChild(node);
			return;
		}

		// Remove forbidden attributes
		const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || [];
		const globalAttrs = ALLOWED_ATTRIBUTES['*'] || [];
		const allAllowed = [...allowedAttrs, ...globalAttrs];
		for (let i = el.attributes.length - 1; i >= 0; i--) {
			const attr = el.attributes[i];
			const attrName = attr.name.toLowerCase();
			if (!isAttributeAllowed(attrName, allAllowed)) {
				el.removeAttribute(attr.name);
			} else if (attrName === 'style') {
				sanitiseStyle(el);
			} else if (attrName === 'href' || attrName === 'src') {
				sanitiseURL(el, attrName, attr.value);
			}
		}

		// Recursively sanitise children
		for (let i = el.childNodes.length - 1; i >= 0; i--) {
			sanitiseNode(el.childNodes[i]);
		}
	}
}

/**
 * Check if an attribute is allowed.
 */
function isAttributeAllowed(name: string, allowed: string[]): boolean {
	if (allowed.includes(name)) return true;
	if (name.startsWith('data-') && allowed.includes('data-*')) return true;
	return false;
}

/**
 * Sanitise style attribute.
 */
function sanitiseStyle(el: HTMLElement) {
	const style = el.getAttribute('style');
	if (!style) return;
	const styles = style.split(';').map(s => s.trim()).filter(Boolean);
	const allowedStyles: string[] = [];
	for (const rule of styles) {
		const [prop, value] = rule.split(':').map(s => s.trim());
		if (!prop || !value) continue;
		const propLower = prop.toLowerCase();
		if (FORBIDDEN_STYLES.includes(propLower)) continue;
		// Allow safe CSS properties
		if (/^[a-z-]+$/.test(propLower) && !propLower.startsWith('--')) {
			allowedStyles.push(`${prop}: ${value}`);
		}
	}
	if (allowedStyles.length > 0) {
		el.setAttribute('style', allowedStyles.join('; '));
	} else {
		el.removeAttribute('style');
	}
}

/**
 * Sanitise URL attributes (href, src).
 */
function sanitiseURL(el: HTMLElement, attrName: string, url: string) {
	try {
		const parsed = new URL(url, window.location.origin);
		const protocol = parsed.protocol;
		// Allow http, https, mailto, tel, relative URLs
		if (!['http:', 'https:', 'mailto:', 'tel:', 'data:'].includes(protocol)) {
			el.removeAttribute(attrName);
			return;
		}
		// For iframe src, restrict to trusted domains
		if (el.tagName.toLowerCase() === 'iframe') {
			const allowedDomains = [
				'youtube.com',
				'youtu.be',
				'vimeo.com',
				'soundcloud.com',
				'google.com',
				'maps.google.com',
			];
			const hostname = parsed.hostname;
			if (!allowedDomains.some(domain => hostname.endsWith(domain))) {
				el.removeAttribute('src');
			}
		}
		// Set sanitised URL
		el.setAttribute(attrName, parsed.toString());
	} catch {
		// Invalid URL, remove attribute
		el.removeAttribute(attrName);
	}
}

/**
 * Strip all HTML tags, leaving plain text.
 */
export function stripHTML(html: string): string {
	const div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent || div.innerText || '';
}

/**
 * Truncate HTML to a given character limit while preserving tag balance.
 */
export function truncateHTML(html: string, maxLength: number): string {
	if (html.length <= maxLength) return html;
	const stripped = stripHTML(html);
	if (stripped.length <= maxLength) return stripped.substring(0, maxLength) + '…';
	// Simple truncation (not perfect but works for basic cases)
	let length = 0;
	let result = '';
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	const walk = (node: Node) => {
		if (length >= maxLength) return;
		if (node.nodeType === Node.TEXT_NODE) {
			const text = node.textContent || '';
			const remaining = maxLength - length;
			if (text.length <= remaining) {
				result += text;
				length += text.length;
			} else {
				result += text.substring(0, remaining) + '…';
				length = maxLength;
			}
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			const el = node as HTMLElement;
			result += `<${el.tagName.toLowerCase()}>`;
			for (const child of Array.from(el.childNodes)) {
				walk(child);
				if (length >= maxLength) break;
			}
			result += `</${el.tagName.toLowerCase()}>`;
		}
	};
	walk(doc.body);
	return result;
}