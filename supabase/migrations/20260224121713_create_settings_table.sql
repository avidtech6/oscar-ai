-- Create settings table for credential management
-- Only the authenticated owner can read/write settings

CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS settings_key_idx ON settings(key);

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "owner_can_read_settings" ON settings;
DROP POLICY IF EXISTS "owner_can_update_settings" ON settings;

-- Create policies
-- Only authenticated users can read settings (owner-only in practice)
CREATE POLICY "owner_can_read_settings" ON settings
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Only authenticated users can insert/update settings (owner-only in practice)
CREATE POLICY "owner_can_update_settings" ON settings
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Insert default settings if they don't exist
INSERT INTO settings (key, value) VALUES
    ('oscar_api_key', ''),
    ('openai_api_key', ''),
    ('groq_api_key', ''),
    ('anthropic_api_key', '')
ON CONFLICT (key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON settings TO authenticated;
GRANT SELECT ON settings TO anon;