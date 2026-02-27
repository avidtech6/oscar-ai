import type { PdfExtractedDocument, PdfPage } from './pdfIngest';

/**
 * Convert extracted PDF document to editable HTML
 */
export function convertPdfToHtml(extracted: PdfExtractedDocument): string {
  const { pages, metadata, coverImage } = extracted;
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${metadata.title || 'PDF Document'}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .document {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 40px;
    }
    .cover-image {
      max-width: 100%;
      height: auto;
      margin-bottom: 30px;
      border-radius: 4px;
    }
    .page {
      position: relative;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px dashed #e0e0e0;
    }
    .page:last-child {
      border-bottom: none;
    }
    .page-number {
      position: absolute;
      top: -25px;
      right: 0;
      font-size: 12px;
      color: #999;
    }
    .page-header {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #eee;
    }
    .page-footer {
      font-size: 12px;
      color: #999;
      margin-top: 20px;
      padding-top: 5px;
      border-top: 1px solid #eee;
    }
    .text-block {
      margin-bottom: 8px;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #2c3e50;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    h1 { font-size: 28px; }
    h2 { font-size: 24px; }
    h3 { font-size: 20px; }
    h4 { font-size: 18px; }
    h5 { font-size: 16px; }
    h6 { font-size: 14px; }
    p {
      margin-bottom: 16px;
    }
    .page-break {
      height: 1px;
      border: none;
      border-top: 2px dashed #ccc;
      margin: 40px 0;
    }
    .image-container {
      margin: 20px 0;
      text-align: center;
    }
    .image-container img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .metadata {
      background: #f5f7fa;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .metadata-item {
      margin-bottom: 5px;
    }
    .metadata-label {
      font-weight: 600;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="document">
`;

  // Add cover image if available
  if (coverImage) {
    html += `
    <div class="cover-image-container">
      <img src="${coverImage}" alt="Cover" class="cover-image" />
    </div>`;
  }

  // Add metadata
  html += `
    <div class="metadata">
      <div class="metadata-item"><span class="metadata-label">Title:</span> ${metadata.title || 'Untitled'}</div>
      ${metadata.author ? `<div class="metadata-item"><span class="metadata-label">Author:</span> ${metadata.author}</div>` : ''}
      ${metadata.creationDate ? `<div class="metadata-item"><span class="metadata-label">Created:</span> ${metadata.creationDate}</div>` : ''}
      <div class="metadata-item"><span class="metadata-label">Pages:</span> ${pages.length}</div>
    </div>`;

  // Add pages
  pages.forEach((page, index) => {
    html += convertPageToHtml(page, index + 1);
    
    // Add page break except after last page
    if (index < pages.length - 1) {
      html += '\n    <hr class="page-break" />\n';
    }
  });

  html += `
  </div>
</body>
</html>`;

  return html;
}

/**
 * Convert a single PDF page to HTML
 */
function convertPageToHtml(page: PdfPage, pageNumber: number): string {
  let html = `\n    <div class="page" data-page="${pageNumber}">`;
  html += `\n      <div class="page-number">Page ${pageNumber}</div>`;
  
  // Add header if detected
  if (page.header) {
    html += `\n      <div class="page-header">${escapeHtml(page.header)}</div>`;
  }
  
  // Group text blocks by y-position to form paragraphs
  const paragraphs = groupTextBlocksIntoParagraphs(page.textBlocks);
  
  // Convert paragraphs to HTML
  paragraphs.forEach(paragraph => {
    if (paragraph.length === 0) return;
    
    // Check if this looks like a heading
    const isHeading = detectIfHeading(paragraph);
    const text = paragraph.map(block => block.text).join(' ');
    
    if (isHeading === 'h1') {
      html += `\n      <h1>${escapeHtml(text)}</h1>`;
    } else if (isHeading === 'h2') {
      html += `\n      <h2>${escapeHtml(text)}</h2>`;
    } else if (isHeading === 'h3') {
      html += `\n      <h3>${escapeHtml(text)}</h3>`;
    } else {
      html += `\n      <p class="text-block">${escapeHtml(text)}</p>`;
    }
  });
  
  // Add images
  page.images.forEach(image => {
    html += `\n      <div class="image-container">
        <img src="${image.dataUrl}" alt="Page ${pageNumber} image" />
      </div>`;
  });
  
  // Add footer if detected
  if (page.footer) {
    html += `\n      <div class="page-footer">${escapeHtml(page.footer)}</div>`;
  }
  
  html += '\n    </div>';
  return html;
}

/**
 * Group text blocks into paragraphs based on y-position proximity
 */
function groupTextBlocksIntoParagraphs(textBlocks: any[]): any[][] {
  if (textBlocks.length === 0) return [];
  
  // Sort by y position (top to bottom)
  const sorted = [...textBlocks].sort((a, b) => b.y - a.y);
  const paragraphs: any[][] = [];
  let currentParagraph: any[] = [];
  let lastY = sorted[0]?.y || 0;
  
  sorted.forEach(block => {
    // If this block is significantly lower than the previous one, start new paragraph
    if (lastY - block.y > 20) { // 20px threshold
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph);
      }
      currentParagraph = [block];
    } else {
      currentParagraph.push(block);
    }
    lastY = block.y;
  });
  
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph);
  }
  
  return paragraphs;
}

/**
 * Detect if a paragraph looks like a heading
 */
function detectIfHeading(paragraph: any[]): 'h1' | 'h2' | 'h3' | null {
  if (paragraph.length === 0) return null;
  
  const firstBlock = paragraph[0];
  const text = paragraph.map(block => block.text).join(' ');
  
  // Check font size (heuristic)
  if (firstBlock.fontSize > 20) return 'h1';
  if (firstBlock.fontSize > 16) return 'h2';
  if (firstBlock.fontSize > 14) return 'h3';
  
  // Check text length and formatting
  if (text.length < 100 && (text.toUpperCase() === text || text.endsWith(':'))) {
    return 'h2';
  }
  
  return null;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}