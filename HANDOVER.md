# Oscar AI - Project Handover Document

## Project Overview
**Project Name**: Oscar AI  
**Type**: Web Application (SvelteKit)  
**Purpose**: Personal arboricultural notebook and AI assistant for UK tree surveyors  
**Deployment**: Cloudflare Pages (SSR)

---

## Current Status

### Working Features
- **Authentication**: Login/Signup pages (local storage based)
- **Dashboard**: Overview of projects and recent activity
- **Projects**: Create, edit, delete tree survey projects
- **Trees**: Add/edit trees within projects with full data (DBH, height, species, condition)
- **Notes**: Create notes with tags, linked to projects
- **Reports**: Generate BS5837 reports (PDF export)
- **Oscar AI Chat**: AI-powered assistant using Groq API
- **Voice Notes**: Audio recording with transcription
- **Blog Writer**: AI-assisted blog post creation
- **Learn My Style**: Train AI on your writing style
- **Tasks**: Task management system
- **Help**: Help center with documentation
- **Settings**: API configuration, data export/import

### Recent Additions
- **Dummy Data System**: Development testing data that can be enabled in Settings
- **Tasks Page**: Full task management with priorities and statuses
- **Help Page**: Comprehensive documentation

---

## Technical Stack

### Frontend
- **Framework**: SvelteKit 2.x
- **Styling**: TailwindCSS
- **State**: Svelte stores + IndexedDB (Dexie)

### Backend/Storage
- **Primary**: Local IndexedDB (Dexie.js)
- **Optional**: PocketBase for cloud sync
- **AI**: Groq API (LLM + Whisper)

### Deployment
- **Adapter**: @sveltejs/adapter-cloudflare
- **Build Output**: `/build` folder

---

## Key Files Structure

```
oscar-ai/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable UI components
│   │   ├── db/            # IndexedDB schema & operations
│   │   ├── services/      # API integrations, AI, etc.
│   │   └── stores/        # Svelte stores (settings, etc.)
│   ├── routes/
│   │   ├── +layout.svelte # Main app layout with sidebar
│   │   ├── dashboard/     # Dashboard page
│   │   ├── workspace/     # Projects list
│   │   ├── project/[id]/ # Project detail
│   │   ├── notes/         # Notes management
│   │   ├── reports/       # Report generation
│   │   ├── oscar/         # AI chat interface
│   │   ├── tasks/         # Task management
│   │   ├── help/          # Help documentation
│   │   ├── learn/         # Style learning
│   │   └── settings/      # App settings
│   ├── app.html           # HTML template
│   └── app.d.ts           # TypeScript declarations
├── static/                # Static assets
├── svelte.config.js       # SvelteKit config
├── vite.config.ts         # Vite config
└── package.json           # Dependencies
```

---

## Database Schema (IndexedDB)

### Tables
- **projects**: id, name, description, location, client, createdAt, updatedAt
- **trees**: id, projectId, number, species, scientificName, DBH, height, age, category, condition, photos
- **notes**: id, projectId, title, content, transcript, tags, type, createdAt, updatedAt
- **tasks**: id, title, content, status, priority, dueDate, projectId, tags, createdAt, updatedAt
- **reports**: id, projectId, title, type, pdfBlob, generatedAt
- **links**: id, sourceId, targetId, sourceType, targetType, relationType
- **chatMessages**: id, role, content, timestamp

### Key Functions (in `src/lib/db/index.ts`)
- `createProject()`, `getProjects()`, `updateProject()`, `deleteProject()`
- `createTree()`, `getTrees()`, `updateTree()`, `deleteTree()`
- `createNote()`, `getNotes()`, `updateNote()`, `deleteNote()`
- `createTask()`, `getAllTasks()`, `updateTask()`, `deleteTask()`
- `createLink()`, `getLinksForObject()`
- `saveChatMessage()`, `getChatHistory()`

---

## Environment Variables

### Required
- **Groq API Key**: Configure in Settings page (or use default dev key)

### Optional
- **PocketBase URL**: For cloud sync (Settings → Cloud Backend)

---

## Deployment Instructions

### Cloudflare Pages (Recommended)

1. **Connect GitHub to Cloudflare**:
   - Go to Cloudflare Dashboard → Pages
   - Connect your GitHub repository
   - Select "SvelteKit" as the framework

2. **Configure Build Settings**:
   - Build command: `npm run build`
   - Build output directory: `build`

3. **Deploy**:
   - Push to main branch
   - Cloudflare will auto-deploy

### Local Development
```bash
cd oscar-ai
npm install
npm run dev
```

### Production Build
```bash
npm run build
# Output in build/ folder
```

---

## Known Issues / Limitations

1. **Local Storage Only**: Data stored in browser IndexedDB, not synced between devices (unless PocketBase is configured)
2. **Authentication**: Simple local auth, not secure for production
3. **Voice Notes**: Require microphone permissions
4. **PDF Generation**: Basic implementation, may need refinement

---

## Future Improvements (Suggested)

1. **Secure Authentication**: Implement proper auth with PocketBase
2. **Cloud Sync**: Full PocketBase integration
3. **Google Drive**: Connect to Google Drive for file storage
4. **Offline Support**: PWA capabilities
5. **Advanced Reports**: More BS5837 report templates
6. **Maps Integration**: Interactive site maps

---

## Support

For issues or questions:
- Check `/help` in the app for documentation
- Review source code in `/src/lib`
- Console logs available for debugging

---

## Handover Checklist

- [x] Project builds successfully
- [x] All routes functional
- [x] Database schema documented
- [x] Deployment configuration ready
- [x] Dummy data system implemented

---

**Last Updated**: February 2026  
**Version**: 1.0.0 (Dev)
