#!/usr/bin/env node

/**
 * Auto-deploy script for Oscar AI
 * 
 * This script automatically commits and pushes changes to GitHub
 * whenever the dev server is updated.
 * 
 * Usage: node scripts/auto-deploy.js "Commit message"
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function runCommand(command, cwd = projectRoot) {
  try {
    console.log(`\x1b[36mRunning: ${command}\x1b[0m`);
    const output = execSync(command, { cwd, stdio: 'pipe', encoding: 'utf-8' });
    console.log(output);
    return { success: true, output };
  } catch (error) {
    console.error(`\x1b[31mError running command: ${command}\x1b[0m`);
    console.error(error.message);
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    return { success: false, error };
  }
}

function autoDeploy(commitMessage = 'Auto-deploy: Dev server updates') {
  console.log('\x1b[33m=== Starting Auto-Deploy ===\x1b[0m');
  
  // Step 1: Check git status
  const statusResult = runCommand('git status --porcelain');
  if (!statusResult.success) {
    console.log('\x1b[31mGit status check failed. Exiting.\x1b[0m');
    return;
  }
  
  const changes = statusResult.output.trim();
  if (!changes) {
    console.log('\x1b[32mNo changes to commit. Exiting.\x1b[0m');
    return;
  }
  
  console.log('\x1b[33mChanges detected:\x1b[0m');
  console.log(changes);
  
  // Step 2: Add all changes
  console.log('\x1b[33mAdding changes...\x1b[0m');
  const addResult = runCommand('git add .');
  if (!addResult.success) {
    console.log('\x1b[31mFailed to add changes. Exiting.\x1b[0m');
    return;
  }
  
  // Step 3: Commit changes
  console.log('\x1b[33mCommitting changes...\x1b[0m');
  const commitResult = runCommand(`git commit -m "${commitMessage}"`);
  if (!commitResult.success) {
    console.log('\x1b[31mFailed to commit changes. Exiting.\x1b[0m');
    return;
  }
  
  // Step 4: Push to GitHub
  console.log('\x1b[33mPushing to GitHub...\x1b[0m');
  const pushResult = runCommand('git push origin main');
  if (!pushResult.success) {
    console.log('\x1b[31mFailed to push changes. Exiting.\x1b[0m');
    return;
  }
  
  console.log('\x1b[32m=== Auto-Deploy Complete ===\x1b[0m');
  console.log(`\x1b[32mSuccessfully deployed: ${commitMessage}\x1b[0m`);
}

// Get commit message from command line arguments
const args = process.argv.slice(2);
const commitMessage = args.length > 0 ? args.join(' ') : 'Auto-deploy: Dev server updates';

autoDeploy(commitMessage);