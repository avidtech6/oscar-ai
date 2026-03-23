@echo off
echo ========================================
echo Oscar AI Development Launcher
echo ========================================
echo.

REM Ensure we're in the project root directory
cd /d "%~dp0"

echo Checking if server is already running...
set "serverPort="

REM Check for common Vite ports
netstat -an | findstr ":5173" >nul
if %errorlevel% equ 0 set "serverPort=5173"

if "%serverPort%"=="" (
    netstat -an | findstr ":5174" >nul
    if %errorlevel% equ 0 set "serverPort=5174"
)

if "%serverPort%"=="" (
    netstat -an | findstr ":5175" >nul
    if %errorlevel% equ 0 set "serverPort=5175"
)

if "%serverPort%"=="" (
    netstat -an | findstr ":5176" >nul
    if %errorlevel% equ 0 set "serverPort=5176"
)

if "%serverPort%"=="" (
    echo No server detected on common Vite ports (5173-5176)
    goto startServer
)

echo Server already detected on port %serverPort%
echo Opening browser in new tab...
start http://localhost:%serverPort%/
echo Browser should open in a new tab
goto keepOpen

:startServer

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    goto keepOpen
)

echo Node.js is installed ✓
echo.

REM Check if npm is installed
echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    goto keepOpen
)

echo npm is installed ✓
echo.

REM Check if package.json exists
echo Checking project files...
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the project root directory.
    goto keepOpen
)

echo Project files found ✓
echo.

REM Clean up old log file if it exists
if exist "vite.log" (
    echo Cleaning up old vite.log file...
    del vite.log
)

echo Starting development server...
echo Server will start in a new window
echo Output will be logged to vite.log
echo.

REM Start the development server in background and log output
start "Oscar AI Development Server" cmd /k "npm run dev"

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

REM Wait for server to be ready (check all common ports)
echo Checking if server is ready...
:checkServer
set "serverReady="

REM Check for common Vite ports
netstat -an | findstr ":5173" >nul
if %errorlevel% equ 0 set "serverReady=5173"

if "%serverReady%"=="" (
    netstat -an | findstr ":5174" >nul
    if %errorlevel% equ 0 set "serverReady=5174"
)

if "%serverReady%"=="" (
    netstat -an | findstr ":5175" >nul
    if %errorlevel% equ 0 set "serverReady=5175"
)

if "%serverReady%"=="" (
    netstat -an | findstr ":5176" >nul
    if %errorlevel% equ 0 set "serverReady=5176"
)

if "%serverReady%"=="" (
    echo Server not ready yet... waiting 3 seconds
    timeout /t 3 /nobreak >nul
    goto checkServer
)

echo Server is ready on port %serverReady%!
echo Opening browser in new tab...
start http://localhost:%serverReady%/
echo Browser should open in a new tab
goto keepOpen

:keepOpen
echo.
echo ========================================
echo Oscar AI Launcher Status:
echo - Server should be running
echo - Browser should have opened
echo - Check the separate terminal window for server output
echo.
echo This window will remain open.
echo Press any key to close this window...
pause >nul