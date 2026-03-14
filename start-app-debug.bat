@echo off
echo DEBUG: Starting Oscar AI Application...
echo.

REM Check if Node.js is installed
echo DEBUG: Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo DEBUG: Node.js is installed ✓
echo.

REM Check if npm is installed
echo DEBUG: Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo DEBUG: npm is installed ✓
echo.

REM Check if package.json exists
echo DEBUG: Checking package.json...
if not exist "package.json" (
    echo ERROR: package.json not found in current directory!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo DEBUG: package.json found ✓
echo.

REM Install dependencies if node_modules doesn't exist
echo DEBUG: Checking dependencies...
if not exist "node_modules" (
    echo DEBUG: Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo DEBUG: Dependencies installed ✓
    echo.
) else (
    echo DEBUG: Dependencies already installed ✓
    echo.
)

REM Start the development server
echo DEBUG: Starting development server...
echo The application will open in your default browser shortly.
echo.

REM Start the server in a new window
echo DEBUG: Starting server window...
start "Oscar AI Development Server" cmd /k "npm run dev"

echo DEBUG: Waiting for server to start...
timeout /t 8 /nobreak >nul

REM Check if server is actually running
echo DEBUG: Checking if server is running on port 5173...
netstat -an | find ":5173" >nul
if %errorlevel% equ 0 (
    echo DEBUG: Server is listening on port 5173 ✓
) else (
    echo DEBUG: WARNING: Server may not be listening on port 5173
)

REM Try to open browser
echo DEBUG: Attempting to open browser...
echo.

REM Try different methods
echo DEBUG: Method 1: Using start command...
start http://localhost:5173

echo.
echo DEBUG: If browser didn't open, try these methods manually:
echo 1. Open your web browser and go to: http://localhost:5173
echo 2. Or try: start http://localhost:5173 in command prompt
echo 3. Or try: explorer http://localhost:5173
echo.

echo Oscar AI should now be running!
echo Press any key to close this window...
pause >nul