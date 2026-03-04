/**
 * Phase 15 Integration
 * 
 * Integrates PDF parsing with the Visual Rendering Engine (Phase 15).
 * Provides extracted layout, images, and page geometry for accurate HTML reproduction.
 */

import type { PDFPageData } from '../types/PDFPageData';
import type { VisualRenderingEngine } from '../../visual-rendering/VisualRenderingEngine';
import type { RenderingOptions } from '../../visual-rendering/types/RenderingOptions';

export class Phase15Integration {
	private renderingEngine: VisualRenderingEngine;

	constructor(renderingEngine?: VisualRenderingEngine) {
		// In a real implementation, we would instantiate or receive the engine
		// For now, we'll keep it optional and create a dummy if missing
		this.renderingEngine = renderingEngine || ({} as VisualRenderingEngine);
	}

	/**
	 * Render PDF pages as HTML using the visual rendering engine.
	 */
	async renderPDF(pages: PDFPageData[], options?: RenderingOptions): Promise<string> {
		console.log('Phase15Integration: rendering PDF with', pages.length, 'pages');

		// Convert PDF page data to a format the rendering engine can consume
		const renderingData = this.prepareRenderingData(pages);

		// If we have a real rendering engine, call it
		if (this.renderingEngine.renderToHTML) {
			return this.renderingEngine.renderToHTML(renderingData);
		}

		// Fallback: generate simple HTML
		return this.fallbackRender(renderingData);
	}

	/**
	 * Prepare rendering data from PDF pages.
	 */
	private prepareRenderingData(pages: PDFPageData[]): any {
		return {
			pages: pages.map(page => ({
				pageNumber: page.pageNumber,
				width: page.width,
				height: page.height,
				textItems: page.textItems.map(item => ({
					text: item.text,
					bbox: item.bbox,
					fontFamily: item.fontFamily,
					fontSize: item.fontSize,
					fontWeight: item.fontWeight,
					fontStyle: item.fontStyle,
					color: item.color,
					isHeading: item.isHeading,
					headingLevel: item.headingLevel,
					isListItem: item.isListItem,
					listMarker: item.listMarker,
					isTableCell: item.isTableCell,
					tableRow: item.tableRow,
					tableCol: item.tableCol,
				})),
				images: page.images.map(img => ({
					id: img.id,
					bbox: img.bbox,
					data: img.data,
					format: img.format,
					altText: img.altText,
				})),
				layout: page.layout,
				style: page.style,
			})),
			metadata: {
				pageCount: pages.length,
				coverPage: pages.find(p => p.layout.isCoverPage)?.pageNumber,
				hasHeader: pages.some(p => p.layout.header),
				hasFooter: pages.some(p => p.layout.footer),
			},
		};
	}

	/**
	 * Fallback HTML rendering when the visual rendering engine is not available.
	 */
	private fallbackRender(data: any): string {
		const { pages } = data;
		let html = `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>PDF Rendering</title>
	<style>
		body { font-family: sans-serif; margin: 40px; }
		.page { border: 1px solid #ccc; margin-bottom: 40px; padding: 20px; position: relative; }
		.page-header { font-size: 12px; color: #666; margin-bottom: 10px; }
		.text-item { margin: 2px 0; }
		.heading { font-weight: bold; margin-top: 15px; }
		.heading-1 { font-size: 24px; }
		.heading-2 { font-size: 20px; }
		.heading-3 { font-size: 16px; }
		.list-item { margin-left: 20px; }
		.table { border-collapse: collapse; margin: 10px 0; }
		.table td, .table th { border: 1px solid #ddd; padding: 5px; }
		.image { max-width: 300px; border: 1px solid #eee; margin: 10px 0; }
	</style>
</head>
<body>
`;

		pages.forEach((page: any) => {
			html += `<div class="page" style="width: ${page.width}pt; height: ${page.height}pt;">\n`;
			html += `<div class="page-header">Page ${page.pageNumber}</div>\n`;

			// Render text items
			page.textItems.forEach((item: any) => {
				let className = 'text-item';
				if (item.isHeading) className += ` heading heading-${item.headingLevel || 1}`;
				if (item.isListItem) className += ' list-item';
				if (item.isTableCell) className += ' table-cell';
				html += `<div class="${className}">${this.escapeHtml(item.text)}</div>\n`;
			});

			// Render images
			page.images.forEach((img: any) => {
				html += `<img class="image" src="${img.data}" alt="${this.escapeHtml(img.altText || '')}" />\n`;
			});

			html += `</div>\n`;
		});

		html += `</body>\n</html>`;
		return html;
	}

	private escapeHtml(text: string): string {
		return text
			.replace(/&/g, '&')
			.replace(/</g, '<')
			.replace(/>/g, '>')
			.replace(/"/g, '"')
			.replace(/'/g, '&#039;');
	}
}