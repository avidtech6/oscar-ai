/**
 * Table Detector
 * 
 * Detects simple text‑based tables (rows separated by lines, columns separated by pipes or tabs).
 */

export interface DetectedTable {
	rows: string[][];
	startIndex: number;
	endIndex: number;
}

export function detectTables(text: string): DetectedTable[] {
	const lines = text.split('\n');
	const tables: DetectedTable[] = [];
	let currentTable: DetectedTable | null = null;
	let lineStartIndex = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();

		// Check if line looks like a table row (contains multiple columns separated by | or tabs)
		const isTableRow = isLikelyTableRow(trimmed);

		if (isTableRow) {
			const columns = parseTableRow(trimmed);
			if (!currentTable) {
				// Start a new table
				currentTable = {
					rows: [columns],
					startIndex: lineStartIndex,
					endIndex: lineStartIndex + line.length
				};
			} else {
				// Add row to existing table
				currentTable.rows.push(columns);
				currentTable.endIndex = lineStartIndex + line.length;
			}
		} else {
			// Non‑table line, close current table if any
			if (currentTable) {
				// Ensure table has at least 2 rows (header + data) or at least 2 columns
				if (currentTable.rows.length >= 1 && currentTable.rows[0].length >= 2) {
					tables.push(currentTable);
				}
				currentTable = null;
			}
		}

		lineStartIndex += line.length + 1;
	}

	// Add the last table if exists
	if (currentTable && currentTable.rows.length >= 1 && currentTable.rows[0].length >= 2) {
		tables.push(currentTable);
	}

	return tables;
}

function isLikelyTableRow(line: string): boolean {
	// Empty line is not a table row
	if (!line) return false;

	// Check for pipe‑separated columns
	if (line.includes('|') && line.split('|').length > 2) {
		return true;
	}

	// Check for tab‑separated columns (at least two tabs)
	if (line.includes('\t') && line.split('\t').length > 2) {
		return true;
	}

	// Check for consistent spacing that suggests columns (simple heuristic)
	const words = line.split(/\s{2,}/); // two or more spaces
	if (words.length >= 2 && words.every(w => w.length > 0)) {
		// Ensure not just a normal sentence
		const totalLength = line.length;
		const spaceCount = (line.match(/\s{2,}/g) || []).length;
		if (spaceCount >= 1 && totalLength > 20) {
			return true;
		}
	}

	return false;
}

function parseTableRow(line: string): string[] {
	// Pipe‑separated
	if (line.includes('|')) {
		return line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
	}

	// Tab‑separated
	if (line.includes('\t')) {
		return line.split('\t').map(cell => cell.trim());
	}

	// Space‑separated (two or more spaces)
	return line.split(/\s{2,}/).map(cell => cell.trim());
}