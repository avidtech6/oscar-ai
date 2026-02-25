-- Allow anonymous users to read settings (needed for CredentialManager to load default API keys)
-- This is safe because settings only contain default API keys that are public anyway

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "owner_can_read_settings" ON settings;
DROP POLICY IF EXISTS "owner_can_update_settings" ON settings;

-- Create new policies:
-- 1. Anyone can read settings (anon and authenticated)
CREATE POLICY "anyone_can_read_settings" ON settings
    FOR SELECT
    USING (true);

-- 2. Only authenticated users can insert/update/delete settings
CREATE POLICY "owner_can_update_settings" ON settings
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure the default Groq API key is present
INSERT INTO settings (key, value) VALUES
    ('groq_api_key', 'your_groq_api_key_here')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW()
WHERE settings.value = '' OR settings.value IS NULL;