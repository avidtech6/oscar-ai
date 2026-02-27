import { getGroqKey } from './supabaseClient';

/**
 * Generates an LLM response using Groq's API.
 * @param prompt - The user's prompt
 * @param context - Additional context (selectedCard, activeFilters, page)
 * @returns The assistant's response as a string
 */
export async function generateLLMResponse(prompt: string, context: any): Promise<string> {
  try {
    const apiKey = await getGroqKey();
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: 'You are Oscar AI. Be concise and helpful.' },
          { role: 'user', content: prompt },
          { role: 'user', content: 'Context: ' + JSON.stringify(context) }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated.';
  } catch (error) {
    console.error('Error generating LLM response:', error);
    throw error;
  }
}

/**
 * Generate an outline for a PDF document
 */
export async function generatePdfOutline(html: string): Promise<any> {
  try {
    const prompt = `Generate a structured outline for this document. Return a JSON array of sections with id, title, level (1-3), and page number. Document content: ${html.substring(0, 2000)}`;
    
    const response = await generateLLMResponse(prompt, { task: 'pdf_outline' });
    
    // Try to parse JSON from response
    try {
      const jsonMatch = response.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Failed to parse outline JSON, returning structured text');
    }
    
    return response;
  } catch (error) {
    console.error('Error generating PDF outline:', error);
    throw error;
  }
}

/**
 * Rewrite a section of a PDF document
 */
export async function rewritePdfSection(sectionHtml: string, contextHtml: string): Promise<string> {
  try {
    const prompt = `Rewrite this section to be more clear and professional. Keep the same meaning but improve the writing. Section: ${sectionHtml}`;
    
    const response = await generateLLMResponse(prompt, {
      task: 'rewrite_section',
      context: contextHtml.substring(0, 1000)
    });
    
    return response;
  } catch (error) {
    console.error('Error rewriting PDF section:', error);
    throw error;
  }
}

/**
 * Summarise a PDF document
 */
export async function summarisePdf(html: string): Promise<string> {
  try {
    const prompt = `Provide a concise summary of this document. Focus on key points and main ideas. Document: ${html.substring(0, 3000)}`;
    
    const response = await generateLLMResponse(prompt, { task: 'summarise_pdf' });
    return response;
  } catch (error) {
    console.error('Error summarising PDF:', error);
    throw error;
  }
}

/**
 * Transcribes audio using Groq's Whisper API.
 * @param file - The audio file to transcribe
 * @returns The transcription text
 */
export async function transcribeAudio(file: File): Promise<string> {
  try {
    const apiKey = await getGroqKey();
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-large-v3');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Whisper API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}