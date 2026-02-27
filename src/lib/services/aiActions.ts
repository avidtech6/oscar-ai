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
