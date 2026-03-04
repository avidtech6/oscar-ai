/**
 * List Detector
 * 
 * Detects bullet lists and numbered lists in text.
 */

export interface DetectedList {
	type: 'bullet' | 'numbered';
	items: string[];
	startIndex: number;
	endIndex: number;
}

export function detectLists(text: string): DetectedList[] {
	const lines = text.split('\n');
	const lists: DetectedList[] = [];
	let currentList: DetectedList | null = null;
	let lineStartIndex = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();

		// Check for bullet list item (•, -, *, +)
		const bulletMatch = trimmed.match(/^([•\-*+])\s+(.+)$/);
		// Check for numbered list item (1., 2., etc.)
		const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);

		if (bulletMatch || numberedMatch) {
			const type = bulletMatch ? 'bullet' : 'numbered';
			const itemContent = bulletMatch ? bulletMatch[2] : numberedMatch![2];

			if (!currentList || currentList.type !== type) {
				// Start a new list
				if (currentList) {
					lists.push(currentList);
				}
				currentList = {
					type,
					items: [itemContent],
					startIndex: lineStartIndex,
					endIndex: lineStartIndex + line.length
				};
			} else {
				// Continue existing list
				currentList.items.push(itemContent);
				currentList.endIndex = lineStartIndex + line.length;
			}
		} else {
			// Non-list line, close current list if any
			if (currentList) {
				lists.push(currentList);
				currentList = null;
			}
		}

		lineStartIndex += line.length + 1; // +1 for newline
	}

	// Add the last list if exists
	if (currentList) {
		lists.push(currentList);
	}

	return lists;
}