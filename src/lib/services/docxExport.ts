import { Document, Paragraph, TextRun, Packer, HeadingLevel } from 'docx';

/**
 * Export HTML content to DOCX format
 */
export async function exportHtmlToDocx(html: string, filename: string = 'document.docx'): Promise<Blob> {
  try {
    // Convert HTML to DOCX paragraphs
    const paragraphs = convertHtmlToParagraphs(html);
    
    // Create DOCX document
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    });
    
    // Generate Blob
    const buffer = await Packer.toBlob(doc);
    return buffer;
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error(`Failed to export DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export HTML content to DOCX and trigger download
 */
export async function downloadHtmlAsDocx(html: string, filename: string = 'document.docx'): Promise<void> {
  try {
    const blob = await exportHtmlToDocx(html, filename);
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Error downloading DOCX:', error);
    throw error;
  }
}

/**
 * Convert HTML to DOCX paragraphs
 */
function convertHtmlToParagraphs(html: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Extract text content and structure
  const walker = document.createTreeWalker(
    tempDiv,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    null
  );
  
  let currentNode: Node | null;
  const nodes: Node[] = [];
  
  while ((currentNode = walker.nextNode())) {
    nodes.push(currentNode);
  }
  
  // Process nodes into paragraphs
  let currentParagraph: TextRun[] = [];
  
  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        currentParagraph.push(new TextRun(text));
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      
      // Handle paragraph breaks
      if (tagName === 'p' || tagName === 'div' || tagName === 'br') {
        if (currentParagraph.length > 0) {
          paragraphs.push(new Paragraph({ children: currentParagraph }));
          currentParagraph = [];
        }
      }
      
      // Handle headings
      if (tagName.match(/^h[1-6]$/)) {
        if (currentParagraph.length > 0) {
          paragraphs.push(new Paragraph({ children: currentParagraph }));
          currentParagraph = [];
        }
        
        const headingLevel = parseInt(tagName.charAt(1));
        const headingText = element.textContent?.trim();
        if (headingText) {
          paragraphs.push(new Paragraph({
            text: headingText,
            heading: getHeadingLevel(headingLevel)
          }));
        }
      }
    }
  }
  
  // Add any remaining text
  if (currentParagraph.length > 0) {
    paragraphs.push(new Paragraph({ children: currentParagraph }));
  }
  
  // If no paragraphs were created, add a default one
  if (paragraphs.length === 0) {
    paragraphs.push(new Paragraph({
      children: [new TextRun('Document content')]
    }));
  }
  
  return paragraphs;
}

/**
 * Map HTML heading level to DOCX heading level
 */
function getHeadingLevel(htmlLevel: number): (typeof HeadingLevel)[keyof typeof HeadingLevel] {
  switch (htmlLevel) {
    case 1: return HeadingLevel.HEADING_1;
    case 2: return HeadingLevel.HEADING_2;
    case 3: return HeadingLevel.HEADING_3;
    case 4: return HeadingLevel.HEADING_4;
    case 5: return HeadingLevel.HEADING_5;
    case 6: return HeadingLevel.HEADING_6;
    default: return HeadingLevel.HEADING_3;
  }
}

/**
 * Simple fallback DOCX generation
 */
export function generateSimpleDocx(text: string): Blob {
  // Create a simple DOCX with just the text
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun(text.substring(0, 1000))]
        })
      ]
    }]
  });
  
  // Return a placeholder Blob (actual generation would require Packer)
  return new Blob([text], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}