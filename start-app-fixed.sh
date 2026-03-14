#!/bin/bash

echo "Starting Oscar AI Application..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js is installed ✓"
echo

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    exit 1
fi

echo "npm is installed ✓"
echo

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found in current directory!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "package.json found ✓"
echo

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies!"
        exit 1
    fi
    echo "Dependencies installed ✓"
    echo
else
    echo "Dependencies already installed ✓"
    echo
fi

# Start the development server
echo "Starting development server..."
echo "Please wait while the server starts..."
echo

# Start the server in background
npm run dev &
SERVER_PID=$!

echo "Server started with PID: $SERVER_PID"
echo "Waiting 12 seconds for server to start..."
sleep 12

# Check if port 5173 is listening
echo "Checking if server is ready..."
if netstat -tlnp 2>/dev/null | grep -q ":5173 "; then
    echo "Server is ready! ✓"
    echo
    echo "Opening browser in new tab..."
    
    # Try different methods to open browser in new tab
    if command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open "http://localhost:5173" &
        echo "Browser opened with xdg-open"
    elif command -v open &> /dev/null; then
        # macOS
        open -a "Google Chrome" "http://localhost:5173" &
        echo "Browser opened with open"
    elif command -v explorer &> /dev/null; then
        # Windows/WSL
        explorer.exe "http://localhost:5173" &
        echo "Browser opened with explorer"
    else
        echo "Could not determine browser command"
        echo "Please manually visit: http://localhost:5173"
    fi
    
    echo
    echo "Oscar AI is now running in your browser!"
    echo "If browser didn't open, please visit: http://localhost:5173"
    echo
else
    echo "WARNING: Server may not be ready yet"
    echo "Please try visiting: http://localhost:5173 manually"
    echo
fi

echo "Press Ctrl+C to stop the server when you're done."
echo "Server PID: $SERVER_PID"
wait $SERVER_PID