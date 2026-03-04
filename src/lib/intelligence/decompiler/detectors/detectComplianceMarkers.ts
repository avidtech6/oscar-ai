/**
 * Compliance Marker Detector
 * 
 * Detects phrases that indicate compliance with standards, regulations, or best practices.
 */

export function detectComplianceMarkers(text: string): string[] {
	const markers: string[] = [];
	const lowerText = text.toLowerCase();

	// List of compliance‑related phrases
	const compliancePhrases = [
		'bs5837',
		'bs 5837',
		'bs5837:2012',
		'bs 5837:2012',
		'iso',
		'iso 9001',
		'iso 14001',
		'compliance with',
		'in accordance with',
		'meets the requirements',
		'follows the guidelines',
		'standard practice',
		'best practice',
		'regulatory',
		'regulation',
		'statutory',
		'legal requirement',
		'code of practice',
		'industry standard',
		'quality assurance',
		'quality control',
		'audit',
		'certified',
		'accredited',
		'approved',
		'endorsed',
		'validated',
		'verified',
		'conforms to',
		'complies with',
		'adheres to',
		'meets standard',
		'meets specification',
		'meets criteria',
		'risk assessment',
		'health and safety',
		'health & safety',
		'coshh',
		'cdm',
		'construction design',
		'planning permission',
		'local authority',
		'planning policy',
		'national planning',
		'tree preservation order',
		'tpo',
		'conservation area',
		'protected species',
		'wildlife and countryside act',
		'environmental impact',
		'sustainability',
		'carbon neutral',
		'net zero'
	];

	for (const phrase of compliancePhrases) {
		if (lowerText.includes(phrase)) {
			markers.push(phrase);
		}
	}

	// Also detect references to specific sections (e.g., "Section 5.2", "Clause 3.1")
	const sectionRefs = text.match(/(Section|Clause|Paragraph|Article)\s+[\d\.]+/gi);
	if (sectionRefs) {
		markers.push(...sectionRefs);
	}

	// Remove duplicates
	return [...new Set(markers)];
}