import JSZip from 'jszip';

// DOCX file type validation
export function isValidDocxFile(file: File): boolean {
	return file.name.toLowerCase().endsWith('.docx') || 
		   file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}

// Extract style information from a DOCX file
export async function extractStyleFromDocx(file: File): Promise<{ textContent: string; visualStyle: VisualStyle | null }> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		
		reader.onload = async (e) => {
			try {
				const arrayBuffer = e.target?.result as ArrayBuffer;
				
				// Load the DOCX as a ZIP
				const zip = await JSZip.loadAsync(arrayBuffer);
				
				// Extract text content
				let textContent = '';
				
				// Try to extract from document.xml
				const documentXml = await zip.file('word/document.xml')?.async('string');
				if (documentXml) {
					textContent = extractTextFromXml(documentXml);
				}
				
				// Extract style information
				const visualStyle = await extractVisualStyles(zip);
				
				resolve({ textContent, visualStyle });
			} catch (error) {
				reject(new Error('Failed to parse DOCX file: ' + (error as Error).message));
			}
		};
		
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsArrayBuffer(file);
	});
}

function extractTextFromXml(xml: string): string {
	// Simple XML text extraction
	const textMatches = xml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
	if (!textMatches) return '';
	
	return textMatches
		.map(match => match.replace(/<[^>]*>/g, ''))
		.join(' ')
		.trim();
}

async function extractVisualStyles(zip: JSZip): Promise<VisualStyle | null> {
	try {
		const stylesXml = await zip.file('word/styles.xml')?.async('string');
		const settingsXml = await zip.file('word/settings.xml')?.async('string');
		
		if (!stylesXml) return null;
		
		const fonts = extractFonts(stylesXml);
		const layout = extractLayout(settingsXml);
		
		return { fonts, layout };
	} catch {
		return null;
	}
}

function extractFonts(stylesXml: string): { header: string; body: string } {
	// Extract header font
	const headerFontMatch = stylesXml.match(/<w:rStyle[^>]*w:styleId="[^"]*"[^>]*>([^<]*)<\/w:rStyle>/);
	const bodyFontMatch = stylesXml.match(/<w:rStyle[^>]*w:styleId="[^"]*"[^>]*>([^<]*)<\/w:rStyle>/);
	
	// Try to find specific font names
	const headerFontNameMatch = stylesXml.match(/<w:rFonts[^>]*w:ascii="([^"]*)"/);
	const bodyFontNameMatch = stylesXml.match(/<w:rFonts[^>]*w:ascii="([^"]*)"/);
	
	return {
		header: headerFontNameMatch ? headerFontNameMatch[1] : 'Calibri',
		body: bodyFontNameMatch ? bodyFontNameMatch[1] : 'Calibri'
	};
}

function extractLayout(settingsXml: string | undefined): { 
	orientation: string; 
	margins: { top: number; bottom: number; left: number; right: number };
	hasHeader: boolean;
	hasFooter: boolean;
} {
	if (!settingsXml) {
		return {
			orientation: 'portrait',
			margins: { top: 1, bottom: 1, left: 1, right: 1 },
			hasHeader: false,
			hasFooter: false
		};
	}
	
	// Check for page orientation
	const orientation = settingsXml.includes('<w:orient w:val="landscape"/>') ? 'landscape' : 'portrait';
	
	// Check for headers/footers
	const hasHeader = settingsXml.includes('<w:headerReference');
	const hasFooter = settingsXml.includes('<w:footerReference');
	
	// Default margins
	const margins = { top: 1, bottom: 1, left: 1, right: 1 };
	
	return { orientation, margins, hasHeader, hasFooter };
}

export interface VisualStyle {
	fonts: {
		header: string;
		body: string;
	};
	layout: {
		orientation: string;
		margins: {
			top: number;
			bottom: number;
			left: number;
			right: number;
		};
		hasHeader: boolean;
		hasFooter: boolean;
	};
}
