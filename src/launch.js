const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ANSI color codes regex
const ansiRegex = /[\u001B\u009B][[()#;?]*(?:[0-9]{1,2}(?:;[0-9]{1,2})?)?[\u0007\u000B\u000C\u001D\u00AD\u000E\u000F\f\n\r\t]+/g;

function stripAnsi(str) {
  return str.replace(ansiRegex, '');
}

function parsePortFromOutput(output) {
  const lines = output.split('\n');
  for (const line of lines) {
    const stripped = stripAnsi(line);
    if (stripped.includes('Local:')) {
      const match = stripped.match(/localhost:(\d+)\//);
      if (match) {
        return parseInt(match[1]);
      }
    }
  }
  return null;
}

function probePort(port) {
  return new Promise((resolve, reject) => {
    const options = {
      port: port,
      host: 'localhost',
      method: 'GET',
      path: '/',
      timeout: 5000 // 5 seconds timeout
    };

    const req = http.get(options, (res) => {
      if (res && res.statusCode) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(port);
        } else {
          reject(new Error(`Server responded with ${res.statusCode}`));
        }
      } else {
        reject(new Error('Response object is missing or invalid'));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      reject(new Error('Server did not respond within timeout'));
    });

    req.end();
  });
}

function openBrowser(url) {
  const osType = os.platform();
  
  if (osType === 'win32') {
    // For Windows, use start command
    const process = require('child_process').spawn('start', [url]);
  } else {
    // For macOS and Linux
    const process = require('child_process').spawn('open', [url]);
  }
}

function launch() {
  console.log('[launcher] Starting Vite development server...');

  const viteProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    cwd: process.cwd()
  });

  let output = '';
  const APP_ID = process.env.APP_ID || 'oscar-ai';

  viteProcess.stdout.on('data', (data) => {
    const dataStr = data.toString();
    output += dataStr;
    // Only log lines containing APP_ID
    if (dataStr.includes(APP_ID)) {
      console.log('[launcher] Vite output:', dataStr);
    }
  });

  viteProcess.stderr.on('data', (data) => {
    const dataStr = data.toString();
    // Only log stderr lines containing APP_ID
    if (dataStr.includes(APP_ID)) {
      console.error('[launcher] Vite error:', dataStr);
    }
  });

  viteProcess.on('close', (code) => {
    console.log('[launcher] Vite process exited with code:', code);
    if (code !== 0) {
      console.error('[launcher] Vite failed to start');
      process.exit(1);
    }
  });

  viteProcess.on('error', (err) => {
    console.error('[launcher] Error starting Vite:', err);
    process.exit(1);
  });

  let detectedPort = null;

  // Parse output for port
  setTimeout(() => {
    const port = parsePortFromOutput(output);
    if (port) {
      detectedPort = port;
      console.log('[launcher] Detected port:', port);
    } else {
      console.error('[launcher] Could not detect port from output');
      process.exit(1);
    }
  }, 2000);

  // Wait for port to be available
  if (detectedPort) {
    console.log('[launcher] Probing port:', detectedPort);
    probePort(detectedPort)
      .then((port) => {
        console.log('[launcher] Server is running on port', port);
        
        // Construct URL based on detected port
        const isHttps = output.includes('https');
        const protocol = isHttps ? 'https' : 'http';
        const host = 'localhost';
        const url = `${protocol}://${host}:${port}`;
        
        console.log('[launcher] Opening browser to:', url);
        openBrowser(url);
        
        // Keep the process alive for a while to allow browser to open
        setTimeout(() => {
          console.log('[launcher] Script will exit now');
          process.exit(0);
        }, 10000); // Wait 10 seconds before exiting
      })
      .catch((err) => {
        console.error('[launcher] Error probing port:', err.message);
        process.exit(1);
      });
  }
}

launch();
