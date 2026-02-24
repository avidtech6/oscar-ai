/**
 * Report-specific AI helper functions
 * 
 * These functions are used exclusively for report generation and should remain
 * separate from the unified intent/action system.
 */

import { get } from 'svelte/store';
import { db } from '$lib/db';
import { credentialManager } from '$lib/system/CredentialManager';

// Types for AI actions (re-exported for compatibility)
export interface ActionResult {
	success: boolean;
	message: string;
	action?: string;
	data?: any;
	redirectUrl?: string;
	intentType?: string;
}

// Context types (re-exported for compatibility)
export interface AIContext {
	currentProject: any | null;
	projects: any[];
	selectedProjectId: string;
	trees: any[];
	notes: any[];
	reports: any[];
	diagrams: any[];
	blogPosts: any[];
}

// Suggest a client name based on project data with confidence score
export async function suggestClientName(projectData: any): Promise<{suggestion: string; confidence: number}> {
	try {
		// Get API key from CredentialManager
		const apiKey = credentialManager.getGroqKey();
		if (!apiKey) {
			throw new Error('Groq API key not configured. Please set it in Settings.');
		}

		// Fetch previous reports for this project (Step 19: Use Previous Reports as Context)
		let previousReportsContext = '';
		if (projectData.project?.id) {
			try {
				const previousReports = await db.reports.where('projectId').equals(projectData.project.id).toArray();
				if (previousReports.length > 0) {
					previousReportsContext = `\nPREVIOUS REPORTS FOR THIS PROJECT (${previousReports.length}):`;
					previousReports.slice(0, 5).forEach((report: any, index: number) => {
						previousReportsContext += `\n${index + 1}. ${report.title} (${report.type}) - ${new Date(report.generatedAt).toLocaleDateString('en-GB')}`;
					});
					if (previousReports.length > 5) {
						previousReportsContext += `\n... and ${previousReports.length - 5} more reports`;
					}
				}
			} catch (error) {
				console.warn('Could not fetch previous reports for context:', error);
			}
		}

		// Prepare context for AI with confidence scoring request
		const context = `
Project Name: ${projectData.project?.name || 'Unnamed Project'}
Project Description: ${projectData.project?.description || 'No description'}
Project Location: ${projectData.project?.location || 'No location specified'}
Tree Species Present: ${projectData.trees?.map((t: any) => t.species).join(', ') || 'None'}
Notes: ${projectData.notes?.slice(0, 3).map((n: any) => n.content.substring(0, 100)).join('; ') || 'None'}
${previousReportsContext}

Based on this arboricultural project context, suggest a plausible client name for the report.
The client should be a realistic organization or individual who would commission this type of work.
Consider previous reports for this project when making your suggestion.
Also provide a confidence score from 0-100% based on how confident you are in this suggestion.
Return in this exact format:
SUGGESTION: [client name]
CONFIDENCE: [number]%
`;

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
						content: 'You are an expert arboricultural consultant. Suggest plausible client names for tree survey and management projects based on project context. Provide a confidence score from 0-100% based on how well the context supports your suggestion.'
					},
					{ role: 'user', content: context }
				],
				temperature: 0.7,
				max_tokens: 100
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error?.message || 'Failed to get AI suggestion');
		}

		const data = await response.json();
		const responseText = data.choices[0].message.content.trim();
		
		// Parse the response for suggestion and confidence
		let suggestion = '';
		let confidence = 70; // Default confidence
		
		const lines = responseText.split('\n');
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.startsWith('SUGGESTION:')) {
				suggestion = trimmed.replace('SUGGESTION:', '').trim();
			} else if (trimmed.startsWith('CONFIDENCE:')) {
				const confidenceText = trimmed.replace('CONFIDENCE:', '').trim();
				if (typeof confidenceText === 'string') {
					const match = confidenceText.match(/(\d+)/);
					if (match) {
						confidence = parseInt(match[1], 10);
						// Ensure confidence is between 0-100
						confidence = Math.max(0, Math.min(100, confidence));
					}
				}
			}
		}
		
		// Clean up the suggestion
		if (suggestion) {
			suggestion = suggestion
				.replace(/^["']|["']$/g, '') // Remove surrounding quotes
				.replace(/^Client name:?\s*/i, '') // Remove "Client name:" prefix
				.replace(/\.$/g, '') // Remove trailing period
				.trim();
		}
		
		// If no suggestion was parsed, use fallback
		if (!suggestion) {
			suggestion = responseText
				.replace(/^["']|["']$/g, '')
				.replace(/^Client name:?\s*/i, '')
				.replace(/\.$/g, '')
				.trim();
			
			// If still empty, use fallback
			if (!suggestion) {
				suggestion = 'Local Council / Property Developer';
				confidence = 50; // Lower confidence for fallback
			}
		}

		return { suggestion, confidence };
	} catch (error) {
		console.error('Error suggesting client name:', error);
		// Fallback suggestions based on project context with lower confidence
		let fallbackSuggestion = 'Property Owner / Client';
		let fallbackConfidence = 40;
		
		if (projectData.project?.location?.toLowerCase().includes('council')) {
			fallbackSuggestion = 'Local Council';
			fallbackConfidence = 60;
		} else if (projectData.trees?.length > 10) {
			fallbackSuggestion = 'Large Property Developer';
			fallbackConfidence = 55;
		} else if (projectData.project?.name?.toLowerCase().includes('school')) {
			fallbackSuggestion = 'School / Educational Institution';
			fallbackConfidence = 65;
		}
		
		return { suggestion: fallbackSuggestion, confidence: fallbackConfidence };
	}
}

// Suggest a site address based on project data with confidence score
export async function suggestSiteAddress(projectData: any): Promise<{suggestion: string; confidence: number}> {
	try {
		// Get API key from CredentialManager
		const apiKey = credentialManager.getGroqKey();
		if (!apiKey) {
			throw new Error('Groq API key not configured. Please set it in Settings.');
		}

		// Fetch previous reports for this project (Step 19: Use Previous Reports as Context)
		let previousReportsContext = '';
		if (projectData.project?.id) {
			try {
				const previousReports = await db.reports.where('projectId').equals(projectData.project.id).toArray();
				if (previousReports.length > 0) {
					previousReportsContext = `\nPREVIOUS REPORTS FOR THIS PROJECT (${previousReports.length}):`;
					previousReports.slice(0, 5).forEach((report: any, index: number) => {
						previousReportsContext += `\n${index + 1}. ${report.title} (${report.type}) - ${new Date(report.generatedAt).toLocaleDateString('en-GB')}`;
					});
					if (previousReports.length > 5) {
						previousReportsContext += `\n... and ${previousReports.length - 5} more reports`;
					}
				}
			} catch (error) {
				console.warn('Could not fetch previous reports for context:', error);
			}
		}

		// Prepare context for AI with confidence scoring request
		const context = `
Project Name: ${projectData.project?.name || 'Unnamed Project'}
Project Description: ${projectData.project?.description || 'No description'}
Project Client: ${projectData.project?.client || 'Not specified'}
Tree Species Present: ${projectData.trees?.map((t: any) => t.species).join(', ') || 'None'}
Notes: ${projectData.notes?.slice(0, 3).map((n: any) => n.content.substring(0, 100)).join('; ') || 'None'}
${previousReportsContext}

Based on this arboricultural project context, suggest a plausible site address for the report.
The address should be a realistic location for tree survey work in the UK.
Include street name, town/city, and postcode if possible.
Consider previous reports for this project when making your suggestion.
Also provide a confidence score from 0-100% based on how confident you are in this suggestion.
Return in this exact format:
SUGGESTION: [site address]
CONFIDENCE: [number]%
`;

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
						content: 'You are an expert arboricultural consultant familiar with UK locations. Suggest plausible site addresses for tree survey projects based on project context. Provide a confidence score from 0-100% based on how well the context supports your suggestion.'
					},
					{ role: 'user', content: context }
				],
				temperature: 0.7,
				max_tokens: 150
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error?.message || 'Failed to get AI suggestion');
		}

		const data = await response.json();
		const responseText = data.choices[0].message.content.trim();
		
		// Parse the response for suggestion and confidence
		let suggestion = '';
		let confidence = 70; // Default confidence
		
		const lines = responseText.split('\n');
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.startsWith('SUGGESTION:')) {
				suggestion = trimmed.replace('SUGGESTION:', '').trim();
			} else if (trimmed.startsWith('CONFIDENCE:')) {
				const confidenceText = trimmed.replace('CONFIDENCE:', '').trim();
				if (typeof confidenceText === 'string') {
					const match = confidenceText.match(/(\d+)/);
					if (match) {
						confidence = parseInt(match[1], 10);
						// Ensure confidence is between 0-100
						confidence = Math.max(0, Math.min(100, confidence));
					}
				}
			}
		}
		
		// Clean up the suggestion
		if (suggestion) {
			suggestion = suggestion
				.replace(/^["']|["']$/g, '')
				.replace(/^Site address:?\s*/i, '')
				.replace(/^Address:?\s*/i, '')
				.replace(/\.$/g, '')
				.trim();
		}
		
		// If no suggestion was parsed, use fallback
		if (!suggestion) {
			suggestion = responseText
				.replace(/^["']|["']$/g, '')
				.replace(/^Site address:?\s*/i, '')
				.replace(/^Address:?\s*/i, '')
				.replace(/\.$/g, '')
				.trim();
			
			// If still empty, use fallback
			if (!suggestion) {
				suggestion = '123 Green Lane, London, SW1A 1AA';
				confidence = 50; // Lower confidence for fallback
			}
		}

		return { suggestion, confidence };
	} catch (error) {
		console.error('Error suggesting site address:', error);
		// Fallback suggestions based on project context with lower confidence
		let fallbackSuggestion = '123 Survey Site, Arboricultural Area, AB1 2CD';
		let fallbackConfidence = 40;
		
		if (projectData.project?.client?.toLowerCase().includes('council')) {
			fallbackSuggestion = 'Council Offices, High Street, Local Town';
			fallbackConfidence = 60;
		} else if (projectData.project?.name?.toLowerCase().includes('school')) {
			fallbackSuggestion = 'School Lane, Education Town, ED1 2AB';
			fallbackConfidence = 65;
		} else if (projectData.trees?.length > 0) {
			const species = projectData.trees[0].species;
			if (species.toLowerCase().includes('oak')) {
				fallbackSuggestion = 'Oak Tree Lane, Woodland Area, WD3 4EF';
				fallbackConfidence = 55;
			}
		}
		
		return { suggestion: fallbackSuggestion, confidence: fallbackConfidence };
	}
}

// Parse and clean user-provided free-text answers with confidence score
// For Step 17: Multi-Field Extraction - can extract both client and location from a single answer
export async function parseUserAnswer(answer: string, field: string): Promise<{cleaned: string; confidence: number}> {
	// For Step 17, handle both client and location fields with multi-field extraction
	if (field !== 'client' && field !== 'location') {
		return { cleaned: answer, confidence: 100 }; // Return as-is for other fields with high confidence
	}

	try {
		// Get API key from CredentialManager
		const apiKey = credentialManager.getGroqKey();
		if (!apiKey) {
			throw new Error('Groq API key not configured. Please set it in Settings.');
		}

		// Determine what we're extracting
		const extractionType = field === 'client' ? 'client name' : 'site address';
		
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
						content: `You are an expert arboricultural consultant. Extract the ${extractionType} from free-text input. The user may provide both client name and site address in a single answer. Focus on extracting just the ${extractionType}, removing any extra commentary, punctuation, or irrelevant details. Also provide a confidence score from 0-100% based on how confident you are that this is the correct extracted ${extractionType}. Return in this exact format:\nCLEANED: [extracted ${extractionType}]\nCONFIDENCE: [number]%`
					},
					{
						role: 'user',
						content: `Extract the ${extractionType} from this text for a professional report: "${answer}"`
					}
				],
				temperature: 0.3,
				max_tokens: 100
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error?.message || 'Failed to parse answer');
		}

		const data = await response.json();
		const responseText = data.choices[0].message.content.trim();
		
		// Parse the response for cleaned text and confidence
		let cleaned = '';
		let confidence = 80; // Default confidence for AI cleaning
		
		const lines = responseText.split('\n');
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.startsWith('CLEANED:')) {
				cleaned = trimmed.replace('CLEANED:', '').trim();
			} else if (trimmed.startsWith('CONFIDENCE:')) {
				const confidenceText = trimmed.replace('CONFIDENCE:', '').trim();
				if (typeof confidenceText === 'string') {
					const match = confidenceText.match(/(\d+)/);
					if (match) {
						confidence = parseInt(match[1], 10);
						// Ensure confidence is between 0-100
						confidence = Math.max(0, Math.min(100, confidence));
					}
				}
			}
		}
		
		// Clean up the cleaned text
		if (cleaned) {
			cleaned = cleaned
				.replace(/^["']|["']$/g, '') // Remove surrounding quotes
				.replace(/^Cleaned (client name|site address):?\s*/i, '')
				.replace(/^(Client name|Site address):?\s*/i, '')
				.replace(/\.$/g, '')
				.trim();
		}
		
		// If no cleaned text was parsed, use fallback
		if (!cleaned) {
			cleaned = responseText
				.replace(/^["']|["']$/g, '')
				.replace(/^Cleaned (client name|site address):?\s*/i, '')
				.replace(/^(Client name|Site address):?\s*/i, '')
				.replace(/\.$/g, '')
				.trim();
			
			// If still empty, use simple cleaning
			if (!cleaned) {
				cleaned = answer
					.replace(/^[^a-zA-Z0-9]+/, '')
					.replace(/[^a-zA-Z0-9\s\/&]+$/, '')
					.replace(/\s+/g, ' ')
					.trim();
				confidence = 60; // Lower confidence for fallback cleaning
			}
		}

		return { cleaned: cleaned || answer, confidence };
	} catch (error) {
		console.error('Error parsing user answer:', error);
		// Simple fallback cleaning with lower confidence
		const simpleClean = answer
			.replace(/^[^a-zA-Z0-9]+/, '') // Remove leading non-alphanumeric
			.replace(/[^a-zA-Z0-9\s\/&]+$/, '') // Remove trailing punctuation
			.replace(/\s+/g, ' ') // Normalize spaces
			.trim();
		
		return {
			cleaned: simpleClean || answer,
			confidence: 50 // Low confidence for error case
		};
	}
}

// Generate follow-up questions for site address
export async function generateFollowUpQuestions(field: string, answer: string): Promise<string[]> {
	// For Step 14, only handle site address
	if (field !== 'location') {
		return []; // Return empty for other fields
	}

	try {
		// Get API key from CredentialManager
		const apiKey = credentialManager.getGroqKey();
		if (!apiKey) {
			throw new Error('Groq API key not configured. Please set it in Settings.');
		}

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
						content: 'You are an expert arboricultural consultant. Based on a site address provided by the user, generate 2-3 relevant follow-up questions to gather more precise location details for a tree survey report. Return each question on a new line, numbered (1., 2., 3.).'
					},
					{
						role: 'user',
						content: `Site address: "${answer}"\n\nGenerate 2-3 follow-up questions to clarify the location details for a tree survey report.`
					}
				],
				temperature: 0.5,
				max_tokens: 150
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error?.message || 'Failed to generate follow-up questions');
		}

		const data = await response.json();
		const questionsText = data.choices[0].message.content.trim();
		
		// Parse the questions - split by new lines and clean
		const questions = questionsText
			.split('\n')
			.map((q: string) => q.replace(/^\d+\.\s*/, '').trim())
			.filter((q: string) => q.length > 0 && !q.toLowerCase().includes('note:') && !q.toLowerCase().includes('follow-up'));

		// Ensure we have at least 2 questions
		if (questions.length === 0) {
			return [
				'Is this a residential or commercial property?',
				'Are there any access restrictions we should be aware of?',
				'Do you have a site plan or map available?'
			];
		}

		return questions.slice(0, 3); // Return max 3 questions
	} catch (error) {
		console.error('Error generating follow-up questions:', error);
		// Fallback questions
		return [
			'Is this a residential or commercial property?',
			'Are there any access restrictions we should be aware of?',
			'Do you have a site plan or map available?'
		];
	}
}

// Generate AI-powered gap-fill questions based on template and project data
export async function generateAIGapFillQuestions(templateId: string, projectData: any): Promise<Array<{id: string; question: string; answer: string; field: string}>> {
	try {
		// Get API key from CredentialManager
		const apiKey = credentialManager.getGroqKey();
		if (!apiKey) {
			throw new Error('Groq API key not configured. Please set it in Settings.');
		}

		// Fetch previous reports for this project (Step 19: Use Previous Reports as Context)
		let previousReportsContext = '';
		if (projectData.project?.id) {
			try {
				const previousReports = await db.reports.where('projectId').equals(projectData.project.id).toArray();
				if (previousReports.length > 0) {
					previousReportsContext = `\nPrevious Reports for this Project: ${previousReports.length} reports found.`;
					previousReports.slice(0, 3).forEach((report: any, index: number) => {
						previousReportsContext += `\n${index + 1}. ${report.title} (${report.type})`;
					});
					if (previousReports.length > 3) {
						previousReportsContext += `\n... and ${previousReports.length - 3} more reports`;
					}
				}
			} catch (error) {
				console.warn('Could not fetch previous reports for gap-fill questions:', error);
			}
		}

		// Prepare context
		const context = `
Template: ${templateId}
Project Name: ${projectData.project?.name || 'Unnamed Project'}
Project Client: ${projectData.project?.client || 'Not specified'}
Project Location: ${projectData.project?.location || 'Not specified'}
Number of Trees: ${projectData.trees?.length || 0}
Number of Notes: ${projectData.notes?.length || 0}
${previousReportsContext}

Based on this project context and the report template, identify the most critical missing information that should be gathered before generating the report.
Consider any previous reports for this project when identifying missing information.
Focus ONLY on client name and site address fields (client, location).
Generate 1-2 questions for each missing field.
Return each question in this exact format:
FIELD: client|location
QUESTION: Your question here
`;

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
						content: 'You are an expert arboricultural consultant. Analyze project data and identify missing information needed for a professional report. Generate focused questions to fill gaps in client name and site address fields only. Return questions in the specified format.'
					},
					{ role: 'user', content: context }
				],
				temperature: 0.4,
				max_tokens: 300
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error?.message || 'Failed to generate AI gap-fill questions');
		}

		const data = await response.json();
		const responseText = data.choices[0].message.content.trim();
		
		// Parse the response
		const questions: Array<{id: string; question: string; answer: string; field: string}> = [];
		const lines = responseText.split('\n');
		
		let currentField = '';
		let currentQuestion = '';
		
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.startsWith('FIELD:')) {
				currentField = trimmed.replace('FIELD:', '').trim().toLowerCase();
			} else if (trimmed.startsWith('QUESTION:')) {
				currentQuestion = trimmed.replace('QUESTION:', '').trim();
				
				if (currentField && currentQuestion && (currentField === 'client' || currentField === 'location')) {
					questions.push({
						id: crypto.randomUUID(),
						question: currentQuestion,
						answer: '',
						field: currentField
					});
					// Reset for next question
					currentField = '';
					currentQuestion = '';
				}
			}
		}

		// If no questions were generated, fall back to static questions
		if (questions.length === 0) {
			const fallbackQuestions = [];
			
			if (!projectData.project?.client || projectData.project.client === 'Not specified') {
				fallbackQuestions.push({
					id: crypto.randomUUID(),
					question: 'What is the client name?',
					answer: '',
					field: 'client'
				});
			}
			
			if (!projectData.project?.location || projectData.project.location === 'Not specified') {
				fallbackQuestions.push({
					id: crypto.randomUUID(),
					question: 'What is the site address?',
					answer: '',
					field: 'location'
				});
			}
			
			return fallbackQuestions;
		}

		return questions;
	} catch (error) {
		console.error('Error generating AI gap-fill questions:', error);
		// Fallback to static questions
		const fallbackQuestions = [];
		
		if (!projectData.project?.client || projectData.project.client === 'Not specified') {
			fallbackQuestions.push({
				id: crypto.randomUUID(),
				question: 'What is the client name?',
				answer: '',
				field: 'client'
			});
		}
		
		if (!projectData.project?.location || projectData.project.location === 'Not specified') {
			fallbackQuestions.push({
				id: crypto.randomUUID(),
				question: 'What is the site address?',
				answer: '',
				field: 'location'
			});
		}
		
		return fallbackQuestions;
	}
}