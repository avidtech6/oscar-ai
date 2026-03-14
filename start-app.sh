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
echo "The application will open in your default browser shortly."
echo

# Start the server in background
npm run dev &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 8

# Check if port 5173 is listening
if netstat -tlnp 2>/dev/null | grep -q ":5173 "; then
    echo "Server is running on port 5173 ✓"
else
    echo "WARNING: Could not confirm server is running on port 5173"
fi

# Open browser in new tab
echo "Opening browser in new tab..."

# Try different methods to open browser in new tab
if command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "http://localhost:5173" &
elif command -v open &> /dev/null; then
    # macOS
    open -a "Google Chrome" "http://localhost:5173" &
elif command -v explorer &> /dev/null; then
    # Windows (if running in WSL or similar)
    explorer.exe "http://localhost:5173" &
else
    echo "Could not determine browser command"
    echo "Please manually visit: http://localhost:5173"
fi

echo
echo "Oscar AI is now running!"
echo "Browser should have opened in a new tab."
echo "If not, please manually visit: http://localhost:5173"
echo

# Keep the script running to maintain the server process
echo "Press Ctrl+C to stop the server when you're done."
wait $SERVER_PID