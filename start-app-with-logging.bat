@echo off
echo Starting Oscar AI Application with logging...
echo All output will be saved to debug.log
echo.

REM Create log file
echo === Oscar AI Launcher Log - %date% %time% === > debug.log
echo. >> debug.log

REM Check if Node.js is installed
echo Checking Node.js... >> debug.log
node --version >> debug.log 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed! >> debug.log
    echo Please install Node.js from https://nodejs.org/ >> debug.log
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed ✓ >> debug.log
echo.

REM Check if npm is installed
echo Checking npm... >> debug.log
npm --version >> debug.log 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed! >> debug.log
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo npm is installed ✓ >> debug.log
echo.

REM Check if package.json exists
echo Checking package.json... >> debug.log
if not exist "package.json" (
    echo ERROR: package.json not found in current directory! >> debug.log
    echo Please run this script from the project root directory. >> debug.log
    echo ERROR: package.json not found in current directory!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo package.json found ✓ >> debug.log
echo.

REM Install dependencies if node_modules doesn't exist
echo Checking dependencies... >> debug.log
if not exist "node_modules" (
    echo Installing dependencies... >> debug.log
    npm install >> debug.log 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies! >> debug.log
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo Dependencies installed ✓ >> debug.log
    echo.
) else (
    echo Dependencies already installed ✓ >> debug.log
    echo.
)

REM Start the development server
echo Starting development server... >> debug.log
echo The application will open in your default browser shortly. >> debug.log
echo. >> debug.log

REM Start the server and capture all output
echo Starting server and capturing output... >> debug.log
start "Oscar AI Development Server" cmd /k "npm run dev" >> debug.log 2>&1

echo Waiting for server to start... >> debug.log
timeout /t 8 /nobreak >nul

REM Check if server is actually running
echo Checking if server is running on port 5173... >> debug.log
netstat -an | find ":5173" >> debug.log 2>&1
if %errorlevel% equ 0 (
    echo Server is listening on port 5173 ✓ >> debug.log
) else (
    echo WARNING: Server may not be listening on port 5173 >> debug.log
)

REM Try to open browser
echo Attempting to open browser... >> debug.log

REM Try different methods
echo Method 1: Using start command... >> debug.log
start http://localhost:5173 >> debug.log 2>&1

echo Method 2: Using explorer command... >> debug.log
explorer http://localhost:5173 >> debug.log 2>&1

echo.
echo Oscar AI should now be running! >> debug.log
echo If browser didn't open, please check debug.log for errors >> debug.log
echo Or manually visit: http://localhost:5173 >> debug.log
echo.
echo Log file created: debug.log
echo Press any key to close this window...
pause >nul