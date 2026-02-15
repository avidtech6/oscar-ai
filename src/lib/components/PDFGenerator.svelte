<script lang="ts">
	import { PDFDocument, rgb, StandardFonts, GrayscaleLogo } from 'pdf-lib';
	import { onMount } from 'svelte';
	
	export let title: string = 'Oscar AI Report';
	export let content: string = '';
	export let projectName: string = '';
	export let author: string = '';
	
	// Cover page options
	export let coverImageUrl: string = '';
	export let coverImageData: { thumbnailUrl: string; webViewLink: string; fileName: string } | null = null;
	export let clientName: string = '';
	export let siteAddress: string = '';
	export let documentDate: string = new Date().toISOString().split('T')[0];
	
	// Page template options
	export let companyName: string = 'Oscar AI';
	export let companyContact: string = '';
	export let disclaimer: string = '';
	
	// Image placement instructions from Mixtral
	export let imagePlacements: Array<{
		id: string;
		page: number;
		position: 'center-top' | 'full-width' | 'float';
		width?: number;
		caption?: string;
		imageData?: { thumbnailUrl: string; webViewLink: string; fileName: string };
	}> = [];
	
	export let onGenerated: (pdfBytes: Uint8Array) => void;
	
	let pdfBytes: Uint8Array | null = null;
	let generating = false;
	let error: string | null = null;
	
	// Generate PDF from content
	async function generatePDF() {
		generating = true;
		error = null;
		
		try {
			// Create new PDF document
			const pdfDoc = await PDFDocument.create();
			
			// Embed fonts
			const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
			const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
			
			// Track page numbers for headers/footers
			let pageNumber = 0;
			
			// Generate cover page if enabled
			if (coverImageData || coverImageUrl) {
				pageNumber++;
				const coverPage = pdfDoc.addPage([595.28, 841.89]); // A4
				const { width, height } = coverPage.getSize();
				
				// Draw cover image if available
				if (coverImageUrl) {
					try {
						const imageResponse = await fetch(coverImageUrl);
						const imageBytes = await imageResponse.arrayBuffer();
						let coverImage;
						
						if (coverImageUrl.toLowerCase().includes('.png')) {
							coverImage = await pdfDoc.embedPng(imageBytes);
						} else {
							coverImage = await pdfDoc.embedJpg(imageBytes);
						}
						
						// Scale image to fit full width
						const imgDims = coverImage.scaleToFit(width, height - 200);
						coverPage.drawImage(coverImage, {
							x: (width - imgDims.width) / 2,
							y: height - imgDims.height - 50,
							width: imgDims.width,
							height: imgDims.height
						});
					} catch (imgErr) {
						console.warn('Could not embed cover image:', imgErr);
					}
				}
				
				// Draw title block
				let y = height - 350;
				
				if (projectName) {
					coverPage.drawText(projectName, {
						x: 50,
						y: y,
						size: 24,
						font: helveticaBold,
						color: rgb(0.18, 0.33, 0.2)
					});
					y -= 35;
				}
				
				coverPage.drawText(title, {
					x: 50,
					y: y,
					size: 18,
					font: helveticaBold,
					color: rgb(0, 0, 0)
				});
				y -= 30;
				
				if (clientName) {
					coverPage.drawText(`Client: ${clientName}`, {
						x: 50,
						y: y,
						size: 12,
						font: helveticaFont,
						color: rgb(0.3, 0.3, 0.3)
					});
					y -= 20;
				}
				
				if (siteAddress) {
					coverPage.drawText(`Site: ${siteAddress}`, {
						x: 50,
						y: y,
						size: 12,
						font: helveticaFont,
						color: rgb(0.3, 0.3, 0.3)
					});
					y -= 20;
				}
				
				coverPage.drawText(`Date: ${documentDate}`, {
					x: 50,
					y: y,
					size: 12,
					font: helveticaFont,
					color: rgb(0.3, 0.3, 0.3)
				});
				
				// Draw footer
				const footerY = 50;
				if (companyName) {
					coverPage.drawText(companyName, {
						x: 50,
						y: footerY,
						size: 10,
						font: helveticaFont,
						color: rgb(0.4, 0.4, 0.4)
					});
				}
				if (companyContact) {
					coverPage.drawText(companyContact, {
						x: width / 2 - 50,
						y: footerY,
						size: 8,
						font: helveticaFont,
						color: rgb(0.5, 0.5, 0.5)
					});
				}
			}
			
			// Add content page
			let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
			const { width, height } = page.getSize();
			const margin = 50;
			const contentWidth = width - margin * 2;
			
			let y = height - 50;
			pageNumber++;
			
			// Draw header on first content page
			drawHeader(page, width, height, margin, helveticaFont, helveticaBold);
			
			y -= 60;
			
			// Draw title
			page.drawText(title, {
				x: margin,
				y: y,
				size: 18,
				font: helveticaBold,
				color: rgb(0, 0, 0)
			});
			
			y -= 30;
			
			// Draw metadata
			if (projectName) {
				page.drawText(`Project: ${projectName}`, {
					x: margin,
					y: y,
					size: 10,
					font: helveticaFont,
					color: rgb(0.4, 0.4, 0.4)
				});
				y -= 15;
			}
			
			if (author) {
				page.drawText(`Author: ${author}`, {
					x: margin,
					y: y,
					size: 10,
					font: helveticaFont,
					color: rgb(0.4, 0.4, 0.4)
				});
				y -= 15;
			}
			
			y -= 20;
			
			// Draw line separator
			page.drawLine({
				start: { x: margin, y: y },
				end: { x: width - margin, y: y },
				thickness: 1,
				color: rgb(0.8, 0.8, 0.8)
			});
			
			y -= 20;
			
			// Process image placements
			const imagePlacementMap = new Map<number, typeof imagePlacements>();
			for (const img of imagePlacements) {
				const existing = imagePlacementMap.get(img.page) || [];
				existing.push(img);
				imagePlacementMap.set(img.page, existing);
			}
			
			// Parse and render content
			const lines = parseContentForPDF(content);
			
			for (const line of lines) {
				// Check for image placement on this page
				const pageImages = imagePlacementMap.get(pageNumber);
				if (pageImages && pageImages.length > 0) {
					for (const img of pageImages) {
						if (img.imageData?.thumbnailUrl && y > 200) {
							// Try to embed image
							try {
								const imgResponse = await fetch(img.imageData.thumbnailUrl);
								const imgBytes = await imgResponse.arrayBuffer();
								let pdfImage;
								
								if (img.imageData.thumbnailUrl.toLowerCase().includes('.png')) {
									pdfImage = await pdfDoc.embedPng(imgBytes);
								} else {
									pdfImage = await pdfDoc.embedJpg(imgBytes);
								}
								
								const maxWidth = img.position === 'full-width' ? contentWidth : 200;
								const imgDims = pdfImage.scaleToFit(maxWidth, 150);
								
								page.drawImage(pdfImage, {
									x: img.position === 'center-top' ? (width - imgDims.width) / 2 : margin,
									y: y - imgDims.height,
									width: imgDims.width,
									height: imgDims.height
								});
								
								if (img.caption) {
									y -= imgDims.height + 20;
									page.drawText(img.caption, {
										x: margin,
										y: y,
										size: 8,
										font: helveticaFont,
										color: rgb(0.5, 0.5, 0.5)
									});
								}
								
								y -= imgDims.height + (img.caption ? 30 : 10);
							} catch (imgErr) {
								console.warn('Could not embed placed image:', imgErr);
							}
						}
					}
				}
				
				// Check if we need a new page
				if (y < 80) {
					// Draw footer before adding new page
					drawFooter(page, width, helveticaFont, pageNumber);
					page = pdfDoc.addPage([595.28, 841.89]);
					pageNumber++;
					y = height - 50;
					
					// Draw header on new page
					drawHeader(page, width, height, margin, helveticaFont, helveticaBold);
					y -= 40;
				}
				
				// Handle different content types
				if (line.type === 'heading') {
					page.drawText(line.text, {
						x: margin,
						y: y,
						size: 14,
						font: helveticaBold,
						color: rgb(0, 0, 0)
					});
					y -= 20;
				} else if (line.type === 'subheading') {
					page.drawText(line.text, {
						x: margin,
						y: y,
						size: 12,
						font: helveticaBold,
						color: rgb(0.2, 0.2, 0.2)
					});
					y -= 16;
				} else if (line.type === 'list') {
					page.drawText(`• ${line.text}`, {
						x: margin + 10,
						y: y,
						size: 10,
						font: helveticaFont,
						color: rgb(0, 0, 0)
					});
					y -= 14;
				} else if (line.type === 'table') {
					// Draw table header
					page.drawRectangle({
						x: margin,
						y: y - 5,
						width: contentWidth,
						height: 15,
						color: rgb(0.9, 0.9, 0.9)
					});
					
					page.drawText(line.text, {
						x: margin + 5,
						y: y,
						size: 9,
						font: helveticaBold,
						color: rgb(0, 0, 0)
					});
					y -= 15;
				} else {
					// Regular text - wrap if too long
					const wrappedLines = wrapText(line.text, helveticaFont, 10, contentWidth);
					
					for (const wrappedLine of wrappedLines) {
						if (y < 80) {
							// Draw footer before adding new page
							drawFooter(page, width, helveticaFont, pageNumber);
							page = pdfDoc.addPage([595.28, 841.89]);
							pageNumber++;
							y = height - 50;
							
							// Draw header on new page
							drawHeader(page, width, height, margin, helveticaFont, helveticaBold);
							y -= 40;
						}
						
						page.drawText(wrappedLine, {
							x: margin,
							y: y,
							size: 10,
							font: helveticaFont,
							color: rgb(0, 0, 0)
						});
						y -= 14;
					}
				}
				
				y -= 5;
			}
			
			// Draw footer on last page
			drawFooter(page, width, helveticaFont, pageNumber);
			
			// Generate PDF bytes
			pdfBytes = await pdfDoc.save();
			
			// Trigger callback
			if (onGenerated) {
				onGenerated(pdfBytes);
			}
			
		} catch (err) {
			console.error('PDF generation error:', err);
			error = err instanceof Error ? err.message : 'Failed to generate PDF';
		} finally {
			generating = false;
		}
	}
	
	// Draw header on page
	function drawHeader(page: any, width: number, height: number, margin: number, helveticaFont: any, helveticaBold: any) {
		// Project name (left)
		page.drawText(projectName || 'Oscar AI Report', {
			x: margin,
			y: height - 30,
			size: 10,
			font: helveticaFont,
			color: rgb(0.18, 0.33, 0.2)
		});
		
		// Document title (center)
		const titleText = title.length > 30 ? title.substring(0, 30) + '...' : title;
		page.drawText(titleText, {
			x: width / 2 - 50,
			y: height - 30,
			size: 10,
			font: helveticaFont,
			color: rgb(0.4, 0.4, 0.4)
		});
		
		// Page number placeholder (will be updated on each page)
		page.drawText('[PAGE_NUM]', {
			x: width - margin - 50,
			y: height - 30,
			size: 10,
			font: helveticaFont,
			color: rgb(0.4, 0.4, 0.4)
		});
		
		// Line under header
		page.drawLine({
			start: { x: margin, y: height - 40 },
			end: { x: width - margin, y: height - 40 },
			thickness: 0.5,
			color: rgb(0.8, 0.8, 0.8)
		});
	}
	
	// Draw footer on page
	function drawFooter(page: any, width: number, helveticaFont: any, pageNum: number) {
		const footerY = 30;
		
		// Company name (left)
		page.drawText(companyName, {
			x: 50,
			y: footerY,
			size: 8,
			font: helveticaFont,
			color: rgb(0.5, 0.5, 0.5)
		});
		
		// Contact details (center)
		if (companyContact) {
			page.drawText(companyContact, {
				x: width / 2 - 50,
				y: footerY,
				size: 8,
				font: helveticaFont,
				color: rgb(0.5, 0.5, 0.5)
			});
		}
		
		// Disclaimer (right)
		if (disclaimer) {
			const disclaimerText = disclaimer.length > 40 ? disclaimer.substring(0, 40) + '...' : disclaimer;
			page.drawText(disclaimerText, {
				x: width - 200,
				y: footerY,
				size: 7,
				font: helveticaFont,
				color: rgb(0.6, 0.6, 0.6)
			});
		}
	}
	
	// Parse content into structured format for PDF
	function parseContentForPDF(text: string): Array<{ type: string; text: string }> {
		const lines: Array<{ type: string; text: string }> = [];
		const paragraphs = text.split('\n\n');
		
		for (const paragraph of paragraphs) {
			const trimmed = paragraph.trim();
			if (!trimmed) continue;
			
			// Check if it's a heading
			if (trimmed.startsWith('# ')) {
				lines.push({ type: 'heading', text: trimmed.substring(2) });
			} else if (trimmed.startsWith('## ')) {
				lines.push({ type: 'subheading', text: trimmed.substring(3) });
			} else if (trimmed.startsWith('### ')) {
				lines.push({ type: 'subheading', text: trimmed.substring(4) });
			} else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
				// List items
				const items = trimmed.split('\n').filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));
				for (const item of items) {
					lines.push({ type: 'list', text: item.substring(2) });
				}
			} else if (trimmed.includes('|') && trimmed.includes('---')) {
				// Table
				lines.push({ type: 'table', text: trimmed.split('\n')[0].replace(/\|/g, ' | ') });
			} else {
				// Regular paragraph
				lines.push({ type: 'text', text: trimmed });
			}
		}
		
		return lines;
	}
	
	// Wrap text to fit within width
	function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
		const words = text.split(' ');
		const lines: string[] = [];
		let currentLine = '';
		
		for (const word of words) {
			const testLine = currentLine ? `${currentLine} ${word}` : word;
			const testWidth = font.widthOfTextAtSize(testLine, fontSize);
			
			if (testWidth > maxWidth && currentLine) {
				lines.push(currentLine);
				currentLine = word;
			} else {
				currentLine = testLine;
			}
		}
		
		if (currentLine) {
			lines.push(currentLine);
		}
		
		return lines;
	}
	
	// Download PDF
	function downloadPDF() {
		if (!pdfBytes) return;
		
		const blob = new Blob([pdfBytes], { type: 'application/pdf' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
	
	// Get PDF bytes for upload
	export function getPDFBytes(): Uint8Array | null {
		return pdfBytes;
	}
	
	// Reset PDF
	export function reset() {
		pdfBytes = null;
		error = null;
	}
</script>

<div class="pdf-generator">
	<div class="pdf-actions">
		<button 
			class="btn btn-primary"
			on:click={generatePDF}
			disabled={generating || !content}
		>
			{#if generating}
				<span class="spinner"></span>
				Generating...
			{:else}
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
				</svg>
				Generate PDF
			{/if}
		</button>
		
		{#if pdfBytes}
			<button class="btn btn-secondary" on:click={downloadPDF}>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
				</svg>
				Download
			</button>
		{/if}
	</div>
	
	{#if error}
		<div class="error-message">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
			</svg>
			{error}
		</div>
	{/if}
	
	{#if pdfBytes}
		<div class="pdf-preview">
			<embed 
				type="application/pdf" 
				src={URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))}
				width="100%"
				height="500px"
			/>
		</div>
	{/if}
</div>

<style>
	.pdf-generator {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.pdf-actions {
		display: flex;
		gap: 0.5rem;
	}
	
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}
	
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.btn-primary {
		background: #2f5233;
		color: white;
	}
	
	.btn-primary:hover:not(:disabled) {
		background: #234026;
	}
	
	.btn-secondary {
		background: #6b7280;
		color: white;
	}
	
	.btn-secondary:hover:not(:disabled) {
		background: #4b5563;
	}
	
	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.error-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: #fef2f2;
		color: #dc2626;
		border-radius: 0.5rem;
		font-size: 0.875rem;
	}
	
	.pdf-preview {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		overflow: hidden;
		background: white;
	}
</style>
