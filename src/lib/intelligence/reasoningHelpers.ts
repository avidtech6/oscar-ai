/**
 * Helper functions for the Reasoning Engine
 */

/**
 * Infer query type from natural language
 */
export function inferQueryType(query: string): 'phase' | 'workflow' | 'report' | 'general' {
	const phaseKeywords = ['phase', 'file', 'architecture', 'intelligence', 'layer', 'blueprint'];
	const workflowKeywords = ['workflow', 'process', 'step', 'pipeline', 'procedure'];
	const reportKeywords = ['report', 'type', 'engine', 'template', 'schema', 'classification'];
	
	const queryWords = query.split(/\s+/);
	
	const phaseMatches = queryWords.filter(word => phaseKeywords.includes(word)).length;
	const workflowMatches = queryWords.filter(word => workflowKeywords.includes(word)).length;
	const reportMatches = queryWords.filter(word => reportKeywords.includes(word)).length;
	
	if (phaseMatches > workflowMatches && phaseMatches > reportMatches) return 'phase';
	if (workflowMatches > phaseMatches && workflowMatches > reportMatches) return 'workflow';
	if (reportMatches > phaseMatches && reportMatches > workflowMatches) return 'report';
	
	return 'general';
}

/**
 * Calculate match score between query and text fields
 */
export function calculateMatchScore(query: string, fields: string[]): number {
	if (!query || fields.length === 0) return 0;
	
	const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
	if (queryWords.length === 0) return 0;
	
	let totalScore = 0;
	
	for (const field of fields) {
		const fieldLower = field.toLowerCase();
		let fieldScore = 0;
		
		for (const word of queryWords) {
			if (fieldLower.includes(word)) {
				fieldScore += 0.3; // Base score for word match
				
				// Bonus for exact phrase match
				if (fieldLower.includes(query.toLowerCase())) {
					fieldScore += 0.4;
				}
				
				// Bonus for word at beginning
				if (fieldLower.startsWith(word)) {
					fieldScore += 0.2;
				}
			}
		}
		
		// Normalize by word count
		if (queryWords.length > 0) {
			fieldScore = Math.min(1, fieldScore / queryWords.length);
		}
		
		totalScore = Math.max(totalScore, fieldScore);
	}
	
	return Math.min(1, totalScore);
}