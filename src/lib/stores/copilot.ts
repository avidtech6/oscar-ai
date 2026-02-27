import { writable, type Writable } from 'svelte/store';
import { generateLLMResponse } from '$lib/services/ai';
import { cards } from './cards';
import { activeFilters } from './context';

export interface CopilotState {
  currentPrompt: string;
  lastResponse: string;
  isThinking: boolean;
}

// Initial state
const initialState: CopilotState = {
  currentPrompt: '',
  lastResponse: '',
  isThinking: false
};

// Create the store
export const copilotState: Writable<CopilotState> = writable(initialState);

// Helper functions
export function setPrompt(value: string): void {
  copilotState.update(state => ({
    ...state,
    currentPrompt: value
  }));
}

export function clearPrompt(): void {
  copilotState.update(state => ({
    ...state,
    currentPrompt: ''
  }));
}

export function setThinking(value: boolean): void {
  copilotState.update(state => ({
    ...state,
    isThinking: value
  }));
}

export function setResponse(value: string): void {
  copilotState.update(state => ({
    ...state,
    lastResponse: value,
    isThinking: false
  }));
}

// Real AI response using Groq
export async function submitPrompt(prompt: string, page: 'workspace' | 'communication' | 'capture' = 'workspace'): Promise<void> {
  setThinking(true);
  
  try {
    // Get current state
    let selectedCard = null;
    let activeFiltersList: any[] = [];
    
    // In a real implementation, we'd get these from stores
    // For now, we'll use empty values
    const context = {
      selectedCard,
      activeFilters: activeFiltersList,
      page
    };
    
    const response = await generateLLMResponse(prompt, context);
    setResponse(response);
    clearPrompt();
  } catch (error) {
    console.error('Error generating AI response:', error);
    setResponse(`Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
  } finally {
    setThinking(false);
  }
}