// Test script to verify API key configuration
console.log('Testing API key configuration...\n');

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
    console.log('Running in browser environment');
    
    // Test Groq API key
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    console.log('Groq API Key:', groqKey ? '✓ Present' : '✗ Missing');
    if (groqKey) {
        console.log('  Length:', groqKey.length, 'characters');
        console.log('  Starts with:', groqKey.substring(0, 10) + '...');
    }
    
    // Test Supabase URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    console.log('\nSupabase URL:', supabaseUrl ? '✓ Present' : '✗ Missing');
    if (supabaseUrl) {
        console.log('  URL:', supabaseUrl);
    }
    
    // Test Supabase Key
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    console.log('\nSupabase Key:', supabaseKey ? '✓ Present' : '✗ Missing');
    if (supabaseKey) {
        console.log('  Length:', supabaseKey.length, 'characters');
        console.log('  Starts with:', supabaseKey.substring(0, 10) + '...');
    }
    
    // Overall status
    console.log('\n=== Configuration Status ===');
    if (groqKey && supabaseUrl && supabaseKey) {
        console.log('✅ All API keys are configured correctly');
    } else {
        console.log('⚠️  Some API keys are missing');
        if (!groqKey) console.log('   - Groq API key is missing');
        if (!supabaseUrl) console.log('   - Supabase URL is missing');
        if (!supabaseKey) console.log('   - Supabase key is missing');
    }
} else {
    console.log('Not running in browser environment');
}

console.log('\nNote: This test runs in the browser console.');
console.log('To test, open browser console and check for any API key warnings.');