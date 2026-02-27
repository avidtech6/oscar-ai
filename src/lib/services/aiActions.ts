import { generateLLMResponse } from './ai';
import type { Card } from '$lib/models/Card';

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
export async function getAIContext(): Promise<any> {
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
export function formatContextForAI(context: any): string {
  return `Workspace: ${context.workspace}\nTimestamp: ${new Date(context.timestamp).toISOString()}`;
}

/**
 * Parse user answer for AI review.
 * This is a placeholder implementation.
 */
export async function parseUserAnswer(answer: string, question: string): Promise<any> {
  return {
    parsed: answer,
    confidence: 0.8,
    issues: []
  };
}

/**
 * Suggest client name based on context.
 * This is a placeholder implementation.
 */
export async function suggestClientName(context: any): Promise<string> {
  return 'Client Name';
}

/**
 * Suggest site address based on context.
 * This is a placeholder implementation.
 */
export async function suggestSiteAddress(context: any): Promise<string> {
  return '123 Main St, City, Country';
}

/**
 * Generate follow-up questions for a report.
 * This is a placeholder implementation.
 */
export async function generateFollowUpQuestions(reportContent: string): Promise<string[]> {
  return [
    'What is the primary objective of this report?',
    'Are there any specific compliance requirements?'
  ];
}

/**
 * Generate AI gap-fill questions for a report.
 * This is a placeholder implementation.
 */
export async function generateAIGapFillQuestions(reportContent: string): Promise<any[]> {
  return [
    {
      question: 'What is the main finding?',
      field: 'mainFinding',
      required: true
    }
  ];
}
