import { generateLLMResponse } from './ai';
import type { Card } from '$lib/models/Card';
import type { Project } from '$lib/db';

export interface AIContext {
  workspace: string;
  timestamp: number;
  items: any[];
  currentProject?: Project | null;
  projects?: Project[];
}

export interface ActionResult {
  success: boolean;
  message: string;
  intentType?: string;
  redirectUrl?: string;
  objects?: any[];
  data?: any;
  action?: string;
}

/**
 * Summarises a card using AI.
 * @param card - The card to summarise
 * @returns A summarised version of the card's content
 */
export async function summariseCard(card: Card): Promise<string> {
  try {
    const prompt = `Summarise this card: ${card.summary}`;
    const context = { card };
    const summary = await generateLLMResponse(prompt, context);
    return summary;
  } catch (error) {
    console.error('Error summarising card:', error);
    throw error;
  }
}

/**
 * Get AI context for semantic routing.
 * This is a placeholder implementation.
 */
export async function getAIContext(): Promise<AIContext> {
  // Return minimal context for now
  return {
    workspace: 'default',
    timestamp: Date.now(),
    items: []
  };
}

/**
 * Format AI context for prompt.
 * This is a placeholder implementation.
 */
export function formatContextForAI(context: AIContext): string {
  return `Workspace: ${context.workspace}\nTimestamp: ${new Date(context.timestamp).toISOString()}`;
}

/**
 * Suggest client name based on context.
 * This is a placeholder implementation.
 */
export async function suggestClientName(context: any): Promise<{ suggestion: string; confidence: number }> {
  return { suggestion: 'Client Name', confidence: 85 };
}

/**
 * Suggest site address based on context.
 * This is a placeholder implementation.
 */
export async function suggestSiteAddress(context: any): Promise<{ suggestion: string; confidence: number }> {
  return { suggestion: '123 Main St, City, Country', confidence: 75 };
}

/**
 * Parse user answer for AI review.
 * This is a placeholder implementation.
 */
export async function parseUserAnswer(answer: string, question: string): Promise<{ cleaned: string; confidence: number }> {
  return {
    cleaned: answer.trim(),
    confidence: 0.8 * 100
  };
}

/**
 * Generate follow-up questions for a report.
 * This is a placeholder implementation.
 */
export async function generateFollowUpQuestions(field: string, answer: string): Promise<string[]> {
  return [
    `Can you provide more details about the ${field}?`,
    `Is there any specific location or address?`
  ];
}

/**
 * Generate AI gap-fill questions for a report.
 * This is a placeholder implementation.
 */
export async function generateAIGapFillQuestions(templateId: string, projectData: any): Promise<Array<{id: string; question: string; answer: string; field: string}>> {
  // Generate a simple set of questions based on template
  const questions = [
    {
      id: crypto.randomUUID(),
      question: 'What is the client or organization name?',
      answer: '',
      field: 'client'
    },
    {
      id: crypto.randomUUID(),
      question: 'What is the site address or location?',
      answer: '',
      field: 'location'
    },
    {
      id: crypto.randomUUID(),
      question: 'Do you have any tree survey data to include?',
      answer: '',
      field: 'trees'
    },
    {
      id: crypto.randomUUID(),
      question: 'Any field notes or observations to include?',
      answer: '',
      field: 'notes'
    }
  ];
  return questions;
}
