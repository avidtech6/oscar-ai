let pdfjsLib: any = null;

async function ensurePdfJs() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    // Set the worker source for PDF.js
    // Using CDN for the worker to avoid build configuration issues
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  
  return pdfjsLib;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('PDF extraction is only available in browser environment');
    }
    
    const pdfjsLib = await ensurePdfJs();
    if (!pdfjsLib) {
      throw new Error('PDF.js library failed to load');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF. Please try a different file.');
  }
}

export function isValidPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}
