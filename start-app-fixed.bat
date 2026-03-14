@echo off
echo Starting Oscar AI Application...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed ✓
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo npm is installed ✓
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found in current directory!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo package.json found ✓
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo Dependencies installed ✓
    echo.
) else (
    echo Dependencies already installed ✓
    echo.
)

REM Start the development server
echo Starting development server...
echo Please wait while the server starts...
echo.

REM Start the server in a new window and keep it running
start "Oscar AI Development Server" cmd /k "npm run dev"

REM Wait longer for server to fully start
echo Waiting 12 seconds for server to start...
timeout /t 12 /nobreak >nul

REM Check if server is actually running
echo Checking if server is ready...
netstat -an | find ":5173" >nul
if %errorlevel% equ 0 (
    echo Server is ready! ✓
    echo.
    echo Opening browser in new tab...
    
    REM Open browser in new tab using start command
    start http://localhost:5173
    
    echo.
    echo Oscar AI is now running in your browser!
    echo If browser didn't open, please visit: http://localhost:5173
    echo.
) else (
    echo WARNING: Server may not be ready yet
    echo Please try visiting: http://localhost:5173 manually
    echo.
)

echo Press any key to close this window...
pause >nul