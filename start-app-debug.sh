#!/bin/bash

echo "DEBUG: Starting Oscar AI Application..."
echo

# Check if Node.js is installed
echo "DEBUG: Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "DEBUG: Node.js is installed ✓"
echo

# Check if npm is installed
echo "DEBUG: Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    exit 1
fi

echo "DEBUG: npm is installed ✓"
echo

# Check if package.json exists
echo "DEBUG: Checking package.json..."
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found in current directory!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "DEBUG: package.json found ✓"
echo

# Install dependencies if node_modules doesn't exist
echo "DEBUG: Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "DEBUG: Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies!"
        exit 1
    fi
    echo "DEBUG: Dependencies installed ✓"
    echo
else
    echo "DEBUG: Dependencies already installed ✓"
    echo
fi

# Start the development server
echo "DEBUG: Starting development server..."
echo "The application will open in your default browser shortly."
echo

# Start the server in background
echo "DEBUG: Starting server process..."
npm run dev &
SERVER_PID=$!

echo "DEBUG: Server PID: $SERVER_PID"
echo "DEBUG: Waiting for server to start..."
sleep 8

# Check if port 5173 is listening
echo "DEBUG: Checking if server is running on port 5173..."
if netstat -tlnp 2>/dev/null | grep -q ":5173 "; then
    echo "DEBUG: Server is listening on port 5173 ✓"
    PORT_LISTENING=true
else
    echo "DEBUG: WARNING: Could not confirm server is running on port 5173"
    PORT_LISTENING=false
fi

# Try to open browser
echo "DEBUG: Attempting to open browser..."
echo

# Try different methods to open browser
echo "DEBUG: Method 1: Using xdg-open (Linux)..."
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:5173" &
    echo "DEBUG: xdg-open command executed"
else
    echo "DEBUG: xdg-open not available"
fi

echo "DEBUG: Method 2: Using open (macOS)..."
if command -v open &> /dev/null; then
    open -a "Google Chrome" "http://localhost:5173" &
    echo "DEBUG: open command executed"
else
    echo "DEBUG: open not available"
fi

echo "DEBUG: Method 3: Using explorer (Windows/WSL)..."
if command -v explorer &> /dev/null; then
    explorer.exe "http://localhost:5173" &
    echo "DEBUG: explorer command executed"
else
    echo "DEBUG: explorer not available"
fi

echo
echo "DEBUG: If browser didn't open, try these methods manually:"
echo "1. Open your web browser and go to: http://localhost:5173"
echo "2. Or try: xdg-open http://localhost:5173 (Linux)"
echo "3. Or try: open http://localhost:5173 (macOS)"
echo "4. Or try: explorer http://localhost:5173 (Windows/WSL)"
echo

echo "Oscar AI should now be running!"
echo "Press Ctrl+C to stop the server when you're done."
echo "DEBUG: Waiting for server process $SERVER_PID..."
wait $SERVER_PID