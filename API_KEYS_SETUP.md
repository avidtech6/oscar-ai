# API Keys Setup for Local Development

This guide explains how to configure API keys for the Oscar AI application in your local development environment.

## Required API Keys

### 1. GROQ API Key
- **Purpose**: Used for AI chat and transcription features
- **Status**: ✅ Already configured in `.env` file
- **Location**: `VITE_GROQ_API_KEY` in `.env`
- **How to get**: Visit [console.groq.com](https://console.groq.com) to create an account and generate an API key

### 2. Gemini API Key (Google AI)
- **Purpose**: For Google's Gemini AI features (if implemented)
- **Status**: ⚠️ Placeholder in `.dev.vars`
- **Location**: `GEMINI_API_KEY` in `.dev.vars`
- **How to get**: 
  1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Create a new API key
  3. Replace placeholder in `.dev.vars`

### 3. Grok API Key (xAI)
- **Purpose**: For xAI's Grok model features (if implemented)
- **Status**: ⚠️ Placeholder in `.dev.vars`
- **Location**: `GROK_API_KEY` in `.dev.vars`
- **How to get**: 
  1. Visit [xAI console](https://console.x.ai/) (if available)
  2. Generate an API key
  3. Replace placeholder in `.dev.vars`

### 4. Supabase Credentials
- **Purpose**: Database and authentication
- **Status**: ✅ Already configured in `.env` file
- **Location**: `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `.env`

## Configuration Files

### `.env` File (Production/Development)
```env
VITE_GROQ_API_KEY=your_actual_groq_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
```

### `.dev.vars` File (Local Development Only)
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/api/auth/callback
GEMINI_API_KEY=your_actual_gemini_key_here
GROK_API_KEY=your_actual_grok_key_here
AUTH_SECRET=oscar-ai-dev-secret-change-in-production
PUBLIC_APP_URL=http://localhost:5173
```

## Verification Steps

1. **Check current configuration**:
   ```bash
   # Check .env file
   cat .env
   
   # Check .dev.vars file  
   cat .dev.vars
   ```

2. **Test API connectivity**:
   - Start the development server: `npm run dev`
   - Open browser to `http://localhost:5173`
   - Check browser console for any API key errors

3. **Update settings in UI**:
   - Navigate to Settings page
   - Enter API keys in the appropriate fields
   - Keys will be saved to IndexedDB

## Troubleshooting

### "API key not found" errors
1. Ensure both `.env` and `.dev.vars` files exist
2. Check that API keys are not commented out
3. Restart the development server after making changes

### "Invalid API key" errors
1. Verify the key is correct (no extra spaces)
2. Check if the API service is accessible
3. Ensure you have sufficient credits/quota

### Local development without all keys
The application can run with just the GROQ API key. Other keys are optional for specific features.

## Security Notes

- Never commit actual API keys to version control
- `.env` and `.dev.vars` are in `.gitignore`
- Use environment variables in production
- Rotate keys regularly
- Use least-privilege access for API keys