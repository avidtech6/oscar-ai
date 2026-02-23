// API keys loaded from environment variables
// These values come from the .env file via Vite's import.meta.env

export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

// Validate that required environment variables are set
if (!GROQ_API_KEY) {
    console.warn("VITE_GROQ_API_KEY is not set in environment variables");
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase credentials are not fully configured in environment variables");
}