# Oscar AI - Quick Start

## Quick Start Launcher

Use these launchers to start Oscar AI with one click:

### Windows Users
Double-click `start-app.bat` to start the application.

### Linux/Mac Users  
Run `./start-app.sh` in your terminal to start the application.

## What the Launcher Does:
1. ✅ Checks if Node.js and npm are installed
2. ✅ Installs dependencies if needed
3. ✅ Starts the development server
4. ✅ Automatically detects the correct port (usually 5173)
5. ✅ Opens the application in your default browser
6. ✅ Runs at http://localhost:[detected_port]

## Manual Start (if needed)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Then visit http://localhost:5173 in your browser.

## Notes:
- Authentication is disabled for development mode
- The app will load directly into the dashboard
- No login required during development