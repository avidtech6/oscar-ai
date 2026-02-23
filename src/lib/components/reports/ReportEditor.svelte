<script lang="ts">
	import { groqApiKey } from '$lib/stores/settings';
	import { decompileReport, analyzeReportStructure } from '$lib/services/reportDecompilerService';
	import { parseHtmlIntoSections, updateSectionInHtml, type ReportSection } from '$lib/services/templateService';
	import { getSpeechRecognition, type SpeechRecognitionResult } from '$lib/services/voiceDictation';
	import PhotoUploader from '$lib/components/PhotoUploader.svelte';
	
	export let generatedReport = '';
	export let selectedTemplate: any = null;
	export let selectedProject: any = undefined;
	
	export let enterSectionEditMode: () => void;
	export let copyToClipboard: () => void;
	export let downloadAsHtml: () => void;
	export let startOver: () => void;
	export let saveToSupabase: () => void;
	
	let apiKey = '';
	groqApiKey.subscribe(value => {
		apiKey = value;
	});
	
	// Section editing state
	let sections: ReportSection[] = [];
	let activeSectionId: string | null = null;
	let activeSectionContent = '';
	
	// AI editing state
	let aiProcessing = false;
	let aiAction = '';
	let aiPrompt = '';
	let aiSectionPrompt = '';
	
	// Voice dictation state
	let isRecording = false;
	let speechRecognition: any = null;
	let dictationText = '';
	
	// Photo upload state
	let showPhotoUploader = false;
	let photoUploadSectionId: string | null = null;
	
	let decompilerProcessing = false;
	let decompilerResult: any = null;
	let showDecompilerResults = false;
	
	// Parse sections when report changes
	$: if (generatedReport) {
		sections = parseHtmlIntoSections(generatedReport);
		if (sections.length > 0 && !activeSectionId) {
			activeSectionId = sections[0].id;
			activeSectionContent = sections.find(s => s.id === activeSectionId)?.content || '';
		}
	}
	
	// Update active section content when section changes
	$: if (activeSectionId) {
		const section = sections.find(s => s.id === activeSectionId);
		if (section) {
			activeSectionContent = section.content;
		}
	}
	
	// Save section changes
	function saveSection() {
		if (!activeSectionId || !generatedReport) return;
		
		generatedReport = updateSectionInHtml(generatedReport, activeSectionId, activeSectionContent);
		
		// Update sections array
		sections = parseHtmlIntoSections(generatedReport);
		
		// Update active section content
		const section = sections.find(s => s.id === activeSectionId);
		if (section) {
			activeSectionContent = section.content;
		}
	}
	
	// Select a section
	function selectSection(sectionId: string) {
		activeSectionId = sectionId;
		const section = sections.find(s => s.id === sectionId);
		if (section) {
			activeSectionContent = section.content;
		}
	}
	
	// Add a new section
	function addSection() {
		const newSectionId = `section-${sections.length + 1}`;
		const newSectionHtml = `<div class="section">
			<div class="section-title">New Section</div>
			<p>Add your content here...</p>
		</div>`;
		
		// Append to report
		generatedReport += newSectionHtml;
		
		// Update sections
		sections = parseHtmlIntoSections(generatedReport);
		selectSection(newSectionId);
	}
	
	// Delete a section
	function deleteSection(sectionId: string) {
		if (sections.length <= 1) {
			alert('Cannot delete the only section');
			return;
		}
		
		if (!confirm('Delete this section?')) return;
		
		// Remove section from HTML
		const parser = new DOMParser();
		const doc = parser.parseFromString(generatedReport, 'text/html');
		const sectionElements = doc.querySelectorAll('.section');
		
		let sectionIndex = -1;
		sectionElements.forEach((section, index) => {
			const titleEl = section.querySelector('.section-title');
			const title = titleEl?.textContent?.trim() || `Section ${index + 1}`;
			const id = `section-${index + 1}`;
			if (id === sectionId) {
				sectionIndex = index;
			}
		});
		
		if (sectionIndex !== -1) {
			const section = sectionElements[sectionIndex];
			section.remove();
			generatedReport = doc.documentElement.outerHTML;
			
			// Update sections and select first section
			sections = parseHtmlIntoSections(generatedReport);
			if (sections.length > 0) {
				selectSection(sections[0].id);
			}
		}
	}
	
	// Move section up
	function moveSectionUp(sectionId: string) {
		const index = sections.findIndex(s => s.id === sectionId);
		if (index <= 0) return;
		
		// Reorder sections in HTML (simplified - just swap with previous)
		const parser = new DOMParser();
		const doc = parser.parseFromString(generatedReport, 'text/html');
		const sectionElements = doc.querySelectorAll('.section');
		
		if (index < sectionElements.length) {
			const currentSection = sectionElements[index];
			const previousSection = sectionElements[index - 1];
			
			// Swap positions
			previousSection.parentNode?.insertBefore(currentSection, previousSection);
			generatedReport = doc.documentElement.outerHTML;
			
			// Update sections
			sections = parseHtmlIntoSections(generatedReport);
		}
	}
	
	// Move section down
	function moveSectionDown(sectionId: string) {
		const index = sections.findIndex(s => s.id === sectionId);
		if (index === -1 || index >= sections.length - 1) return;
		
		// Reorder sections in HTML (simplified - just swap with next)
		const parser = new DOMParser();
		const doc = parser.parseFromString(generatedReport, 'text/html');
		const sectionElements = doc.querySelectorAll('.section');
		
		if (index < sectionElements.length - 1) {
			const currentSection = sectionElements[index];
			const nextSection = sectionElements[index + 1];
			
			// Swap positions
			currentSection.parentNode?.insertBefore(nextSection, currentSection);
			generatedReport = doc.documentElement.outerHTML;
			
			// Update sections
			sections = parseHtmlIntoSections(generatedReport);
		}
	}
	
	async function rewriteWithAI() {
		if (!generatedReport.trim() || !apiKey) return;
		
		aiProcessing = true;
		aiAction = 'Rewriting with AI...';
		
		try {
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{
							role: 'system',
							content: 'You are an expert arboricultural report writer. Rewrite the provided report text to be more professional, clear, and suitable for a formal report. Maintain all technical details and data.'
						},
						{
							role: 'user',
							content: `Please rewrite this report to be more professional:\n\n${generatedReport}`
						}
					],
					temperature: 0.7,
					max_tokens: 4096
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to rewrite with AI');
			}
			
			const data = await response.json();
			generatedReport = data.choices[0].message.content;
		} catch (e) {
			console.error('AI rewrite failed:', e);
			alert('Failed to rewrite with AI. Please check your API key in Settings.');
		} finally {
			aiProcessing = false;
			aiAction = '';
		}
	}
	
	async function improveSectionWithAI() {
		if (!generatedReport.trim() || !apiKey) return;
		
		const section = prompt('Which section would you like to improve? (e.g., "Introduction", "Methodology", "Results", "Conclusion")');
		if (!section) return;
		
		aiProcessing = true;
		aiAction = `Improving ${section} section...`;
		
		try {
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{
							role: 'system',
							content: 'You are an expert arboricultural report writer. Improve the specified section of the report to be more detailed, professional, and comprehensive.'
						},
						{
							role: 'user',
							content: `Please improve the "${section}" section of this report:\n\n${generatedReport}`
						}
					],
					temperature: 0.7,
					max_tokens: 2048
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to improve section with AI');
			}
			
			const data = await response.json();
			generatedReport = data.choices[0].message.content;
		} catch (e) {
			console.error('AI section improvement failed:', e);
			alert('Failed to improve section with AI. Please check your API key in Settings.');
		} finally {
			aiProcessing = false;
			aiAction = '';
		}
	}
	
	async function generateSectionWithAI() {
		if (!selectedTemplate || !apiKey) return;
		
		const section = prompt('What section would you like to generate? (e.g., "Executive Summary", "Recommendations", "Appendices")');
		if (!section) return;
		
		aiProcessing = true;
		aiAction = `Generating ${section} section...`;
		
		try {
			const context = selectedProject ?
				`Project: ${selectedProject.name}\nClient: ${selectedProject.client || 'Not specified'}\nLocation: ${selectedProject.location || 'Not specified'}` :
				'No project context available';
			
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{
							role: 'system',
							content: `You are an expert arboricultural report writer. Generate a professional ${section} section for a ${selectedTemplate?.name || 'arboricultural'} report.`
						},
						{
							role: 'user',
							content: `Generate a ${section} section for an arboricultural report with the following context:\n\n${context}`
						}
					],
					temperature: 0.7,
					max_tokens: 2048
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to generate section with AI');
			}
			
			const data = await response.json();
			const newSection = data.choices[0].message.content;
			
			// Append the new section to the report
			generatedReport += '\n\n' + newSection;
		} catch (e) {
			console.error('AI section generation failed:', e);
			alert('Failed to generate section with AI. Please check your API key in Settings.');
		} finally {
			aiProcessing = false;
			aiAction = '';
		}
	}
	
	async function processAIPrompt() {
		if (!aiPrompt.trim() || !apiKey) return;
		
		aiProcessing = true;
		aiAction = 'Processing AI request...';
		
		try {
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{
							role: 'system',
							content: 'You are an expert arboricultural report writer. Help the user modify their report based on their request.'
						},
						{
							role: 'user',
							content: `Current report:\n\n${generatedReport}\n\nUser request: ${aiPrompt}`
						}
					],
					temperature: 0.7,
					max_tokens: 4096
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to process AI request');
			}
			
			const data = await response.json();
			generatedReport = data.choices[0].message.content;
			aiPrompt = '';
		} catch (e) {
			console.error('AI prompt processing failed:', e);
			alert('Failed to process AI request. Please check your API key in Settings.');
		} finally {
			aiProcessing = false;
			aiAction = '';
		}
	}
	
	async function analyzeReportWithDecompiler() {
		if (!generatedReport.trim()) {
			alert('Please enter some report content first.');
			return;
		}
		
		decompilerProcessing = true;
		decompilerResult = null;
		showDecompilerResults = false;
		
		try {
			// First get quick analysis
			const analysis = await analyzeReportStructure(generatedReport);
			
			if (analysis) {
				decompilerResult = {
					analysis,
					fullDecompilation: null
				};
				showDecompilerResults = true;
				
				// Ask if user wants full decompilation
				const shouldDecompile = confirm(
					`Report Analysis Complete:\n\n` +
					`• ${analysis.sectionCount} sections detected\n` +
					`• ${analysis.headingCount} headings\n` +
					`• ${analysis.wordCount} words\n` +
					`• Confidence: ${Math.round(analysis.confidenceScore * 100)}%\n\n` +
					`Run full decompilation to see detailed section breakdown?`
				);
				
				if (shouldDecompile) {
					await runFullDecompilation();
				}
			} else {
				alert('Could not analyze report structure. The report may be too short or malformed.');
			}
		} catch (error) {
			console.error('Report analysis failed:', error);
			alert('Failed to analyze report. Please try again.');
		} finally {
			decompilerProcessing = false;
		}
	}
	
	async function runFullDecompilation() {
		if (!generatedReport.trim()) return;
		
		decompilerProcessing = true;
		
		try {
			const result = await decompileReport(generatedReport, 'text');
			
			if (result.success) {
				decompilerResult = {
					analysis: {
						sectionCount: result.data.sections.length,
						headingCount: result.data.sections.filter((s: any) => s.type === 'heading' || s.type === 'subheading').length,
						listCount: result.data.sections.filter((s: any) => s.type === 'list').length,
						tableCount: result.data.sections.filter((s: any) => s.type === 'table').length,
						appendixCount: result.data.sections.filter((s: any) => s.type === 'appendix').length,
						wordCount: result.data.metadata.wordCount || 0,
						detectedReportType: result.data.detectedReportType,
						confidenceScore: result.data.confidenceScore,
						hasMethodology: result.data.structureMap.hasMethodology,
						hasAppendices: result.data.structureMap.hasAppendices,
						hasLegalSections: result.data.structureMap.hasLegalSections
					},
					fullDecompilation: result.data
				};
				showDecompilerResults = true;
			} else {
				alert(`Decompilation failed: ${result.error}`);
			}
		} catch (error) {
			console.error('Full decompilation failed:', error);
			alert('Failed to decompile report. Please try again.');
		} finally {
			decompilerProcessing = false;
		}
	}
	
	// Voice dictation functions
	async function startDictation() {
		if (!activeSectionId) {
			alert('Please select a section first');
			return;
		}
		
		try {
			speechRecognition = getSpeechRecognition();
			
			if (!speechRecognition) {
				alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
				return;
			}
			
			speechRecognition.continuous = true;
			speechRecognition.interimResults = true;
			
			speechRecognition.onstart = () => {
				isRecording = true;
				dictationText = '';
			};
			
			speechRecognition.onresult = (event: any) => {
				let interimTranscript = '';
				let finalTranscript = '';
				
				for (let i = event.resultIndex; i < event.results.length; i++) {
					const transcript = event.results[i][0].transcript;
					if (event.results[i].isFinal) {
						finalTranscript += transcript;
					} else {
						interimTranscript += transcript;
					}
				}
				
				dictationText = finalTranscript + interimTranscript;
			};
			
			speechRecognition.onerror = (event: any) => {
				console.error('Speech recognition error:', event.error);
				isRecording = false;
				speechRecognition = null;
				
				if (event.error === 'not-allowed') {
					alert('Microphone access denied. Please allow microphone access to use voice dictation.');
				}
			};
			
			speechRecognition.onend = () => {
				isRecording = false;
				speechRecognition = null;
			};
			
			speechRecognition.start();
		} catch (error) {
			console.error('Failed to start dictation:', error);
			alert('Failed to start voice dictation. Please check your microphone permissions.');
			isRecording = false;
			speechRecognition = null;
		}
	}
	
	function stopDictation() {
		if (speechRecognition) {
			speechRecognition.stop();
			isRecording = false;
			speechRecognition = null;
			
			// Insert dictation text into active section
			if (dictationText.trim() && activeSectionContent !== undefined) {
				activeSectionContent += dictationText + ' ';
				dictationText = '';
				saveSection();
			}
		}
	}
	
	function insertDictationText() {
		if (dictationText.trim() && activeSectionContent !== undefined) {
			activeSectionContent += dictationText + ' ';
			dictationText = '';
			saveSection();
		}
	}
	
	// Photo upload functions
	function openPhotoUploader(sectionId: string) {
		photoUploadSectionId = sectionId;
		showPhotoUploader = true;
	}
	
	function closePhotoUploader() {
		showPhotoUploader = false;
		photoUploadSectionId = null;
	}
	
	function handlePhotoUpload(url: string) {
		if (!photoUploadSectionId || !url) return;
		
		// Insert image HTML into the active section content
		const imgHtml = `<img src="${url}" alt="Uploaded photo" style="max-width: 100%; height: auto; margin: 10px 0;">`;
		
		if (activeSectionId === photoUploadSectionId) {
			activeSectionContent += imgHtml;
			saveSection();
		}
		
		closePhotoUploader();
	}
	
	// AI section-specific functions
	async function improveActiveSectionWithAI() {
		if (!activeSectionId || !apiKey) return;
		
		const section = sections.find(s => s.id === activeSectionId);
		if (!section) return;
		
		aiProcessing = true;
		aiAction = `Improving "${section.title}" section...`;
		
		try {
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{
							role: 'system',
							content: 'You are an expert arboricultural report writer. Improve the provided section to be more detailed, professional, and comprehensive while maintaining its core content.'
						},
						{
							role: 'user',
							content: `Improve this section titled "${section.title}":\n\n${section.content}`
						}
					],
					temperature: 0.7,
					max_tokens: 2048
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to improve section with AI');
			}
			
			const data = await response.json();
			const improvedContent = data.choices[0].message.content;
			
			// Update the section content
			activeSectionContent = improvedContent;
			saveSection();
		} catch (e) {
			console.error('AI section improvement failed:', e);
			alert('Failed to improve section with AI. Please check your API key in Settings.');
		} finally {
			aiProcessing = false;
			aiAction = '';
		}
	}
	
	async function rewriteActiveSectionWithAI() {
		if (!activeSectionId || !apiKey) return;
		
		const section = sections.find(s => s.id === activeSectionId);
		if (!section) return;
		
		aiProcessing = true;
		aiAction = `Rewriting "${section.title}" section...`;
		
		try {
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{
							role: 'system',
							content: 'You are an expert arboricultural report writer. Rewrite the provided section to be more concise, clear, and professional while preserving all key information.'
						},
						{
							role: 'user',
							content: `Rewrite this section titled "${section.title}" to be more concise and professional:\n\n${section.content}`
						}
					],
					temperature: 0.7,
					max_tokens: 2048
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to rewrite section with AI');
			}
			
			const data = await response.json();
			const rewrittenContent = data.choices[0].message.content;
			
			// Update the section content
			activeSectionContent = rewrittenContent;
			saveSection();
		} catch (e) {
			console.error('AI section rewrite failed:', e);
			alert('Failed to rewrite section with AI. Please check your API key in Settings.');
		} finally {
			aiProcessing = false;
			aiAction = '';
		}
	}
	
	async function expandActiveSectionWithAI() {
		if (!activeSectionId || !apiKey) return;
		
		const section = sections.find(s => s.id === activeSectionId);
		if (!section) return;
		
		aiProcessing = true;
		aiAction = `Expanding "${section.title}" section...`;
		
		try {
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{
							role: 'system',
							content: 'You are an expert arboricultural report writer. Expand the provided section by adding more detail, examples, and supporting information while staying on topic.'
						},
						{
							role: 'user',
							content: `Expand this section titled "${section.title}" by adding more detail and supporting information:\n\n${section.content}`
						}
					],
					temperature: 0.7,
					max_tokens: 2048
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to expand section with AI');
			}
			
			const data = await response.json();
			const expandedContent = data.choices[0].message.content;
			
			// Update the section content
			activeSectionContent = expandedContent;
			saveSection();
		} catch (e) {
			console.error('AI section expansion failed:', e);
			alert('Failed to expand section with AI. Please check your API key in Settings.');
		} finally {
			aiProcessing = false;
			aiAction = '';
		}
	}
	
	async function processSectionAIPrompt() {
		if (!activeSectionId || !aiSectionPrompt.trim() || !apiKey) return;
		
		const section = sections.find(s => s.id === activeSectionId);
		if (!section) return;
		
		aiProcessing = true;
		aiAction = 'Processing section AI request...';
		
		try {
			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{
							role: 'system',
							content: 'You are an expert arboricultural report writer. Help the user modify their report section based on their specific request.'
						},
						{
							role: 'user',
							content: `Current section titled "${section.title}":\n\n${section.content}\n\nUser request for this section: ${aiSectionPrompt}`
						}
					],
					temperature: 0.7,
					max_tokens: 2048
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to process section AI request');
			}
			
			const data = await response.json();
			const modifiedContent = data.choices[0].message.content;
			
			// Update the section content
			activeSectionContent = modifiedContent;
			saveSection();
			aiSectionPrompt = '';
		} catch (e) {
			console.error('AI section prompt processing failed:', e);
			alert('Failed to process section AI request. Please check your API key in Settings.');
		} finally {
			aiProcessing = false;
			aiAction = '';
		}
	}
	
	function closeDecompilerResults() {
		showDecompilerResults = false;
		decompilerResult = null;
	}
</script>

<div class="card">
	<div class="p-4 border-b border-gray-200 flex items-center justify-between">
		<h2 class="text-lg font-semibold">Edit Report</h2>
		<div class="flex gap-2">
			<button
				on:click={enterSectionEditMode}
				class="btn btn-secondary text-sm"
			>
				Edit by Sections
			</button>
			<button
				on:click={copyToClipboard}
				class="btn btn-secondary text-sm"
			>
				Copy HTML
			</button>
			<button
				on:click={downloadAsHtml}
				class="btn btn-primary text-sm"
			>
				Download HTML
			</button>
			<button
				on:click={startOver}
				class="btn btn-secondary text-sm"
			>
				New Report
			</button>
		</div>
	</div>
	
	<div class="p-6">
		<!-- AI Tools Section -->
		<div class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
			<h3 class="font-medium text-blue-900 mb-3">AI Report Tools</h3>
			<div class="flex flex-wrap gap-2 mb-4">
				<button
					on:click={rewriteWithAI}
					disabled={aiProcessing || !generatedReport.trim() || !apiKey}
					class="btn btn-primary text-sm"
				>
					{#if aiProcessing && aiAction === 'Rewriting with AI...'}
						<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Rewriting...
					{:else}
						Rewrite with AI
					{/if}
				</button>
				<button
					on:click={improveSectionWithAI}
					disabled={aiProcessing || !generatedReport.trim() || !apiKey}
					class="btn btn-primary text-sm"
				>
					{#if aiProcessing && aiAction.includes('Improving')}
						<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Improving...
					{:else}
						Improve Section
					{/if}
				</button>
				<button
					on:click={generateSectionWithAI}
					disabled={aiProcessing || !apiKey}
					class="btn btn-primary text-sm"
				>
					{#if aiProcessing && aiAction.includes('Generating')}
						<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Generating...
					{:else}
						Generate Section
					{/if}
				</button>
				<button
					on:click={analyzeReportWithDecompiler}
					disabled={decompilerProcessing || !generatedReport.trim()}
					class="btn btn-secondary text-sm"
				>
					{#if decompilerProcessing}
						<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Analyzing...
					{:else}
						Analyze Structure
					{/if}
				</button>
			</div>
			
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={aiPrompt}
					placeholder="Ask AI to modify the report (e.g., 'Make it more concise', 'Add more technical details')"
					class="input flex-1 text-sm"
					on:keydown={(e) => e.key === 'Enter' && processAIPrompt()}
					disabled={aiProcessing || !apiKey}
				/>
				<button
					on:click={processAIPrompt}
					disabled={aiProcessing || !aiPrompt.trim() || !apiKey}
					class="btn btn-primary text-sm"
				>
					{#if aiProcessing && aiAction === 'Processing AI request...'}
						<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Processing
					{:else}
						Ask AI
					{/if}
				</button>
			</div>
			{#if !apiKey}
				<p class="text-xs text-red-600 mt-2">
					⚠️ API key required. Set your Groq API key in Settings.
				</p>
			{/if}
		</div>
		
		<!-- Decompiler Results -->
		{#if showDecompilerResults && decompilerResult}
			<div class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
				<div class="flex items-center justify-between mb-3">
					<h3 class="font-medium text-green-900">Report Structure Analysis</h3>
					<button
						on:click={closeDecompilerResults}
						class="text-green-700 hover:text-green-900"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-green-700">{decompilerResult.analysis.sectionCount}</div>
						<div class="text-sm text-gray-600">Sections</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-green-700">{decompilerResult.analysis.headingCount}</div>
						<div class="text-sm text-gray-600">Headings</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-green-700">{decompilerResult.analysis.wordCount}</div>
						<div class="text-sm text-gray-600">Words</div>
					</div>
					<div class="bg-white p-3 rounded border">
						<div class="text-2xl font-bold text-green-700">{Math.round(decompilerResult.analysis.confidenceScore * 100)}%</div>
						<div class="text-sm text-gray-600">Confidence</div>
					</div>
				</div>
				
				{#if decompilerResult.fullDecompilation}
					<div class="mt-4">
						<h4 class="font-medium text-green-800 mb-2">Detailed Sections</h4>
						<div class="space-y-2 max-h-60 overflow-y-auto">
							{#each decompilerResult.fullDecompilation.sections as section}
								<div class="bg-white p-3 rounded border border-green-100">
									<div class="flex justify-between items-start">
										<div>
											<div class="font-medium text-gray-900">{section.title || 'Untitled'}</div>
											<div class="text-xs text-gray-500">
												Type: {section.type} • Level: {section.level} • Words: {section.metadata?.wordCount || 0}
											</div>
										</div>
										<span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
											{section.type}
										</span>
									</div>
									{#if section.content && section.content.length > 0}
										<div class="mt-2 text-sm text-gray-700 truncate">
											{section.content.substring(0, 100)}{section.content.length > 100 ? '...' : ''}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div class="mt-4">
						<p class="text-sm text-green-700 mb-3">
							Analysis complete. Run full decompilation for detailed section breakdown.
						</p>
						<button
							on:click={runFullDecompilation}
							disabled={decompilerProcessing}
							class="btn btn-secondary text-sm"
						>
							{#if decompilerProcessing}
								<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
								</svg>
								Decompiling...
							{:else}
								Run Full Decompilation
							{/if}
						</button>
					</div>
				{/if}
				
				{#if decompilerResult.analysis.detectedReportType}
					<div class="mt-4 p-3 bg-green-100 rounded">
						<div class="text-sm font-medium text-green-800">Detected Report Type:</div>
						<div class="text-green-900">{decompilerResult.analysis.detectedReportType}</div>
					</div>
				{/if}
			</div>
		{/if}
		
		<!-- Section Controls -->
		{#if sections.length > 0}
			<div class="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
				<h3 class="font-medium text-gray-900 mb-3">Section Controls</h3>
				
				<!-- Section Selection -->
				<div class="mb-4">
					<label class="block text-sm font-medium text-gray-700 mb-2">Active Section</label>
					<div class="flex flex-wrap gap-2">
						{#each sections as section}
							<button
								on:click={() => selectSection(section.id)}
								class="px-3 py-2 text-sm border rounded hover:bg-gray-100 transition-colors {activeSectionId === section.id ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'}"
							>
								{section.title || `Section ${section.order}`}
							</button>
						{/each}
					</div>
				</div>
				
				<!-- Section Actions -->
				<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
					<button
						on:click={() => activeSectionId && moveSectionUp(activeSectionId)}
						disabled={!activeSectionId || sections.findIndex(s => s.id === activeSectionId) <= 0}
						class="btn btn-secondary text-sm flex items-center gap-2"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
						</svg>
						Move Up
					</button>
					<button
						on:click={() => activeSectionId && moveSectionDown(activeSectionId)}
						disabled={!activeSectionId || sections.findIndex(s => s.id === activeSectionId) >= sections.length - 1}
						class="btn btn-secondary text-sm flex items-center gap-2"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
						Move Down
					</button>
					<button
						on:click={() => activeSectionId && deleteSection(activeSectionId)}
						disabled={!activeSectionId || sections.length <= 1}
						class="btn btn-secondary text-sm flex items-center gap-2"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
						Delete
					</button>
					<button
						on:click={addSection}
						class="btn btn-primary text-sm flex items-center gap-2"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						Add Section
					</button>
				</div>
				
				<!-- Section-Specific AI Tools -->
				{#if activeSectionId}
					<div class="mb-4">
						<h4 class="font-medium text-gray-800 mb-2">AI Tools for Active Section</h4>
						<div class="flex flex-wrap gap-2">
							<button
								on:click={improveActiveSectionWithAI}
								disabled={aiProcessing || !apiKey}
								class="btn btn-primary text-sm"
							>
								{#if aiProcessing && aiAction.includes('Improving')}
									<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
									</svg>
									Improving...
								{:else}
									Improve
								{/if}
							</button>
							<button
								on:click={rewriteActiveSectionWithAI}
								disabled={aiProcessing || !apiKey}
								class="btn btn-primary text-sm"
							>
								{#if aiProcessing && aiAction.includes('Rewriting')}
									<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
									</svg>
									Rewriting...
								{:else}
									Rewrite
								{/if}
							</button>
							<button
								on:click={expandActiveSectionWithAI}
								disabled={aiProcessing || !apiKey}
								class="btn btn-primary text-sm"
							>
								{#if aiProcessing && aiAction.includes('Expanding')}
									<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
									</svg>
									Expanding...
								{:else}
									Expand
								{/if}
							</button>
							<button
								on:click={() => activeSectionId && openPhotoUploader(activeSectionId)}
								class="btn btn-secondary text-sm flex items-center gap-2"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								Add Photo
							</button>
							<button
								on:click={startDictation}
								disabled={isRecording}
								class="btn btn-secondary text-sm flex items-center gap-2"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
								</svg>
								{#if isRecording}
									<svg class="w-4 h-4 animate-pulse text-red-600" fill="currentColor" viewBox="0 0 24 24">
										<circle cx="12" cy="12" r="6" />
									</svg>
									Recording...
								{:else}
									Dictate
								{/if}
							</button>
						</div>
						
						<!-- Section AI Prompt -->
						<div class="mt-3">
							<div class="flex gap-2">
								<input
									type="text"
									bind:value={aiSectionPrompt}
									placeholder="Ask AI to modify this section..."
									class="input flex-1 text-sm"
									on:keydown={(e) => e.key === 'Enter' && processSectionAIPrompt()}
									disabled={aiProcessing || !apiKey}
								/>
								<button
									on:click={processSectionAIPrompt}
									disabled={aiProcessing || !aiSectionPrompt.trim() || !apiKey}
									class="btn btn-primary text-sm"
								>
									{#if aiProcessing && aiAction === 'Processing section AI request...'}
										<svg class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
											<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
											<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
										</svg>
										Processing
									{:else}
										Ask AI
									{/if}
								</button>
							</div>
						</div>
					</div>
				{/if}
				
				<!-- Voice Dictation Status -->
				{#if isRecording}
					<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded">
						<div class="flex items-center gap-3">
							<svg class="w-5 h-5 text-red-600 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
								<circle cx="12" cy="12" r="6" />
							</svg>
							<div class="flex-1">
								<div class="font-medium text-red-800">Recording in progress...</div>
								<div class="text-sm text-red-700">{dictationText || 'Speak now...'}</div>
							</div>
							<button
								on:click={stopDictation}
								class="btn btn-secondary text-sm"
							>
								Stop
							</button>
						</div>
					</div>
				{/if}
			</div>
		{/if}
		
		<!-- Photo Uploader Modal -->
		{#if showPhotoUploader}
			<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div class="bg-white rounded-lg p-6 max-w-md w-full">
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-lg font-semibold">Upload Photo</h3>
						<button
							on:click={closePhotoUploader}
							class="text-gray-500 hover:text-gray-700"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					<PhotoUploader
						projectId={selectedProject?.id || ''}
						onUpload={handlePhotoUpload}
						buttonText="Upload Photo"
						buttonVariant="primary"
						showPreview={true}
						multiple={false}
					/>
				</div>
			</div>
		{/if}
		
		<div class="mb-4">
			<textarea
				bind:value={generatedReport}
				rows="20"
				class="input w-full font-mono text-sm"
				placeholder="Edit your report HTML here..."
			></textarea>
		</div>
		
		<div class="flex gap-4">
			<button
				on:click={downloadAsHtml}
				class="btn btn-primary"
			>
				Save & Download
			</button>
			<button
				on:click={saveToSupabase}
				class="btn btn-primary"
			>
				Save to Supabase
			</button>
			<button
				on:click={startOver}
				class="btn btn-secondary"
			>
				Discard Changes
			</button>
		</div>
	</div>
</div>

<style>
	.card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	}
	
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-weight: 500;
		font-size: 0.875rem;
		line-height: 1.25rem;
		cursor: pointer;
		transition: all 0.2s;
		border: 1px solid transparent;
	}
	
	.btn-primary {
		background-color: #059669;
		color: white;
	}
	
	.btn-primary:hover {
		background-color: #047857;
	}
	
	.btn-primary:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}
	
	.btn-secondary {
		background-color: white;
		color: #374151;
		border-color: #d1d5db;
	}
	
	.btn-secondary:hover {
		background-color: #f9fafb;
	}
	
	.input {
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		width: 100%;
	}
	
	.input:focus {
		outline: none;
		box-shadow: 0 0 0 2px #059669;
		border-color: #059669;
	}
</style>