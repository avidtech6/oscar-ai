// Test script to check if environment variables are being loaded
import { readFileSync } from 'fs';
import { config } from 'dotenv';

console.log('=== Testing Environment Variable Loading ===\n');

// Load .env file directly
config({ path: '.env' });

console.log('Direct .env loading:');
console.log('VITE_GROQ_API_KEY:', process.env.VITE_GROQ_API_KEY ? '✓ Loaded' : '✗ Not loaded');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✓ Loaded' : '✗ Not loaded');
console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✓ Loaded' : '✗ Not loaded');

// Check if .env file exists and has content
try {
  const envContent = readFileSync('.env', 'utf8');
  console.log('\n.env file content:');
  console.log(envContent);
} catch (error) {
  console.error('Error reading .env file:', error.message);
}

// Test Vite's import.meta.env simulation
console.log('\n=== Vite Environment Simulation ===');
console.log('Note: In browser, import.meta.env would be used');
console.log('In Node.js, we simulate with process.env');

// Check if keys.ts would work
const simulatedKeys = {
  GROQ_API_KEY: process.env.VITE_GROQ_API_KEY || '',
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
};

console.log('\nSimulated keys.ts values:');
console.log('GROQ_API_KEY:', simulatedKeys.GROQ_API_KEY ? '✓ Has value' : '✗ Empty');
console.log('SUPABASE_URL:', simulatedKeys.SUPABASE_URL ? '✓ Has value' : '✗ Empty');
console.log('SUPABASE_ANON_KEY:', simulatedKeys.SUPABASE_ANON_KEY ? '✓ Has value' : '✗ Empty');

if (!simulatedKeys.GROQ_API_KEY) {
  console.error('\n❌ ERROR: GROQ_API_KEY is empty! This will cause "invalid API key" errors.');
}
if (!simulatedKeys.SUPABASE_URL || !simulatedKeys.SUPABASE_ANON_KEY) {
  console.error('\n❌ ERROR: Supabase credentials are incomplete! This will cause "supabaseUrl is required" errors.');
}