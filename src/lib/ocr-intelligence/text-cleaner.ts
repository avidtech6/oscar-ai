/**
 * Text Cleaner for Oscar AI Phase Compliance Package
 * 
 * This file implements the TextCleaner class for the OCR & Table Extraction Layer.
 * It implements Phase 29.5: OCR & Table Extraction Layer from the OCR Intelligence System.
 * 
 * File: src/lib/ocr-intelligence/text-cleaner.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

import type {
  CleanedText,
  TextCleanerConfig
} from './ocr-types.js';

/**
 * Text cleaner for cleaning and normalizing extracted text
 * 
 * Supports:
 * - Whitespace normalization
 * - Punctuation removal
 * - Special character removal
 * - Text normalization
 * - HTML tag removal
 */
export class TextCleaner {
  private config: TextCleanerConfig;

  constructor(config: TextCleanerConfig = {}) {
    this.config = this.normalizeConfig(config);
  }

  /**
   * Normalize and validate configuration
   */
  private normalizeConfig(config: TextCleanerConfig): TextCleanerConfig {
    return {
      removeExtraWhitespace: config.removeExtraWhitespace ?? true,
      trimWhitespace: config.trimWhitespace ?? true,
      removePunctuation: config.removePunctuation ?? false,
      removeSpecialChars: config.removeSpecialChars ?? false,
      normalizeLineEndings: config.normalizeLineEndings ?? true,
      toLowerCase: config.toLowerCase ?? false,
      removeNumbers: config.removeNumbers ?? false,
      removeUrls: config.removeUrls ?? false,
      removeEmails: config.removeEmails ?? false,
      removeHtmlTags: config.removeHtmlTags ?? false,
      removeControlChars: config.removeControlChars ?? true,
      replaceMultipleSpaces: config.replaceMultipleSpaces ?? true,
      preserveLineBreaks: config.preserveLineBreaks ?? false
    };
  }

  /**
   * Clean text according to configuration
   * 
   * @param text - Text to clean
   * @param options - Additional cleaner options
   * @returns Promise resolving to cleaned text result
   */
  public async clean(
    text: string,
    options?: Partial<TextCleanerConfig>
  ): Promise<CleanedText> {
    const config = this.normalizeConfig({ ...this.config, ...options });
    const startTime = performance.now();

    const warnings: string[] = [];
    const originalText = text;

    try {
      // Remove HTML tags if enabled
      if (config.removeHtmlTags) {
        text = this.removeHtmlTags(text);
      }

      // Remove control characters if enabled
      if (config.removeControlChars) {
        text = this.removeControlCharacters(text);
      }

      // Remove URLs if enabled
      if (config.removeUrls) {
        text = this.removeUrls(text);
        warnings.push('URLs removed');
      }

      // Remove emails if enabled
      if (config.removeEmails) {
        text = this.removeEmails(text);
        warnings.push('Emails removed');
      }

      // Remove numbers if enabled
      if (config.removeNumbers) {
        text = this.removeNumbers(text);
      }

      // Convert to lowercase if enabled
      if (config.toLowerCase) {
        text = text.toLowerCase();
      }

      // Normalize line endings if enabled
      if (config.normalizeLineEndings) {
        text = this.normalizeLineEndings(text);
      }

      // Remove punctuation if enabled
      if (config.removePunctuation) {
        text = this.removePunctuation(text);
      }

      // Remove special characters if enabled
      if (config.removeSpecialChars) {
        text = this.removeSpecialCharacters(text);
      }

      // Replace multiple spaces with single space if enabled
      if (config.replaceMultipleSpaces) {
        text = this.replaceMultipleSpaces(text);
      }

      // Trim whitespace if enabled
      if (config.trimWhitespace) {
        text = text.trim();
      }

      // Calculate statistics
      const statistics = this.calculateStatistics(originalText, text);

      const processingTime = performance.now() - startTime;

      return {
        original: originalText,
        cleaned: text,
        statistics,
        warnings,
        success: true
      };

    } catch (error) {
      const processingTime = performance.now() - startTime;
      return {
        original: originalText,
        cleaned: '',
        statistics: this.calculateStatistics(originalText, ''),
        warnings: [`Cleaning failed: ${error instanceof Error ? error.message : String(error)}`],
        success: false
      };
    }
  }

  /**
   * Remove HTML tags from text
   */
  private removeHtmlTags(text: string): string {
    return text.replace(/<[^>]*>/g, '');
  }

  /**
   * Remove control characters from text
   */
  private removeControlCharacters(text: string): string {
    return text.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  }

  /**
   * Remove URLs from text
   */
  private removeUrls(text: string): string {
    return text.replace(/https?:\/\/[^\s]+/g, '');
  }

  /**
   * Remove emails from text
   */
  private removeEmails(text: string): string {
    return text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
  }

  /**
   * Remove numbers from text
   */
  private removeNumbers(text: string): string {
    return text.replace(/\d+/g, '');
  }

  /**
   * Remove punctuation from text
   */
  private removePunctuation(text: string): string {
    return text.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '');
  }

  /**
   * Remove special characters from text
   */
  private removeSpecialCharacters(text: string): string {
    return text.replace(/[^\w\s]/g, '');
  }

  /**
   * Normalize line endings to Windows format
   */
  private normalizeLineEndings(text: string): string {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  /**
   * Replace multiple spaces with single space
   */
  private replaceMultipleSpaces(text: string): string {
    return text.replace(/\s+/g, ' ');
  }

  /**
   * Calculate cleaning statistics
   */
  private calculateStatistics(
    original: string,
    cleaned: string
  ): CleanedText['statistics'] {
    const originalLength = original.length;
    const cleanedLength = cleaned.length;
    const whitespaceRemoved = originalLength - cleanedLength;

    return {
      originalLength,
      cleanedLength,
      characterCount: cleanedLength,
      wordCount: this.countWords(cleaned),
      lineCount: this.countLines(cleaned),
      whitespaceRemoved,
      punctuationRemoved: this.countPunctuation(original),
      numbersRemoved: this.countNumbers(original)
    };
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    if (!text || text.trim().length === 0) {
      return 0;
    }
    return text.trim().split(/\s+/).length;
  }

  /**
   * Count lines in text
   */
  private countLines(text: string): number {
    if (!text || text.trim().length === 0) {
      return 0;
    }
    return text.split(/\n/).length;
  }

  /**
   * Count punctuation in text
   */
  private countPunctuation(text: string): number {
    return (text.match(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g) || []).length;
  }

  /**
   * Count numbers in text
   */
  private countNumbers(text: string): number {
    return (text.match(/\d+/g) || []).length;
  }

  /**
   * Clean text with default options
   */
  public async cleanDefault(text: string): Promise<CleanedText> {
    return this.clean(text, {
      removeExtraWhitespace: true,
      trimWhitespace: true,
      removePunctuation: false,
      removeSpecialChars: false,
      normalizeLineEndings: true,
      toLowerCase: false,
      removeNumbers: false,
      removeUrls: false,
      removeEmails: false,
      removeHtmlTags: false,
      removeControlChars: true,
      replaceMultipleSpaces: true,
      preserveLineBreaks: false
    });
  }

  /**
   * Clean text for SEO purposes
   */
  public async cleanForSEO(text: string): Promise<CleanedText> {
    return this.clean(text, {
      removeExtraWhitespace: true,
      trimWhitespace: true,
      removePunctuation: true,
      removeSpecialChars: true,
      normalizeLineEndings: true,
      toLowerCase: false,
      removeNumbers: false,
      removeUrls: true,
      removeEmails: true,
      removeHtmlTags: true,
      removeControlChars: true,
      replaceMultipleSpaces: true,
      preserveLineBreaks: false
    });
  }

  /**
   * Clean text for data processing
   */
  public async cleanForDataProcessing(text: string): Promise<CleanedText> {
    return this.clean(text, {
      removeExtraWhitespace: true,
      trimWhitespace: true,
      removePunctuation: false,
      removeSpecialChars: false,
      normalizeLineEndings: true,
      toLowerCase: false,
      removeNumbers: false,
      removeUrls: false,
      removeEmails: false,
      removeHtmlTags: false,
      removeControlChars: true,
      replaceMultipleSpaces: true,
      preserveLineBreaks: true
    });
  }
}
