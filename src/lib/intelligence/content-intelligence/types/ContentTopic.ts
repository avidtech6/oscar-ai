/**
 * Content Topic – a topic that can be turned into a blog post.
 */

export interface ContentTopic {
	id: string;
	title: string;
	category: string;
	priority: number; // 1‑10
	brandId: string;
	keywords: string[];
	lastUsed: string | null;
	timestamps: {
		created: string;
		updated: string;
	};
}