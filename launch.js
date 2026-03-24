#!/usr/bin/env node

import { spawn } from "node:child_process";
import http from "node:http";

// ---------------- CONFIG ----------------

const MAX_PROBES = 60;          // 60 × 250ms = 15 seconds max wait
const PROBE_INTERVAL = 250;     // ms
const VITE_COMMAND = "npm";
const VITE_ARGS = ["run", "dev"];

// ---------------- STATE -----------------

let detectedPort = null;
let browserOpened = false;

// ---------------- HELPERS ---------------

function log(msg) {
  console.log(`[launcher] ${msg}`);
}

function stripAnsi(str) {
  return str.replace(
    // eslint-disable-next-line no-control-regex
    /\u001b

\[.*?m/g,
    ""
  );
}

function extractPort(line) {
  const clean = stripAnsi(line);

  // Matches:
  //   Local: http://localhost:5173/
  //   Local: https://localhost:5173/
  //   Local:   http://127.0.0.1:5173/
  //   Local:   http://[::1]:5173/
  const match = clean.match(/Local:\s+https?:\/\/(?:localhost|127\.0\.0\.1|

\[::1\]

):(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

function probe(port) {
  return new Promise((resolve) => {
    const req = http.get({ host: "localhost", port, path: "/" }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.end();
  });
}

async function waitForServer(port) {
  log(`Probing port ${port}...`);

  for (let i = 0; i < MAX_PROBES; i++) {
    const ok = await probe(port);
    if (ok) return true;
    await new Promise((r) => setTimeout(r, PROBE_INTERVAL));
  }

  return false;
}

function openBrowser(port) {
  const url = `http://localhost:${port}`;
  log(`Opening browser at ${url}`);

  const cmd =
    process.platform === "win32"
      ? "start"
      : process.platform === "darwin"
      ? "open"
      : "xdg-open";

  spawn(cmd, [url], { stdio: "ignore", shell: true });
}

// ---------------- MAIN ------------------

async function main() {
  log("Starting Vite...");

  const vite = spawn(VITE_COMMAND, VITE_ARGS, {
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });

  vite.stdout.on("data", async (data) => {
    const line = data.toString().trim();
    console.log(line);

    if (!detectedPort) {
      const port = extractPort(line);
      if (port) {
        detectedPort = port;
        log(`Detected Vite port: ${detectedPort}`);

        const ready = await waitForServer(detectedPort);
        if (ready && !browserOpened) {
          browserOpened = true;
          openBrowser(detectedPort);
        } else if (!ready) {
          log(`Server did not respond on port ${detectedPort}.`);
        }
      }
    }
  });

  vite.stderr.on("data", (data) => {
    console.error(stripAnsi(data.toString().trim()));
  });

  vite.on("close", (code) => {
    log(`Vite exited with code ${code}`);
    process.exit(code);
  });
}

main();
