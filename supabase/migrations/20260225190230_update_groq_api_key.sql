-- Update default Groq API key for Oscar AI
-- This ensures the Groq API key is set by default (development/demo key)

-- Insert or update the groq_api_key setting
INSERT INTO settings (key, value) VALUES
    ('groq_api_key', 'your_groq_api_key_here')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW()
WHERE settings.value = '' OR settings.value IS NULL;

-- Log the update
DO $$
BEGIN
    RAISE NOTICE 'Updated groq_api_key in settings table';
END $$;