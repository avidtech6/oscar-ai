import { supabase } from '$lib/supabase/client';

/**
 * Fetches the Groq API key from Supabase.
 * Assumes a table called "keys" with a column "groq_api_key".
 * Returns the first row's groq_api_key value.
 * @throws {Error} If the key is missing or cannot be retrieved
 */
export async function getGroqKey(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('keys')
      .select('groq_api_key')
      .limit(1)
      .single();

    if (error) {
      throw new Error(`Failed to fetch Groq API key: ${error.message}`);
    }

    if (!data?.groq_api_key) {
      throw new Error('Groq API key not found in the database');
    }

    return data.groq_api_key;
  } catch (err) {
    console.error('Error retrieving Groq API key:', err);
    throw err;
  }
}