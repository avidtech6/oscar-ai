/**
 * Metadata Detector
 * 
 * Extracts metadata from report text, such as author, date, version, client, project reference, etc.
 */

export interface ExtractedMetadata {
	author?: string;
	date?: string;
	version?: string;
	client?: string;
	projectReference?: string;
	documentId?: string;
	keywords?: string[];
}

export function detectMetadata(text: string): ExtractedMetadata {
	const metadata: ExtractedMetadata = {};
	const lines = text.split('\n').slice(0, 30); // Look only at the beginning

	// Common patterns
	for (const line of lines) {
		const trimmed = line.trim();

		// Author pattern: "Author:", "Prepared by:", "By:"
		const authorMatch = trimmed.match(/^(Author|Prepared by|By)\s*[:‑]\s*(.+)$/i);
		if (authorMatch && !metadata.author) {
			metadata.author = authorMatch[2].trim();
		}

		// Date pattern: "Date:", "Created:", "Issued:"
		const dateMatch = trimmed.match(/^(Date|Created|Issued|Report Date)\s*[:‑]\s*(.+)$/i);
		if (dateMatch && !metadata.date) {
			metadata.date = dateMatch[2].trim();
		}

		// Version pattern: "Version:", "Rev:", "v1.0"
		const versionMatch = trimmed.match(/^(Version|Rev|Revision)\s*[:‑]\s*(.+)$/i) ||
			trimmed.match(/\b(v\d+\.\d+\.?\d*)\b/i);
		if (versionMatch && !metadata.version) {
			metadata.version = versionMatch[2] ? versionMatch[2].trim() : versionMatch[1];
		}

		// Client pattern: "Client:", "For:", "Prepared for:"
		const clientMatch = trimmed.match(/^(Client|For|Prepared for)\s*[:‑]\s*(.+)$/i);
		if (clientMatch && !metadata.client) {
			metadata.client = clientMatch[2].trim();
		}

		// Project reference pattern: "Project:", "Ref:", "Job No:"
		const projectMatch = trimmed.match(/^(Project|Ref|Job No|Reference)\s*[:‑]\s*(.+)$/i);
		if (projectMatch && !metadata.projectReference) {
			metadata.projectReference = projectMatch[2].trim();
		}

		// Document ID pattern: "Document ID:", "Doc No:"
		const docIdMatch = trimmed.match(/^(Document ID|Doc No|Document Number)\s*[:‑]\s*(.+)$/i);
		if (docIdMatch && !metadata.documentId) {
			metadata.documentId = docIdMatch[2].trim();
		}
	}

	// Extract keywords from first few lines (simple heuristic)
	const firstBlock = lines.slice(0, 10).join(' ');
	const words = firstBlock.split(/\W+/).filter(w => w.length > 3);
	const commonKeywords = ['report', 'survey', 'assessment', 'method', 'statement', 'analysis', 'review', 'evaluation'];
	metadata.keywords = words.filter(w => commonKeywords.some(k => w.toLowerCase().includes(k.toLowerCase()))).slice(0, 5);

	return metadata;
}