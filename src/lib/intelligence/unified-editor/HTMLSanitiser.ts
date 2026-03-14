/**
 * HTML Sanitiser – cleans HTML for safe rendering and storage.
 */

export interface SanitiseOptions {
    allowImages: boolean;
    allowLinks: boolean;
    allowTables: boolean;
    allowStyles: boolean;
    maxImageSize?: number;
    allowedClasses: string[];
}

/**
 * HTML Sanitiser – removes unsafe HTML while preserving structure.
 */
export class HTMLSanitiser {
    private options: SanitiseOptions;

    constructor(options: Partial<SanitiseOptions> = {}) {
        this.options = {
            allowImages: options.allowImages ?? true,
            allowLinks: options.allowLinks ?? true,
            allowTables: options.allowTables ?? true,
            allowStyles: options.allowStyles ?? false,
            maxImageSize: options.maxImageSize ?? 5 * 1024 * 1024, // 5 MB
            allowedClasses: options.allowedClasses ?? [],
        };
    }

    /**
     * Sanitise HTML string.
     */
    sanitise(html: string): string {
        // Very basic sanitisation – in a real implementation you would use DOMPurify or similar
        let cleaned = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/data:/gi, '');

        if (!this.options.allowImages) {
            cleaned = cleaned.replace(/<img[^>]*>/gi, '');
        }

        if (!this.options.allowLinks) {
            cleaned = cleaned.replace(/<a[^>]*>/gi, '');
            cleaned = cleaned.replace(/<\/a>/gi, '');
        }

        if (!this.options.allowTables) {
            cleaned = cleaned.replace(/<table[^>]*>/gi, '');
            cleaned = cleaned.replace(/<\/table>/gi, '');
            cleaned = cleaned.replace(/<tr[^>]*>/gi, '');
            cleaned = cleaned.replace(/<\/tr>/gi, '');
            cleaned = cleaned.replace(/<td[^>]*>/gi, '');
            cleaned = cleaned.replace(/<\/td>/gi, '');
            cleaned = cleaned.replace(/<th[^>]*>/gi, '');
            cleaned = cleaned.replace(/<\/th>/gi, '');
        }

        if (!this.options.allowStyles) {
            cleaned = cleaned.replace(/style="[^"]*"/gi, '');
            cleaned = cleaned.replace(/<style[^>]*>.*?<\/style>/gi, '');
        }

        // Remove disallowed classes
        if (this.options.allowedClasses.length > 0) {
            cleaned = cleaned.replace(/class="([^"]*)"/gi, (match, classes) => {
                const allowed = classes.split(' ').filter((cls: string) => this.options.allowedClasses.includes(cls)).join(' ');
                return allowed ? `class="${allowed}"` : '';
            });
        }

        return cleaned.trim();
    }

    /**
     * Validate an image URL.
     */
    validateImageUrl(url: string): boolean {
        if (!this.options.allowImages) return false;
        // Basic URL validation
        try {
            const parsed = new URL(url);
            const allowedProtocols = ['http:', 'https:', 'data:'];
            if (!allowedProtocols.includes(parsed.protocol)) return false;
            // Check file extension
            const ext = parsed.pathname.split('.').pop()?.toLowerCase();
            const allowedExt = ['jpg', 'jpeg', png', 'gif', 'webp', 'svg'];
            if (ext && !allowedExt.includes(ext)) return false;
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate a link URL.
     */
    validateLinkUrl(url: string): boolean {
        if (!this.options.allowLinks) return false;
        try {
            const parsed = new URL(url);
            const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
            return allowedProtocols.includes(parsed.protocol);
        } catch {
            return false;
        }
    }

    /**
     * Strip all HTML tags, leaving plain text.
     */
    stripTags(html: string): string {
        return html.replace(/<[^>]*>/g, '');
    }

    /**
     * Escape HTML entities.
     */
    escape(html: string): string {
        return html
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
}
