// Simple test to check .env file
const fs = require('fs');
const path = require('path');

console.log('=== Testing .env File ===\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file does not exist!');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
console.log('.env file exists and contains:');
console.log('---');
console.log(envContent);
console.log('---\n');

// Parse key-value pairs
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const equalsIndex = line.indexOf('=');
    if (equalsIndex !== -1) {
      const key = line.substring(0, equalsIndex).trim();
      const value = line.substring(equalsIndex + 1).trim();
      envVars[key] = value;
    }
  }
});

// Check required variables
const requiredVars = [
  'VITE_GROQ_API_KEY',
  'VITE_SUPABASE_URL', 
  'VITE_SUPABASE_PUBLISHABLE_KEY'
];

console.log('Checking required environment variables:');
let allPresent = true;

requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value && value.length > 0) {
    console.log(`✓ ${varName}: Present (${value.length} chars)`);
  } else {
    console.log(`❌ ${varName}: MISSING or empty`);
    allPresent = false;
  }
});

console.log('\n=== Summary ===');
if (allPresent) {
  console.log('✅ All required environment variables are present in .env file');
  console.log('\n⚠️  Note: If Vite is still showing warnings about missing variables,');
  console.log('you may need to restart the dev server with:');
  console.log('1. Stop the current dev server (Ctrl+C)');
  console.log('2. Run: npm run dev');
} else {
  console.log('❌ Some environment variables are missing');
  console.log('Please add the missing variables to your .env file');
}

// Also check if there's a .env.local file
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('\n⚠️  Warning: .env.local file exists and may override .env');
  console.log('This could be causing the issue. Check its contents.');
}