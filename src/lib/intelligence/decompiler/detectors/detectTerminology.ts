/**
 * Terminology Detector
 * 
 * Extracts domain‑specific terminology from report text.
 * Focuses on capitalized phrases, technical terms, and repeated keywords.
 */

export function detectTerminology(text: string): string[] {
	const words = text.split(/\W+/).filter(w => w.length > 0);
	const terminology = new Set<string>();

	// 1. Capitalized multi‑word phrases (Title Case)
	const lines = text.split('\n');
	for (const line of lines) {
		const matches = line.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g);
		if (matches) {
			matches.forEach(phrase => terminology.add(phrase.trim()));
		}
	}

	// 2. Technical abbreviations (all caps, 2‑5 letters)
	const abbrevMatches = text.match(/\b[A-Z]{2,5}\b/g);
	if (abbrevMatches) {
		abbrevMatches.forEach(abbr => terminology.add(abbr));
	}

	// 3. Words that appear frequently (simple frequency count)
	const wordCount: Record<string, number> = {};
	words.forEach(w => {
		const lower = w.toLowerCase();
		wordCount[lower] = (wordCount[lower] || 0) + 1;
	});

	// Filter words that appear at least 3 times and are longer than 4 characters
	Object.entries(wordCount).forEach(([word, count]) => {
		if (count >= 3 && word.length > 4 && !isCommonWord(word)) {
			terminology.add(word);
		}
	});

	// 4. Known arboricultural terms (static list)
	const knownTerms = [
		'arboriculture', 'arboricultural', 'BS5837', 'tree survey', 'tree condition',
		'risk assessment', 'method statement', 'impact assessment', 'mitigation',
		'retention', 'removal', 'protection', 'crown', 'root', 'stem', 'canopy',
		'phytophthora', 'fungal', 'decay', 'structural', 'hazard', 'safety'
	];
	knownTerms.forEach(term => {
		if (text.toLowerCase().includes(term.toLowerCase())) {
			terminology.add(term);
		}
	});

	return Array.from(terminology).slice(0, 50); // Limit to top 50 terms
}

function isCommonWord(word: string): boolean {
	const common = new Set([
		'the', 'and', 'for', 'that', 'with', 'this', 'from', 'have', 'were', 'which',
		'will', 'their', 'there', 'about', 'would', 'should', 'could', 'when', 'what',
		'where', 'who', 'whom', 'whose', 'been', 'also', 'into', 'over', 'under',
		'between', 'through', 'during', 'before', 'after', 'above', 'below', 'since',
		'until', 'while', 'because', 'although', 'however', 'therefore', 'thus',
		'hence', 'nevertheless', 'moreover', 'furthermore', 'otherwise', 'instead',
		'likewise', 'similarly', 'consequently', 'accordingly', 'otherwise'
	]);
	return common.has(word.toLowerCase());
}