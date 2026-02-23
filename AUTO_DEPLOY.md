# Auto-Deploy System for Oscar AI

This project now includes an automated deployment system that commits and pushes changes to GitHub whenever the dev server is updated.

## How It Works

The auto-deploy system consists of:

1. **`scripts/auto-deploy.cjs`** - Main deployment script
2. **`package.json` scripts** - Convenient npm commands
3. **Git integration** - Automatically detects, commits, and pushes changes

## Available Commands

### Basic Auto-Deploy
```bash
npm run deploy
```
This will:
1. Check for uncommitted changes
2. Add all changes to git
3. Commit with message "Auto-deploy: Dev server updates"
4. Push to GitHub (origin/main)

### Custom Message Auto-Deploy
```bash
npm run deploy -- "Your custom commit message"
```
or
```bash
node scripts/auto-deploy.cjs "Your custom commit message"
```

### Auto-Deploy with Timestamp
```bash
npm run deploy:message
```
This uses a timestamp in the commit message.

## Integration with Dev Workflow

### Option 1: Manual Trigger
After making changes to the dev server, run:
```bash
npm run deploy
```

### Option 2: Git Hook (Recommended)
You can set up a git hook to automatically run the deploy script. Add to `.git/hooks/post-commit`:
```bash
#!/bin/bash
npm run deploy
```

### Option 3: Watch Mode Integration
If you want to auto-deploy on every file change, you could modify the dev script in `package.json`:
```json
"dev:watch": "vite dev && npm run deploy"
```

## What Gets Deployed

The script automatically:
- Detects all changed files (modified, added, deleted)
- Adds everything to git staging
- Commits with the provided message
- Pushes to the `main` branch on `origin`

## Error Handling

The script includes error handling for:
- No changes to commit (exits gracefully)
- Git command failures (shows detailed error)
- Network issues during push

## Example Output

```
=== Starting Auto-Deploy ===
Running: git status --porcelain
Changes detected:
 M src/lib/copilot/CopilotDock.svelte
?? screenshots/test.png
Adding changes...
Running: git add .
Committing changes...
Running: git commit -m "Auto-deploy: Copilot fixes"
Pushing to GitHub...
Running: git push origin main
=== Auto-Deploy Complete ===
Successfully deployed: Auto-deploy: Copilot fixes
```

## Notes

1. **Security**: The script runs git commands with your existing credentials
2. **Branch**: Always pushes to `main` branch
3. **Merge Conflicts**: If there are merge conflicts, the script will fail and you'll need to resolve manually
4. **Large Files**: Be mindful of committing large files to git

## Customization

You can modify `scripts/auto-deploy.cjs` to:
- Change the default branch
- Add pre-commit hooks
- Include/exclude specific file patterns
- Add deployment notifications