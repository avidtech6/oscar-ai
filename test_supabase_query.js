import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uoznborffctkpwgnghdr.supabase.co';
const supabaseAnonKey = 'sb_publishable_8cCgepMSrGtTMb-kZEcuLg_eeihm7_R';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing Supabase settings query...');
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['groq_api_key', 'openai_api_key']);

  if (error) {
    console.error('Error:', error);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
    console.error('Hint:', error.hint);
  } else {
    console.log('Success! Data:', data);
    console.log('Number of rows:', data.length);
    data.forEach(row => {
      console.log(`- ${row.key}: ${row.value ? '***' + row.value.slice(-4) : 'empty'}`);
    });
  }
}

test().catch(console.error);