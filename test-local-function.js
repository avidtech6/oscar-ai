// Test the local Supabase Edge Function
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDecompilerFunction() {
  const url = 'http://127.0.0.1:54321/functions/v1/decompiler';
  const authToken = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
  
  const testData = {
    text: 'BS5837:2012 Tree Survey Report\n\nAuthor: John Smith\nDate: 2024-01-15\nClient: City Council\n\n1.0 INTRODUCTION\nThis is a test report for decompilation.'
  };

  console.log('Testing local Supabase Edge Function...');
  console.log('URL:', url);
  console.log('Request payload:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testData)
    });

    console.log('\nResponse Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('Response Body:', responseText);

    try {
      const jsonResponse = JSON.parse(responseText);
      console.log('\nParsed JSON Response:', JSON.stringify(jsonResponse, null, 2));
      
      if (response.ok) {
        console.log('\n✅ SUCCESS: Function returned valid JSON');
        return { success: true, data: jsonResponse };
      } else {
        console.log('\n❌ ERROR: Function returned error');
        return { success: false, error: jsonResponse };
      }
    } catch (e) {
      console.log('\n❌ ERROR: Response is not valid JSON');
      return { success: false, error: 'Invalid JSON response', raw: responseText };
    }
  } catch (error) {
    console.log('\n❌ NETWORK ERROR:', error.message);
    return { success: false, error: error.message };
  }
}

// Run test
testDecompilerFunction().then(result => {
  console.log('\nTest completed:', result.success ? 'SUCCESS' : 'FAILED');
  process.exit(result.success ? 0 : 1);
});