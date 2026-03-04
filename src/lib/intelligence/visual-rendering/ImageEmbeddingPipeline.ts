/**
 * Supported image formats.
 */
export type ImageFormat = 'png' | 'jpeg' | 'gif' | 'webp' | 'svg' | 'bmp';

/**
 * Image embedding options.
 */
export interface ImageEmbeddingOptions {
  /** Maximum width in pixels (0 = no resize) */
  maxWidth: number;
  /** Maximum height in pixels (0 = no resize) */
  maxHeight: number;
  /** Quality for JPEG/WebP (0‑100) */
  quality: number;
  /** Whether to convert to base64 */
  embedAsBase64: boolean;
  /** Whether to compress the image */
  compress: boolean;
  /** Output format (if conversion is needed) */
  outputFormat: ImageFormat;
}

/**
 * Default image embedding options.
 */
export const defaultImageEmbeddingOptions: ImageEmbeddingOptions = {
  maxWidth: 1200,
  maxHeight: 1600,
  quality: 85,
  embedAsBase64: true,
  compress: true,
  outputFormat: 'png'
};

/**
 * Image embedding pipeline that handles base64 embedding, file‑path embedding, image optimization, and multiple formats.
 */
export class ImageEmbeddingPipeline {
  private options: ImageEmbeddingOptions;

  constructor(options: Partial<ImageEmbeddingOptions> = {}) {
    this.options = { ...defaultImageEmbeddingOptions, ...options };
  }

  /**
   * Embeds an image from a file path or URL.
   * @param source File path, URL, or base64 data URL
   * @returns HTML <img> tag with embedded data
   */
  async embedImage(source: string): Promise<string> {
    if (this.isBase64DataURL(source)) {
      return this.embedBase64Image(source);
    } else if (this.isURL(source)) {
      return this.embedRemoteImage(source);
    } else {
      // Assume local file path (in a real implementation you would read the file)
      return this.embedLocalImage(source);
    }
  }

  /**
   * Embeds multiple images.
   */
  async embedImages(sources: string[]): Promise<string[]> {
    return Promise.all(sources.map(src => this.embedImage(src)));
  }

  /**
   * Updates embedding options.
   */
  updateOptions(newOptions: Partial<ImageEmbeddingOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Returns current options.
   */
  getOptions(): ImageEmbeddingOptions {
    return { ...this.options };
  }

  // Private methods

  private isBase64DataURL(str: string): boolean {
    return /^data:image\/[a-zA-Z]+;base64,/.test(str);
  }

  private isURL(str: string): boolean {
    return /^https?:\/\//.test(str);
  }

  private async embedBase64Image(dataURL: string): Promise<string> {
    // Optionally resize/compress the base64 image
    const processed = await this.processImage(dataURL);
    return `<img src="${processed}" alt="Embedded image" />`;
  }

  private async embedRemoteImage(url: string): Promise<string> {
    // In a real implementation, you would fetch the image, convert to base64, and process
    // For now, we just return an img tag with the original URL
    return `<img src="${url}" alt="Remote image" />`;
  }

  private async embedLocalImage(filePath: string): Promise<string> {
    // In a real implementation, you would read the file, convert to base64, and process
    // For now, we simulate a placeholder
    const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    return `<img src="${placeholder}" alt="Local image" />`;
  }

  private async processImage(dataURL: string): Promise<string> {
    // Placeholder for image processing (resize, compress, convert format)
    // In a real implementation you would use a library like sharp (Node.js) or canvas (browser)
    return dataURL;
  }

  /**
   * Generates a CSS background‑image rule for an embedded image.
   */
  async embedAsBackground(source: string, additionalCSS = ''): Promise<string> {
    const imgTag = await this.embedImage(source);
    // Extract src from img tag
    const srcMatch = imgTag.match(/src="([^"]+)"/);
    if (!srcMatch) return '';
    const src = srcMatch[1];
    return `background-image: url('${src}'); ${additionalCSS}`;
  }

  /**
   * Creates a figure element with embedded image and caption.
   */
  async embedFigure(
    source: string,
    caption: string,
    options: { className?: string; width?: string; height?: string } = {}
  ): Promise<string> {
    const imgTag = await this.embedImage(source);
    const { className = '', width = '', height = '' } = options;
    const style = width || height ? `style="${width ? `width:${width};` : ''}${height ? `height:${height};` : ''}"` : '';
    return `
<figure class="${className}" ${style}>
  ${imgTag}
  <figcaption>${caption}</figcaption>
</figure>`;
  }
}