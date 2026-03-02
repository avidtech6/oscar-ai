# Supabase Setup for Oscar AI V2

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: `oscar-ai-v2` (or your preferred name)
   - **Database Password**: Generate a secure password
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development

## Step 2: Get Project Credentials

After project creation, go to **Project Settings** → **API**:

1. **Project URL**: Copy the `https://[project-ref].supabase.co` URL
2. **anon/public key**: Copy the `anon` key (starts with `eyJ`)

Update your `.env.local` file:
```env
PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...[your-anon-key]
```

## Step 3: Set Up Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates:
   - **Confirm email**: Customize for magic links
   - **Invite user**: Optional
   - **Reset password**: Not needed (we use magic links only)
   - **Email change**: Optional

4. Configure **Site URL**:
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL** to `http://localhost:5173` (or your dev URL)
   - Add redirect URLs for production when ready

## Step 4: Create Database Tables

Run the following SQL in the **SQL Editor**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth)
-- Note: auth.users is automatically created by Supabase

-- Extended with local encryption metadata
CREATE TABLE IF NOT EXISTS user_encryption_metadata (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  pin_salt TEXT NOT NULL,
  encryption_key_hash TEXT NOT NULL,
  biometric_public_key TEXT,
  recovery_token_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences (encrypted locally, synced optionally)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  encrypted_data TEXT,
  sync_version INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_encryption_metadata_user_id ON user_encryption_metadata(id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_encryption_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own encryption metadata"
  ON user_encryption_metadata
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own encryption metadata"
  ON user_encryption_metadata
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own encryption metadata"
  ON user_encryption_metadata
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);
```

## Step 5: Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize the **Confirm email** template:
   ```html
   <h2>Welcome to Oscar AI</h2>
   <p>Click the link below to sign in:</p>
   <p>
     <a href="{{ .ConfirmationURL }}">Sign in to Oscar AI</a>
   </p>
   <p>This link will expire in 24 hours.</p>
   <p>If you didn't request this, please ignore this email.</p>
   ```

3. Customize the **Recovery email** template:
   ```html
   <h2>Reset your Oscar AI PIN</h2>
   <p>Click the link below to reset your PIN:</p>
   <p>
     <a href="{{ .ConfirmationURL }}">Reset PIN</a>
   </p>
   <p>This link will expire in 1 hour.</p>
   <p>If you didn't request this, please ignore this email.</p>
   ```

## Step 6: Test Configuration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login`
3. Enter your email address
4. Check your email for the magic link
5. Click the link to complete authentication

## Step 7: Development Bypass (Optional)

For development without actual Supabase credentials, set:
```env
PUBLIC_DEV_BYPASS_AUTH=true
```

This will:
- Skip actual Supabase authentication
- Use mock user data
- Allow PIN setup and biometric testing
- Work offline

## Troubleshooting

### "Invalid login credentials"
- Check that email provider is enabled in Supabase
- Verify Site URL is set correctly
- Check that magic link emails are being sent (check spam)

### "Failed to fetch" errors
- Verify `PUBLIC_SUPABASE_URL` is correct
- Check network connectivity
- Ensure CORS is configured (should be auto-configured)

### Database connection errors
- Verify database is running in Supabase
- Check that SQL was executed successfully
- Verify RLS policies allow access

## Production Deployment

For production deployment:

1. Update environment variables with production Supabase project
2. Configure custom domain in Supabase
3. Set up SSL certificates
4. Configure backup and monitoring
5. Update email templates with production branding
6. Set `PUBLIC_DEV_BYPASS_AUTH=false`

## Security Notes

1. **Never commit `.env.local`** to version control
2. Use different projects for development and production
3. Regularly rotate API keys
4. Monitor authentication logs in Supabase
5. Implement rate limiting if needed