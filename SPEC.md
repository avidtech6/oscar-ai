# Oscar AI - Technical Specification

## Project Overview
Oscar AI is an arboricultural notebook application that helps field arborists conduct tree surveys, generate reports, and manage project data using AI-powered features.

## Core Technology Stack
- **Frontend**: SvelteKit with TypeScript
- **Styling**: TailwindCSS
- **AI Backend**: Groq API (Llama 3, Mixtral, Whisper)
- **Storage**: Google Drive (OAuth)
- **Deployment**: Cloudflare Pages

---

## 1. Markdown Rendering

### Requirements
- Render Markdown in chat messages including:
  - Headings (h1-h6)
  - Lists (ordered and unordered)
  - Tables
  - Code blocks with syntax highlighting
  - Blockquotes
  - Bold, italic, strikethrough
- Support Mermaid diagrams (flowcharts, sequence diagrams, etc.)
- Sanitize HTML output to prevent XSS attacks

### Implementation
- Use `marked` library for Markdown parsing
- Use `mermaid` for diagram rendering
- Use `DOMPurify` for HTML sanitization
- Render diagrams client-side after message rendering

---

## 2. PDF Rendering

### Requirements
- Use browser-based PDF library (`pdf-lib`)
- Convert Mixtral's PDF instructions into real PDF
- Preview PDF in UI before saving
- Save final PDF to Google Drive

### Implementation
- Install `pdf-lib` for PDF generation
- Create PDF preview component
- Integrate with Mixtral's structured output for PDF instructions
- Save PDFs to /OscarAI/Projects/{ProjectName}/PDFs/

---

## 3. Google Drive Folder Structure

### Required Structure
```
/OscarAI/
  /Projects/
    /{ProjectName}/
      /Audio/
      /Transcripts/
      /Summaries/
      /PDFs/
      metadata.json
```

### Implementation
- Create folder structure automatically on project creation
- Store metadata in metadata.json:
  ```json
  {
    "projectId": "string",
    "projectName": "string",
    "createdAt": "ISO date",
    "updatedAt": "ISO date",
    "treeCount": number,
    "lastSurveyDate": "ISO date"
  }
  ```
- Use timestamped, human-readable filenames:
  - Audio: `voice-note-2024-01-15-14-30-00.webm`
  - Transcripts: `transcript-2024-01-15-14-30-00.txt`
  - Summaries: `summary-2024-01-15-14-30-00.md`
  - PDFs: `BS5837-Report-2024-01-15.pdf`

---

## 4. Routing Prompt Installation

### Routing Rules
All AI requests must use the routing prompt:

```
You are Oscar's AI routing engine.

Use the following models for specific tasks:

- Whisper (Groq): Speech-to-text, continuous dictation, long-form audio notes
- Llama 3 70B (Groq): Chat, reasoning, planning, rewriting, summaries, task extraction, understanding user intent
- Mixtral 8x7B (Groq): HTML/CSS layout generation, JSON structures, Mermaid diagrams, flowcharts, UI scaffolding, PDF instruction generation

Rules:
- Always return structured output when possible
- Prefer Mermaid for diagrams
- Prefer HTML/CSS for layouts
- Prefer JSON for structured data
- PDF files must be generated in the browser using Oscar's renderer
- All output must be compatible with Cloudflare Pages Functions
- If a task requires speech, route to Whisper
- If a task requires reasoning or conversation, route to Llama 3
- If a task requires structured output or diagrams, route to Mixtral
```

### Implementation
- Add routing prompt to all AI function calls
- Create wrapper functions that include the routing prompt
- Ensure all chat, transcription, and generation functions use this system prompt

---

## 5. Assistant System Prompt (Oscar)

### Oscar's Identity
Oscar must be aware of its capabilities and identity. The following system prompt is used for Oscar's chat responses:

```
You are Oscar the Oak, a knowledgeable and friendly UK Arboricultural Consultant assistant powered by advanced AI.

## Your Capabilities

You have access to the following features:

### PDF Generation
- You can generate professional PDF reports (BS5837, AIA, AMS, Tree Condition Reports)
- PDFs are generated in the browser using Oscar's PDF renderer
- Users can preview PDFs before saving to Google Drive

### Google Drive Integration
- Save reports, audio files, transcripts, and summaries directly to Google Drive
- Create and manage project folders
- All files are organized in /OscarAI/Projects/{ProjectName}/ structure

### Project Management
- Create new projects with automatic folder structure
- Add trees to surveys with BS5837 categories
- Generate arboricultural reports from survey data
- Manage project metadata

### Voice Features
- Live Dictation: Stream audio for real-time transcription
- Voice Notes: Record, transcribe, summarize, and save audio clips
- All voice data is saved to Google Drive

### Structured Output
- Generate Mermaid diagrams for workflows and tree data
- Create JSON structures for data export
- Generate HTML/CSS layouts for reports
- Produce flowcharts for planning applications

## Your Expertise

- BS5837:2012 Tree Survey methodology
- Root Protection Area (RPA) calculations
- Tree categories (A, B, C, U)
- Arboricultural Impact Assessments (AIA)
- Arboricultural Method Statements (AMS)
- Visual Tree Assessment (VTA)
- UK planning applications and tree legislation

## Guidelines

- Use British English spelling and metric measurements
- Be warm, helpful, and professional
- Always offer to save work to Google Drive when appropriate
- Use structured output (Markdown, JSON, Mermaid) when helpful
- If asked about capabilities not listed, explain what you can do
```

### Implementation
- Add Oscar's system prompt to all chat responses
- Combine with routing prompt for AI task routing
- Ensure Oscar mentions its capabilities when relevant

---

## 6. Voice Features

### Live Dictation Mode
- Microphone button to start/stop recording
- Stream audio to Whisper (Groq)
- Show text in chat box in real-time
- User can edit before sending
- Send final text to Llama 3 (Groq)

### Voice Note Mode
- Record long audio clips (up to 10 minutes)
- Save audio file to Google Drive (/Audio/)
- Transcribe with Whisper
- Save transcript to Google Drive (/Transcripts/)
- Summarise with Llama 3
- Save summary to Google Drive (/Summaries/)
- Attach everything to the current project folder

---

## 7. API Endpoints

### Chat (Renamed from Gemini)
- `POST /api/chat` - Chat with Oscar using Llama 3 (was `/api/gemini/chat`)

### Whisper (Speech-to-Text)
- `POST /api/whisper/transcribe` - Transcribe audio using Whisper
  - **Accepted formats**: webm, wav, mp3
  - **Max duration**: 10 minutes
  - **Streaming support**: For live dictation mode
  - **Batch mode**: For voice notes
  - **Error handling**: 
    - Return 413 for files exceeding 10MB
    - Return 408 for requests exceeding timeout
    - Return 415 for unsupported formats

### Mixtral (Structured Output)
- `POST /api/mixtral/generate` - Generate HTML, JSON, Mermaid, PDF instructions

### Google Drive
- `POST /api/drive/upload-audio` - Upload audio file
- `POST /api/drive/save-transcript` - Save transcript
- `POST /api/drive/save-summary` - Save summary
- `POST /api/drive/save-pdf` - Save generated PDF
- `POST /api/drive/create-project` - Create project folder structure
- `GET /api/drive/list-projects` - List all projects
- `GET /api/drive/list/{folderId}` - List files in folder

### Deprecated Endpoints (Remove)
- `POST /api/gemini/chat` - DELETE - Use `/api/chat` instead
- `POST /api/gemini/generate` - DELETE - Use `/api/mixtral/generate` instead

---

## 8. Google Drive OAuth Flow

### OAuth Callback Route
- **Login endpoint**: `GET /api/auth/login`
- **Callback endpoint**: `GET /api/auth/callback`
- **Fallback callback endpoint**: `GET /api/auth/callback/google` (redirects to main callback)
- **Logout endpoint**: `GET /api/auth/logout`

### OAuth Token Flow
1. User clicks "Sign in with Google" → redirected to `/api/auth/login`
2. Login endpoint generates OAuth URL with state cookie → redirects to Google
3. User authenticates with Google → Google redirects to `/api/auth/callback` with code
4. Callback exchanges code for tokens → stores tokens in httpOnly cookies
5. Each API request validates token via `hooks.server.ts` → refreshes if expired
6. Token is passed to Google Drive API via Authorization header

### Cookie Settings
- **access_token**: httpOnly, secure, sameSite: 'lax', maxAge: 1 week
- **refresh_token**: httpOnly, secure, sameSite: 'lax', maxAge: 1 year
- **root_folder_id**: httpOnly, secure, sameSite: 'lax', maxAge: 1 year

### Required Redirect URIs in Google Cloud Console

You MUST add these URIs to your Google Cloud Console OAuth credentials:

1. **Production (recommended)**: `https://oscar-ai.pages.dev/api/auth/callback`
2. **Production (alternative)**: `https://oscar-ai.pages.dev/api/auth/callback/google`
3. **Development**: `http://localhost:5173/api/auth/callback`

The application supports both `/api/auth/callback` and `/api/auth/callback/google` routes for OAuth callbacks.

### Environment Variables Required
The following environment variables must be set in Cloudflare Pages:
- `GOOGLE_CLIENT_ID` - OAuth client ID from Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - OAuth client secret
- `GOOGLE_REDIRECT_URI` - OAuth callback URI (optional - defaults to production URL)

### Login Prompts
- **When to prompt login**:
  - First time user visits the app
  - When accessing Drive-dependent features (save, upload, project creation)
  - When accessing voice note features
  
- **What happens if user is not logged in**:
  - Show login button prominently
  - Display message: "Sign in with Google to save to Drive"
  - Disable voice note save buttons until logged in
  - Show Drive-only features as disabled with tooltip

### Drive Connection Diagnostics
- Add a "Drive Diagnostics" component to check connection status
- Include a ping endpoint: `GET /api/drive/list?action=ping`
- Show clear error messages when Drive is not accessible
- Provide "Re-authenticate" button when session expires

### Token Management
- **Access Token**: 
  - Stored in httpOnly, secure cookie
  - Included in Authorization header for API calls
  - Expires after 1 hour

- **Refresh Token**:
  - Stored in httpOnly, secure cookie
  - Automatically refreshed when access token expires
  - If refresh fails, redirect to login

- **Token Refresh Behavior**:
  - Check token validity on each request
  - If 401 received, attempt refresh
  - If refresh fails, clear cookies and redirect to login
  - Log refresh events for debugging

### Required Scopes
```
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com.auth/userinfo.profile
https://www.googleapis.com.auth/gmail.send
```

### Drive as Required Storage
- All PDFs must be saved to Drive (no local download only)
- Voice recordings saved to Drive
- Transcripts saved to Drive
- Summaries saved to Drive
- Project data stored in Drive metadata.json

---

## 9. Security Requirements

### Authentication
- Google OAuth 2.0 for user authentication
- Access token stored in httpOnly cookies
- Refresh token for token renewal

### Data Security
- All API keys stored as Cloudflare secrets
- No API keys exposed to client
- Input sanitization for all user inputs

---

## 10. Environment Variables

Required Cloudflare secrets:
- `GROQ_API_KEY` - Groq API key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_MAPS_API_KEY` - Google Maps API key (for maps)

---

## 11. Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive design
- Service worker for offline capability (future)

---

## 12. Error Handling
- Graceful degradation when AI services unavailable
- User-friendly error messages
- Retry logic for failed API calls
- Logging for debugging

---

## 13. Definition of Done (DoD)

### All Features Must Be Fully Functional End-to-End
- [ ] Chat with Oscar returns meaningful responses
- [ ] Markdown renders correctly (headings, lists, tables, code blocks)
- [ ] Mermaid diagrams render from code blocks
- [ ] HTML is sanitized (no XSS vulnerabilities)

### No UI Placeholders
- [ ] All buttons have functional click handlers
- [ ] All forms submit real data
- [ ] Loading states show actual progress
- [ ] Error states display actionable messages

### Google Drive Operations
- [ ] User can sign in with Google
- [ ] Projects create folder structure automatically
- [ ] Audio files upload successfully
- [ ] Transcripts save to correct folder
- [ ] Summaries save to correct folder
- [ ] PDFs save to correct folder
- [ ] metadata.json updates correctly

### Whisper Functionality
- [ ] Live Dictation: Audio streams to Whisper in real-time
- [ ] Live Dictation: Text appears in chat as user speaks
- [ ] Live Dictation: User can edit before sending
- [ ] Voice Notes: Recording works for up to 10 minutes
- [ ] Voice Notes: Transcription completes successfully
- [ ] Voice Notes: Summary generates correctly

### PDF Generation
- [ ] PDF generates from report content
- [ ] PDF preview displays in UI
- [ ] PDF downloads correctly
- [ ] PDF saves to Google Drive
- [ ] PDF is valid and opens in PDF readers

### Routing Prompt
- [ ] All `/api/chat` calls use routing prompt
- [ ] All `/api/mixtral/generate` calls use routing prompt
- [ ] All `/api/whisper/transcribe` calls work correctly
- [ ] Correct model used for each task type

### Endpoint Naming
- [ ] `/api/chat` works (not `/api/gemini/chat`)
- [ ] No references to "gemini" in codebase
- [ ] API responses match expected format

---

## 15. Camera and Photo Features

### Camera Capture
- **Component**: `CameraCapture.svelte`
- **Supported Devices**: Mobile and desktop browsers
- **Supported Formats**: JPEG, PNG
- **Max Resolution**: Device camera maximum (typically 12MP+)
- **Preview**: Show captured photo before saving
- **Storage**: Save to Google Drive `/OscarAI/Projects/{ProjectName}/Images/`
- **Metadata**: Store in `metadata.json` with photo entries

### Photo Metadata Structure
```json
{
  "photos": [
    {
      "id": "uuid",
      "fileName": "IMG_2024-01-15_14-30-00.jpg",
      "timestamp": "2024-01-15T14:30:00Z",
      "project": "Project Name",
      "tags": ["oak", "T1", "disease"],
      "drivePath": "/OscarAI/Projects/ProjectName/Images/IMG_2024-01-15_14-30-00.jpg",
      "thumbnailUrl": "https://drive.google.com/thumbnail?id=...",
      "webViewLink": "https://drive.google.com/file/d/...",
      "description": ""
    }
  ]
}
```

### Google Drive Structure (Updated)
```
/OscarAI/
  /Projects/
    /{ProjectName}/
      /Audio/
      /Transcripts/
      /Summaries/
      /PDFs/
      /Images/           <-- NEW
      metadata.json
```

### Photo Awareness in Chat
Oscar can:
- **List photos**: By time, project, or tags
- **Display thumbnails**: Show photo previews in chat
- **Natural language queries**: 
  - "Show me photos from yesterday"
  - "Show me photos from Project A"
  - "Show me photos tagged with oak"
  - "Show me photos I took at lunchtime"
- **Insert into PDFs**: Add selected photos to generated reports
- **Move photos**: Between project folders
- **Tag photos**: Add/update tags via chat or UI

### API Endpoints (Photos)

#### POST /api/drive/upload-photo
- Accept: multipart/form-data
- Fields: photo (File), projectId, projectName, tags
- Save to: `/OscarAI/Projects/{ProjectName}/Images/`
- Update: `metadata.json`
- Response: `{ success, fileId, fileName, thumbnailUrl, webViewLink }`

#### GET /api/drive/list-photos
- Query params: projectId, projectName, tags, startDate, endDate
- Response: `{ success, photos: [...] }`

#### POST /api/drive/update-photo-metadata
- Fields: fileId, updates (tags, description, projectId)
- Update: metadata.json
- Response: `{ success, photo }`

#### POST /api/drive/move-photo
- Fields: fileId, sourceProjectId, targetProjectId
- Move file and update metadata
- Response: `{ success, newPath }`

---

## 16. Definition of Done (Updated)

### Camera Features
- [ ] Camera capture works on mobile devices
- [ ] Camera capture works on desktop
- [ ] Photo preview displays before saving
- [ ] Photos save to correct Drive folder
- [ ] Photos save as JPEG format
- [ ] Metadata.json updates with photo entry

### Photo Awareness
- [ ] Oscar can list photos by time
- [ ] Oscar can list photos by project
- [ ] Oscar can list photos by tags
- [ ] Photo thumbnails display in chat
- [ ] Natural language queries return correct photos
- [ ] Photos can be inserted into PDFs
- [ ] Photos can be moved between projects
- [ ] Tags can be added/updated

### API Endpoints
- [ ] POST /api/drive/upload-photo works
- [ ] GET /api/drive/list-photos works
- [ ] POST /api/drive/update-photo-metadata works
- [ ] POST /api/drive/move-photo works

### Integration
- [ ] Photos appear in chat when referenced
- [ ] Photo thumbnails render correctly
- [ ] Drive permissions properly requested
- [ ] Error handling for failed uploads

---

## 17. PDF Cover Page

### Requirements
- Full-page or full-width cover image
- Title block with:
  - Project name
  - Document title
  - Client name
  - Site address
  - Date
- Footer with company details
- Cover image sources:
  - Photos taken in Oscar
  - Images stored in Google Drive
  - User-uploaded images
- Mixtral must generate layout instructions for the cover

### Cover Page Layout Structure
```
+------------------------------------------+
|                                          |
|         [COVER IMAGE - FULL BLEED]       |
|                                          |
+------------------------------------------+
|  PROJECT NAME                            |
|  Document Title                          |
|                                          |
|  Client: [Client Name]                  |
|  Site Address: [Address]                |
|  Date: [Date]                           |
|                                          |
+------------------------------------------+
|  [Company Name]                         |
|  [Contact Details]                       |
+------------------------------------------+
```

### Implementation
- PDFGenerator.svelte must support cover page generation
- Cover image must be fetched before PDF generation
- Mixtral generates layout instructions in JSON format
- Cover page is optional (user can skip)

### Mixtral Cover Page Instructions
Mixtral must output structured JSON for cover page:
```json
{
  "cover": {
    "include": true,
    "imageSource": "photos|take-new|upload",
    "imageId": "optional-drive-file-id",
    "titleBlock": {
      "projectName": "string",
      "documentTitle": "string",
      "client": "string",
      "siteAddress": "string",
      "date": "YYYY-MM-DD"
    },
    "footer": {
      "companyName": "string",
      "contactDetails": "string",
      "disclaimer": "optional"
    }
  }
}
```

---

## 18. Page Templates (Headers and Footers)

### Requirements
Every page in generated PDFs must include:

#### Header
- Project name (left-aligned)
- Document title (center)
- Page number with total pages (right-aligned)
- Format: "Page X of Y"

#### Footer
- Company name (left-aligned)
- Contact details (center)
- Optional disclaimer (right-aligned)
- Disclaimer examples:
  - "This report is for planning purposes only"
  - "Subject to site inspection"
  - "Copyright [Company] 2024"

### Mixtral Template Instructions
Mixtral must generate reusable page template:
```json
{
  "pageTemplate": {
    "header": {
      "include": true,
      "showProjectName": true,
      "showDocumentTitle": true,
      "showPageNumber": true,
      "pageNumberFormat": "Page X of Y"
    },
    "footer": {
      "include": true,
      "companyName": "string",
      "contactDetails": "string",
      "disclaimer": "optional text"
    },
    "margins": {
      "top": "20mm",
      "bottom": "20mm",
      "left": "20mm",
      "right": "20mm"
    }
  }
}
```

### Implementation
- PDFGenerator.svelte applies headers/footers to all pages
- First page (cover) excludes header
- Page numbers start from page 2 (after cover)
- Template applied consistently across all PDFs

---

## 19. Image Placement in PDFs

### Chat Commands for Image Placement
Oscar must understand and execute these commands:

1. **"Insert photo X on page Y"**
   - Extract photo ID and page number from message
   - Fetch photo from Drive
   - Place on specified page

2. **"Use the photo from [time] as the cover"**
   - Find photo by timestamp
   - Set as cover image

3. **"Add photos 1, 3, and 4 to the AMS"**
   - Parse photo references
   - Add to specified document section

4. **"Show me the available photos"**
   - List all photos in current project
   - Display thumbnails in chat

### Photo Selection Flow
```
User Command → Oscar Parses → Show Thumbnails → 
User Confirms → Mixtral Generates Layout → PDF Created
```

### Implementation Requirements
- Oscar must show photo thumbnails in chat before placement
- Oscar must confirm placement before applying
- Parse natural language for photo references:
  - By number: "photo 1", "the first photo"
  - By time: "yesterday", "last week", "at lunchtime"
  - By tag: "oak photo", "T1 photo"
  - By description: "the photo of the damaged branch"

### Photo Placement JSON
Mixtral generates placement instructions:
```json
{
  "images": [
    {
      "id": "photo-id",
      "source": "drive",
      "placement": {
        "page": 2,
        "position": "center-top|full-width|float",
        "width": "optional-custom-width",
        "caption": "optional-caption-text"
      }
    }
  ]
}
```

### Thumbnail Display in Chat
- Show up to 4 thumbnails in chat message
- Click thumbnail to select for PDF
- Show photo metadata (date, tags) below thumbnail

---

## 20. Online Image Search (Safe Mode)

### Use Cases
Oscar may search for open-licensed images when:
- User needs tree diagrams
- User needs BS5837 example illustrations
- User needs generic arboricultural graphics
- No photos available from their projects

### Approved Sources
Only search from safe, non-copyrighted sources:
- Unsplash (unsplash.com) - Free commercial use
- Pexels (pexels.com) - Free commercial use
- Pixabay (pixabay.com) - Free commercial use
- Wikimedia Commons (commons.wikimedia.org) - Check license
- OpenClipArt (openclipart.org) - Public domain

### Search Keywords
- Tree diagrams
- BS5837
- Root protection area diagram
- Tree survey methodology
- Arboricultural illustration
- Tree cross-section
- Tree root system

### Implementation
- Create `/api/images/search` endpoint
- Use source's public API or RSS feed
- Cache results for 1 hour
- Display source attribution

### User Confirmation Required
Before inserting searched image:
```
Oscar: "I found this image from Unsplash. 
It's free to use commercially. 
Shall I add it to your report?"
[Show thumbnail]
[Yes, add it] [No, find another]
```

### Online Image Search JSON
```json
{
  "search": {
    "query": "tree root system diagram",
    "source": "unsplash|pexels|pixabay",
    "limit": 5
  }
}
```

### API Endpoint
#### GET /api/images/search
- Query params: query, source (optional), limit (default 5)
- Response: `{ success, images: [{ url, thumbnailUrl, source, attribution }] }`

---

## 21. Definition of Done (Final)

### Google Drive Connection
- [ ] OAuth login works correctly
- [ ] OAuth callback processes tokens successfully
- [ ] Token refresh works when access token expires
- [ ] Clear error messages when Drive is not accessible
- [ ] Drive connection diagnostic available in UI
- [ ] Workspace page shows helpful error when Drive fails
- [ ] Dashboard gracefully handles missing Drive data
- [ ] Pages re-authenticate user when session expires

### PDF Cover Page
- [ ] Cover image can be selected from photos taken in Oscar
- [ ] Cover image can be selected from Google Drive
- [ ] Cover image can be uploaded by user
- [ ] Title block displays all required fields
- [ ] Footer displays company details
- [ ] Mixtral generates cover page layout instructions

### Page Templates
- [ ] All pages include header with project name
- [ ] All pages include document title in header
- [ ] All pages show page numbers
- [ ] All pages include footer with company name
- [ ] Footer includes contact details
- [ ] Disclaimer can be added to footer
- [ ] Mixtral generates reusable template

### Image Placement
- [ ] "Insert photo X on page Y" command works
- [ ] "Use the photo from [time] as cover" command works
- [ ] "Add photos to the AMS" command works
- [ ] Oscar shows thumbnails in chat
- [ ] Oscar confirms placement before applying
- [ ] Photos display correctly in generated PDF
- [ ] Natural language photo references parsed correctly

### Online Image Search
- [ ] Search works for tree diagrams
- [ ] Search works for BS5837 examples
- [ ] Only safe, non-copyrighted sources used
- [ ] Source attribution displayed
- [ ] User confirms before inserting searched images
- [ ] Images cached appropriately

### Integration
- [ ] All PDF commands work end-to-end
- [ ] Photos load from Drive in PDF
- [ ] Cover page integrates with main document
- [ ] Headers/footers consistent throughout
- [ ] No broken image references in PDFs
