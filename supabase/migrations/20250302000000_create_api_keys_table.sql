-- Create API keys table for secure key vault
-- All keys are encrypted at rest using client-side encryption
-- No plaintext API keys are ever stored in the database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Encrypted key data (encrypted client-side before storage)
    encrypted_key TEXT NOT NULL,
    iv TEXT NOT NULL, -- Initialization vector for AES-GCM
    
    -- Key metadata
    key_name TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'azure', 'grok', 'custom')),
    model_family TEXT, -- e.g., 'gpt-4', 'claude-3', 'gemini-pro'
    
    -- Usage tracking
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    
    -- Security metadata
    key_version INTEGER DEFAULT 1,
    rotation_due_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    -- Sync metadata
    local_hash TEXT, -- Hash of local encrypted data for conflict detection
    last_synced_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_user_key_name UNIQUE (user_id, key_name),
    CONSTRAINT valid_iv CHECK (iv ~ '^[A-Za-z0-9+/=]+$'), -- Base64 validation
    CONSTRAINT valid_encrypted_key CHECK (encrypted_key ~ '^[A-Za-z0-9+/=]+$') -- Base64 validation
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_rotation_due ON api_keys(rotation_due_at) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy: Users can read only their own keys
CREATE POLICY "Users can view their own API keys"
    ON api_keys
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert only their own keys
CREATE POLICY "Users can insert their own API keys"
    ON api_keys
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own keys
CREATE POLICY "Users can update their own API keys"
    ON api_keys
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own keys
CREATE POLICY "Users can delete their own API keys"
    ON api_keys
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment usage count
CREATE OR REPLACE FUNCTION increment_key_usage(key_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE api_keys
    SET 
        usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = key_id;
END;
$$ language 'plpgsql';

-- Create function to mark keys for rotation
CREATE OR REPLACE FUNCTION mark_keys_for_rotation(days_interval INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    keys_marked INTEGER;
BEGIN
    UPDATE api_keys
    SET rotation_due_at = NOW() + (days_interval || ' days')::INTERVAL
    WHERE rotation_due_at IS NULL
      AND is_active = true;
    
    GET DIAGNOSTICS keys_marked = ROW_COUNT;
    RETURN keys_marked;
END;
$$ language 'plpgsql';

-- Create function to deactivate expired keys
CREATE OR REPLACE FUNCTION deactivate_expired_keys()
RETURNS INTEGER AS $$
DECLARE
    keys_deactivated INTEGER;
BEGIN
    UPDATE api_keys
    SET is_active = false
    WHERE rotation_due_at < NOW()
      AND is_active = true;
    
    GET DIAGNOSTICS keys_deactivated = ROW_COUNT;
    RETURN keys_deactivated;
END;
$$ language 'plpgsql';

-- Create view for active keys (simplified for client use)
CREATE OR REPLACE VIEW active_api_keys AS
SELECT 
    id,
    user_id,
    key_name,
    provider,
    model_family,
    last_used_at,
    usage_count,
    key_version,
    rotation_due_at,
    created_at,
    updated_at
FROM api_keys
WHERE is_active = true;

-- Create view for keys needing rotation (for admin/notification purposes)
CREATE OR REPLACE VIEW keys_needing_rotation AS
SELECT 
    id,
    user_id,
    key_name,
    provider,
    rotation_due_at,
    EXTRACT(DAY FROM (rotation_due_at - NOW())) AS days_until_due
FROM api_keys
WHERE is_active = true
  AND rotation_due_at IS NOT NULL
  AND rotation_due_at < NOW() + INTERVAL '7 days'
ORDER BY rotation_due_at ASC;

-- Add comment for documentation
COMMENT ON TABLE api_keys IS 'Secure vault for encrypted API keys. All keys are encrypted client-side before storage.';
COMMENT ON COLUMN api_keys.encrypted_key IS 'AES-GCM encrypted API key (base64 encoded)';
COMMENT ON COLUMN api_keys.iv IS 'Initialization vector for AES-GCM encryption (base64 encoded)';
COMMENT ON COLUMN api_keys.local_hash IS 'Hash of locally encrypted data for conflict detection during sync';

-- Grant permissions
GRANT ALL ON api_keys TO authenticated;
GRANT SELECT ON active_api_keys TO authenticated;
GRANT SELECT ON keys_needing_rotation TO authenticated;
GRANT EXECUTE ON FUNCTION increment_key_usage TO authenticated;
GRANT EXECUTE ON FUNCTION mark_keys_for_rotation TO authenticated;
GRANT EXECUTE ON FUNCTION deactivate_expired_keys TO authenticated;