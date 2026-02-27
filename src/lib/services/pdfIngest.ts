// Browser-only imports - must be guarded
let pdfjsLib: any = null;
let PDFDocument: any = null;

async function ensurePdfLibs() {
  if (typeof window === 'undefined') {
    return { pdfjsLib: null, PDFDocument: null };
  }
  
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    // Configure pdfjs worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  
  if (!PDFDocument) {
    const pdfLibModule = await import('pdf-lib');
    PDFDocument = pdfLibModule.PDFDocument;
  }
  
  return { pdfjsLib, PDFDocument };
}

export interface TextBlock {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
}

export interface PdfImage {
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfPage {
  pageNumber: number;
  textBlocks: TextBlock[];
  images: PdfImage[];
  header: string | null;
  footer: string | null;
  width: number;
  height: number;
}

export interface PdfExtractedDocument {
  pages: PdfPage[];
  metadata: {
    title: string;
    author: string;
    creationDate: string;
    pageCount: number;
    [key: string]: any;
  };
  coverImage: string | null;
}

/**
 * Extract PDF content using pdf.js and pdf-lib
 */
export async function extractPdf(file: File): Promise<PdfExtractedDocument> {
  try {
    // Ensure we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF extraction is only available in browser environment');
    }
    
    const { pdfjsLib, PDFDocument } = await ensurePdfLibs();
    if (!pdfjsLib || !PDFDocument) {
      throw new Error('PDF libraries failed to load');
    }
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF with pdf.js
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    
    // Extract metadata with pdf-lib
    const pdfLibDoc = await PDFDocument.load(arrayBuffer);
    const subject = pdfLibDoc.getSubject();
    const metadata = {
      title: pdfLibDoc.getTitle() || file.name.replace('.pdf', ''),
      author: pdfLibDoc.getAuthor() || '',
      creationDate: pdfLibDoc.getCreationDate()?.toString() || '',
      pageCount,
      ...(subject ? { subject } : {})
    };
    
    // Extract pages
    const pages: PdfPage[] = [];
    let coverImage: string | null = null;
    
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Extract text content
      const textContent = await page.getTextContent();
      const textBlocks: TextBlock[] = textContent.items.map((item: any) => ({
        text: item.str,
        x: item.transform[4],
        y: viewport.height - item.transform[5],
        width: item.width,
        height: item.height,
        fontSize: item.transform[0],
        fontName: item.fontName
      }));
      
      // Extract images (simplified - pdf.js doesn't easily extract images)
      const images: PdfImage[] = [];
      
      // Detect header/footer (simple heuristic: text near top/bottom)
      const header = detectHeader(textBlocks, viewport.height);
      const footer = detectFooter(textBlocks, viewport.height);
      
      pages.push({
        pageNumber: i,
        textBlocks,
        images,
        header,
        footer,
        width: viewport.width,
        height: viewport.height
      });
      
      // Extract cover image from first page
      if (i === 1) {
        coverImage = await extractCoverImage(page, viewport);
      }
    }
    
    return {
      pages,
      metadata,
      coverImage
    };
  } catch (error) {
    console.error('Error extracting PDF:', error);
    throw new Error(`Failed to extract PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Simple header detection: text blocks near the top of the page
 */
function detectHeader(textBlocks: TextBlock[], pageHeight: number): string | null {
  const headerBlocks = textBlocks.filter(block => block.y > pageHeight - 100);
  if (headerBlocks.length === 0) return null;
  
  // Group by y position and find most common header text
  const headerText = headerBlocks
    .map(block => block.text.trim())
    .filter(text => text.length > 0)
    .join(' ');
  
  return headerText || null;
}

/**
 * Simple footer detection: text blocks near the bottom of the page
 */
function detectFooter(textBlocks: TextBlock[], pageHeight: number): string | null {
  const footerBlocks = textBlocks.filter(block => block.y < 100);
  if (footerBlocks.length === 0) return null;
  
  const footerText = footerBlocks
    .map(block => block.text.trim())
    .filter(text => text.length > 0)
    .join(' ');
  
  return footerText || null;
}

/**
 * Extract cover image from first page
 */
async function extractCoverImage(page: any, viewport: any): Promise<string | null> {
  try {
    // Create canvas to render page
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    
    // Convert to data URL
    return canvas.toDataURL('image/jpeg', 0.7);
  } catch (error) {
    console.warn('Failed to extract cover image:', error);
    return null;
  }
}

/**
 * Convert PDF to base64 string
 */
export async function pdfToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:application/pdf;base64, prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}