let html2pdf: any = null;

async function ensureHtml2Pdf() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!html2pdf) {
    const module = await import('html2pdf.js');
    html2pdf = module.default;
  }
  
  return html2pdf;
}

/**
 * Export HTML content to PDF using html2pdf.js
 */
export async function exportHtmlToPdf(html: string, filename: string = 'document.pdf'): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('PDF export is only available in browser environment');
  }
  
  return new Promise(async (resolve, reject) => {
    try {
      const html2pdf = await ensureHtml2Pdf();
      if (!html2pdf) {
        throw new Error('html2pdf.js library failed to load');
      }
      
      // Create a temporary div with the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      
      // Configure html2pdf options
      const options = {
        margin: 15,
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: {
          unit: 'mm' as const,
          format: 'a4' as const,
          orientation: 'portrait' as const
        }
      };
      
      // Generate PDF
      html2pdf()
        .from(tempDiv)
        .set(options)
        .toPdf()
        .get('pdf')
        .then((pdf: any) => {
          // Remove temporary div
          document.body.removeChild(tempDiv);
          
          // Convert to Blob
          const pdfBlob = pdf.output('blob');
          resolve(pdfBlob);
        })
        .catch((error: Error) => {
          document.body.removeChild(tempDiv);
          reject(new Error(`PDF generation failed: ${error.message}`));
        });
    } catch (error) {
      reject(new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}

/**
 * Export HTML content to PDF and trigger download
 */
export async function downloadHtmlAsPdf(html: string, filename: string = 'document.pdf'): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('PDF download is only available in browser environment');
  }
  
  try {
    const blob = await exportHtmlToPdf(html, filename);
    
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
    console.error('Failed to download PDF:', error);
    throw error;
  }
}

/**
 * Simple fallback PDF generation for when html2pdf fails
 */
export function generateSimplePdf(html: string): Blob {
  if (typeof window === 'undefined') {
    // Return empty blob for SSR
    return new Blob([''], { type: 'application/pdf' });
  }
  
  // Create a simple text-based PDF using data URI
  const text = extractTextFromHtml(html);
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/Contents 5 0 R
>>
endobj
4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
5 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(${text.substring(0, 50)}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000106 00000 n
0000000179 00000 n
0000000234 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
295
%%EOF`;
  
  return new Blob([pdfContent], { type: 'application/pdf' });
}

/**
 * Extract plain text from HTML for simple PDF fallback
 */
function extractTextFromHtml(html: string): string {
  if (typeof window === 'undefined') {
    return '';
  }
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}