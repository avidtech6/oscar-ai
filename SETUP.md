# Oscar AI - Complete Setup Guide

Welcome to Oscar AI! This guide will walk you through setting up everything step by step.

---

## Step 1: Create a Cloudflare Account

1. Go to [cloudflare.com](https://cloudflare.com) and sign up for free
2. Verify your email address
3. Create a new project called "oscar-ai" in the Cloudflare Dashboard

---

## Step 2: Set Up Google Cloud Project

### 2.1 Create a Google Cloud Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Name it "Oscar AI" and note your **Project ID** (e.g., `oscar-ai-12345`)

### 2.2 Enable Required APIs
1. In your Google Cloud Console, go to "APIs & Services" → "Library"
2. Enable these APIs:
   - **Google Drive API** - For storing data in user's Drive
   - **Gmail API** - For sending reports via email
   - **Google AI Studio API** - For Gemini AI

### 2.3 Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure the OAuth consent screen:
   - User Type: External
   - App name: "Oscar AI"
   - Support email: Your Google email
   - Add your email to "Test users"
4. Create the OAuth client:
   - Application type: Web application
   - Name: "Oscar AI Web"
   - **Add authorized redirect URIs:**
     - `http://localhost:5173/api/auth/callback` (for development)
     - `https://oscar-ai.pages.dev/api/auth/callback` (for production)
   - **Add authorized JavaScript origins:**
     - `http://localhost:5173` (for development)
     - `https://oscar-ai.pages.dev` (for production)
5. Copy your **Client ID** and **Client Secret**

### 2.4 Get Gemini API Key
1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key

---

## Step 3: Set Environment Variables in Cloudflare

### 3.1 Go to Cloudflare Dashboard
1. Go to your Cloudflare Pages project
2. Click "Settings" → "Environment Variables"

### 3.2 Add These Variables

| Variable Name | Value |
|---------------|-------|
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://YOUR_PROJECT.pages.dev/api/auth/callback` |
| `GEMINI_API_KEY` | Your Gemini API Key |
| `JWT_SECRET` | A random string (generate one with a password manager) |
| `PUBLIC_APP_URL` | `https://YOUR_PROJECT.pages.dev` |

### 3.3 Important: Update the Redirect URI
After you deploy, update your Google OAuth credentials with the production redirect URI.

---

## Step 4: Deploy to Cloudflare

### 4.1 Install Dependencies
```bash
cd oscar-ai
npm install
```

### 4.2 Build the Project
```bash
npm run build
```

### 4.3 Deploy
```bash
npx wrangler pages deploy .svelte-kit/cloudflare
```

Or connect your GitHub repository to Cloudflare Pages for automatic deployments.

---

## Step 5: Test the Application

1. Go to your deployed URL (e.g., `https://oscar-ai.pages.dev`)
2. Click "Sign in with Google"
3. Complete the OAuth flow
4. Grant permissions for Drive and Gmail

---

## Step 6: Using Oscar AI

### Creating a Project
1. After login, click "Create New Project"
2. Enter a project name (e.g., "Oakwood Development")
3. Click "Create Project"

### Adding Trees
1. Open your project
2. Use the form to add trees:
   - Tree Number (e.g., T1, T2)
   - Species (e.g., Oak, Ash)
   - DBH (diameter at breast height in mm)
   - Category (A, B, C, or U)
3. Click "Add Tree"

### Voice Notes
1. In your project, go to the "Notebook" tab
2. Click "Start Recording"
3. Speak your notes (rambling is OK!)
4. Click "Stop Recording"
5. Click "Save Note"

### Generating Reports
1. In your project, click "Generate Report"
2. Select a report type:
   - BS5837:2012 Tree Survey
   - Arboricultural Impact Assessment
   - Arboricultural Method Statement
   - Tree Condition Report
   - Planning Support Letter
   - Legal Support Statement
3. Add any additional notes
4. Click "Generate Report"
5. Once generated, you can:
   - Copy to clipboard
   - Download as Markdown
   - Email to yourself

### Asking Oscar
1. Click "Oscar" in the sidebar
2. Ask questions about:
   - BS5837 methodology
   - RPA calculations
   - Tree assessment
   - Report writing

---

## Troubleshooting

### "Invalid credentials" error
- Make sure all environment variables are set correctly in Cloudflare
- Check that your Google OAuth credentials have the correct redirect URIs

### "Failed to generate report" error
- Check that your Gemini API key is valid
- Check that the Gemini API is enabled in Google Cloud Console

### "Failed to send email" error
- Make sure you've granted Gmail permission during OAuth
- Check that the Gmail API is enabled in Google Cloud Console

### Project won't load
- Make sure you've created at least one project
- Check that your Google Drive permissions are granted

---

## Privacy Information

- **All data stays in your Google Drive** - We never store your data
- A folder called "OscarAI_Data" is created in your Drive
- Each project is a subfolder within this folder
- You can delete this folder anytime to remove all data

---

## Support

If you need help, ask Oscar the Oak assistant in the app!

---

Built for UK Arboricultural Consultants 🌳
